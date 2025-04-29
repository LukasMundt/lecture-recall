import {redirect} from "next/navigation";
import {getUserSubscriptions} from "@/actions/lemonsqueezy";
import {prisma} from "@/prisma";
import {Plan} from "@prisma/client";
import {NoPlans, PlanItem} from "@/components/payment/plans/PlanItem";

export async function ChangePlans({currentPlan}: { readonly currentPlan?: Plan }) {
    const allPlans: Plan[] = await prisma.plan.findMany();
    const userSubscriptions = await getUserSubscriptions();

    // If user does not have a valid subscription, redirect to the billing page, or
    // if there are no plans in the database, redirect to the billing page to fetch.
    if (!userSubscriptions.length || !allPlans.length) {
        redirect("/billing");
    }

    const isCurrentPlanUsageBased = currentPlan?.isUsageBased;

    const filteredPlans = allPlans
        .filter((plan) => {
            return isCurrentPlanUsageBased
                ? Boolean(plan.isUsageBased)
                : Boolean(!plan.isUsageBased);
        })
        .sort((a, b) => {
            if (
                a.sort === undefined ||
                a.sort === null ||
                b.sort === undefined ||
                b.sort === null
            ) {
                return 0;
            }

            return a.sort - b.sort;
        });

    if (filteredPlans.length < 2) {
        return <NoPlans/>;
    }

    return (
        <div className="flex flex-col gap-5">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5">
                {filteredPlans.map((plan, index) => {
                    return (
                        <PlanItem
                            isChangingPlans={true}
                            key={`plan-${index}`}
                            plan={plan}
                            currentPlan={currentPlan}
                        />
                    );
                })}
            </div>
        </div>
    );
}