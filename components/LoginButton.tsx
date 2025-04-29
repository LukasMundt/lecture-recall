import Link from "next/link";
import {auth, pages} from "@/auth";
import {Button} from "@/components/ui/button";

export default async function LoginButton() {
    const session = await auth();

    return <Link href={session ? "/" : pages.signIn}>
        <Button variant="ghost" className="space-x-1 group">
            <span className="">{session ? "Dashboard" : "Anmelden"}</span>
        </Button></Link>
}