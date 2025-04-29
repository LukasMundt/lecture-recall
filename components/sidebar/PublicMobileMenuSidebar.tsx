import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarSeparator
} from "@/components/ui/sidebar";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";
import {ChevronDown} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/logo.png";
import React from "react";
import LoginButtonSidebar from "@/components/sidebar/LoginButtonSidebar";

export default async function PublicMobileMenuSidebar({menu}: {
    readonly menu: ({ title: string, items: { title: string; href: string; description: string }[] } | {
        title: string,
        href: string
    })[]
}) {
    return <Sidebar>
        <SidebarHeader>
            <div className="w-full flex justify-center mb-5">
                <Link href="/">
                    <Image src={logo} alt="Logo" height={50}/>
                </Link>
            </div>
        </SidebarHeader>
        <SidebarContent>
            <SidebarGroup>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <LoginButtonSidebar />
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
            <SidebarSeparator />
            <SidebarGroup>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {menu.map((item, index) => {
                                if ("items" in item) {
                                    return (<Collapsible defaultOpen={index == 0} className="group/collapsible"
                                                         key={`${item.title}-${index}`}>
                                            <SidebarMenuItem>
                                                <CollapsibleTrigger asChild>
                                                    <SidebarMenuButton>{item.title}<ChevronDown
                                                        className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180"/></SidebarMenuButton>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <SidebarMenuSub>
                                                        {item.items?.map((sub, index) => <SidebarMenuSubItem
                                                                key={`${sub.title}-${index}`}>
                                                                <SidebarMenuSubButton asChild>
                                                                    <Link href={sub.href}>{sub.title}</Link>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        )}
                                                    </SidebarMenuSub>
                                                </CollapsibleContent>
                                            </SidebarMenuItem>
                                        </Collapsible>
                                    )
                                }
                                return (<SidebarMenuItem key={item.title + "-" + index}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.href}>
                                            {item.title}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>)
                            }
                        )}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </SidebarContent>
    </Sidebar>
}