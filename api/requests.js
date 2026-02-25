import { appendRow, deleteRow, listRows, patchRow, send, withErrorHandling } from './_sheets.js'

export default async function handler(req, res) {
  return withErrorHandling(res, async () => {
    if (req.method === 'GET') return send(res, 200, await listRows('requests'))

    if (req.method === 'POST') return send(res, 201, await appendRow('requests', req.body || {}))

    if (req.method === 'PATCH') {
      const { id, ...patch } = req.body || {}
      if (!id) return send(res, 400, { error: 'id is required' })
      const row = await patchRow('requests', id, patch)
      if (!row) return send(res, 404, { error: 'Not found' })
      return send(res, 200, row)
    }

    if (req.method === 'DELETE') {
      const id = req.query?.id || req.body?.id
      if (!id) return send(res, 400, { error: 'id is required' })
      const removed = await deleteRow('requests', id)
      if (!removed) return send(res, 404, { error: 'Not found' })
      return send(res, 200, { ok: true })
    }

    return send(res, 405, { error: 'Method not allowed' })
  })
}
