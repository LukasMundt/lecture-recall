import {Subscription} from "@prisma/client";
import {getSubscriptionURLs} from "@/actions/lemonsqueezy";
import {SubscriptionActionsDropdown} from "@/components/payment/subscription/ActionsDropdown";

export async function SubscriptionActions({
                                              subscription,
                                          }: {
    readonly subscription: Subscription;
}) {
    if (
        subscription.status === "expired" ||
        subscription.status === "cancelled" ||
        subscription.status === "unpaid"
    ) {
        return null;
    }

    const urls = await getSubscriptionURLs(subscription.lemonSqueezyId);

    return (
        <SubscriptionActionsDropdown subscription={subscription} urls={urls} />
    );
}