"use client";

import useBreadcrumbs from "./BreadcrumbProvider";
import {
    Breadcrumb,
    BreadcrumbEllipsis,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList, BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem, DropdownMenuPortal,
    DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {ComplexBreadcrumb} from "@/components/breadcrumbs/types";
import React from "react";
import {ChevronDownIcon} from "lucide-react";
import Link from "next/link";

export default function Breadcrumbs() {
    const {breadcrumbs} = useBreadcrumbs();

    return <Breadcrumb>
        <BreadcrumbList>
            {breadcrumbs.map((item, index, array) => {
                    // last
                    if (index == array.length - 1) {
                        if (item.sub && item.sub?.length >= 1) {
                            return <DropdownBreadcrumb key={item.url + index} breadcrumb={item}/>;
                        }
                        return <PageBreadcrumb key={item.url + index} breadcrumb={item}/>
                    }

                    // ellipsis
                    if (array.length > 3 && index == 1) {
                        return <React.Fragment key={"ellipsis"}>
                            <EllipsisBreadcrumb
                                breadcrumbs={array.filter((value, index) =>
                                    index != 0 && index < array.length - 2
                                )}/><BreadcrumbSeparator/></React.Fragment>;
                    }

                    // if more than 3 breadcrumbs and current element is not the first or one of the both last
                    if (index != 0 && index < array.length - 2) {
                        return <React.Fragment key={item.url + index}></React.Fragment>;
                    }

                    if (item.sub && item.sub?.length >= 1) {
                        return <React.Fragment key={item.url + index}>
                            <DropdownBreadcrumb key={item.url + index} breadcrumb={item}/>
                            <BreadcrumbSeparator/>
                        </React.Fragment>
                    }

                    return <React.Fragment key={item.url + index}><DefaultBreadcrumb breadcrumb={item}/>
                        <BreadcrumbSeparator/>
                    </React.Fragment>
                }
            )}
        </BreadcrumbList>
    </Breadcrumb>
}

function PageBreadcrumb({breadcrumb}: { readonly breadcrumb: ComplexBreadcrumb }) {
    return <BreadcrumbItem key={breadcrumb.url}>
        <BreadcrumbPage>{breadcrumb.title}</BreadcrumbPage>
    </BreadcrumbItem>
}

function DefaultBreadcrumb({breadcrumb}: { readonly breadcrumb: ComplexBreadcrumb }) {
    return <BreadcrumbItem>
        <BreadcrumbLink href={breadcrumb.url}>
            {breadcrumb.title}</BreadcrumbLink>
    </BreadcrumbItem>;
}

function DropdownBreadcrumb({breadcrumb}: { readonly breadcrumb: ComplexBreadcrumb }) {
    return <BreadcrumbItem>
        <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1">
                {breadcrumb.title}<ChevronDownIcon size={15}/>
                {/*<BreadcrumbEllipsis className="h-4 w-4"/>*/}
                {/*<span className="sr-only">Toggle menu</span>*/}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                {breadcrumb.sub?.map((item, index) => {
                    return <Link key={item.url + index} href={item.url}><DropdownMenuItem
                        className="cursor-pointer">{item.title}</DropdownMenuItem></Link>
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    </BreadcrumbItem>
}

function EllipsisBreadcrumb({breadcrumbs}: { readonly breadcrumbs: ComplexBreadcrumb[] }) {
    return <BreadcrumbItem>
        <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1">
                <BreadcrumbEllipsis className="h-4 w-4"/>
                <ChevronDownIcon size={15}/>
                <span className="sr-only">Toggle menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                {breadcrumbs.map((item, index) => {
                    if (item.sub && item.sub?.length >= 1) {
                        return <ComplexDropdownItem breadcrumb={item} key={item.url + index}/>
                    }
                    return <Link key={item.url + index} href={item.url}><DropdownMenuItem
                        className="cursor-pointer">{item.title}</DropdownMenuItem></Link>
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    </BreadcrumbItem>
}

function ComplexDropdownItem({breadcrumb}: { readonly breadcrumb: ComplexBreadcrumb }) {
    return <DropdownMenuSub>
        <DropdownMenuSubTrigger>{breadcrumb.title}</DropdownMenuSubTrigger>
        <DropdownMenuPortal>
            <DropdownMenuSubContent>
                {breadcrumb.sub?.map((item, index) => {
                    return <Link href={item.url}
                                 key={item.url + index}><DropdownMenuItem
                        className="cursor-pointer">{item.title}</DropdownMenuItem></Link>
                })}
            </DropdownMenuSubContent>
        </DropdownMenuPortal>
    </DropdownMenuSub>
}