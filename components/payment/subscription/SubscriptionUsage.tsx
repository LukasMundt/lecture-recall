import {SubscriptionItemCurrentUsage} from "@lemonsqueezy/lemonsqueezy.js";
import {unitNames} from "@/config/lemonsqueezy";


export default function SubscriptionUsage({usage}: { readonly usage: SubscriptionItemCurrentUsage | null }) {
    if(usage==null)
    {
        return <></>
    }
    return <><span className="text-surface-200">&bull;</span><p>{`Angefallen: ${usage.meta.quantity} ${usage.meta.quantity==1?unitNames.singular:unitNames.plural}`}</p></>
}