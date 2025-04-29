'use server'

import {
    cancelSubscription,
    createCheckout, createUsageRecord,
    getPrice,
    getProduct, getSubscription, getSubscriptionItemCurrentUsage,
    listPrices,
    listProducts, NewUsageRecord,
    updateSubscription,
    Variant
} from '@lemonsqueezy/lemonsqueezy.js'
import {configureLemonSqueezy} from "@/config/lemonsqueezy";
import {prisma} from '@/prisma';
import {Plan, Prisma, Subscription, WebhookEvent} from "@prisma/client";
import {auth} from "@/auth";
import {webhookHasData, webhookHasMeta} from '@/lib/typeguards'
import {revalidatePath} from 'next/cache';
import {notFound} from "next/navigation";

export async function getCheckoutURL(variantId: number, embed = false) {
    configureLemonSqueezy()

    const session = await auth()

    if (!session?.user) {
        throw new Error('User is not authenticated.')
    }

    const checkout = await createCheckout(
        process.env.LEMONSQUEEZY_STORE_ID!,
        variantId,
        {
            checkoutOptions: {
                embed: embed,
                media: false,
                logo: !embed,
            },
            checkoutData: {
                email: session.user.email ?? undefined,
                name: session.user.name ?? undefined,
                custom: {
                    user_id: session.user.id
                },
                billingAddress: {
                    country: "DE",
                }
            },
            productOptions: {
                enabledVariants: [variantId],
                redirectUrl: `${process.env.CLOUDRON_APP_ORIGIN ?? "localhost:3000"}/billing/`,
                receiptButtonText: 'Go to Dashboard',
                // TODO: change
                receiptThankYouNote: 'Thank you for signing up to Lemon Stand!',
            },
        }
    )
    return checkout.data?.data.attributes.url
}

export async function syncPlans() {
    configureLemonSqueezy()

    // Fetch all the variants from the database.
    const productVariants: Plan[] = await prisma.plan.findMany()

    // Helper function to add a variant to the productVariants array and sync it with the database.
    async function _addVariant(variant: Omit<Plan, "id">) {
        console.log(`Syncing variant ${variant.name} with the database...`)

        // Sync the variant with the plan in the database.
        const savedVariant = await prisma.plan.upsert({
            where: {variantId: variant.variantId},
            create: {...variant},
            update: {...variant},
        })

        console.log(`${savedVariant.name} synced with the database...`)

        productVariants.push(savedVariant)
    }

    // Fetch products from the Lemon Squeezy store.
    const products = await listProducts({
        filter: {storeId: process.env.LEMONSQUEEZY_STORE_ID},
        include: ['variants'],
    })

    // Loop through all the variants.
    const allVariants = products.data?.included as Variant['data'][] | undefined
    console.log(allVariants)

    // for...of supports asynchronous operations, unlike forEach.
    if (allVariants) {
        /* eslint-disable no-await-in-loop -- allow */
        for (const v of allVariants) {
            const variant = v.attributes

            // Skip draft variants or if there's more than one variant, skip the default
            // variant. See https://docs.lemonsqueezy.com/api/variants
            if (
                variant.status === 'draft' ||
                (allVariants.length !== 1 && variant.status === 'pending')
            ) {
                // `return` exits the function entirely, not just the current iteration.
                // so use `continue` instead.
                continue
            }

            // Fetch the Product name.
            const productName =
                (await getProduct(variant.product_id)).data?.data.attributes.name ?? ''

            // Fetch the Price object.
            const variantPriceObject = await listPrices({
                filter: {
                    variantId: v.id,
                },
            })

            const currentPriceObj = variantPriceObject.data?.data.at(0)
            const isUsageBased =
                currentPriceObj?.attributes.usage_aggregation !== null
            const interval = currentPriceObj?.attributes.renewal_interval_unit
            const intervalCount =
                currentPriceObj?.attributes.renewal_interval_quantity
            const trialInterval = currentPriceObj?.attributes.trial_interval_unit
            const trialIntervalCount =
                currentPriceObj?.attributes.trial_interval_quantity

            const price = isUsageBased
                ? currentPriceObj?.attributes.unit_price_decimal
                : currentPriceObj.attributes.unit_price

            const priceString = price !== null ? price?.toString() ?? '' : ''

            const isSubscription =
                currentPriceObj?.attributes.category === 'subscription'

            // If not a subscription, skip it.
            if (!isSubscription) {
                continue
            }

            await _addVariant({
                name: variant.name,
                description: variant.description,
                price: priceString,
                interval: interval ?? null,
                intervalCount: intervalCount ?? null,
                isUsageBased: isUsageBased,
                productId: variant.product_id,
                productName: productName,
                variantId: parseInt(v.id) as unknown as number,
                trialInterval: trialInterval ?? null,
                trialIntervalCount: trialIntervalCount ?? null,
                sort: variant.sort,
            })
        }
    }

    return productVariants
}

