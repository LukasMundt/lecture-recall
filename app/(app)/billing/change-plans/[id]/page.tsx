import {notFound, redirect} from 'next/navigation'
import {isValidSubscription} from '@/lib/utils'
import {prisma} from "@/prisma";
import {getUserSubscriptions} from "@/actions/lemonsqueezy";
import {Subscription} from "@lemonsqueezy/lemonsqueezy.js";
import type {Metadata} from "next";
import {DashboardContent} from "@/components/DashboardContent";
import {ChangePlans} from "@/components/payment/plans/ChangePlans";
import RegisterBreadcrumb from "@/components/breadcrumbs/RegisterBreadcrumb";

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: "Change Plans"
};

export default async function ChangePlansPage({
                                                  params,
                                              }: {
    readonly params: Promise<{ id?: string }>
}) {
    if (!(await params).id) {
        notFound()
    }
    const currentPlanId = parseInt((await params).id as string)

    if (isNaN(currentPlanId)) {
        notFound()
    }

    // Get user subscriptions to check the current plan.
    const userSubscriptions = await getUserSubscriptions()

    if (!userSubscriptions.length) {
        notFound()
    }

    const isCurrentPlan = userSubscriptions.find(
        (s) =>
            s.planId === currentPlanId &&
            isValidSubscription(s.status as Subscription["data"]["attributes"]["status"])
    )

    if (!isCurrentPlan) {
        redirect('/billing')
    }

    const currentPlan = await prisma.plan.findMany({where: {id: currentPlanId}})

    if (!currentPlan.length) {
        notFound()
    }

    return (
        <DashboardContent
            title="Plan ändern"
            subtitle="Wähle einen Plan, der für dich passt."
        >
            <RegisterBreadcrumb newBreadcrumbs={[{title: "Home", url: "/"}, {title: "Plan und Zahlungen", url: "/billing"}, {title: "Plan ändern", url: "/billing"}]}/>
            <div>
                <ChangePlans currentPlan={currentPlan.at(0)}/>
            </div>

        </DashboardContent>
    )
}
