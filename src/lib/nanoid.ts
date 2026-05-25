let counter = 0
export function nanoid(): string {
  return `id-${Date.now()}-${++counter}`
}
