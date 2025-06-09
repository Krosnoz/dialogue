import { auth } from "@dialogue/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
	// Protected routes that require authentication
	const protectedPaths = ["/dashboard", "/chat", "/settings"];
	const { pathname } = request.nextUrl;

	// Check if the current path is protected
	const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

	if (isProtected) {
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session) {
			// Redirect to login if no session
			const loginUrl = new URL("/login", request.url);
			loginUrl.searchParams.set("callbackUrl", pathname);
			return NextResponse.redirect(loginUrl);
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
