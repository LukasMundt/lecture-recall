"use client";

import {redirect, usePathname} from "next/navigation";

export default function NotAuthenticated({redirectUrl}: {redirectUrl: string}) {
    const pathname = usePathname();

    redirect(redirectUrl+"?callbackUrl="+pathname)

    return <>Nicht angemeldet.</>
}