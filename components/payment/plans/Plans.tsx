import {Plan} from "@prisma/client";
import {syncPlans} from "@/actions/lemonsqueezy";
import {prisma} from "@/prisma";
import {NoPlans, PlanItem} from "@/components/payment/plans/PlanItem";
import {cn} from "@/lib/utils";

export async function Plans({action}: { readonly action?: "signIn" | "default" }) {
    let allPlans: Plan[] = await prisma.plan.findMany({orderBy: [{price: "desc"}]})

    // If there are no plans in the database, sync them from Lemon Squeezy.
    // You might want to add logic to sync plans periodically or a webhook handler.
    // TODO: do this
    if (!allPlans.length) {
        allPlans = await syncPlans()
    }

    if (!allPlans.length) {
        return <NoPlans />;
    }

    return (
        <div>
            <div className="flex justify-center w-full lg:px-28">
                <div
                    className={cn("mb-5 mt-3 grid list gap-5", allPlans.length == 1 ? "md:w-1/3" : "", allPlans.length == 2 ? "md:w-2/3 md:grid-cols-3" : "lg:grid-cols-3")}>

                    {allPlans.sort((a, b) => parseInt(a.price) - parseInt(b.price)).map((plan, index) => {
                        return <PlanItem
                            key={`plan-${index}`} plan={plan} action={action}/>
                    })}
                </div>
            </div>

        </div>
    )
}
