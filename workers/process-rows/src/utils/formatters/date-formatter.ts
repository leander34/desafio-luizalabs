import dayjs from 'dayjs'

export function dateFormatter(date: string) {
  const dateFormated = dayjs(date).format('YYYY-MM-DD')
  return dateFormated
}
