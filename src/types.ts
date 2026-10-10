export interface DateRange {
  start: Date | null
  end: Date | null
}

/** `Date | null` in single mode, `DateRange` in range mode. */
export type DatePickerValue = Date | null | DateRange
