'use client'

import { useState, useEffect } from 'react'
import StatsClient from './StatsClient'
import BottomNav from '@/components/shared/BottomNav'
import { initializeIfNeeded, getActivities, getEnrichment } from '@/lib/storage/activityStorage'

export default function StatsPage() {
  const [loaded, setLoaded] = useState(false)
  const [activities, setActivities] = useState([])
  const [enrichment, setEnrichment] = useState({})

  useEffect(() => {
    initializeIfNeeded().then(() => {
      setActivities(getActivities())
      setEnrichment(getEnrichment())
      setLoaded(true)
    })
  }, [])

  if (!loaded) {
    return <div className="min-h-screen bg-gray-950" />
  }

  return (
    <div className="min-h-screen bg-gray-950 pb-24">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between px-5 pt-12 pb-2">
          <h1 className="text-xl font-black text-white tracking-tight">Stats</h1>
          <p className="text-xs text-gray-500">Kilimanjaro-lens view</p>
        </div>
        <StatsClient activities={activities} enrichment={enrichment} />
      </div>
      <BottomNav />
    </div>
  )
}
