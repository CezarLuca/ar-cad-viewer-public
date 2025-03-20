import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const session = await getToken({ req });

    // Check if the user is authenticated
    if (!session) {
        // Redirect to login page if not authenticated
        const url = new URL("/auth/login", req.url);
        url.searchParams.set("callbackUrl", req.url);
        return NextResponse.redirect(url);
    }

    // Check if accessing admin routes and user is not an admin
    if (req.nextUrl.pathname.startsWith("/admin") && session.role !== "admin") {
        // Redirect to dashboard if user is not an admin
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Allow access to the requested page if authenticated
    return NextResponse.next();
}

// Define the paths that require authentication
export const config = {
    matcher: ["/dashboard", "/admin/:path*"],
};