/**
 * This action will store a webhook event in the database.
 * @param eventName - The name of the event.
 * @param body - The body of the event.
 */
export async function storeWebhookEvent(
    eventName: string,
    body: WebhookEvent["body"],
) {
    const returnedValue = await prisma.webhookEvent.create({
        data: {
            eventName: eventName,
            body: body ?? Prisma.JsonNull,
            processed: false
        }
    })

    return returnedValue;
}

/**
 * Process a webhook event in the database.
 */
export async function processWebhookEvent(webhookEvent: WebhookEvent) {
    configureLemonSqueezy()

    const dbwebhookEvent = await prisma.webhookEvent.findMany({where: {id: webhookEvent.id}})


    if (dbwebhookEvent.length < 1) {
        throw new Error(
            `Webhook event #${webhookEvent.id} not found in the database.`
        )
    }

    let processingError: string | null = null;
    const eventBody = webhookEvent.body

    if (!webhookHasMeta(eventBody)) {
        processingError = "Event body is missing the 'meta' property.";
    } else if (webhookHasData(eventBody)) {
        if (webhookEvent.eventName.startsWith('subscription_payment_')) {
            // TODO: Save subscription invoices; eventBody is a SubscriptionInvoice
            // Not implemented.
            console.log("not implemented")
        } else if (webhookEvent.eventName.startsWith('subscription_')) {
            // Save subscription events; obj is a Subscription
            const attributes = eventBody.data.attributes
            const variantId = attributes.variant_id as string

            // We assume that the Plan table is up to date.
            const plan = await prisma.plan.findMany({where: {variantId: parseInt(variantId, 10)}})

            if (plan.length < 1) {
                processingError = `Plan with variantId ${variantId} not found.`
            } else {
                // Update the subscription in the database.
                const priceId = attributes.first_subscription_item.price_id

                // Get the price data from Lemon Squeezy.
                const priceData = await getPrice(priceId)
                if (priceData.error) {
                    processingError = `Failed to get the price data for the subscription ${eventBody.data.id}.`
                }

                const isUsageBased = attributes.first_subscription_item.is_usage_based
                const price = isUsageBased
                    ? priceData.data?.data.attributes.unit_price_decimal
                    : priceData.data?.data.attributes.unit_price

                const updateData: Omit<Subscription, "id"> = {
                    lemonSqueezyId: eventBody.data.id,
                    orderId: attributes.order_id as number,
                    name: attributes.user_name as string,
                    email: attributes.user_email as string,
                    status: attributes.status as string,
                    statusFormatted: attributes.status_formatted as string,
                    renewsAt: attributes.renews_at as string,
                    endsAt: attributes.ends_at as string,
                    trialEndsAt: attributes.trial_ends_at as string,
                    price: price?.toString() ?? '',
                    isPaused: attributes.pause != null,
                    subscriptionItemId: attributes.first_subscription_item.id,
                    isUsageBased: attributes.first_subscription_item.is_usage_based,
                    userId: eventBody.meta.custom_data.user_id,
                    planId: plan[0].id,
                }

                // Create/update subscription in the database.
                try {
                    await prisma.subscription.upsert({
                        where: {lemonSqueezyId: updateData.lemonSqueezyId},
                        create: {...updateData},
                        update: {...updateData}
                    })
                } catch (error) {
                    processingError = `Failed to upsert Subscription #${updateData.lemonSqueezyId} to the database.`
                    console.error(error)
                }
            }
        } else if (webhookEvent.eventName.startsWith('order_')) {
            // TODO: Save orders; eventBody is a "Order"
            /* Not implemented */
        } else if (webhookEvent.eventName.startsWith('license_')) {
            // TODO: Save license keys; eventBody is a "License key"
            /* Not implemented */
        }

    }

    // Update the webhook event in the database.
    await prisma.webhookEvent.update({
        where: {id: webhookEvent.id},
        data: {processed: processingError != null, processingError: processingError}
    })
}

/**
 * This action will get the subscriptions for the current user.
 */
export async function getUserSubscriptions() {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        notFound();
    }

    const userSubscriptions: Subscription[] = await prisma.subscription.findMany({where: {userId: userId}})

    // todo: do sth (if present error is thrown that revalidation during rendering is illegal) https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic#dynamic-rendering
    // revalidatePath("/");

    return userSubscriptions;
}

/**
 * This action will get the subscription URLs (including `update_payment_method` for the given subscription ID.
 *
 */
export async function getSubscriptionURLs(id: string) {
    configureLemonSqueezy()
    const subscription = await getSubscription(id)

    if (subscription.error) {
        throw new Error(subscription.error.message)
    }

    return subscription.data?.data.attributes.urls
}

/**
 * This action will cancel a subscription on Lemon Squeezy.
 */
