import { describe, expect, it } from 'vitest'
import { isJalaliLeapYear, jalaliFirstWeekday, jalaliMonthLength, shiftJalaliMonth, toGregorian, toJalali } from '../src/jalali'

function intlJalali(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US-u-ca-persian', { year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(date)
  const get = (type: string) => Number(parts.find((part) => part.type === type)!.value)
  return { jy: get('year'), jm: get('month'), jd: get('day') }
}

describe('jalali conversion', () => {
  it('converts known dates', () => {
    expect(toJalali(new Date(2024, 2, 20))).toEqual({ jy: 1403, jm: 1, jd: 1 })
    expect(toJalali(new Date(2025, 2, 21))).toEqual({ jy: 1404, jm: 1, jd: 1 })
    expect(toGregorian({ jy: 1403, jm: 12, jd: 30 })).toEqual(new Date(2025, 2, 20))
  })

  it('matches Intl for every day in 1370..1430', () => {
    const date = new Date(1991, 2, 1)
    const end = new Date(2051, 2, 1)
    while (date < end) {
      const jalali = toJalali(date)
      expect(jalali).toEqual(intlJalali(date))
      expect(toGregorian(jalali).getTime()).toBe(new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime())
      date.setDate(date.getDate() + 1)
    }
  })

  it('knows leap years and month lengths', () => {
    expect(isJalaliLeapYear(1403)).toBe(true)
    expect(isJalaliLeapYear(1404)).toBe(false)
    expect(jalaliMonthLength(1403, 12)).toBe(30)
    expect(jalaliMonthLength(1404, 12)).toBe(29)
    expect(jalaliMonthLength(1404, 1)).toBe(31)
    expect(jalaliMonthLength(1404, 7)).toBe(30)
  })

  it('aligns the first weekday Saturday-first', () => {
    // 1 Farvardin 1404 = Friday 21 March 2025
    expect(jalaliFirstWeekday(1404, 1)).toBe(6)
  })

  it('shifts months across year boundaries', () => {
    expect(shiftJalaliMonth({ jy: 1403, jm: 12 }, 1)).toEqual({ jy: 1404, jm: 1 })
    expect(shiftJalaliMonth({ jy: 1404, jm: 1 }, -1)).toEqual({ jy: 1403, jm: 12 })
    expect(shiftJalaliMonth({ jy: 1404, jm: 5 }, -17)).toEqual({ jy: 1402, jm: 12 })
  })
})
