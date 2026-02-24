import { useMemo, useState } from 'react'
import { Button, Input, TextArea } from 'liquid-spirit-styleguide/ui-primitives/web'
import heroImage from './assets/hero-jala.svg'
import './App.css'

const TABS = ['Home', 'Musician Sign Up', 'Feast Request', 'Performance Requests', 'Committee Review']

const SAMPLE_MUSICIANS = [
  { id: 's1', name: 'Aaliyah', community: 'Northside', instrument: '🎻 Violin', contact: 'aaliyah@example.com', available: true, performances: 12 },
  { id: 's2', name: 'Sam', community: 'West End', instrument: '🎸 Guitar', contact: 'sam@example.com', available: true, performances: 8 },
  { id: 's3', name: 'Noah', community: 'Riverdale', instrument: '🥁 Drums', contact: 'noah@example.com', available: false, performances: 5 },
]

const SAMPLE_REQUESTS = [
  { id: 'r1', committee: 'Northside Feast Committee', community: 'Northside', date: '2026-03-02', needs: 'Opening prayer + reflective song', notes: '2-3 songs, acoustic preferred' },
  { id: 'r2', committee: 'West End Devotions Team', community: 'West End', date: '2026-03-09', needs: 'Upbeat welcome piece', notes: 'Guitar or keyboard great' },
]

const SAMPLE_RESPONSES = {
  r1: [
    { musicianId: 's1', message: 'Happy to support this Feast. I can prepare two reflective pieces.' },
    { musicianId: 's2', message: 'Available and can bring guitar + vocals.' },
  ],
  r2: [
    { musicianId: 's2', message: 'I can do a welcoming upbeat opening song.' },
  ],
}

function MusicianCard({ musician }) {
  const initial = musician.name?.[0]?.toUpperCase() || '🎵'

  return (
    <article className="musician-card">
      <div className="avatar-wrap" aria-hidden="true">{initial}</div>
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
          <Button className="cta" onPress={goToMusician} label="I’m a Musician" />
          <Button className="cta secondary" secondary onPress={goToRequest} label="Request a Musician" />
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
          <Input label="Full name" value={form.name} onChange={(e) => update('name', e.target.value)} />
          <Input label="Home community" value={form.community} onChange={(e) => update('community', e.target.value)} />
          <Input label="Instrument / voice" placeholder="e.g. 🎸 Guitar" value={form.instrument} onChange={(e) => update('instrument', e.target.value)} />
          <Input label="Contact" placeholder="email or phone" value={form.contact} onChange={(e) => update('contact', e.target.value)} />
          <label className="check-row">
            <input type="checkbox" checked={form.available} onChange={(e) => update('available', e.target.checked)} />
            Available for upcoming Feasts
          </label>
          <Button type="submit" label="Join the Jala musician circle" />
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
        <Input label="Committee name" placeholder="e.g. Northside Feast Committee" value={form.committee} onChange={(e) => update('committee', e.target.value)} />
        <Input label="Community name" value={form.community} onChange={(e) => update('community', e.target.value)} />
        <Input label="Date" type="date" value={form.date} onChange={(e) => update('date', e.target.value)} />
        <Input label="Music needed" value={form.needs} onChange={(e) => update('needs', e.target.value)} />
        <TextArea label="Notes (optional)" value={form.notes} onChange={(e) => update('notes', e.target.value)} />
        <Button type="submit" label="Share Feast request" />
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

function MusicianRequestsPage({ requests }) {
  return (
    <section className="card left">
      <h2>Performance Requests</h2>
      <p className="muted small">Browse requests from committees looking for musicians.</p>
      {!requests.length ? (
        <p className="muted">No requests right now. Check back soon.</p>
      ) : (
        <ul className="list stack">
          {requests.map((r) => (
            <li key={r.id} className="list-item">
              <PerformanceRequestCard request={r} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function CommitteeReviewPage({ requests, musicians, responses, acceptedByRequest, onAccept }) {
  const musicianById = useMemo(
    () => Object.fromEntries(musicians.map((m) => [m.id, m])),
    [musicians],
  )

  return (
    <section className="card left">
      <h2>Committee Review</h2>
      <p className="muted small">See which musicians responded and choose who to confirm.</p>

      {!requests.length ? (
        <p className="muted">No requests available yet.</p>
      ) : (
        <div className="stack">
          {requests.map((request) => {
            const requestResponses = responses[request.id] || []
            const acceptedId = acceptedByRequest[request.id]
            const acceptedMusician = acceptedId ? musicianById[acceptedId] : null

            return (
              <div key={request.id} className="review-card">
                <PerformanceRequestCard request={request} />

                <div className="response-list stack">
                  {requestResponses.length === 0 ? (
                    <p className="muted small">No musician responses yet.</p>
                  ) : (
                    requestResponses.map((response) => {
                      const musician = musicianById[response.musicianId]
                      if (!musician) return null

                      const isAccepted = acceptedId === musician.id

                      return (
                        <div key={`${request.id}-${musician.id}`} className="response-item">
                          <MusicianCard musician={musician} />
                          <p className="muted small">“{response.message}”</p>
                          <Button
                            className={`accept-btn ${isAccepted ? 'accepted' : ''}`}
                            secondary={!isAccepted}
                            onPress={() => onAccept(request.id, musician.id)}
                            label={isAccepted ? '✅ Accepted' : 'Accept Musician'}
                          />
                        </div>
                      )
                    })
                  )}
                </div>

                {acceptedMusician && (
                  <p className="accepted-note">
                    Confirmed: <strong>{acceptedMusician.name}</strong> for this request.
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

function App() {
  const [tab, setTab] = useState('Home')
  const [musicians, setMusicians] = useState(SAMPLE_MUSICIANS)
  const [requests, setRequests] = useState(SAMPLE_REQUESTS)
  const [responses] = useState(SAMPLE_RESPONSES)
  const [acceptedByRequest, setAcceptedByRequest] = useState({})

  const addMusician = (payload) => {
    const next = {
      id: crypto.randomUUID(),
      performances: 0,
      ...payload,
    }
    setMusicians((prev) => [next, ...prev])
  }

  const addRequest = (payload) => setRequests((prev) => [{ id: crypto.randomUUID(), ...payload }, ...prev])
  const acceptMusician = (requestId, musicianId) => {
    setAcceptedByRequest((prev) => ({ ...prev, [requestId]: musicianId }))
  }

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
        {tab === 'Performance Requests' && <MusicianRequestsPage requests={requests} />}
        {tab === 'Committee Review' && (
          <CommitteeReviewPage
            requests={requests}
            musicians={musicians}
            responses={responses}
            acceptedByRequest={acceptedByRequest}
            onAccept={acceptMusician}
          />
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
