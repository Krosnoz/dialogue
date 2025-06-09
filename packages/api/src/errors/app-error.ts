import { TRPCError } from "@trpc/server";

export class AppError extends Error {
	public readonly statusCode: number;
	public readonly isOperational: boolean;

	constructor(message: string, statusCode = 500, isOperational = true) {
		super(message);
		this.statusCode = statusCode;
		this.isOperational = isOperational;

		Error.captureStackTrace(this, this.constructor);
	}

	static notFound(message = "Resource not found") {
		return new AppError(message, 404);
	}

	static unauthorized(message = "Unauthorized") {
		return new AppError(message, 401);
	}

	static forbidden(message = "Forbidden") {
		return new AppError(message, 403);
	}

	static badRequest(message = "Bad request") {
		return new AppError(message, 400);
	}

	static conflict(message = "Conflict") {
		return new AppError(message, 409);
	}

	toTRPCError(): TRPCError {
		const codeMap: Record<number, string> = {
			400: "BAD_REQUEST",
			401: "UNAUTHORIZED",
			403: "FORBIDDEN",
			404: "NOT_FOUND",
			409: "CONFLICT",
			500: "INTERNAL_SERVER_ERROR",
		};

		return new TRPCError({
			code: (codeMap[this.statusCode] ||
				"INTERNAL_SERVER_ERROR") as TRPCError["code"],
			message: this.message,
		});
	}
}
