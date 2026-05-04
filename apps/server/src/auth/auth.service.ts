import {
    BadRequestException,
    ConflictException,
    Injectable,
    ServiceUnavailableException,
    UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OAuthProvider, Prisma, Role, User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { randomBytes } from "node:crypto";
import { sign } from "jsonwebtoken";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

type OAuthProfile = {
    provider: OAuthProvider;
    providerUserId: string;
    email: string;
    name: string;
};

@Injectable()
export class AuthService {
    private readonly accessTokenTtl = "15m";
    private readonly refreshTokenDays = 7;

    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
    ) {}

    async register(dto: RegisterDto) {
        const email = dto.email.toLowerCase();
        const passwordHash = await bcrypt.hash(dto.password, 12);

        try {
            const user = await this.prisma.user.create({
                data: {
                    email,
                    name: dto.name,
                    passwordHash,
                },
            });

            return this.createAuthResult(user);
        } catch (error) {
            this.handleUserError(error);
        }
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });

        if (!user?.passwordHash) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (user.isBlocked) {
            throw new UnauthorizedException("User is blocked");
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

        if (!isPasswordValid) {
            throw new UnauthorizedException("Invalid email or password");
        }

        return this.createAuthResult(user);
    }

    async refresh(refreshToken: string | undefined) {
        if (!refreshToken) {
            throw new UnauthorizedException("Refresh token is missing");
        }

        const sessions = await this.prisma.refreshSession.findMany({
            where: {
                revokedAt: null,
                expiresAt: { gt: new Date() },
            },
            include: { user: true },
            orderBy: { createdAt: "desc" },
        });

        for (const session of sessions) {
            const isMatch = await bcrypt.compare(refreshToken, session.tokenHash);

            if (isMatch) {
                if (session.user.isBlocked) {
                    throw new UnauthorizedException("User is blocked");
                }

                const accessToken = this.createAccessToken(session.user);

                return {
                    accessToken,
                    user: this.toPublicUser(session.user),
                };
            }
        }

        throw new UnauthorizedException("Refresh token is invalid or expired");
    }

    async logout(refreshToken: string | undefined) {
        if (!refreshToken) {
            return { success: true };
        }

        const sessions = await this.prisma.refreshSession.findMany({
            where: { revokedAt: null },
            orderBy: { createdAt: "desc" },
        });

        for (const session of sessions) {
            const isMatch = await bcrypt.compare(refreshToken, session.tokenHash);

            if (isMatch) {
                await this.prisma.refreshSession.update({
                    where: { id: session.id },
                    data: { revokedAt: new Date() },
                });
                break;
            }
        }

        return { success: true };
    }

    async getMe(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || user.isBlocked) {
            throw new UnauthorizedException("User is not available");
        }

        return this.toPublicUser(user);
    }

    async loginWithOAuth(profile: OAuthProfile) {
        const email = profile.email.toLowerCase();
        const existingAccount = await this.prisma.oAuthAccount.findUnique({
            where: {
                provider_providerUserId: {
                    provider: profile.provider,
                    providerUserId: profile.providerUserId,
                },
            },
            include: { user: true },
        });

        if (existingAccount) {
            if (existingAccount.user.isBlocked) {
                throw new UnauthorizedException("User is blocked");
            }

            return this.createAuthResult(existingAccount.user);
        }

        const user = await this.prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                name: profile.name,
                role: Role.USER,
            },
        });

        await this.prisma.oAuthAccount.create({
            data: {
                userId: user.id,
                provider: profile.provider,
                providerUserId: profile.providerUserId,
                email,
            },
        });

        return this.createAuthResult(user);
    }

    async getGoogleAuthUrl() {
        const clientId = this.configService.get<string>("GOOGLE_CLIENT_ID");
        const callbackUrl = this.configService.get<string>("GOOGLE_CALLBACK_URL");

        if (!clientId || !callbackUrl) {
            throw new ServiceUnavailableException("Google OAuth is not configured");
        }

        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: callbackUrl,
            response_type: "code",
            scope: "openid email profile",
            access_type: "offline",
            prompt: "select_account",
        });

        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }

    async getVkAuthUrl() {
        const clientId = this.configService.get<string>("VK_CLIENT_ID");
        const callbackUrl = this.configService.get<string>("VK_CALLBACK_URL");

        if (!clientId || !callbackUrl) {
            throw new ServiceUnavailableException("VK OAuth is not configured");
        }

        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: callbackUrl,
            response_type: "code",
            scope: "email",
            v: "5.131",
        });

        return `https://oauth.vk.com/authorize?${params.toString()}`;
    }

    async handleGoogleCallback(code: string) {
        const clientId = this.configService.getOrThrow<string>("GOOGLE_CLIENT_ID");
        const clientSecret = this.configService.getOrThrow<string>("GOOGLE_CLIENT_SECRET");
        const callbackUrl = this.configService.getOrThrow<string>("GOOGLE_CALLBACK_URL");

        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: callbackUrl,
                grant_type: "authorization_code",
            }),
        });

        const tokenData = (await tokenResponse.json()) as { access_token?: string };

        if (!tokenResponse.ok || !tokenData.access_token) {
            throw new UnauthorizedException("Google OAuth token exchange failed");
        }

        const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const profile = (await profileResponse.json()) as { sub?: string; email?: string; name?: string };

        if (!profileResponse.ok || !profile.sub || !profile.email) {
            throw new BadRequestException("Google account did not provide email");
        }

        return this.loginWithOAuth({
            provider: OAuthProvider.GOOGLE,
            providerUserId: profile.sub,
            email: profile.email,
            name: profile.name ?? profile.email,
        });
    }

    async handleVkCallback(code: string) {
        const clientId = this.configService.getOrThrow<string>("VK_CLIENT_ID");
        const clientSecret = this.configService.getOrThrow<string>("VK_CLIENT_SECRET");
        const callbackUrl = this.configService.getOrThrow<string>("VK_CALLBACK_URL");

        const tokenParams = new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: callbackUrl,
            code,
        });
        const tokenResponse = await fetch(`https://oauth.vk.com/access_token?${tokenParams.toString()}`);
        const tokenData = (await tokenResponse.json()) as {
            access_token?: string;
            user_id?: number;
            email?: string;
        };

        if (!tokenResponse.ok || !tokenData.access_token || !tokenData.user_id || !tokenData.email) {
            throw new BadRequestException("VK account did not provide email");
        }

        const profileParams = new URLSearchParams({
            user_ids: String(tokenData.user_id),
            fields: "photo_200",
            access_token: tokenData.access_token,
            v: "5.131",
        });
        const profileResponse = await fetch(`https://api.vk.com/method/users.get?${profileParams.toString()}`);
        const profileData = (await profileResponse.json()) as {
            response?: Array<{ first_name?: string; last_name?: string }>;
        };
        const profile = profileData.response?.[0];
        const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || tokenData.email;

        return this.loginWithOAuth({
            provider: OAuthProvider.VK,
            providerUserId: String(tokenData.user_id),
            email: tokenData.email,
            name,
        });
    }

    async revokeUserSessions(userId: string) {
        await this.prisma.refreshSession.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }

    createAccessToken(user: Pick<User, "id" | "email" | "role">) {
        return sign(
            {
                sub: user.id,
                email: user.email,
                role: user.role,
            },
            this.configService.getOrThrow<string>("JWT_ACCESS_SECRET"),
            { expiresIn: this.accessTokenTtl },
        );
    }

    toPublicUser(user: Pick<User, "id" | "email" | "name" | "phone" | "role" | "isBlocked" | "createdAt">) {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: user.role,
            isBlocked: user.isBlocked,
            createdAt: user.createdAt,
        };
    }

    private async createAuthResult(user: User) {
        const accessToken = this.createAccessToken(user);
        const refreshToken = randomBytes(48).toString("hex");
        const tokenHash = await bcrypt.hash(refreshToken, 12);
        const expiresAt = new Date(Date.now() + this.refreshTokenDays * 24 * 60 * 60 * 1000);

        await this.prisma.refreshSession.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt,
            },
        });

        return {
            accessToken,
            refreshToken,
            user: this.toPublicUser(user),
        };
    }

    private handleUserError(error: unknown): never {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            throw new ConflictException("User email already exists");
        }

        throw error;
    }
}
