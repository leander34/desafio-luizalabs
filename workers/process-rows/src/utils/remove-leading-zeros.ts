export function removeLeadingZeros(value: string) {
  const valueWithZerosRemovedFromRheLeft = value.replace(/^0+/, '') // Substitui zeros à esquerda por vazio
  return valueWithZerosRemovedFromRheLeft === ''
    ? '0'
    : valueWithZerosRemovedFromRheLeft
}
