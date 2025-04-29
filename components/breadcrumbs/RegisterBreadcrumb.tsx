"use client";

import useBreadcrumbs from "@/components/breadcrumbs/BreadcrumbProvider";
import {useEffect} from "react";
import {ComplexBreadcrumb} from "@/components/breadcrumbs/types";


export default function RegisterBreadcrumb({newBreadcrumbs}:{readonly newBreadcrumbs: ComplexBreadcrumb[]}) {
    const {breadcrumbs, setBreadcrumbs} = useBreadcrumbs();

    useEffect(() => {
        if(breadcrumbs != newBreadcrumbs) {
            setBreadcrumbs(newBreadcrumbs);
        }
    })


    return <></>;
}