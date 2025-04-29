import crypto from "node:crypto";
import {jobs} from "@/config/cron.config";

export async function POST(request: Request) {
    if (!process.env.WEBHOOK_SECRET_CRON) {
        return new Response("An error occured", {
            status: 500
        })
    }

    // First, make sure the request is authentic
    const rawBody = await request.text()
    const secret = process.env.WEBHOOK_SECRET_CRON

    const hmac = crypto.createHmac('sha256', secret)
    const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8')
    const signature = Buffer.from(
        request.headers.get('X-Signature') || '',
        'utf8'
    )

    if (!crypto.timingSafeEqual(digest, signature)) {
        throw new Error('Invalid signature.')
    }

    const data = JSON.parse(rawBody)

    const job = jobs.find(value => value.name == data.job)
    if (!job) {
        throw new Error('Invalid job.')
    }
    await job.func()

    return new Response("Success", {status: 200})
}