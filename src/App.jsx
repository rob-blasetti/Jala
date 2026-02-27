import { useEffect, useMemo, useState } from 'react'
import { Button, Input, TextArea } from 'liquid-spirit-styleguide/ui-primitives/web'
import heroImage from './assets/hero-jala.jpg'
import { api } from './lib/api'
import { useMusiciansContext } from './context/MusiciansContext'
import { useTabRouter } from './hooks/useTabRouter'
import { useJalaData } from './hooks/useJalaData'
import './App.css'

const TABS = ['Home', 'Musicians', 'Categories', 'Community']
const REQUEST_TAB = 'Community Envoy Request'
const EXPLAINER_TAB = 'Explainer'

const tabToPath = (tab) => {
  if (tab === 'Musicians') return '/browse'
  if (tab === 'Categories') return '/categories'
  if (tab === 'Community') return '/community'
  if (tab === 'Admin') return '/admin'
  if (tab === EXPLAINER_TAB) return '/explainer'
  if (tab === REQUEST_TAB) return '/request'
  return '/'
}

const pathToTab = (path) => {
  if (path === '/browse') return 'Musicians'
  if (path === '/categories') return 'Categories'
  if (path === '/community') return 'Community'
  if (path === '/admin') return 'Admin'
  if (path === '/explainer') return EXPLAINER_TAB
  if (path === '/request') return REQUEST_TAB
  return 'Home'
}

const SAMPLE_MUSICIANS = [
  { id: 's1', name: 'Aaliyah', community: 'Northside', city: 'Melbourne', country: 'Australia', musicCategory: 'Strings', instrument: '🎻 Violin', bio: 'I love reflective devotional pieces for Feast gatherings.', contact: 'aaliyah@example.com', available: true, performances: 12, compensationPreference: 'Open to honorarium' },
  { id: 's2', name: 'Sam', community: 'West End', city: 'Sydney', country: 'Australia', musicCategory: 'Strings', instrument: '🎸 Guitar', bio: 'Warm acoustic style, ideal for opening songs.', contact: 'sam@example.com', available: true, performances: 8, compensationPreference: 'Voluntary service' },
  { id: 's3', name: 'Noah', community: 'Riverdale', city: 'Brisbane', country: 'Australia', musicCategory: 'Rhythm & Percussion', instrument: '🥁 Drums', bio: 'Light rhythmic support for joyful gatherings.', contact: 'noah@example.com', available: false, performances: 5, compensationPreference: 'Professional rate' },
]

const SAMPLE_REQUESTS = [
  { id: 'r1', committee: 'Northside Feast Committee', community: 'Northside', date: '2026-03-02', needs: 'Opening prayer + reflective song', notes: '2-3 songs, acoustic preferred', status: 'Open' },
  { id: 'r2', committee: 'West End Devotions Team', community: 'West End', date: '2026-03-09', needs: 'Upbeat welcome piece', notes: 'Guitar or keyboard great', status: 'Open' },
]

const SAMPLE_RESPONSES = [
  { id: 'rsp1', requestId: 'r1', musicianId: 's1', message: 'Happy to support this Feast. I can prepare two reflective pieces.' },
  { id: 'rsp2', requestId: 'r1', musicianId: 's2', message: 'Available and can bring guitar + vocals.' },
  { id: 'rsp3', requestId: 'r2', musicianId: 's2', message: 'I can do a welcoming upbeat opening song.' },
]

function CommunityChip({ label }) {
  return <span className="community-chip">{label || 'Community'}</span>
}

