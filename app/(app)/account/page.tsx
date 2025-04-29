import RegisterBreadcrumb from "@/components/breadcrumbs/RegisterBreadcrumb";
import {auth} from "@/auth";
import {prisma} from "@/prisma";
import {Card, CardContent, CardHeader} from "@/components/ui/card";

export default async function Account() {
    const session = await auth();
    const user = await prisma.user.findFirst({where: {id: session?.user?.id}});
    const accounts = await prisma.account.findMany({where: {userId: session?.user?.id}, select: {provider: true,}})

    return <div className="xl:px-40 pt-3">
        <RegisterBreadcrumb
            newBreadcrumbs={[{title: "Home", url: "/"}, {title: "Account", url: "/account"}]}/>
        <h1 className={"text-2xl font-semibold mb-3"}>Profil</h1>
        {/*TODO: do this right*/}
        <Card>
            <CardHeader><h2 className="text-md font-semibold">E-Mail</h2></CardHeader>
            <CardContent>
                {user?.email}
            </CardContent>
        </Card>
        <Card>
            <CardHeader><h2 className="text-md font-semibold">Verbundene Accounts</h2></CardHeader>
            <CardContent>
                {JSON.stringify(accounts)}
            </CardContent>
        </Card>

        <div>{JSON.stringify(session?.user)}</div>
        <hr/>
        <div>{JSON.stringify(user)}</div>
    </div>
}