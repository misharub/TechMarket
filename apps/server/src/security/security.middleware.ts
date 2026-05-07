import type { NextFunction, Request, Response } from "express";

type RateLimitEntry = {
    count: number;
    resetAt: number;
};

export function securityHeaders(request: Request, response: Response, next: NextFunction) {
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("X-Frame-Options", "DENY");
    response.setHeader("Referrer-Policy", "no-referrer");
    response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    response.setHeader("Cross-Origin-Resource-Policy", "same-site");
    next();
}

export function createRateLimitMiddleware(options: { windowMs: number; max: number }) {
    const hits = new Map<string, RateLimitEntry>();

    return (request: Request, response: Response, next: NextFunction) => {
        const now = Date.now();
        const key = `${request.ip}:${request.method}:${request.originalUrl}`;
        const current = hits.get(key);

        if (!current || current.resetAt <= now) {
            hits.set(key, {
                count: 1,
                resetAt: now + options.windowMs,
            });
            next();
            return;
        }

        current.count += 1;

        if (current.count > options.max) {
            response.status(429).json({
                statusCode: 429,
                message: "Too many requests, please try again later",
                error: "Too Many Requests",
            });
            return;
        }

        next();
    };
}
