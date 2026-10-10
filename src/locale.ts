export interface DatePickerLocale {
  months: string[]
  /** Saturday..Friday */
  weekdays: string[]
  toggleLabel: string
  placeholder: string
  rangePlaceholder: string
  emptySummary: string
  emptyRangeSummary: string
  today: string
  confirm: string
  prevMonth: string
  nextMonth: string
  rangeSeparator: string
}

export const faLocale: DatePickerLocale = {
  months: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'],
  weekdays: ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'],
  toggleLabel: 'باز کردن تقویم',
  placeholder: 'تاریخ را انتخاب کنید',
  rangePlaceholder: 'بازه تاریخ را انتخاب کنید',
  emptySummary: 'تاریخ را انتخاب کنید',
  emptyRangeSummary: 'تاریخ شروع و پایان را انتخاب کنید',
  today: 'امروز',
  confirm: 'تایید',
  prevMonth: 'ماه قبل',
  nextMonth: 'ماه بعد',
  rangeSeparator: ' - ',
}

/** English (transliterated) labels, still on the Jalali calendar. */
export const enLocale: DatePickerLocale = {
  months: ['Farvardin', 'Ordibehesht', 'Khordad', 'Tir', 'Mordad', 'Shahrivar', 'Mehr', 'Aban', 'Azar', 'Dey', 'Bahman', 'Esfand'],
  weekdays: ['Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr'],
  toggleLabel: 'Open calendar',
  placeholder: 'Select a date',
  rangePlaceholder: 'Select a date range',
  emptySummary: 'Select a date',
  emptyRangeSummary: 'Select start and end dates',
  today: 'Today',
  confirm: 'Confirm',
  prevMonth: 'Previous month',
  nextMonth: 'Next month',
  rangeSeparator: ' – ',
}
