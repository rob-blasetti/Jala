import { google } from 'googleapis'

const REQUIRED_ENV = ['GOOGLE_SERVICE_ACCOUNT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GOOGLE_SHEETS_ID']

const TABLE_CONFIG = {
  musicians: {
    range: 'musicians!A:H',
    columns: ['id', 'name', 'community', 'instrument', 'contact', 'available', 'performances', 'createdAt'],
  },
  requests: {
    range: 'requests!A:I',
    columns: ['id', 'committee', 'community', 'date', 'needs', 'notes', 'status', 'createdAt', 'updatedAt'],
  },
  responses: {
    range: 'responses!A:F',
    columns: ['id', 'requestId', 'musicianId', 'message', 'status', 'createdAt'],
  },
  matches: {
    range: 'matches!A:D',
    columns: ['id', 'requestId', 'musicianId', 'updatedAt'],
  },
}

export const send = (res, status, payload) => {
  res.status(status).json(payload)
}

export const isMissingConfig = () => REQUIRED_ENV.some((k) => !process.env[k])

const decodePrivateKey = () => process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')

const sheetsClient = () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: decodePrivateKey(),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  return google.sheets({ version: 'v4', auth })
}

const normalizeRow = (columns, row) => {
  const out = {}
  columns.forEach((key, idx) => {
    out[key] = row[idx] ?? ''
  })

  if ('available' in out) out.available = String(out.available).toLowerCase() === 'true'
  if ('performances' in out) out.performances = Number(out.performances || 0)

  return out
}

const rowToArray = (columns, payload) => columns.map((col) => String(payload[col] ?? ''))

export const listRows = async (table) => {
  const config = TABLE_CONFIG[table]
  const sheets = sheetsClient()
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: config.range,
  })

  const values = response.data.values || []
  if (values.length <= 1) return []

  return values.slice(1).map((row) => normalizeRow(config.columns, row))
}

export const appendRow = async (table, payload) => {
  const config = TABLE_CONFIG[table]
  const sheets = sheetsClient()
  const id = payload.id || crypto.randomUUID()
  const now = new Date().toISOString()

  const fullPayload = {
    ...payload,
    id,
    createdAt: payload.createdAt || now,
    updatedAt: payload.updatedAt || now,
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: config.range,
    valueInputOption: 'RAW',
    requestBody: { values: [rowToArray(config.columns, fullPayload)] },
  })

  return fullPayload
}

const rowIndexById = async (table, id) => {
  const config = TABLE_CONFIG[table]
  const sheets = sheetsClient()
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: config.range,
  })

  const values = response.data.values || []
  for (let i = 1; i < values.length; i += 1) {
    if ((values[i]?.[0] || '') === id) return { rowNumber: i + 1, values }
  }

  return { rowNumber: -1, values }
}

export const patchRow = async (table, id, patch) => {
  const config = TABLE_CONFIG[table]
  const sheets = sheetsClient()
  const { rowNumber, values } = await rowIndexById(table, id)

  if (rowNumber < 0) return null

  const existing = normalizeRow(config.columns, values[rowNumber - 1] || [])
  const merged = {
    ...existing,
    ...patch,
    id,
    updatedAt: new Date().toISOString(),
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: `${config.range.split('!')[0]}!A${rowNumber}`,
    valueInputOption: 'RAW',
    requestBody: { values: [rowToArray(config.columns, merged)] },
  })

  return merged
}

export const deleteRow = async (table, id) => {
  const config = TABLE_CONFIG[table]
  const sheets = sheetsClient()
  const { rowNumber, values } = await rowIndexById(table, id)

  if (rowNumber < 0) return false

  const rows = values.filter((_, idx) => idx !== rowNumber - 1)

  await sheets.spreadsheets.values.clear({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: config.range,
  })

  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: `${config.range.split('!')[0]}!A1`,
    valueInputOption: 'RAW',
    requestBody: { values: rows },
  })

  return true
}

export const withErrorHandling = async (res, fn) => {
  try {
    if (isMissingConfig()) {
      return send(res, 500, {
        error: 'Missing required env vars. Set GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEETS_ID',
      })
    }

    return await fn()
  } catch (error) {
    return send(res, 500, { error: error?.message || 'Unexpected server error' })
  }
}
