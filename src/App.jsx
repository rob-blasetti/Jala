import { useMemo, useState } from 'react'
import heroImage from './assets/hero-jala.svg'
import './App.css'

const TABS = ['Home', 'Musician Sign Up', 'Feast Request']

const SAMPLE_MUSICIANS = [
  { id: 's1', name: 'Aaliyah', community: 'Northside', instrument: '🎻 Violin', contact: 'aaliyah@example.com', available: true, performances: 12 },
  { id: 's2', name: 'Sam', community: 'West End', instrument: '🎸 Guitar', contact: 'sam@example.com', available: true, performances: 8 },
  { id: 's3', name: 'Noah', community: 'Riverdale', instrument: '🥁 Drums', contact: 'noah@example.com', available: false, performances: 5 },
]

const SAMPLE_REQUESTS = [
  { id: 'r1', committee: 'Northside Feast Committee', community: 'Northside', date: '2026-03-02', needs: 'Opening prayer + reflective song', notes: '2-3 songs, acoustic preferred' },
  { id: 'r2', committee: 'West End Devotions Team', community: 'West End', date: '2026-03-09', needs: 'Upbeat welcome piece', notes: 'Guitar or keyboard great' },
]

function MusicianCard({ musician }) {
  const initial = musician.name?.[0]?.toUpperCase() || '🎵'

  return (
    <article className="musician-card">
      <div className="avatar" aria-hidden="true">{initial}</div>
      <div>
        <div className="musician-head">
          <strong>{musician.name}</strong>
          <span className="star">⭐ {musician.performances ?? 0}</span>
        </div>
        <div className="muted">{musician.instrument} · {musician.community}</div>
      </div>
    </article>
  )
}

function MusicianSpotlight({ musicians }) {
  return (
    <section className="card left stack">
      <h3>Musicians in the community</h3>
      <p className="muted small">Examples of who’s signing up: 🎻 🎸 🥁 🎹 🎤</p>
      <div className="stack">
        {musicians.slice(0, 4).map((m) => (
          <MusicianCard key={m.id} musician={m} />
        ))}
      </div>
    </section>
  )
}

function HomePage({ musicians, requests, goToMusician, goToRequest }) {
  const activeMusicians = musicians.filter((m) => m.available).length

  return (
    <>
      <section className="hero-banner">
        <img src={heroImage} alt="Friends in community making music together" className="hero-image" />
        <div className="hero-overlay">
          <h1>Jala</h1>
          <p>Connecting musicians and Feast communities through friendship and joyful service.</p>
        </div>
      </section>

      <section className="card stack left">
        <p className="muted">A warm space for musicians of all kinds to connect with friends nearby and share music at Feast.</p>

        <div className="hero-actions">
          <button className="cta" onClick={goToMusician}>I’m a Musician</button>
          <button className="cta secondary" onClick={goToRequest}>Request a Musician</button>
        </div>

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

        <div className="how-it-works">
          <h3>How it works</h3>
          <ol>
            <li>Musicians of any style add a quick profile.</li>
            <li>A Feast committee member shares what their community needs.</li>
            <li>Jala helps connect nearby friends to make it happen.</li>
          </ol>
        </div>

        <p className="muted small">MVP preview — built to feel simple, welcoming, and community-first.</p>
      </section>

      <MusicianSpotlight musicians={musicians} />
    </>
  )
}

