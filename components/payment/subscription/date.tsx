import { formatDate } from "@/lib/utils";
import {Subscription} from "@lemonsqueezy/lemonsqueezy.js";

export function SubscriptionDate({
                                     endsAt,
                                     renewsAt,
                                     trialEndsAt,
                                 }: Readonly<{
    readonly endsAt?: string | null;
    readonly renewsAt?: string | null;
    readonly status: Subscription["data"]["attributes"]["status"];
    readonly trialEndsAt?: string | null;
}>) {
    const now = new Date();
    const trialEndDate = trialEndsAt ? new Date(trialEndsAt) : null;
    const endsAtDate = endsAt ? new Date(endsAt) : null;
    let message = `Abrechnung und Verlängerung am ${formatDate(renewsAt)}`;

    if (!trialEndsAt && !renewsAt) return null;

    if (trialEndDate && trialEndDate > now) {
        message = `Ende am ${formatDate(trialEndsAt)}`;
    }

    if (endsAt) {
        message =
            endsAtDate && endsAtDate < now
                ? `Ausgelaufen am ${formatDate(endsAt)}`
                : `Ausgelaufen am ${formatDate(endsAt)}`;
    }

    return (
        <>
            {<span className="text-surface-200">&bull;</span>}
            <p>{message}</p>
        </>
    );
}