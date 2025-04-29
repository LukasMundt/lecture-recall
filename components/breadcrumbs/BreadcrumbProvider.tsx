"use client";

import React, {ReactNode} from "react";
import {ComplexBreadcrumb} from "@/components/breadcrumbs/types";

type BreadcrumbContextType = {
    breadcrumbs: ComplexBreadcrumb[];
    setBreadcrumbs: React.Dispatch<React.SetStateAction<ComplexBreadcrumb[]>>;
}

const BreadcrumbContext = React.createContext<BreadcrumbContextType | undefined>(undefined);

export function BreadcrumbProvider({children}: { children: ReactNode }) {
    const [breadcrumbs, setBreadcrumbs] = React.useState<ComplexBreadcrumb[]>([{title: "Home", url: "/"}]);

    return <BreadcrumbContext.Provider value={{
        breadcrumbs,
        setBreadcrumbs
    }}>
        {children}
    </BreadcrumbContext.Provider>
}

export default function useBreadcrumbs() {
    const context = React.useContext(BreadcrumbContext);
    if (context === undefined) {
        throw new Error("useBreadcrumbs must be used within the BreadcrumbProvider");
    }
    return context;
}