import {redirect} from "next/navigation";
import {AuthError} from "next-auth";
import {Metadata} from "next";
import Link from "next/link";
import {cn} from "@/lib/utils";
import {Button, buttonVariants} from "@/components/ui/button";
import {signIn, providerMap, pages, auth} from "@/auth";
import {ChevronLeft, Key} from "lucide-react";
import {Card, CardContent} from "@/components/ui/card";

export const metadata: Metadata = {
    title: "Login",
    description: "Login to your account",
};

export default async function SignInPage({searchParams}: {
    readonly searchParams: Promise<{ callbackUrl?: string }>
}) {
    const callbackUrl = (await searchParams)?.callbackUrl ?? "/";
    const callbackUrlEmpty = (await searchParams)?.callbackUrl == undefined;
    const session = await auth();

    if (session) {
        redirect(callbackUrl);
    }

    return (
        <div className="flex pt-24 md:pt-36 lg:pt-52 flex-col items-center justify-center relative">
            <Link
                href={callbackUrl}
                className={cn(
                    buttonVariants({variant: "ghost"}),
                    "absolute left-0 top-0", callbackUrlEmpty?"hidden":""
                )}
                aria-hidden={callbackUrlEmpty}
            >
                <>
                    <ChevronLeft className="mr-2 h-4 w-4"/>
                    Zurück
                </>
            </Link>
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] px-7">
                <Card className="border-0 md:border shadow-none md:shadow">
                    <CardContent className="p-6 space-y-5">
                        <div className="flex flex-col space-y-5 text-center justify-center">
                            <div className="rounded-full w-fit h-fit mx-auto p-8 bg-secondary">
                                <Key size="50"/>
                            </div>

                            <h1 className="text-2xl font-semibold tracking-tight">Willkommen</h1>
                            <p className="text-sm text-muted-foreground">
                                Wähle einen der Dienste um dich anzumelden oder zu registrieren
                            </p>
                        </div>
                        <div className={"grid gap-6"}>
                            <div className="flex flex-col gap-2">
                                {Object.values(providerMap).map((provider) => (
                                    <form
                                        key={provider.id}
                                        action={async () => {
                                            "use server";
                                            try {
                                                await signIn(provider.id, {
                                                    redirectTo: callbackUrl,
                                                });
                                            } catch (error) {
                                                // Signin can fail for a number of reasons, such as the user
                                                // not existing, or the user not having the correct role.
                                                // In some cases, you may want to redirect to a custom error
                                                if (error instanceof AuthError) {
                                                    return redirect(`${pages.error}?error=${error.type}`);
                                                }

                                                // Otherwise if a redirects happens Next.js can handle it
                                                // so you can just re-thrown the error and let Next.js handle it.
                                                // Docs:
                                                // https://nextjs.org/docs/app/api-reference/functions/redirect#server-component
                                                throw error;
                                            }
                                        }}
                                    >
                                        <Button type="submit" variant={"outline"} className="w-full">
                                            <span>Sign in with {provider.name}</span>
                                        </Button>
                                    </form>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <p className="text-balance px-8 text-center text-muted-foreground text-xs">
                    Mit der Anmeldung akzeptieren Sie unsere{" "}
                    <Link
                        href="#"
                        className="hover:text-brand underline underline-offset-4"
                    >
                        AGB
                    </Link>{" "}
                    und{" "}
                    <Link
                        href="#"
                        className="hover:text-brand underline underline-offset-4"
                    >
                        Privacy Richtlinien
                    </Link>
                    .
                </p>
            </div>
        </div>
    )
        ;
}
