import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Role } from "@prisma/client";
import { verify } from "jsonwebtoken";

type AccessTokenPayload = {
    sub: string;
    email: string;
    role: Role;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private readonly configService: ConfigService) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context
            .switchToHttp()
            .getRequest<{ headers: Record<string, string>; user?: { id: string; email: string; role: Role } }>();
        const header = request.headers.authorization;

        if (!header?.startsWith("Bearer ")) {
            throw new UnauthorizedException("Access token is missing");
        }

        const token = header.slice("Bearer ".length);

        try {
            const payload = verify(token, this.configService.getOrThrow<string>("JWT_ACCESS_SECRET")) as AccessTokenPayload;
            request.user = {
                id: payload.sub,
                email: payload.email,
                role: payload.role,
            };
            return true;
        } catch {
            throw new UnauthorizedException("Access token is invalid or expired");
        }
    }
}
