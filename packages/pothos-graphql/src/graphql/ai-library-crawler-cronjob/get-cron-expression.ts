import { AiLibraryCrawlerCronJob } from '@george-ai/prismaClient'

export const getCronExpression = (cronJob: AiLibraryCrawlerCronJob) => {
  const { hour, minute, monday, tuesday, wednesday, thursday, friday, saturday, sunday } = cronJob

  const days = [
    monday ? 1 : 0,
    tuesday ? 2 : 0,
    wednesday ? 3 : 0,
    thursday ? 4 : 0,
    friday ? 5 : 0,
    saturday ? 6 : 0,
    sunday ? 7 : 0,
  ].filter((day) => day !== 0)

  if (days.length === 0) {
    return null
  }

  const segments: string[] = []
  let segment: number[] = []

  const moveSegmentToSegments = () => {
    // skip empty segments
    if (segment.length === 0) {
      return
    }

    // segemnts with one or two days will be comma separated
    if (segment.length < 3) {
      segments.push(segment.join(','))
      segment = []
      return
    }

    // segments with three or more days will be a range
    const start = segment[0]
    const end = segment[segment.length - 1]
    const range = `${start}-${end}`
    segments.push(range)

    segment = []
  }

  for (const day of days) {
    if (segment.length === 0) {
      segment.push(day)
      continue
    }

    const prevDayInSegment = segment[segment.length - 1]
    const isCurrentDayConsecutive = prevDayInSegment + 1 === day

    if (isCurrentDayConsecutive) {
      segment.push(day)
      continue
    }

    // end of the current segment found
    moveSegmentToSegments()

    // start a new segment
    segment.push(day)
  }
  moveSegmentToSegments()

  return `${minute} ${hour} * * ${segments.join(',')}`
}