function MusicianSignupPage({ onAdd, musicians }) {
  const [form, setForm] = useState({ name: '', community: '', instrument: '', contact: '', available: true })

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.name || !form.community || !form.instrument || !form.contact) return
    onAdd(form)
    setForm({ name: '', community: '', instrument: '', contact: '', available: true })
  }

  return (
    <>
      <section className="card left">
        <h2>Musician Sign-up</h2>
        <p className="muted small">All musicians are welcome — voice, instruments, beginner to experienced.</p>
        <form className="form stack" onSubmit={submit}>
          <input placeholder="Full name" value={form.name} onChange={(e) => update('name', e.target.value)} />
          <input placeholder="Home community" value={form.community} onChange={(e) => update('community', e.target.value)} />
          <input placeholder="Instrument / voice (e.g. 🎸 Guitar)" value={form.instrument} onChange={(e) => update('instrument', e.target.value)} />
          <input placeholder="Contact (email or phone)" value={form.contact} onChange={(e) => update('contact', e.target.value)} />
          <label className="check-row">
            <input type="checkbox" checked={form.available} onChange={(e) => update('available', e.target.checked)} />
            Available for upcoming Feasts
          </label>
          <button type="submit">Join the Jala musician circle</button>
        </form>
      </section>

      <MusicianSpotlight musicians={musicians} />
    </>
  )
}

function PerformanceRequestCard({ request }) {
  return (
    <article className="performance-request-card">
      <div className="request-head">
        <strong>🎶 {request.committee || 'Feast Committee'}</strong>
        <span className="request-date">📅 {request.date}</span>
      </div>
      <div className="muted">📍 {request.community}</div>
      <div className="request-needs">{request.needs}</div>
      {request.notes && <small className="muted">{request.notes}</small>}
    </article>
  )
}

function FeastRequestPage({ onAdd }) {
  const [form, setForm] = useState({ committee: '', community: '', date: '', needs: '', notes: '' })
  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.committee || !form.community || !form.date || !form.needs) return
    onAdd(form)
    setForm({ committee: '', community: '', date: '', needs: '', notes: '' })
  }

  return (
    <section className="card left">
      <h2>Feast Request</h2>
      <p className="muted small">Tell us what your Feast gathering needs and we’ll help connect you with nearby friends.</p>
      <form className="form stack" onSubmit={submit}>
        <input placeholder="Committee name (e.g. Northside Feast Committee)" value={form.committee} onChange={(e) => update('committee', e.target.value)} />
        <input placeholder="Community name" value={form.community} onChange={(e) => update('community', e.target.value)} />
        <input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} />
        <input placeholder="What music is needed?" value={form.needs} onChange={(e) => update('needs', e.target.value)} />
        <textarea placeholder="Notes (optional)" value={form.notes} onChange={(e) => update('notes', e.target.value)} />
        <button type="submit">Share Feast request</button>
      </form>
    </section>
  )
}

function RequestBoard({ requests, musicians }) {
  const available = useMemo(() => musicians.filter((m) => m.available), [musicians])

  return (
    <section className="card left">
      <h2>Community Requests</h2>
      {!requests.length ? (
        <p className="muted">No requests yet.</p>
      ) : (
        <ul className="list stack">
          {requests.map((r) => (
            <li key={r.id} className="list-item">
              <PerformanceRequestCard request={r} />
              <div className="suggestion">Suggested musicians: {available.slice(0, 3).map((m) => m.name).join(', ') || 'None yet'}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function App() {
  const [tab, setTab] = useState('Home')
  const [musicians, setMusicians] = useState(SAMPLE_MUSICIANS)
  const [requests, setRequests] = useState(SAMPLE_REQUESTS)

  const addMusician = (payload) => {
    const next = {
      id: crypto.randomUUID(),
      performances: 0,
      ...payload,
    }
    setMusicians((prev) => [next, ...prev])
  }

  const addRequest = (payload) => setRequests((prev) => [{ id: crypto.randomUUID(), ...payload }, ...prev])

  return (
    <div className="app-shell">
      <main className="page">
        {tab === 'Home' && (
          <HomePage
            musicians={musicians}
            requests={requests}
            goToMusician={() => setTab('Musician Sign Up')}
            goToRequest={() => setTab('Feast Request')}
          />
        )}
        {tab === 'Musician Sign Up' && <MusicianSignupPage onAdd={addMusician} musicians={musicians} />}
        {tab === 'Feast Request' && (
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
