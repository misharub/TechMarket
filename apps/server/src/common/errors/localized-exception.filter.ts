import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { localizeErrorMessages } from "./error-localization";

type ErrorResponseBody = {
    error?: string;
    message?: string | string[];
    statusCode?: number;
    [key: string]: unknown;
};

function localizeBody(body: string | ErrorResponseBody, statusCode: number): ErrorResponseBody {
    if (typeof body === "string") {
        return {
            statusCode,
            message: localizeErrorMessages(body),
        };
    }

    return {
        ...body,
        statusCode: body.statusCode ?? statusCode,
        ...(body.message ? { message: localizeErrorMessages(body.message) } : {}),
        ...(body.error ? { error: localizeErrorMessages(body.error) as string } : {}),
    };
}

@Catch()
export class LocalizedExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const context = host.switchToHttp();
        const response = context.getResponse<Response>();
        const request = context.getRequest<Request>();

        if (exception instanceof HttpException) {
            const statusCode = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            const body = localizeBody(
                typeof exceptionResponse === "string" ? exceptionResponse : exceptionResponse as ErrorResponseBody,
                statusCode,
            );

            response.status(statusCode).json({
                ...body,
                path: request.originalUrl,
                timestamp: new Date().toISOString(),
            });
            return;
        }

        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: "Внутренняя ошибка сервера",
            error: "Внутренняя ошибка сервера",
            path: request.originalUrl,
            timestamp: new Date().toISOString(),
        });
    }
}
