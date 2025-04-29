import {SubscriptionActions} from './actions'
import {SubscriptionDate} from './date'
import {SubscriptionPrice} from './price'
import {SubscriptionStatus} from './status'
import {cn, isValidSubscription} from '@/lib/utils'
import {prisma} from "@/prisma";
import {getCurrentUsage, getUserSubscriptions} from "@/actions/lemonsqueezy";
import {Subscription as LsSubscription, SubscriptionItemCurrentUsage} from "@lemonsqueezy/lemonsqueezy.js"
import {Subscription} from "@prisma/client";
import {ChangePlan} from "@/components/payment/subscription/ChangePlanButton";
import {Card} from "@/components/ui/card";
import SubscriptionUsage from "@/components/payment/subscription/SubscriptionUsage";

export async function Subscriptions() {
    const userSubscriptions = await getUserSubscriptions()
    const allPlans = await prisma.plan.findMany()
    const currentUsages: {
        subscriptionItemId: number,
        data: SubscriptionItemCurrentUsage | null
    }[] = await Promise.all(userSubscriptions.map(async (sub) => {
        const temp = await getCurrentUsage(sub.subscriptionItemId);
        return {subscriptionItemId: sub.subscriptionItemId, data: temp.data}
    }));


    if (userSubscriptions.length === 0) {
        return (
            <p className="not-prose mb-2">
                It appears that you do not have any subscriptions. Please sign up for a
                plan below.
            </p>
        )
    }

    // Show active subscriptions first, then paused, then canceled
    const sortedSubscriptions = userSubscriptions.sort((a, b) => {
        if (a.status === 'active' && b.status !== 'active') {
            return -1
        }

        if (a.status === 'paused' && b.status === 'cancelled') {
            return -1
        }

        return 0
    })

    return (<div>
            {sortedSubscriptions.map(
                (subscription: Subscription, index: number) => {
                    const plan = allPlans.find((p) => p.id === subscription.planId)
                    const status = subscription.status as LsSubscription["data"]["attributes"]["status"]
                    const usage = currentUsages.find((item) => item.subscriptionItemId === subscription.subscriptionItemId)


                    if (!plan) {
                        throw new Error('Plan not found')
                    }

                    return (
                        <Card className="pb-4 flex-col items-stretch justify-center gap-2" key={index}>

                            <header className="pt-4 px-4 flex items-center justify-between gap-3">
                                <div className="min-h-8 flex flex-wrap items-center gap-x-3 gap-y-1">
                                    <h2
                                        className={cn(
                                            'text-surface-900 text-lg',
                                            !isValidSubscription(status) && 'text-inherit'
                                        )}
                                    >
                                        {plan.productName} ({plan.name})
                                    </h2>
                                </div>

                                <div className="flex items-center gap-2">
                                    {isValidSubscription(status) && (
                                        <ChangePlan planId={subscription.planId}/>
                                    )}

                                    <SubscriptionActions subscription={subscription}/>
                                </div>
                            </header>

                            <div className="px-4 flex flex-wrap items-center gap-2">
                                <SubscriptionPrice
                                    endsAt={subscription.endsAt}
                                    interval={plan.interval}
                                    intervalCount={plan.intervalCount}
                                    price={subscription.price}
                                    isUsageBased={plan.isUsageBased ?? false}
                                />

                                <SubscriptionStatus
                                    status={status}
                                    statusFormatted={subscription.statusFormatted}
                                    isPaused={Boolean(subscription.isPaused)}
                                />

                                <SubscriptionDate
                                    endsAt={subscription.endsAt}
                                    renewsAt={subscription.renewsAt}
                                    status={status}
                                    trialEndsAt={subscription.trialEndsAt}
                                />
                                <SubscriptionUsage usage={usage?.data ?? null}/>
                            </div>
                        </Card>
                    )
                }
            )
            }
        </div>
    )
}
