import React from "react";
import Script from "next/script";

export default function Layout({children}: { readonly children: React.ReactNode }) {
    return <>
        <Script
            src="https://app.lemonsqueezy.com/js/lemon.js"
            strategy="lazyOnload"
        />
        {children}</>
}