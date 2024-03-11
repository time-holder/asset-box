export function numberFixed (number: string | number, fixed = 2) {
  return Number(
    Number(number).toFixed(fixed)
  )
}
