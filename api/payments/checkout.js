import Stripe from 'stripe'
import { patchRow } from '../_db.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const toOrigin = (req) => {
  const proto = req.headers['x-forwarded-proto'] || 'https'
  const host = req.headers['x-forwarded-host'] || req.headers.host
  return `${proto}://${host}`
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    const { requestId, committee, needs, amountAud } = req.body || {}
    if (!requestId || !amountAud) return res.status(400).json({ error: 'requestId and amountAud are required' })

    const baseAmount = Math.round(Number(amountAud) * 100)
    if (Number.isNaN(baseAmount) || baseAmount < 500 || baseAmount > 30000) {
      return res.status(400).json({ error: 'Amount must be between AUD 5 and AUD 300' })
    }

    const platformFee = Math.round(baseAmount * 0.1)
    const total = baseAmount + platformFee
    const origin = toOrigin(req)

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      client_reference_id: requestId,
      line_items: [
        {
          price_data: {
            currency: 'aud',
            product_data: {
              name: `Jala Music Request — ${committee || 'Community Request'}`,
              description: needs || 'Feast / Holy Day music support',
            },
            unit_amount: total,
          },
          quantity: 1,
        },
      ],
      metadata: {
        requestId,
        baseAmount: String(baseAmount),
        platformFee: String(platformFee),
      },
      success_url: `${origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?payment=cancel`,
    })

    await patchRow('requests', requestId, { status: 'Awaiting Payment' })

    return res.status(200).json({ url: session.url })
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to create checkout session' })
  }
}
