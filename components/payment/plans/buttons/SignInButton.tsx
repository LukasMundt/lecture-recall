import Link from "next/link";
import {pages} from "@/auth";
import {Button} from "@/components/ui/button";

export default function SignInButton() {
    const url = pages.signIn+"?callbackUrl=/billing";

    return <Link href={url}>
        <Button className="w-full">Jetzt starten</Button>
    </Link>
}