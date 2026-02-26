import { createClient } from '@supabase/supabase-js'

const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']

const TABLES = {
  musicians: 'musicians',
  requests: 'requests',
  responses: 'responses',
  matches: 'matches',
}

export const send = (res, status, payload) => res.status(status).json(payload)

const isMissingConfig = () => REQUIRED_ENV.some((key) => !process.env[key])

const db = () =>
  createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })

const toApi = (table, row = {}) => {
  if (table === 'responses') {
    return {
      id: row.id,
      requestId: row.request_id,
      musicianId: row.musician_id,
      message: row.message,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  if (table === 'matches') {
    return {
      id: row.id,
      requestId: row.request_id,
      musicianId: row.musician_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  if (table === 'musicians') {
    return {
      id: row.id,
      name: row.name,
      community: row.community,
      city: row.city,
      country: row.country,
      musicCategory: row.music_category,
      instrument: row.instrument,
      bio: row.bio,
      contact: row.contact,
      compensationPreference: row.compensation_preference,
      available: row.available,
      performances: row.performances,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  return {
    id: row.id,
    committee: row.committee,
    community: row.community,
    date: row.date,
    needs: row.needs,
    notes: row.notes,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const fromApi = (table, payload = {}) => {
  if (table === 'responses') {
    return {
      id: payload.id,
      request_id: payload.requestId,
      musician_id: payload.musicianId,
      message: payload.message,
      status: payload.status,
    }
  }

  if (table === 'matches') {
    return {
      id: payload.id,
      request_id: payload.requestId,
      musician_id: payload.musicianId,
    }
  }

  if (table === 'musicians') {
    return {
      id: payload.id,
      name: payload.name,
      community: payload.community,
      city: payload.city,
      country: payload.country,
      music_category: payload.musicCategory,
      instrument: payload.instrument,
      bio: payload.bio,
      contact: payload.contact,
      compensation_preference: payload.compensationPreference,
      available: payload.available,
      performances: payload.performances,
    }
  }

  return {
    id: payload.id,
    committee: payload.committee,
    community: payload.community,
    date: payload.date,
    needs: payload.needs,
    notes: payload.notes,
    status: payload.status,
  }
}

const maybeRow = (rows) => (rows && rows.length ? rows[0] : null)

export const listRows = async (table) => {
  const supabase = db()
  const { data, error } = await supabase.from(TABLES[table]).select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map((row) => toApi(table, row))
}

export const appendRow = async (table, payload) => {
  const supabase = db()
  const { data, error } = await supabase.from(TABLES[table]).insert(fromApi(table, payload)).select('*')
  if (error) throw error
  return toApi(table, maybeRow(data))
}

export const patchRow = async (table, id, patch) => {
  const supabase = db()
  const { data, error } = await supabase.from(TABLES[table]).update(fromApi(table, patch)).eq('id', id).select('*')
  if (error) throw error
  const row = maybeRow(data)
  return row ? toApi(table, row) : null
}

export const deleteRow = async (table, id) => {
  const supabase = db()
  const { data, error } = await supabase.from(TABLES[table]).delete().eq('id', id).select('id')
  if (error) throw error
  return Boolean(data?.length)
}

export const withErrorHandling = async (res, fn) => {
  try {
    if (isMissingConfig()) {
      return send(res, 500, {
        error: 'Missing required env vars. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY',
      })
    }

    return await fn()
  } catch (error) {
    return send(res, 500, { error: error?.message || 'Unexpected server error' })
  }
}
