export {auth as authMiddleware} from "@/auth"
import {NextRequest, NextResponse} from "next/server";
import umami from "@umami/node";

// export const config = {
//     runtime: "nodejs",
// };

export default async function middleware(request: NextRequest) {
    // Apply custom middleware logic first
    const customResponse = customMiddleware(request);

    // If custom middleware returned a response, use it
    if (customResponse) {
        return customResponse;
    }

    // Fallback to NextAuth middleware
    // return authMiddleware(request);
    return NextResponse.next();
}

export function customMiddleware(request: NextRequest) {
    // Dynamische URL bestimmen
    const rewriteUrl = getRewriteUrl(request);
    const redirectUrl = getRedirectUrl(request);
    const shouldBeTracked = getShouldBeTracked(request);
    const {pathname} = request.nextUrl;

    // track page visit if it should be tracked
    if (shouldBeTracked && (rewriteUrl || redirectUrl)) {
        umami.init({
            websiteId: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID, // Your website id
            hostUrl: process.env.UMAMI_URL, // URL to your Umami instance
        });
        umami.track({url: pathname});
    }

    // rewrite or redirect
    if (rewriteUrl) {
        // rewrite (url for the client is the same, next works like a proxy)
        return NextResponse.rewrite(rewriteUrl);
    } else if (redirectUrl) {
        // redirect (url for the client changes)
        return NextResponse.redirect(redirectUrl);
    }


    return NextResponse.next();
}

// Hilfsfunktion zur URL-Bestimmung (kann auch eine API-Abfrage sein)
function getRewriteUrl(request: NextRequest): string | null {
    const {pathname} = request.nextUrl;

    // Beispiel: Basierend auf Pfadnamen umleiten
    switch (pathname) {
        case "/script.js":
            return process.env.UMAMI_URL + "/script.js";
        case "/api/send":
            return process.env.UMAMI_URL + "/api/send";
        default:
            return null;
    }
}

function getRedirectUrl(request: NextRequest): string | null {
//   const { pathname } = request.nextUrl;
    //   if (/\/shared.*/g.test(pathname)) {
    //     return request.nextUrl.toString().replace("/shared", "");
    //   }
    return null;
}

function getShouldBeTracked(request: NextRequest): boolean {
    const {pathname} = request.nextUrl;
    return /\/shared.*/g.test(pathname);
}
