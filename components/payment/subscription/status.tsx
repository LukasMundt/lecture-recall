import {Badge} from "@/components/ui/badge";
import {Subscription} from "@lemonsqueezy/lemonsqueezy.js";
import {cn} from "@/lib/utils";

export function SubscriptionStatus({
                                       status,
                                       statusFormatted,
                                       isPaused,
                                   }: {
    readonly status: Subscription["data"]["attributes"]["status"];
    readonly statusFormatted: string;
    readonly isPaused?: boolean;
}) {
    const statusColor: Record<Subscription["data"]["attributes"]["status"], string> = {
        active: "bg-green-500 hover:bg-green-600",
        cancelled: "bg-gray-500 hover:bg-gray-600",
        expired: "bg-red-500 hover:bg-red-600",
        past_due: "bg-red-500 hover:bg-red-600",
        on_trial: "bg-primary",
        unpaid: "bg-red-500 hover:bg-red-600",
        pause: "bg-yellow-500 hover:bg-yellow-600",
        paused: "bg-yellow-500 hover:bg-yellow-600",
    };

    const _status = isPaused ? "paused" : status;
    const _statusFormatted = isPaused ? "Paused" : statusFormatted;

    return (
        <>
            {status !== "cancelled" && (
                <span className="text-surface-200">&bull;</span>
            )}

            <Badge
                className={cn("rounded-sm px-1 py-0 text-sm", statusColor[_status])}
            >
                {_statusFormatted}
            </Badge>
        </>
    );
}