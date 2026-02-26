import Stripe from 'stripe'
import { patchRow } from '../_db.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const config = {
  api: {
    bodyParser: false,
  },
}

const readRawBody = async (req) => {
  const chunks = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    const signature = req.headers['stripe-signature']
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!signature || !webhookSecret) {
      return res.status(400).json({ error: 'Missing stripe signature or STRIPE_WEBHOOK_SECRET' })
    }

    const rawBody = await readRawBody(req)
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const requestId = session?.metadata?.requestId
      if (requestId && session.payment_status === 'paid') {
        await patchRow('requests', requestId, { status: 'Paid' })
      }
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object
      const requestId = session?.metadata?.requestId
      if (requestId) {
        await patchRow('requests', requestId, { status: 'Payment Expired' })
      }
    }

    return res.status(200).json({ received: true })
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Webhook error' })
  }
}
