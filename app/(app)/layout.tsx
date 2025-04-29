import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/sidebar/AppSidebar";
import {Separator} from "@/components/ui/separator";
import {auth, pages} from "@/auth";
import NotAuthenticated from "@/components/NotAuthenticated";
import {BreadcrumbProvider} from "@/components/breadcrumbs/BreadcrumbProvider";
import Breadcrumbs from "@/components/breadcrumbs/Breadcrumbs";
import React from "react";

export default async function Layout({children}: { readonly children: React.ReactNode }) {
    const session = await auth();

    if (!session) {
        return <NotAuthenticated redirectUrl={pages.signIn}/>
    }

    return <SidebarProvider>
        <AppSidebar user={session.user}/>
        <SidebarInset>
            <BreadcrumbProvider>
                <header
                    className="w-full bg-sidebar border border-l-0 border-b-sidebar-border p-2 md:p-3 flex items-center">
                    <SidebarTrigger/>
                    <Separator orientation="vertical" className="h-4 mr-2"/>
                    <Breadcrumbs />
                </header>
                <div className="p-3">
                    {children}
                </div>
            </BreadcrumbProvider>
        </SidebarInset>
    </SidebarProvider>

}