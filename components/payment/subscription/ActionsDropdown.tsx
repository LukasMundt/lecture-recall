'use client'

import {MoreVerticalIcon} from 'lucide-react'
import {useState} from 'react'
import {Subscription} from "@prisma/client";
import {Skeleton} from "@/components/ui/skeleton";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {cancelSub, getSubscriptionURLs, pauseUserSubscription, unpauseUserSubscription} from '@/actions/lemonsqueezy';
import {Button} from "@/components/ui/button";
import { LemonSqueezyModalLink } from './modal-link';

export function SubscriptionActionsDropdown({
                                                subscription,
                                                urls,
                                            }: {
    readonly subscription: Subscription
    readonly urls: Awaited<ReturnType<typeof getSubscriptionURLs>>
}) {
    const [loading, setLoading] = useState(false)

    if (
        subscription.status === 'expired' ||
        subscription.status === 'cancelled' ||
        subscription.status === 'unpaid'
    ) {
        return null
    }

    return (
        <>
            {loading && (
                <div className="bg-surface-50/50 absolute inset-0 z-10 flex items-center justify-center rounded-md">
                    <Skeleton className={"w-full"}/>
                </div>
            )}

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        size="sm"
                        variant="outline"
                        className="size-8 data-[state=open]:bg-surface-50"

                    ><MoreVerticalIcon className="size-4"/></Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent side="bottom" className="z-10" align="end">
                    <DropdownMenuGroup>
                        {!subscription.isPaused && (
                            <DropdownMenuItem
                                onClick={async () => {
                                    setLoading(true)
                                    await pauseUserSubscription(subscription.lemonSqueezyId).then(
                                        () => {
                                            setLoading(false)
                                        }
                                    )
                                }}
                            >
                                Zahlungen pausieren
                            </DropdownMenuItem>
                        )}

                        {subscription.isPaused && (
                            <DropdownMenuItem
                                onClick={async () => {
                                    setLoading(true)
                                    await unpauseUserSubscription(
                                        subscription.lemonSqueezyId
                                    ).then(() => {
                                        setLoading(false)
                                    })
                                }}
                            >
                                Zahlungen starten
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuItem asChild>
                            <a href={urls?.customer_portal}>Kundenportal ↗</a>
                        </DropdownMenuItem>

                        <LemonSqueezyModalLink href={urls?.update_payment_method}>
                            Zahlungsmethode bearbeiten
                        </LemonSqueezyModalLink>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator/>

                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            className="border bg-destructive/30"
                            onClick={async () => {
                                if (
                                    confirm(
                                        `Bitte bestätige, dass du deine Subscription beenden möchtest.`
                                    )
                                ) {
                                    setLoading(true)
                                    await cancelSub(subscription.lemonSqueezyId).then(() => {
                                        setLoading(false)
                                    })
                                }
                            }}
                        >
                            Subscription beenden
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
