import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export type RequestUser = {
    id: string;
    email: string;
    role: string;
};

// CurrentUser достает пользователя, которого JwtAuthGuard положил в request.
export const CurrentUser = createParamDecorator((data: keyof RequestUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user?: RequestUser }>();
    const user = request.user;

    return data && user ? user[data] : user;
});
