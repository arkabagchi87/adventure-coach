/**
 * Merges new parsed activities into the existing store.
 *
 * Deduplication rules (Task 3):
 *   Match on: same date + same activity_type + duration within 5 minutes.
 *   A file can be re-uploaded any number of times without corrupting data.
 *
 * Existing enriched activities are never overwritten — only new activities are appended.
 */

function isDuplicate(incoming, existing) {
  return existing.some(
    e =>
      e.date === incoming.date &&
      e.activity_type === incoming.activity_type &&
      Math.abs((e.duration_minutes || 0) - (incoming.duration_minutes || 0)) <= 5
  )
}

export function mergeActivities(existing, incoming) {
  const added = []

  for (const activity of incoming) {
    if (!isDuplicate(activity, existing)) {
      existing = [...existing, activity] // grow the pool so later items in same batch don't self-duplicate
      added.push(activity)
    }
  }

  const merged = [...existing].sort((a, b) => a.date.localeCompare(b.date))
  return { merged, added: added.length, total: merged.length }
}
