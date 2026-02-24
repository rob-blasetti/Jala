import { useMemo, useState } from 'react'
import './App.css'

const TABS = ['Home', 'Musicians', 'Requests']

function HomePage({ musicians, requests }) {
  const activeMusicians = musicians.filter((m) => m.available).length

  return (
    <section className="card stack left">
      <h1>Jala</h1>
      <p className="muted">Helping Baha’i communities connect with musicians for Feast.</p>
      <div className="stats-grid">
        <div className="stat">
          <span className="stat-label">Musicians signed up</span>
          <strong>{musicians.length}</strong>
        </div>
        <div className="stat">
          <span className="stat-label">Available now</span>
          <strong>{activeMusicians}</strong>
        </div>
        <div className="stat">
          <span className="stat-label">Open requests</span>
          <strong>{requests.length}</strong>
        </div>
      </div>
      <p className="muted small">Prototype flow for signup + request matching. Backend can be added next.</p>
    </section>
  )
}

function MusicianSignupPage({ onAdd }) {
  const [form, setForm] = useState({ name: '', community: '', instrument: '', contact: '', available: true })

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.name || !form.community || !form.instrument || !form.contact) return
    onAdd(form)
    setForm({ name: '', community: '', instrument: '', contact: '', available: true })
  }

  return (
    <section className="card left">
      <h2>Musician Signup</h2>
      <form className="form stack" onSubmit={submit}>
        <input placeholder="Full name" value={form.name} onChange={(e) => update('name', e.target.value)} />
        <input placeholder="Home community" value={form.community} onChange={(e) => update('community', e.target.value)} />
        <input placeholder="Instrument / voice" value={form.instrument} onChange={(e) => update('instrument', e.target.value)} />
        <input placeholder="Contact (email or phone)" value={form.contact} onChange={(e) => update('contact', e.target.value)} />
        <label className="check-row">
          <input type="checkbox" checked={form.available} onChange={(e) => update('available', e.target.checked)} />
          Available for upcoming Feasts
        </label>
        <button type="submit">Join musician list</button>
      </form>
    </section>
  )
}

function FeastRequestPage({ onAdd }) {
  const [form, setForm] = useState({ community: '', date: '', needs: '', notes: '' })
  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.community || !form.date || !form.needs) return
    onAdd(form)
    setForm({ community: '', date: '', needs: '', notes: '' })
  }

  return (
    <section className="card left">
      <h2>Feast Request</h2>
      <form className="form stack" onSubmit={submit}>
        <input placeholder="Community name" value={form.community} onChange={(e) => update('community', e.target.value)} />
        <input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} />
        <input placeholder="What music is needed?" value={form.needs} onChange={(e) => update('needs', e.target.value)} />
        <textarea placeholder="Notes (optional)" value={form.notes} onChange={(e) => update('notes', e.target.value)} />
        <button type="submit">Post request</button>
      </form>
    </section>
  )
}

function RequestBoard({ requests, musicians }) {
  const available = useMemo(() => musicians.filter((m) => m.available), [musicians])

  return (
    <section className="card left">
      <h2>Request Board</h2>
      {!requests.length ? (
        <p className="muted">No requests yet.</p>
      ) : (
        <ul className="list stack">
          {requests.map((r) => (
            <li key={r.id} className="list-item">
              <strong>{r.community}</strong> · {r.date}
              <div>{r.needs}</div>
              {r.notes && <small className="muted">{r.notes}</small>}
              <div className="suggestion">Suggested musicians nearby: {available.slice(0, 3).map((m) => m.name).join(', ') || 'None yet'}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function App() {
  const [tab, setTab] = useState('Home')
  const [musicians, setMusicians] = useState([])
  const [requests, setRequests] = useState([])

  const addMusician = (payload) => setMusicians((prev) => [{ id: crypto.randomUUID(), ...payload }, ...prev])
  const addRequest = (payload) => setRequests((prev) => [{ id: crypto.randomUUID(), ...payload }, ...prev])

  return (
    <div className="app-shell">
      <main className="page">
        {tab === 'Home' && <HomePage musicians={musicians} requests={requests} />}
        {tab === 'Musicians' && (
          <>
            <MusicianSignupPage onAdd={addMusician} />
            <RequestBoard requests={requests} musicians={musicians} />
          </>
        )}
        {tab === 'Requests' && (
          <>
            <FeastRequestPage onAdd={addRequest} />
            <RequestBoard requests={requests} musicians={musicians} />
          </>
        )}
      </main>

      <nav className="bottom-nav" aria-label="Primary navigation">
        {TABS.map((item) => (
          <button key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>
            {item}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default App
