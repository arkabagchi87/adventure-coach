/**
 * Merges new parsed activities into the existing store.
 * Deduplicates by (date + activity_type + duration_minutes proximity).
 * Existing hand-enriched activities are never overwritten.
 */

function activityKey(a) {
  return `${a.date}|${a.activity_type}|${Math.round(a.duration_minutes / 5) * 5}`
}

export function mergeActivities(existing, incoming) {
  const existingKeys = new Set(existing.map(activityKey))
  const added = []

  for (const activity of incoming) {
    const key = activityKey(activity)
    if (!existingKeys.has(key)) {
      existingKeys.add(key)
      added.push(activity)
    }
  }

  const merged = [...existing, ...added].sort((a, b) => a.date.localeCompare(b.date))
  return { merged, added: added.length, total: merged.length }
}
