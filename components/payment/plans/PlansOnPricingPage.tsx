import {Plan} from "@prisma/client";
import {syncPlans} from "@/actions/lemonsqueezy";
import {prisma} from "@/prisma";
import {PlanItem} from "@/components/payment/plans/PlanItem";
import {cn} from "@/lib/utils";

export async function PlansOnPricingPage() {
    let allPlans: Plan[] = await prisma.plan.findMany({orderBy: [{price: "desc"}]})

    // If there are no plans in the database, sync them from Lemon Squeezy.
    // You might want to add logic to sync plans periodically or a webhook handler.
    // TODO: remove this if done
    if (!allPlans.length) {
        allPlans = await syncPlans()
    }

    if (!allPlans.length) {
        return <p>Keine Pläne gefunden.</p>
    }

    return (
        <div>
            <div className="flex justify-center w-full lg:px-28">
                <div
                    className={cn("mb-5 mt-3 grid list gap-5", allPlans.length == 1 ? "md:w-1/3" : "", allPlans.length == 2 ? "md:w-2/3 md:grid-cols-2" : "")}>

                    {allPlans.map((plan, index) => {
                        return <PlanItem
                            key={`plan-${index}`} plan={plan}/>
                    })}
                </div>
            </div>

        </div>
    )
}
