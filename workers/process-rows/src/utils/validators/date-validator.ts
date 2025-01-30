export function dateValidator(dateString: string): boolean {
  const regex = /^\d{8}$/
  return regex.test(dateString)
}
