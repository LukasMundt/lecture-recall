import {Suspense} from "react";
import {Plans} from "@/components/payment/plans/Plans";
import {DashboardContent} from "@/components/DashboardContent";
import {Subscriptions} from "@/components/payment/subscription/subscriptions";
import {getUserSubscriptions} from "@/actions/lemonsqueezy";
import RegisterBreadcrumb from "@/components/breadcrumbs/RegisterBreadcrumb";
import {Skeleton} from "@/components/ui/skeleton";

export default async function BillingPage() {
    const userSubscriptions = await getUserSubscriptions();

    return (
        <DashboardContent
            title="Plan und Zahlungen"
            subtitle="Hier siehst du alle deine Subscriptions und kannst Änderungen vornehmen."
        >
            <RegisterBreadcrumb newBreadcrumbs={[{title: "Home", url: "/"}, {title: "Plan und Zahlungen", url: "/billing"}]}/>
            <Suspense fallback={<Skeleton className="h-20 w-full"/>}>
                <Subscriptions/>
            </Suspense>

            {userSubscriptions.length === 0 ?
                <Suspense fallback={<Skeleton className="h-48 w-full"/>}>
                    <Plans/>
                </Suspense> : ""
            }


        </DashboardContent>
    )
}