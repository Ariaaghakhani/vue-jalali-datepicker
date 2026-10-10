export interface JalaliDate {
  jy: number
  jm: number
  jd: number
}

export interface JalaliMonth {
  jy: number
  jm: number
}

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

export function toFaDigits(value: number | string): string {
  return String(value).replace(/[0-9]/g, (digit) => FA_DIGITS[Number(digit)]!)
}

// --- Closed-form Jalali <-> Gregorian conversion -----------------------------
// Based on the Borkowski algorithm (as popularised by jalaali-js), valid for
// Jalali years -61 .. 3177. Works purely on Julian Day Numbers, so it is
// independent of Intl support and of the host's time zone.

const BREAKS = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178]

const div = (a: number, b: number) => ~~(a / b)
const mod = (a: number, b: number) => a - ~~(a / b) * b

function jalCal(jy: number) {
  const gy = jy + 621
  let leapJ = -14
  let jp = BREAKS[0]!
  let jump = 0

  if (jy < jp || jy >= BREAKS[BREAKS.length - 1]!) throw new RangeError(`Invalid Jalali year ${jy}`)

  for (let i = 1; i < BREAKS.length; i++) {
    const jm = BREAKS[i]!
    jump = jm - jp
    if (jy < jm) break
    leapJ += div(jump, 33) * 8 + div(mod(jump, 33), 4)
    jp = jm
  }

  let n = jy - jp
  leapJ += div(n, 33) * 8 + div(mod(n, 33) + 3, 4)
  if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1

  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150
  const march = 20 + leapJ - leapG

  if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33
  let leap = mod(mod(n + 1, 33) - 1, 4)
  if (leap === -1) leap = 4

  return { leap, gy, march }
}

function g2d(gy: number, gm: number, gd: number): number {
  const d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4) + div(153 * mod(gm + 9, 12) + 2, 5) + gd - 34840408
  return d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752
}

function d2g(jdn: number) {
  let j = 4 * jdn + 139361631
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908
  const i = div(mod(j, 1461), 4) * 5 + 308
  const gd = div(mod(i, 153), 5) + 1
  const gm = mod(div(i, 153), 12) + 1
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6)
  return { gy, gm, gd }
}

function j2d(jy: number, jm: number, jd: number): number {
  const { gy, march } = jalCal(jy)
  return g2d(gy, 3, march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1
}

function d2j(jdn: number): JalaliDate {
  const { gy } = d2g(jdn)
  let jy = gy - 621
  const { leap, march } = jalCal(jy)
  let k = jdn - g2d(gy, 3, march)

  if (k >= 0) {
    if (k <= 185) return { jy, jm: 1 + div(k, 31), jd: mod(k, 31) + 1 }
    k -= 186
  } else {
    jy -= 1
    k += 179
    if (leap === 1) k += 1
  }
  return { jy, jm: 7 + div(k, 30), jd: mod(k, 30) + 1 }
}

// --- Public helpers ----------------------------------------------------------

/** Converts a JS Date (read in local time) to its Jalali calendar date. */
export function toJalali(date: Date): JalaliDate {
  return d2j(g2d(date.getFullYear(), date.getMonth() + 1, date.getDate()))
}

/** Converts a Jalali date to a JS Date at local midnight. */
export function toGregorian(date: JalaliDate): Date {
  const { gy, gm, gd } = d2g(j2d(date.jy, date.jm, date.jd))
  return new Date(gy, gm - 1, gd)
}

export function isJalaliLeapYear(jy: number): boolean {
  return jalCal(jy).leap === 0
}

export function jalaliMonthLength(jy: number, jm: number): number {
  if (jm <= 6) return 31
  if (jm <= 11) return 30
  return isJalaliLeapYear(jy) ? 30 : 29
}

/** 0 = Saturday .. 6 = Friday (Saturday-first Persian week). */
export function jalaliFirstWeekday(jy: number, jm: number): number {
  return (toGregorian({ jy, jm, jd: 1 }).getDay() + 1) % 7
}

/** Monotonic, comparable integer for a Jalali date. */
export function jalaliKey(date: JalaliDate): number {
  return date.jy * 372 + (date.jm - 1) * 31 + date.jd
}

export function shiftJalaliMonth(view: JalaliMonth, delta: number): JalaliMonth {
  const index = view.jy * 12 + (view.jm - 1) + delta
  return { jy: Math.floor(index / 12), jm: (((index % 12) + 12) % 12) + 1 }
}
