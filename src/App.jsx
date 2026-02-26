import { useEffect, useMemo, useState } from 'react'
import { Button, Input, TextArea } from 'liquid-spirit-styleguide/ui-primitives/web'
import heroImage from './assets/hero-jala.jpg'
import { api } from './lib/api'
import { useMusiciansContext } from './context/MusiciansContext'
import './App.css'

const TABS = ['Home', 'Musicians', 'Categories', 'Community']
const REQUEST_TAB = 'Community Envoy Request'

const tabToPath = (tab) => {
  if (tab === 'Musicians') return '/browse'
  if (tab === 'Categories') return '/categories'
  if (tab === 'Community') return '/community'
  if (tab === REQUEST_TAB) return '/request'
  return '/'
}

const pathToTab = (path) => {
  if (path === '/browse') return 'Musicians'
  if (path === '/categories') return 'Categories'
  if (path === '/community') return 'Community'
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
      <div className="avatar-wrap" aria-hidden="true">{initial}</div>

      <div className="musician-main">
        <div className="musician-head">
          <strong>{musician.name}</strong>
          <CommunityChip label={musician.community} />
        </div>

        <div className="muted">{category} · {musician.instrument}</div>

        <div className="musician-meta-row">
          <span className="muted small">📍 {location}</span>
          <span className="star">⭐ {musician.performances ?? 0}</span>
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

function HomePage({ musicians, requests, onOpenMusicianSignup, goToRequest, onRequestMusician }) {
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
          <h1 key={heroAnimKey} className={`typing-title ${heroTitleClass}`}>{heroTitle}<span className="typing-cursor" aria-hidden="true">|</span></h1>
          <p>Connecting musicians and Feast communities through friendship and joyful service.</p>
        </div>
      </section>

      <MusicianSpotlight musicians={musicians} title="Available musicians" onRequest={onRequestMusician} />

      <section className="card stack left">
        <p className="muted">A warm space for musicians of all kinds to connect with friends nearby and share music at Feast.</p>

        <div className="hero-actions">
          <Button className="cta" onPress={onOpenMusicianSignup} label="I’m a Musician" />
          <Button className="cta secondary" secondary onPress={goToRequest} label="Community Envoy Request" />
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
      </section>
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

function MusicianRequestsPage({ requests }) {
  const [communityFilter, setCommunityFilter] = useState('')

  const filteredRequests = useMemo(() => {
    if (!communityFilter) return requests
    return requests.filter((r) => r.community.toLowerCase().includes(communityFilter.toLowerCase()))
  }, [requests, communityFilter])

  return (
    <section className="card left">
      <h2>Performance Requests</h2>
      <p className="muted small">Browse requests from committees looking for musicians.</p>
      <div className="filter-row">
        <Input label="Filter by community" placeholder="e.g. Northside" value={communityFilter} onChange={(e) => setCommunityFilter(e.target.value)} />
      </div>
      {!filteredRequests.length ? (
        <p className="muted">No requests match this filter right now.</p>
      ) : (
        <ul className="list stack">
          {filteredRequests.map((r) => (
            <li key={r.id} className="list-item">
              <PerformanceRequestCard request={r} />
            </li>
          ))}
        </ul>
      )}
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
  const [tab, setTab] = useState(() => pathToTab(window.location.pathname))
  const [musicians, setMusicians] = useState([])
  const [requests, setRequests] = useState([])
  const [responses, setResponses] = useState([])
  const [acceptedByRequest, setAcceptedByRequest] = useState({})

  const [successNotice, setSuccessNotice] = useState('')
  const [errorNotice, setErrorNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [showMusicianSignupModal, setShowMusicianSignupModal] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [musiciansData, requestsData, responsesData, matchesData] = await Promise.all([
          api.getMusicians(),
          api.getRequests(),
          api.getResponses(),
          api.getMatches(),
        ])

        setMusicians(musiciansData.length ? musiciansData : SAMPLE_MUSICIANS)
        setRequests(requestsData.length ? requestsData : SAMPLE_REQUESTS)
        setResponses(responsesData.length ? responsesData : SAMPLE_RESPONSES)

        const nextMatches = {}
        for (const match of matchesData) nextMatches[match.requestId] = match.musicianId
        setAcceptedByRequest(nextMatches)
      } catch (error) {
        setMusicians(SAMPLE_MUSICIANS)
        setRequests(SAMPLE_REQUESTS)
        setResponses(SAMPLE_RESPONSES)
        setErrorNotice(`Sheet API unavailable. Showing fallback data. ${error.message}`)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const navigateToTab = (nextTab) => {
    setTab(nextTab)
    const nextPath = tabToPath(nextTab)
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath)
    }
  }

  useEffect(() => {
    const onPopState = () => setTab(pathToTab(window.location.pathname))
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const payment = params.get('payment')
    const sessionId = params.get('session_id')

    if (payment === 'success' && sessionId) {
      api
        .verifyCheckoutSession({ sessionId })
        .then((result) => {
          if (result.paid) {
            setRequests((prev) => prev.map((r) => (r.id === result.requestId ? { ...r, status: 'Paid' } : r)))
            setSuccessNotice('Payment confirmed. Your request is now marked Paid.')
          } else {
            setSuccessNotice('Payment completed. Verification is still processing.')
          }
        })
        .catch((error) => setErrorNotice(`Could not verify payment: ${error.message}`))
        .finally(() => {
          const cleanUrl = window.location.pathname
          window.history.replaceState({}, '', cleanUrl)
        })
    }

    if (payment === 'cancel') {
      setErrorNotice('Payment was cancelled. You can try again anytime.')
      const cleanUrl = window.location.pathname
      window.history.replaceState({}, '', cleanUrl)
    }
  }, [])

  useEffect(() => {
    if (!successNotice && !errorNotice) return
    const timer = setTimeout(() => {
      setSuccessNotice('')
      setErrorNotice('')
    }, 3500)
    return () => clearTimeout(timer)
  }, [successNotice, errorNotice])

  const addMusician = async (payload) => {
    try {
      const created = await api.createMusician({ ...payload, performances: 0 })
      setMusicians((prev) => [created, ...prev])
      setSuccessNotice('Musician profile added.')
    } catch (error) {
      setErrorNotice(`Could not save musician: ${error.message}`)
    }
  }

  const addRequest = async (payload) => {
    try {
      const created = await api.createRequest({ ...payload, status: 'Open' })
      setRequests((prev) => [created, ...prev])

      const checkout = await api.createCheckoutSession({
        requestId: created.id,
        committee: created.committee,
        needs: created.needs,
        amountAud: payload.amountAud,
      })

      if (checkout?.url) {
        window.location.href = checkout.url
        return
      }

      setSuccessNotice('Feast request submitted.')
    } catch (error) {
      setErrorNotice(`Could not save request: ${error.message}`)
    }
  }

  const requestMusicianByEmail = (musician, details) => {
    if (!musician?.contact || !String(musician.contact).includes('@')) {
      setErrorNotice('This musician does not have a valid email contact yet.')
      return
    }

    const subject = encodeURIComponent(`Music request for upcoming ${details.eventType || 'Feast/Holy Day'}`)
    const body = encodeURIComponent(
      `Hi ${musician.name},\n\n` +
        `I'd love to request your music support for an upcoming ${details.eventType || 'Feast/Holy Day'}.\n\n` +
        `Date: ${details.eventDate || 'TBC'}\n` +
        `From: ${details.requesterName || 'Community member'}\n` +
        `Contact: ${details.contactEmail || 'Not provided'}\n\n` +
        `Details:\n${details.notes || 'No additional notes'}\n\n` +
        `Blessings,`
    )

    window.location.href = `mailto:${musician.contact}?subject=${subject}&body=${body}`
    setSuccessNotice(`Email draft opened for ${musician.name}.`)
  }

  const acceptMusician = async (requestId, musicianId) => {
    try {
      const existingMatch = Object.entries(acceptedByRequest).find(([rid]) => rid === requestId)
      if (existingMatch) {
        await api.patchMatch({ id: requestId, requestId, musicianId })
      } else {
        await api.createMatch({ id: requestId, requestId, musicianId })
      }

      await api.patchRequest({ id: requestId, status: 'Confirmed' })
      setAcceptedByRequest((prev) => ({ ...prev, [requestId]: musicianId }))
      setRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, status: 'Confirmed' } : r)))
      setSuccessNotice('Musician confirmed for request.')
    } catch (error) {
      setErrorNotice(`Could not confirm musician: ${error.message}`)
    }
  }

  return (
    <div className="app-shell">
      <nav className="bottom-nav" aria-label="Primary navigation">
        <button className="brand-button" onClick={() => navigateToTab('Home')}>Jala</button>
        {TABS.map((item) => (
          <button key={item} className={tab === item ? 'active' : ''} onClick={() => navigateToTab(item)}>
            {item}
          </button>
        ))}
        <button className={`request-cta ${tab === REQUEST_TAB ? 'active' : ''}`} onClick={() => navigateToTab(REQUEST_TAB)}>
          Community Envoy Request
        </button>
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
            goToRequest={() => navigateToTab(REQUEST_TAB)}
            onRequestMusician={requestMusicianByEmail}
          />
        )}

        {tab === 'Musicians' && <MusicianRequestsPage requests={requests} />}

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
            <MusicianSignupPage onAdd={(payload) => {
              addMusician(payload)
              setShowMusicianSignupModal(false)
            }} musicians={musicians} showSpotlight={false} />
          </div>
        </div>
      )}
    </div>
  )
}

export default App
