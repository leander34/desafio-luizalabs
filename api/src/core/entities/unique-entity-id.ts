export class UniqueEntityId {
  private value: number

  constructor(value?: number) {
    this.value = value ?? -1
  }

  toValue() {
    return this.value
  }

  toDBValue() {
    return this.value === -1 ? undefined : this.value
  }

  public equals(id: UniqueEntityId) {
    return id.toValue() === this.toValue()
  }
}
