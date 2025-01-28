export function generateRandomId() {
  return Math.floor((Date.now() / 1000) * 9999 * Math.random())
}
