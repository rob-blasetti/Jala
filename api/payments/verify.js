import Stripe from 'stripe'
import { patchRow } from '../_db.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    const { sessionId } = req.body || {}
    if (!sessionId) return res.status(400).json({ error: 'sessionId required' })

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status === 'paid' && session.metadata?.requestId) {
      await patchRow('requests', session.metadata.requestId, { status: 'Paid' })
      return res.status(200).json({ ok: true, paid: true, requestId: session.metadata.requestId })
    }

    return res.status(200).json({ ok: true, paid: false })
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to verify payment' })
  }
}
