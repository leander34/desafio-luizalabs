import dayjs from 'dayjs'

export function dateFormatter(date: string) {
  const dateFormated = dayjs(date, 'yyyymmdd').format('YYYY-MM-DD')
  return dateFormated
}
