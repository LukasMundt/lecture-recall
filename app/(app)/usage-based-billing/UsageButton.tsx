"use client";

import {updateUsage} from "@/actions/lemonsqueezy";
import {Button} from "@/components/ui/button";

export default function UsageButton({subscriptionItemId}: { readonly subscriptionItemId: number }) {
    return <Button onClick={() => updateUsage(
        "increment",
        1,
        subscriptionItemId
    )}>Increase Usage</Button>
}