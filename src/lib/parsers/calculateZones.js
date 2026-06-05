/**
 * Zone calculation utility.
 *
 * Zones are defined as absolute HR ranges calibrated to a 180 bpm max HR:
 *   Z1: < 90 bpm  (< 50% of 180)
 *   Z2: 90–126    (50–70%)
 *   Z3: 126–144   (70–80%)
 *   Z4: 144–162   (80–90%)
 *   Z5: 162–180   (90–100%)
 *
 * If the user has confirmed a different max HR (stored in enrichment.defaults.max_hr),
 * the boundaries scale proportionally.
 *
 * Estimation method: given an avg HR, model a Gaussian distribution of effort
 * centred at that HR with σ = 10 bpm. This gives a realistic spread
 * rather than allocating 100% to one zone.
 */

// Abramowitz & Stegun approximation of the error function
function erf(x) {
  const sign = x >= 0 ? 1 : -1
  x = Math.abs(x)
  const t = 1 / (1 + 0.3275911 * x)
  const y =
    1 -
    (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t +
      0.254829592) *
      t) *
      Math.exp(-x * x)
  return sign * y
}

/** P(X ≤ x) for a Normal(mu, sigma) distribution. */
function normalCDF(x, mu, sigma) {
  return 0.5 * (1 + erf((x - mu) / (sigma * Math.sqrt(2))))
}

/**
 * Builds zone HR boundaries scaled to the given max HR.
 * Default max HR = 180 bpm.
 */
export function getZoneBoundaries(maxHr = 180) {
  return [
    { zone: 1, min: 0,              max: maxHr * 0.50 },
    { zone: 2, min: maxHr * 0.50,   max: maxHr * 0.70 },
    { zone: 3, min: maxHr * 0.70,   max: maxHr * 0.80 },
    { zone: 4, min: maxHr * 0.80,   max: maxHr * 0.90 },
    { zone: 5, min: maxHr * 0.90,   max: maxHr         },
  ]
}

/**
 * Estimates zone percent distribution from an average heart rate.
 *
 * @param {number} avgHr   - average HR during the activity (bpm)
 * @param {number} maxHr   - athlete's max HR (default 180)
 * @returns {{ zone1_percent, zone2_percent, zone3_percent, zone4_percent, zone5_percent } | null}
 */
export function estimateZonesFromAvgHr(avgHr, maxHr = 180) {
  if (!avgHr || avgHr <= 0) return null

  const sigma = 10 // assumed effort spread ±10 bpm around avg HR
  const zones = getZoneBoundaries(maxHr)

  // For each zone, integrate the Normal PDF over its HR range
  const rawFractions = zones.map(z =>
    normalCDF(z.max, avgHr, sigma) - normalCDF(z.min, avgHr, sigma)
  )

  const total = rawFractions.reduce((s, v) => s + v, 0)
  if (total === 0) return null

  // Convert to integer percents, fix rounding error in the dominant zone
  const percents = rawFractions.map(v => Math.round((v / total) * 100))
  const rSum = percents.reduce((s, v) => s + v, 0)
  const dominantIdx = percents.indexOf(Math.max(...percents))
  percents[dominantIdx] += 100 - rSum

  return {
    zone1_percent: percents[0],
    zone2_percent: percents[1],
    zone3_percent: percents[2],
    zone4_percent: percents[3],
    zone5_percent: percents[4],
  }
}