export async function cancelSub(id: string) {
    configureLemonSqueezy()

    // Get user subscriptions
    const userSubscriptions = await getUserSubscriptions()

    // Check if the subscription exists
    const subscription = userSubscriptions.find(
        (sub) => sub.lemonSqueezyId === id
    )

    if (!subscription) {
        throw new Error(`Subscription #${id} not found.`)
    }

    const cancelledSub = await cancelSubscription(id)

    if (cancelledSub.error) {
        throw new Error(cancelledSub.error.message)
    }

    // Update the db
    try {
        await prisma.subscription.update({
            where: {lemonSqueezyId: id},
            data: {
                status: cancelledSub.data?.data.attributes.status,
                statusFormatted: cancelledSub.data?.data.attributes.status_formatted,
                endsAt: cancelledSub.data?.data.attributes.ends_at
            }
        })
    } catch (error) {
        throw new Error(`Failed to cancel Subscription #${id} in the database.`, {cause: error})
    }

    revalidatePath('/')

    return cancelledSub
}

/**
 * This action will pause a subscription on Lemon Squeezy.
 */
export async function pauseUserSubscription(id: string) {
    configureLemonSqueezy()

    // Get user subscriptions
    const userSubscriptions = await getUserSubscriptions()

    // Check if the subscription exists
    const subscription = userSubscriptions.find(
        (sub) => sub.lemonSqueezyId === id
    )

    if (!subscription) {
        throw new Error(`Subscription #${id} not found.`)
    }

    const returnedSub = await updateSubscription(id, {
        pause: {
            mode: 'void',
        },
    })

    // Update the db
    try {
        await prisma.subscription.update({
            where: {lemonSqueezyId: id},
            data: {
                status: returnedSub.data?.data.attributes.status,
                statusFormatted: returnedSub.data?.data.attributes.status_formatted,
                endsAt: returnedSub.data?.data.attributes.ends_at,
                isPaused: returnedSub.data?.data.attributes.pause !== null,
            }
        })
    } catch (error) {
        throw new Error(`Failed to pause Subscription #${id} in the database.`, {cause: error})
    }

    revalidatePath('/')

    return returnedSub
}

/**
 * This action will unpause a subscription on Lemon Squeezy.
 */
export async function unpauseUserSubscription(id: string) {
    configureLemonSqueezy()

    // Get user subscriptions
    const userSubscriptions = await getUserSubscriptions()

    // Check if the subscription exists
    const subscription = userSubscriptions.find(
        (sub) => sub.lemonSqueezyId === id
    )

    if (!subscription) {
        throw new Error(`Subscription #${id} not found.`)
    }

    const returnedSub = await updateSubscription(id, {
        pause: null,
    })

    // Update the db
    try {
        await prisma.subscription.update({
            where: {lemonSqueezyId: id},
            data: {
                status: returnedSub.data?.data.attributes.status,
                statusFormatted: returnedSub.data?.data.attributes.status_formatted,
                endsAt: returnedSub.data?.data.attributes.ends_at,
                isPaused: returnedSub.data?.data.attributes.pause !== null,
            }
        })
    } catch (error) {
        throw new Error(`Failed to pause Subscription #${id} in the database.`, {cause: error})
    }

    revalidatePath('/')

    return returnedSub
}

/**
 * This action will change the plan of a subscription on Lemon Squeezy.
 */
export async function changePlan(currentPlanId: number, newPlanId: number) {
    configureLemonSqueezy()

    // Get user subscriptions
    const userSubscriptions = await getUserSubscriptions()

    // Check if the subscription exists
    const subscription = userSubscriptions.find(
        (sub) => sub.planId === currentPlanId
    )

    if (!subscription) {
        throw new Error(`No subscription with plan id #${currentPlanId} was found.`)
    }

    // Get the new plan details from the database.
    const newPlan = await prisma.plan
        .findUniqueOrThrow({where: {id: newPlanId}})

    // Send request to Lemon Squeezy to change the subscription.
    const updatedSub = await updateSubscription(subscription.lemonSqueezyId, {
        variantId: newPlan.variantId,
    })

    // Save in db
    try {
        await prisma.subscription.update({
            data: {
                planId: newPlanId,
                price: newPlan.price,
                endsAt: updatedSub.data?.data.attributes.ends_at,
            },
            where: {lemonSqueezyId: subscription.lemonSqueezyId}
        })
    } catch (error) {
        throw new Error(
            `Failed to update Subscription #${subscription.lemonSqueezyId} in the database.`, {cause: error}
        )
    }

    revalidatePath('/')

    return updatedSub
}

export async function updateUsage(
    action: NewUsageRecord["action"],
    quantity: NewUsageRecord["quantity"],
    subscriptionItemId: NewUsageRecord["subscriptionItemId"]
) {
    configureLemonSqueezy();

    const newUsageRecord: NewUsageRecord = {action: action, quantity: quantity, subscriptionItemId: subscriptionItemId};

    return await createUsageRecord(newUsageRecord);
}

export async function getCurrentUsage(subscriptionItemId: NewUsageRecord["subscriptionItemId"]) {
    configureLemonSqueezy();
    return await getSubscriptionItemCurrentUsage(subscriptionItemId);
}