function MusicianCard({ musician, showContact = false, onRequest }) {
  const initial = musician.name?.[0]?.toUpperCase() || '🎵'
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [requestDetails, setRequestDetails] = useState({
    requesterName: '',
    contactEmail: '',
    eventType: '',
    eventDate: '',
    notes: '',
  })

  const updateRequest = (key, value) => setRequestDetails((prev) => ({ ...prev, [key]: value }))

  const submitRequest = (event) => {
    event.preventDefault()
    if (!onRequest) return
    onRequest(musician, requestDetails)
    setShowRequestForm(false)
    setRequestDetails({ requesterName: '', contactEmail: '', eventType: '', eventDate: '', notes: '' })
  }

  const location = [musician.city, musician.country].filter(Boolean).join(', ') || musician.community
  const category = musician.musicCategory || 'General'

  return (
    <article className="musician-card">
      <div className="musician-head-row">
        <div className="avatar-wrap" aria-hidden="true">{initial}</div>
        <div className="musician-head-main">
          <strong>{musician.name}</strong>
          <div className="muted">{category} · {musician.instrument}</div>
        </div>
        <CommunityChip label={musician.community} />
      </div>

      <div className="musician-main">
        <div className="musician-meta-row">
          <span className="muted small">📍 {location}</span>
        </div>

        {musician.bio && <p className="musician-bio">{musician.bio}</p>}
        {showContact && <div className="muted small">📬 {musician.contact}</div>}

        <div className="musician-footer">
          <span className="muted small">💳 {musician.compensationPreference || 'Voluntary service'}</span>
          {onRequest && (
            <button className="mini-request-btn" onClick={() => setShowRequestForm((v) => !v)}>
              {showRequestForm ? 'Cancel' : 'Request'}
            </button>
          )}
        </div>

        {onRequest && showRequestForm && (
          <form className="mini-request-form" onSubmit={submitRequest}>
            <Input label="Your name" value={requestDetails.requesterName} onChange={(e) => updateRequest('requesterName', e.target.value)} />
            <Input label="Your email" type="email" value={requestDetails.contactEmail} onChange={(e) => updateRequest('contactEmail', e.target.value)} />
            <Input label="Occasion" placeholder="Feast or Holy Day" value={requestDetails.eventType} onChange={(e) => updateRequest('eventType', e.target.value)} />
            <Input label="Date" type="date" value={requestDetails.eventDate} onChange={(e) => updateRequest('eventDate', e.target.value)} />
            <TextArea label="Message" value={requestDetails.notes} onChange={(e) => updateRequest('notes', e.target.value)} />
            <button type="submit" className="mini-request-submit">Send request email</button>
          </form>
        )}
      </div>
    </article>
  )
}

function MusicianSpotlight({ musicians, title = 'Available musicians', onRequest }) {
  const available = musicians.filter((m) => m.available)

  return (
    <section className="card left stack">
      <h3>{title}</h3>
      <p className="muted small">Friends currently available to serve nearby communities.</p>
      <div className="stack">
        {(available.length ? available : musicians).slice(0, 6).map((m) => (
          <MusicianCard key={m.id} musician={m} onRequest={onRequest} />
        ))}
      </div>
    </section>
  )
}

