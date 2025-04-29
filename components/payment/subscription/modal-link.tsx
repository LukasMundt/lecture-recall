"use client";

import { type ReactNode, useEffect } from "react";
import {DropdownMenuItem} from "@/components/ui/dropdown-menu";

declare global {
    interface Window {
        createLemonSqueezy: () => void;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        LemonSqueezy: any;
    }
}

export function LemonSqueezyModalLink({
                                          href,
                                          children,
                                      }: {
    readonly href?: string;
    readonly children: ReactNode;
}) {
    useEffect(() => {
        if (typeof window.createLemonSqueezy === "function") {
            window.createLemonSqueezy();
        } else {
            console.warn("createLemonSqueezy is not available yet.");
        }
    }, []);

    return (
        <DropdownMenuItem
            onClick={() => {
                if (href) {
                    window.LemonSqueezy.Url.Open(href);
                } else {
                    throw new Error(
                        "href provided for the Lemon Squeezy modal is not valid.",
                    );
                }
            }}
        >
            {children}
        </DropdownMenuItem>
    );
}