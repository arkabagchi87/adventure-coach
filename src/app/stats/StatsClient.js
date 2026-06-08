'use client'

import { useState, useMemo } from 'react'
import TimeRangeSelector from '@/components/stats/TimeRangeSelector'
import SummaryStrip from '@/components/stats/SummaryStrip'
import ElevationChart from '@/components/stats/ElevationChart'
import ZoneDonut from '@/components/stats/ZoneDonut'
import ActivityDaysChart from '@/components/stats/ActivityDaysChart'
import ActivityTypeBreakdown from '@/components/stats/ActivityTypeBreakdown'
import HrvTrendChart from '@/components/stats/HrvTrendChart'
import {
  filterByRange,
  buildElevationChartData,
  buildActivityDaysData,
  computeZoneDistribution,
  computeTypeCounts,
  buildHrvRhrData,
  computeSummaryTotals,
} from '@/lib/stats/processStatsData'

// Phase 1 elevation target: 400–600m/week by end of phase
const PHASE_ELEVATION_TARGET = 500

export default function StatsClient({ activities, enrichment = {} }) {
  const [range, setRange] = useState('30D')

  const filtered = useMemo(() => filterByRange(activities, range), [activities, range])

  const summary      = useMemo(() => computeSummaryTotals(filtered, enrichment), [filtered, enrichment])
  const elevData     = useMemo(() => buildElevationChartData(filtered, enrichment), [filtered, enrichment])
  const actDaysData  = useMemo(() => buildActivityDaysData(filtered), [filtered])
  const zones        = useMemo(() => computeZoneDistribution(filtered), [filtered])
  const typeCounts   = useMemo(() => computeTypeCounts(filtered), [filtered])
  const hrvRhrData   = useMemo(() => buildHrvRhrData(filtered), [filtered])

  return (
    <>
      <TimeRangeSelector selected={range} onChange={setRange} />
      <SummaryStrip
        totalElevation={summary.totalElevation}
        activeDays={summary.activeDays}
        totalHours={summary.totalHours}
      />
      <ElevationChart data={elevData} phaseTarget={PHASE_ELEVATION_TARGET} />
      <ZoneDonut zones={zones} />
      <ActivityDaysChart data={actDaysData} />
      <ActivityTypeBreakdown typeCounts={typeCounts} totalSessions={filtered.length} />
      <HrvTrendChart data={hrvRhrData} />
    </>
  )
}