function HomePage({ musicians, requests, onOpenMusicianSignup, onOpenExplainer, onRequestMusician }) {
  const activeMusicians = musicians.filter((m) => m.available).length
  const [heroTitle, setHeroTitle] = useState('Jala')
  const [heroTitleClass, setHeroTitleClass] = useState('')
  const [heroAnimKey, setHeroAnimKey] = useState(0)

  useEffect(() => {
    const sequence = [
      { text: 'Jala', className: '', wait: 900 },
      { text: 'Jalalala', className: 'joy-pop', wait: 1100 },
      { text: 'Jalal', className: '', wait: 900 },
      { text: 'Jala', className: 'fade-in', wait: 1350 },
    ]

    let cancelled = false
    let step = 0
    let timer

    const run = () => {
      const current = sequence[step]
      setHeroTitle(current.text)
      setHeroTitleClass(current.className)
      setHeroAnimKey((k) => k + 1)
      step = (step + 1) % sequence.length
      timer = setTimeout(() => {
        if (!cancelled) run()
      }, current.wait)
    }

    run()

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [])

  return (
    <>
      <section className="hero-banner">
        <img src={heroImage} alt="Friends in community making music together" className="hero-image" />
        <div className="hero-overlay">
          <div className="hero-stats stats-grid">
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
          <h1 key={heroAnimKey} className={`typing-title ${heroTitleClass}`}>{heroTitle}<span className="typing-cursor" aria-hidden="true">|</span></h1>
          <p>The ocean is calling all musicians and artists.</p>
          <div className="hero-inline-actions">
            <button className="hero-inline-btn primary" onClick={onOpenMusicianSignup}>Sign up Musician</button>
            <button className="hero-inline-btn" onClick={onOpenExplainer}>Explainer</button>
          </div>
        </div>
      </section>

      <MusicianSpotlight musicians={musicians} title="Available musicians" onRequest={onRequestMusician} />

    </>
  )
}

function MusicianSignupPage({ onAdd, musicians, showSpotlight = true }) {
  const [form, setForm] = useState({ name: '', community: '', city: '', country: 'Australia', musicCategory: 'Singing & Vocals', instrument: '', bio: '', contact: '', compensationPreference: 'Voluntary service', available: true })
  const [error, setError] = useState('')

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.name || !form.community || !form.instrument || !form.contact) {
      setError('Please complete all fields before submitting.')
      return
    }

    onAdd(form)
    setForm({ name: '', community: '', city: '', country: 'Australia', musicCategory: 'Singing & Vocals', instrument: '', bio: '', contact: '', compensationPreference: 'Voluntary service', available: true })
    setError('')
  }

  return (
    <>
      <section className="card left">
        <h2>Musician Sign-up</h2>
        <p className="muted small">All musicians are welcome — voice, instruments, beginner to experienced.</p>
        <form className="form stack" onSubmit={submit}>
          <Input label="Full name" value={form.name} onChange={(e) => update('name', e.target.value)} />
          <Input label="Home community" value={form.community} onChange={(e) => update('community', e.target.value)} />
          <div className="split-row">
            <Input label="City" placeholder="Melbourne" value={form.city} onChange={(e) => update('city', e.target.value)} />
            <Input label="Country" value={form.country} onChange={(e) => update('country', e.target.value)} />
          </div>
          <label className="stack left small">
            Music category
            <select value={form.musicCategory} onChange={(e) => update('musicCategory', e.target.value)}>
              <option>Singing & Vocals</option>
              <option>Strings</option>
              <option>Keys & Piano</option>
              <option>Rhythm & Percussion</option>
              <option>Wind & Brass</option>
              <option>Other</option>
            </select>
          </label>
          <Input label="Instrument / voice" placeholder="e.g. 🎸 Guitar" value={form.instrument} onChange={(e) => update('instrument', e.target.value)} />
          <TextArea label="Short bio (optional)" value={form.bio} onChange={(e) => update('bio', e.target.value)} />
          <Input label="Contact" placeholder="email or phone" value={form.contact} onChange={(e) => update('contact', e.target.value)} />
          <label className="stack left small">
            Compensation preference
            <select value={form.compensationPreference} onChange={(e) => update('compensationPreference', e.target.value)}>
              <option>Voluntary service</option>
              <option>Open to honorarium</option>
              <option>Professional rate</option>
            </select>
          </label>
          <label className="check-row">
            <input type="checkbox" checked={form.available} onChange={(e) => update('available', e.target.checked)} />
            Available for upcoming Feasts
          </label>
          {error && <p className="error-note">{error}</p>}
          <Button type="submit" label="Join the Jala musician circle" />
        </form>
      </section>

      {showSpotlight && <MusicianSpotlight musicians={musicians} />}
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
      <small className="muted">Status: {request.status || 'Open'}</small>
    </article>
  )
}

