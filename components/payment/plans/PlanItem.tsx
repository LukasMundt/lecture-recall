import {Plan} from "@prisma/client";
import {Card, CardContent, CardDescription, CardFooter, CardHeader} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {cn} from "@/lib/utils";
import Features from "@/components/payment/plans/Features";
import {SearchXIcon} from "lucide-react";
import {SignupButton} from "@/components/payment/plans/buttons/SignupButton";
import SignInButton from "@/components/payment/plans/buttons/SignInButton";
import {unitNames} from "@/config/lemonsqueezy";

export function PlanItem({plan, currentPlan, isChangingPlans, featured, featuredText, features, action}: {
    readonly plan: Plan,
    readonly currentPlan?: Plan,
    readonly isChangingPlans?: boolean,
    readonly featured?: boolean,
    readonly featuredText?: string
    readonly features?: {
        included: string[],
        excluded: string[],
    }
    readonly action?: "signIn" | "default"
}) {
    const {description, name, price} = plan
    let interval = null;

    switch (plan.interval) {
        case "day":
            interval = plan.intervalCount == 1 ? "täglich" : `alle ${plan.intervalCount} Tage`;
            break;
        case "week":
            interval = plan.intervalCount == 1 ? "wöchentlich" : `alle ${plan.intervalCount} Wochen`;
            break;
        case "month":
            interval = plan.intervalCount == 1 ? "monatlich" : `alle ${plan.intervalCount} Monate`;
            break;
        case "year":
            interval = plan.intervalCount == 1 ? "jährlich" : `alle ${plan.intervalCount} Jahre`;
    }

    return (
        <Card className={cn("relative", featured ? "my-0 border-primary" : "my-5")}>
            <CardHeader className={cn(featured ? "mb-3.5" : "")}>
                {featuredText &&
                    <div className="absolute -top-3 inset-x-0 flex justify-center"><Badge>{featuredText}</Badge></div>}

                <h2 className="text-2xl font-semibold">
                    {name}
                </h2>
                <CardDescription>{description}</CardDescription>
                <p className="mb-8"><span className="text-4xl font-bold">{parseInt(price) / 100}</span> €
                    / {plan.isUsageBased ? unitNames.singular : plan?.interval}</p>
            </CardHeader>

            <CardContent>
                {action == "signIn" ? <SignInButton/> : <SignupButton
                    plan={plan}
                    isChangingPlans={isChangingPlans}
                    currentPlan={currentPlan}
                />}
                {features && <Features features={features} className="mt-5"/>}
            </CardContent>
            <CardFooter>
                {plan.isUsageBased && interval &&
                    <div className="text-xs mt-8">Die Abbuchung findet {interval} statt.</div>}
            </CardFooter>
        </Card>
    )
}

export function NoPlans() {
    return (
        <section className="prose mt-[10vw] flex flex-col items-center justify-center">
      <span className="flex size-24 items-center justify-center rounded-full bg-wg-red-50/70">
        <SearchXIcon
            className="text-wg-red"
            aria-hidden="true"
            size={48}
            strokeWidth={0.75}
        />
      </span>

            <p className="max-w-prose text-balance text-center leading-6 text-gray-500">
                Aktuell sind leider keine Pläne verfügbar.
            </p>
        </section>
    );
}