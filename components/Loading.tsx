"use client";

import { Loader } from "lucide-react";

export default function Loading({children}: {children?: React.ReactNode}) {
    return (
        <div className="h-dvh w-full flex flex-col absolute items-center justify-center text-center gap-[21px]">
            <Loader className="animate-spin" size={32} />
            {children}
        </div>
    );
}