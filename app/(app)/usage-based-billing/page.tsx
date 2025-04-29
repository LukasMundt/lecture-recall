import {getUserSubscriptions} from "@/actions/lemonsqueezy";
import UsageButton from "@/app/(app)/usage-based-billing/UsageButton";

export default async function Protected() {
    const subs = await getUserSubscriptions();

    return <div>
        Every click costs. This is a working demo page to demonstrate how a usage record could be updated on various actions by the user.
        <div><UsageButton subscriptionItemId={subs[0].subscriptionItemId}/></div>
    </div>
}