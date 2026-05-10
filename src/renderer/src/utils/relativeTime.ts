interface TimeTranslations {
  time: {
    justNow: string
    minutesAgo: (m: number) => string
    hoursAgo: (h: number) => string
    yesterday: string
    daysAgo: (d: number) => string
  }
}

export function relativeTime(date: Date, t: TimeTranslations): string {
  const diff = Date.now() - date.getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return t.time.justNow
  const min = Math.floor(sec / 60)
  if (min < 60) return t.time.minutesAgo(min)
  const hour = Math.floor(min / 60)
  if (hour < 24) return t.time.hoursAgo(hour)
  const day = Math.floor(hour / 24)
  if (day === 1) return t.time.yesterday
  return t.time.daysAgo(day)
}