function FeastRequestPage({ onAdd }) {
  const [form, setForm] = useState({
    contactName: '',
    contactRole: '',
    contactEmail: '',
    contactPhone: '',
    onBehalfOf: '',
    community: '',
    eventType: 'Nineteen Day Feast',
    date: '',
    time: '',
    needs: '',
    notes: '',
    amountAud: '150',
  })
  const [error, setError] = useState('')
  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const submit = (e) => {
    e.preventDefault()
    const amount = Number(form.amountAud)
    if (!form.contactName || !form.contactEmail || !form.community || !form.date || !form.needs) {
      setError('Please complete contact, community, date, and music needs.')
      return
    }
    if (Number.isNaN(amount) || amount < 5 || amount > 300) {
      setError('Amount must be between AUD $5 and $300.')
      return
    }

    const committee = form.onBehalfOf || `${form.contactName}${form.contactRole ? ` (${form.contactRole})` : ''}`
    const detailNotes = [
      `Community Contact: ${form.contactName}`,
      form.contactRole ? `Role: ${form.contactRole}` : null,
      `Email: ${form.contactEmail}`,
      form.contactPhone ? `Phone: ${form.contactPhone}` : null,
      `Event: ${form.eventType}`,
      form.time ? `Time: ${form.time}` : null,
      form.notes ? `Extra Notes: ${form.notes}` : null,
    ]
      .filter(Boolean)
      .join('\n')

    onAdd({
      committee,
      community: form.community,
      date: form.date,
      needs: `${form.eventType}: ${form.needs}`,
      notes: detailNotes,
      amountAud: amount,
    })

    setForm({
      contactName: '',
      contactRole: '',
      contactEmail: '',
      contactPhone: '',
      onBehalfOf: '',
      community: '',
      eventType: 'Nineteen Day Feast',
      date: '',
      time: '',
      needs: '',
      notes: '',
      amountAud: '150',
    })
    setError('')
  }

  return (
    <section className="card left">
      <h2>Community Contact Request</h2>
      <p className="muted small">An individual signs up on behalf of the community and becomes the point of contact for this request.</p>
      <p className="muted small"><strong>Step 1:</strong> Contact details · <strong>Step 2:</strong> Event needs · <strong>Step 3:</strong> Payment</p>
      <form className="form stack" onSubmit={submit}>
        <Input label="Your name" value={form.contactName} onChange={(e) => update('contactName', e.target.value)} />
        <Input label="Your role (optional)" placeholder="Feast Coordinator, Secretary, etc." value={form.contactRole} onChange={(e) => update('contactRole', e.target.value)} />
        <Input label="Contact email" type="email" value={form.contactEmail} onChange={(e) => update('contactEmail', e.target.value)} />
        <Input label="Contact phone (optional)" value={form.contactPhone} onChange={(e) => update('contactPhone', e.target.value)} />
        <Input label="On behalf of (optional)" placeholder="e.g. Northside Feast Committee" value={form.onBehalfOf} onChange={(e) => update('onBehalfOf', e.target.value)} />
        <Input label="Community name" value={form.community} onChange={(e) => update('community', e.target.value)} />
        <Input label="Event type" placeholder="Nineteen Day Feast / Holy Day / Devotional" value={form.eventType} onChange={(e) => update('eventType', e.target.value)} />
        <Input label="Date" type="date" value={form.date} onChange={(e) => update('date', e.target.value)} />
        <Input label="Time (optional)" placeholder="e.g. 7:30 PM" value={form.time} onChange={(e) => update('time', e.target.value)} />
        <Input label="Music needed" value={form.needs} onChange={(e) => update('needs', e.target.value)} />
        <Input label="Musician payment (AUD)" type="number" min="5" max="300" value={form.amountAud} onChange={(e) => update('amountAud', e.target.value)} />
        <TextArea label="Additional notes (optional)" value={form.notes} onChange={(e) => update('notes', e.target.value)} />
        <p className="muted small">Includes a standard 10% platform fee at checkout.</p>
        {error && <p className="error-note">{error}</p>}
        <Button type="submit" label="Continue to payment" />
      </form>
    </section>
  )
}

