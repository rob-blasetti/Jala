import { listRows, send, withErrorHandling } from '../_db.js'

export default async function handler(req, res) {
  return withErrorHandling(res, async () => {
    if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' })
    const musicians = await listRows('musicians')
    return send(res, 200, { musicians })
  })
}
