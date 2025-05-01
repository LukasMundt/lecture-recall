import Link from "next/link";
import {Button} from "@/components/ui/button";
import packageJson from "./../../package.json";
import logo from "./../../logo.png";
import Image from "next/image";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem, NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger, navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import React from "react";
import {cn} from "@/lib/utils";
import {SidebarProvider} from "@/components/ui/sidebar";
import PublicMobileMenuSidebar from "@/components/sidebar/PublicMobileMenuSidebar";
import {CustomTrigger} from "@/components/sidebar/CustomTrigger";

const menu: ({ title: string, items: { title: string; href: string; description: string }[] } | {
    title: string,
    href: string
})[] = [
    {
        title: "Produkte", items: [
            {
                title: "Produkt 1",
                href: "/product-1",
                description: "Dies ist eine kurze Beschreibung.",
            },
        ]
    },
    {
        title: "Preise",
        href: "/pricing",
    }
]

export default function Layout({children}: { readonly children: React.ReactNode }) {
    return <SidebarProvider defaultOpen={false}>
        <PublicMobileMenuSidebar menu={menu} />
        <div className="w-screen">
            <nav className="px-8 lg:px-24 flex justify-between w-full items-center h-16">
                <div className="w-24">
                    <Link href="/">
                        <Image src={logo} alt="Logo" height={50}/>
                    </Link>
                </div>
                <div className="flex justify-center w-full gap-3">
                    <NavigationMenu className="hidden md:block">
                        <NavigationMenuList>
                            {menu.map((item, index) => {
                                if ("items" in item) {
                                    return <NavigationMenuItem key={`${index}-${item.title}`}>
                                        <NavigationMenuTrigger className="bg-transparent">
                                            Produkte
                                        </NavigationMenuTrigger>
                                        <NavigationMenuContent>
                                            <ul
                                                className={
                                                    item.items.length > 2
                                                        ? "grid w-[400px] gap-3 p-4 md:w-[450px] md:grid-cols-2 lg:w-[600px] "
                                                        : "grid w-[250px] gap-3 p-4 "
                                                }
                                            >
                                                {item.items.map((component) => (
                                                    <ListItem
                                                        key={component.title}
                                                        title={component.title}
                                                        href={component.href}
                                                    >
                                                        {component.description}
                                                    </ListItem>
                                                ))}
                                            </ul>
                                        </NavigationMenuContent>
                                    </NavigationMenuItem>
                                }
                                return <NavigationMenuItem key={`${index}-${item.title}`}>
                                    <Link href={item.href} legacyBehavior passHref>
                                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                            {item.title}
                                        </NavigationMenuLink>
                                    </Link>
                                </NavigationMenuItem>
                            })}
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
                <div className="md:flex justify-end w-24 hidden ">
                    {/*<Suspense fallback={<Skeleton className={"h-9 w-24"}/>}>*/}
                    {/*    <LoginButton/>*/}
                    {/*</Suspense>*/}
                </div>
                <div className="md:hidden justify-end w-24 flex">
                    <CustomTrigger/>
                </div>
            </nav>
            <main className="p-8 lg:px-24 w-full mx-auto py-3  lg:py-8">
                {children}
            </main>
            <footer className="px-8 lg:px-24 py-32 space-y-10">
                {/* <Separator className="mx-auto bg-violet-300 h-1 rounded-full w-1/2"/> */}
                <div className="w-full flex flex-wrap justify-center gap-x-10">
                    <Link href="/privacy">
                        <Button variant="link">Datenschutzerklärung</Button>
                    </Link>
                    <Link href="/imprint">
                        <Button variant="link">Impressum</Button>
                    </Link>

                    <Link href="/contact">
                        <Button variant="link">Schreibe mir.</Button>
                    </Link>
                </div>
                <div className="w-full text-center">
                    &copy; {new Date().getFullYear()} Lukas Mundt. Alle Rechte vorbehalten. Version <span
                    className="font-bold">{packageJson.version}</span>.
                </div>
            </footer>
        </div>
    </SidebarProvider>

}

const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
>(({className, title, children, ...props}, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className
                    )}
                    {...props}
                >
                    <div className="text-sm font-medium leading-none">{title}</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    );
});
ListItem.displayName = "ListItem";