function RequestBoard({ requests, musicians }) {
  const available = useMemo(() => musicians.filter((m) => m.available), [musicians])

  const findSuggestedMusicians = (request) => {
    const exactCommunity = available.filter((m) => m.community.toLowerCase() === request.community.toLowerCase())
    if (exactCommunity.length) return exactCommunity.slice(0, 3)
    return available.slice(0, 3)
  }

  return (
    <section className="card left">
      <h2>Community Requests</h2>
      {!requests.length ? (
        <p className="muted">No requests yet.</p>
      ) : (
        <ul className="list stack">
          {requests.map((r) => {
            const suggested = findSuggestedMusicians(r)
            return (
              <li key={r.id} className="list-item">
                <PerformanceRequestCard request={r} />
                <div className="suggestion">
                  Suggested musicians: {suggested.map((m) => `${m.name} (${m.community})`).join(', ') || 'None yet'}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function BrowseMusiciansPage({ musicians, onRequestMusician }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')

  const categories = useMemo(() => ['All', ...new Set(musicians.map((m) => m.musicCategory || 'Other'))], [musicians])

  const filtered = useMemo(() => {
    return musicians.filter((m) => {
      const byCategory = category === 'All' || (m.musicCategory || 'Other') === category
      const text = `${m.name} ${m.community} ${m.instrument} ${m.city || ''}`.toLowerCase()
      const byQuery = !query || text.includes(query.toLowerCase())
      return byCategory && byQuery
    })
  }, [musicians, query, category])

  return (
    <section className="card left">
      <h2>Browse Musicians</h2>
      <p className="muted small">Find musicians by name, instrument, category, or location.</p>
      <div className="filter-row stack">
        <Input label="Search" placeholder="Name, instrument, city..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <label className="stack left small">
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>

      {!filtered.length ? (
        <p className="muted">No musicians match your filters right now.</p>
      ) : (
        <div className="stack">
          {filtered.map((musician) => (
            <MusicianCard key={musician.id} musician={musician} onRequest={onRequestMusician} showContact />
          ))}
        </div>
      )}
    </section>
  )
}

function ExplainerPage({ onOpenMusicianSignup, goToRequest }) {
  return (
    <section className="card left stack">
      <h2>How Jala Works</h2>
      <p className="muted">Jala connects community envoys with musicians for Feast and Holy Day gatherings in a simple, relational way.</p>

      <div className="stack">
        <div>
          <strong>1) Musicians join</strong>
          <p className="muted small">Musicians create a profile with their instrument, location, community, and compensation preference.</p>
        </div>
        <div>
          <strong>2) Community envoy submits a request</strong>
          <p className="muted small">An individual submits event details, music needs, and payment amount on behalf of the community.</p>
        </div>
        <div>
          <strong>3) Match and confirm</strong>
          <p className="muted small">Communities review musicians, send requests, and confirm who will serve for the gathering.</p>
        </div>
      </div>

      <div className="hero-actions">
        <Button className="cta" onPress={onOpenMusicianSignup} label="Sign up Musician" />
        <Button className="cta secondary" secondary onPress={goToRequest} label="Community Envoy Request" />
      </div>
    </section>
  )
}

function AdminDashboardPage({ musicians, requests }) {
  const paid = requests.filter((r) => r.status === 'Paid').length
  const pending = requests.filter((r) => ['Open', 'Awaiting Payment'].includes(r.status)).length
  const confirmed = requests.filter((r) => r.status === 'Confirmed').length

  return (
    <section className="card left stack">
      <h2>Admin Dashboard</h2>
      <p className="muted small">Decision-grade view of live activity and request pipeline.</p>

      <div className="stats-grid">
        <div className="stat"><span className="stat-label">Total musicians</span><strong>{musicians.length}</strong></div>
        <div className="stat"><span className="stat-label">Pending requests</span><strong>{pending}</strong></div>
        <div className="stat"><span className="stat-label">Confirmed</span><strong>{confirmed}</strong></div>
        <div className="stat"><span className="stat-label">Paid</span><strong>{paid}</strong></div>
      </div>

      <div className="stack">
        {requests.slice(0, 8).map((r) => (
          <article key={r.id} className="list-item">
            <div className="request-head">
              <strong>{r.committee || 'Community Request'}</strong>
              <span className="request-date">{r.status}</span>
            </div>
            <div className="muted small">{r.community} · {r.date}</div>
            <div className="small">{r.needs}</div>
          </article>
        ))}
      </div>
    </section>
  )
}

function CategoriesPage() {
  const { categorized, loading } = useMusiciansContext()

  const categories = [
    'Singing & Vocals',
    'Strings',
    'Keys & Piano',
    'Rhythm & Percussion',
    'Wind & Brass',
    'Other',
  ]

  return (
    <section className="card left">
      <h2>Music Categories</h2>
      <p className="muted small">Browse musicians grouped by instrument and style category.</p>
      {loading ? (
        <p className="muted">Loading musician categories…</p>
      ) : (
        <div className="categories-grid">
          {categories.map((title) => {
            const members = categorized[title] || []
            return (
              <article key={title} className="category-card">
                <h3>{title} <span className="muted small">({members.length})</span></h3>
                {!members.length ? (
                  <p className="muted small">No musicians yet.</p>
                ) : (
                  <ul>
                    {members.map((musician) => (
                      <li key={musician.id}>{musician.name} — {musician.instrument}</li>
                    ))}
                  </ul>
                )}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

function CommitteeReviewPage({ requests, musicians, responses, acceptedByRequest, onAccept }) {
  const musicianById = useMemo(() => Object.fromEntries(musicians.map((m) => [m.id, m])), [musicians])

  const responsesByRequest = useMemo(() => {
    const grouped = {}
    for (const response of responses) {
      grouped[response.requestId] = grouped[response.requestId] || []
      grouped[response.requestId].push(response)
    }
    return grouped
  }, [responses])

  return (
    <section className="card left">
      <h2>Committee Review</h2>
      <p className="muted small">See which musicians responded and choose who to confirm.</p>

      {!requests.length ? (
        <p className="muted">No requests available yet.</p>
      ) : (
        <div className="stack">
          {requests.map((request) => {
            const requestResponses = responsesByRequest[request.id] || []
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
                          <MusicianCard musician={musician} showContact />
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
                    Confirmed: <strong>{acceptedMusician.name}</strong> ({acceptedMusician.contact}) for this request.
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
  const [showMusicianSignupModal, setShowMusicianSignupModal] = useState(false)
  const { tab, navigateToTab } = useTabRouter({ pathToTab, tabToPath })

  const {
    musicians,
    requests,
    responses,
    acceptedByRequest,
    loading,
    successNotice,
    errorNotice,
    addMusician,
    addRequest,
    requestMusicianByEmail,
    acceptMusician,
  } = useJalaData({
    api,
    sampleMusicians: SAMPLE_MUSICIANS,
    sampleRequests: SAMPLE_REQUESTS,
    sampleResponses: SAMPLE_RESPONSES,
  })

  return (
    <div className="app-shell">
      <div className="top-banner">
        <span>The second drop of the </span>
        <a href="https://liquidspirit.org" target="_blank" rel="noreferrer">Liquid Spirit experience.</a>
      </div>

      <nav className="top-nav" aria-label="Primary navigation">
        <div className="top-nav-inner">
          <button className="nav-text brand" onClick={() => navigateToTab('Home')}>Jala</button>
          {TABS.map((item) => (
            <button key={item} className={`nav-text ${tab === item ? 'active' : ''}`} onClick={() => navigateToTab(item)}>
              {item}
            </button>
          ))}
          <button className={`nav-cta ${tab === REQUEST_TAB ? 'active' : ''}`} onClick={() => navigateToTab(REQUEST_TAB)}>
            Request A Performance
          </button>
        </div>
      </nav>

      <main className="page">
        {loading && <p className="muted">Loading data…</p>}
        {successNotice && <p className="success-banner">{successNotice}</p>}
        {errorNotice && <p className="error-note">{errorNotice}</p>}

        {tab === 'Home' && (
          <HomePage
            musicians={musicians}
            requests={requests}
            onOpenMusicianSignup={() => setShowMusicianSignupModal(true)}
            onOpenExplainer={() => navigateToTab(EXPLAINER_TAB)}
            onRequestMusician={requestMusicianByEmail}
          />
        )}

        {tab === 'Musicians' && <BrowseMusiciansPage musicians={musicians} onRequestMusician={requestMusicianByEmail} />}

        {tab === EXPLAINER_TAB && (
          <ExplainerPage
            onOpenMusicianSignup={() => setShowMusicianSignupModal(true)}
            goToRequest={() => navigateToTab(REQUEST_TAB)}
          />
        )}

        {tab === 'Categories' && <CategoriesPage />}

        {tab === 'Community' && (
          <>
            <RequestBoard requests={requests} musicians={musicians} />
            <CommitteeReviewPage
              requests={requests}
              musicians={musicians}
              responses={responses}
              acceptedByRequest={acceptedByRequest}
              onAccept={acceptMusician}
            />
          </>
        )}

        {tab === REQUEST_TAB && (
          <>
            <FeastRequestPage onAdd={addRequest} />
            <RequestBoard requests={requests} musicians={musicians} />
          </>
        )}
      </main>

      {showMusicianSignupModal && (
        <div className="modal-backdrop" onClick={() => setShowMusicianSignupModal(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Musician Sign-up</h3>
              <button className="modal-close" onClick={() => setShowMusicianSignupModal(false)}>✕</button>
            </div>
            <MusicianSignupPage
              onAdd={(payload) => {
                addMusician(payload)
                setShowMusicianSignupModal(false)
              }}
              musicians={musicians}
              showSpotlight={false}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default App
