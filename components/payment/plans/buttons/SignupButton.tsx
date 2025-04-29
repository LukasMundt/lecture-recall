'use client'

import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {Plan} from "@prisma/client";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {changePlan, getCheckoutURL} from "@/actions/lemonsqueezy";
import {CheckIcon, Loader, PlusIcon} from "lucide-react";

export function SignupButton(props: {
    readonly plan: Plan
    readonly currentPlan?: Plan
    readonly isChangingPlans?: boolean;
}) {
    const {plan, currentPlan, isChangingPlans} = props
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const isCurrent = currentPlan && plan.id === currentPlan.id;

    const label = isCurrent
        ? "Dein Plan"
        : isChangingPlans
            ? "Zu diesem Plan wechseln"
            : "Loslegen";

    return (<Button
            disabled={(loading || isCurrent)}
            className="w-full"
            onClick={async () => {
                // If changing plans, call server action.
                if (isChangingPlans) {
                    if (!currentPlan?.id) {
                        throw new Error("Current plan not found.");
                    }

                    if (!plan.id) {
                        throw new Error("New plan not found.");
                    }

                    setLoading(true);
                    await changePlan(currentPlan.id, plan.id);
                    setLoading(false);

                    return;
                }

                // Otherwise, create a checkout and open the Lemon.js modal.
                let checkoutUrl: string | undefined = "";
                try {
                    setLoading(true);
                    checkoutUrl = await getCheckoutURL(plan.variantId);
                } catch (error) {
                    setLoading(false);
                    toast("Bitte versuche es später nochmal.", {
                        description:
                            "Fehler bei der Erzeugung eines Checkouts.",
                    });
                    console.error(error);
                } finally {
                    setLoading(false);
                }

                router.push(checkoutUrl ?? '/')
            }}
        >
            {!loading && (isCurrent ? <CheckIcon className="size-4"/> :
                <PlusIcon className="size-4"/>)}
            {loading ? <Loader className="animate-spin"/> : label}
        </Button>
    )
}