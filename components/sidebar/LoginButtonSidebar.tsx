import Link from "next/link";
import {auth, pages} from "@/auth";
import {LayoutDashboard, LogIn} from "lucide-react";

export default async function LoginButtonSidebar() {
    const session = await auth();

    return <Link href={session ? "/" : pages.signIn}>
        <span className="pl-0.5 flex gap-3 items-center">{session ? <LayoutDashboard size={20}/> :
            <LogIn size={20}/>}{session ? "Dashboard" : "Anmelden"}</span>
    </Link>
}