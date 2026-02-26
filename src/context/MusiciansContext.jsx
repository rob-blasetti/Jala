/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'

const MusiciansContext = createContext({
  musicians: [],
  categorized: {},
  loading: false,
})

const getCategory = (instrument = '') => {
  const value = instrument.toLowerCase()
  if (/(voice|vocal|sing|choir)/.test(value)) return 'Singing & Vocals'
  if (/(guitar|violin|cello|ukulele|string)/.test(value)) return 'Strings'
  if (/(piano|keyboard|keys|synth)/.test(value)) return 'Keys & Piano'
  if (/(drum|percussion|cajon|rhythm)/.test(value)) return 'Rhythm & Percussion'
  if (/(flute|sax|trumpet|clarinet|wind|brass)/.test(value)) return 'Wind & Brass'
  return 'Other'
}

export function MusiciansProvider({ children }) {
  const [musicians, setMusicians] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    api
      .getAllMusicians()
      .then((data) => {
        if (!active) return
        setMusicians(data.musicians || [])
      })
      .catch(() => {
        if (!active) return
        setMusicians([])
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const categorized = useMemo(() => {
    const bucket = {
      'Singing & Vocals': [],
      Strings: [],
      'Keys & Piano': [],
      'Rhythm & Percussion': [],
      'Wind & Brass': [],
      Other: [],
    }

    for (const musician of musicians) {
      const category = getCategory(musician.instrument)
      bucket[category].push(musician)
    }

    return bucket
  }, [musicians])

  return <MusiciansContext.Provider value={{ musicians, categorized, loading }}>{children}</MusiciansContext.Provider>
}

export const useMusiciansContext = () => useContext(MusiciansContext)
