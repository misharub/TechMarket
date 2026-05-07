import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Request, Response } from "express";
import { CurrentUser } from "./decorators/current-user.decorator";
import type { RequestUser } from "./decorators/current-user.decorator";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { AuthService } from "./auth.service";

const REFRESH_COOKIE = "refreshToken";
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const GOOGLE_OAUTH_STATE_COOKIE = "googleOAuthState";
const GOOGLE_OAUTH_STATE_COOKIE_MAX_AGE = 10 * 60 * 1000;

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {}

    @Post("register")
    @ApiOperation({ summary: "Регистрация пользователя" })
    async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) response: Response) {
        const result = await this.authService.register(dto);
        this.setRefreshCookie(response, result.refreshToken);

        return {
            accessToken: result.accessToken,
            user: result.user,
        };
    }

    @Post("login")
    @ApiOperation({ summary: "Авторизация пользователя" })
    async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
        const result = await this.authService.login(dto);
        this.setRefreshCookie(response, result.refreshToken);

        return {
            accessToken: result.accessToken,
            user: result.user,
        };
    }

    @Post("refresh")
    @ApiOperation({ summary: "Получить новый access token по refresh cookie" })
    refresh(@Req() request: Request) {
        return this.authService.refresh(request.cookies?.[REFRESH_COOKIE]);
    }

    @Post("logout")
    @ApiOperation({ summary: "Выйти из аккаунта" })
    async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
        const result = await this.authService.logout(request.cookies?.[REFRESH_COOKIE]);
        this.clearRefreshCookie(response);

        return result;
    }

    @Get("me")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Получить текущего пользователя" })
    me(@CurrentUser() user: RequestUser) {
        return this.authService.getMe(user.id);
    }

    @Get("google")
    @ApiOperation({ summary: "Начать вход через Google" })
    async google(@Res() response: Response) {
        const state = this.authService.createOAuthState();
        const authUrl = await this.authService.getGoogleAuthUrl(state);
        this.setGoogleOAuthStateCookie(response, state);

        response.redirect(authUrl);
    }

    @Get("google/callback")
    @ApiOperation({ summary: "Callback входа через Google" })
    async googleCallback(
        @Query("code") code: string,
        @Query("state") state: string,
        @Req() request: Request,
        @Res() response: Response,
    ) {
        this.authService.validateOAuthState(request.cookies?.[GOOGLE_OAUTH_STATE_COOKIE], state);
        this.clearGoogleOAuthStateCookie(response);

        const result = await this.authService.handleGoogleCallback(code);
        this.setRefreshCookie(response, result.refreshToken);
        response.redirect(this.oauthSuccessUrl());
    }

    @Get("vk")
    @ApiOperation({ summary: "Начать вход через VK" })
    async vk(@Res() response: Response) {
        response.redirect(await this.authService.getVkAuthUrl());
    }

    @Get("vk/callback")
    @ApiOperation({ summary: "Callback входа через VK" })
    async vkCallback(@Query("code") code: string, @Res() response: Response) {
        const result = await this.authService.handleVkCallback(code);
        this.setRefreshCookie(response, result.refreshToken);
        response.redirect(this.oauthSuccessUrl());
    }

    private setRefreshCookie(response: Response, refreshToken: string) {
        response.cookie(REFRESH_COOKIE, refreshToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            maxAge: REFRESH_COOKIE_MAX_AGE,
            path: "/api/auth",
        });
    }

    private clearRefreshCookie(response: Response) {
        response.clearCookie(REFRESH_COOKIE, {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            path: "/api/auth",
        });
    }

    private setGoogleOAuthStateCookie(response: Response, state: string) {
        response.cookie(GOOGLE_OAUTH_STATE_COOKIE, state, {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            maxAge: GOOGLE_OAUTH_STATE_COOKIE_MAX_AGE,
            path: "/api/auth/google",
        });
    }

    private clearGoogleOAuthStateCookie(response: Response) {
        response.clearCookie(GOOGLE_OAUTH_STATE_COOKIE, {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            path: "/api/auth/google",
        });
    }

    private oauthSuccessUrl() {
        return `${this.configService.get<string>("CLIENT_URL") ?? "http://localhost:5173"}/auth/oauth-success`;
    }
}
