import { useCallback, useEffect, useState } from 'react'

export function useJalaData({ api, sampleMusicians, sampleRequests, sampleResponses }) {
  const [musicians, setMusicians] = useState([])
  const [requests, setRequests] = useState([])
  const [responses, setResponses] = useState([])
  const [acceptedByRequest, setAcceptedByRequest] = useState({})
  const [successNotice, setSuccessNotice] = useState('')
  const [errorNotice, setErrorNotice] = useState('')
  const [loading, setLoading] = useState(true)

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

        setMusicians(musiciansData.length ? musiciansData : sampleMusicians)
        setRequests(requestsData.length ? requestsData : sampleRequests)
        setResponses(responsesData.length ? responsesData : sampleResponses)

        const nextMatches = {}
        for (const match of matchesData) nextMatches[match.requestId] = match.musicianId
        setAcceptedByRequest(nextMatches)
      } catch (error) {
        setMusicians(sampleMusicians)
        setRequests(sampleRequests)
        setResponses(sampleResponses)
        setErrorNotice(`Data API unavailable. Showing fallback data. ${error.message}`)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [api, sampleMusicians, sampleRequests, sampleResponses])

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
  }, [api])

  useEffect(() => {
    if (!successNotice && !errorNotice) return
    const timer = setTimeout(() => {
      setSuccessNotice('')
      setErrorNotice('')
    }, 3500)
    return () => clearTimeout(timer)
  }, [successNotice, errorNotice])

  const addMusician = useCallback(async (payload) => {
    try {
      const created = await api.createMusician({ ...payload, performances: 0 })
      setMusicians((prev) => [created, ...prev])
      setSuccessNotice('Musician profile added.')
    } catch (error) {
      setErrorNotice(`Could not save musician: ${error.message}`)
    }
  }, [api])

  const addRequest = useCallback(async (payload) => {
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
  }, [api])

  const requestMusicianByEmail = useCallback((musician, details) => {
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
  }, [])

  const acceptMusician = useCallback(async (requestId, musicianId) => {
    try {
      const hasExistingMatch = Boolean(acceptedByRequest[requestId])
      if (hasExistingMatch) {
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
  }, [acceptedByRequest, api])

  return {
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
  }
}
