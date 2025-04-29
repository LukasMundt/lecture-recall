import { formatPrice } from "@/lib/utils";
import {unitNames} from "@/config/lemonsqueezy";

export function SubscriptionPrice({
                                      endsAt,
                                      price,
                                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                      interval,
                                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                      intervalCount,
                                      isUsageBased,
                                  }: {
    readonly endsAt?: string | null;
    readonly price: string;
    readonly interval?: string | null;
    readonly intervalCount?: number | null;
    readonly isUsageBased?: boolean;
}) {
    if (endsAt) return null;

    let formattedPrice = formatPrice(price);

    if (isUsageBased) {
        formattedPrice += " / "+unitNames.singular;
    }

    // const formattedIntervalCount =
    //     intervalCount && intervalCount !== 1 ? `every ${intervalCount} ` : "every";

    return <p>{`${formattedPrice}`}</p>;
}