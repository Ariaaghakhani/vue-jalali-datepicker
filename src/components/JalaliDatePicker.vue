<template>
  <div
    v-if="variant === 'popover'"
    ref="rootRef"
    class="vjdp-popover"
    :class="`vjdp-popover--align-${align}`"
    :dir="rtl ? 'rtl' : 'ltr'"
  >
    <slot name="trigger" :open="open" :toggle="toggle" :label="committedLabel" :placeholder="placeholderLabel">
      <div class="vjdp-trigger">
        <button
          type="button"
          class="vjdp-btn vjdp-trigger__icon"
          :aria-label="labels.toggleLabel"
          :aria-expanded="open"
          :disabled="disabled"
          @click="toggle"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="3" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </button>
        <input
          class="vjdp-input"
          :value="committedLabel ?? ''"
          :placeholder="placeholderLabel"
          :disabled="disabled"
          :name="name"
          readonly
          @click="toggle"
        >
      </div>
    </slot>

    <div v-if="open" class="vjdp-popover__panel">
      <DatePickerCalendar
        elevated
        v-bind="calendarProps"
        :show-footer="true"
        :show-confirm="!autoApply"
        @shift="shift"
        @day-click="onDayClick"
        @day-hover="hoverKey = $event"
        @today="jumpToday"
        @confirm="confirm"
      />
    </div>
  </div>

  <DatePickerCalendar
    v-else
    v-bind="calendarProps"
    :show-footer="showFooter"
    :show-confirm="false"
    @shift="shift"
    @day-click="onDayClick"
    @day-hover="hoverKey = $event"
    @today="jumpToday"
  />
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import DatePickerCalendar from './DatePickerCalendar.vue'
import { jalaliKey, shiftJalaliMonth, toFaDigits, toGregorian, toJalali } from '../jalali'
import type { JalaliDate } from '../jalali'
import { faLocale } from '../locale'
import type { DatePickerLocale } from '../locale'
import type { DatePickerValue, DateRange } from '../types'

const props = withDefaults(defineProps<{
  /** `Date | null` in single mode, `{ start, end }` in range mode. */
  modelValue?: DatePickerValue
  range?: boolean
  variant?: 'popover' | 'inline'
  /** Number of months shown side by side (the second collapses on narrow containers). */
  months?: 1 | 2
  placeholder?: string
  disabledDates?: Date[]
  minDate?: Date | null
  maxDate?: Date | null
  isDateDisabled?: (date: Date) => boolean
  locale?: Partial<DatePickerLocale>
  /** Render numbers with Persian (`fa`) or Latin (`latin`) digits. */
  digits?: 'fa' | 'latin'
  rtl?: boolean
  /** Popover only: commit and close as soon as the selection is complete, no confirm button. */
  autoApply?: boolean
  showToday?: boolean
  /** Inline only: show the summary/today footer. */
  showFooter?: boolean
  align?: 'start' | 'end'
  disabled?: boolean
  name?: string
  /** Custom label for a selected date; defaults to `<day> <month name>`. */
  formatDate?: (date: Date, jalali: JalaliDate) => string
}>(), {
  modelValue: null,
  range: false,
  variant: 'popover',
  months: 2,
  disabledDates: () => [],
  minDate: null,
  maxDate: null,
  digits: 'fa',
  rtl: true,
  autoApply: false,
  showToday: true,
  showFooter: true,
  align: 'start',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: DatePickerValue]
  confirm: [value: DatePickerValue]
  'select-date': [date: Date]
  open: []
  close: []
}>()

const labels = computed<DatePickerLocale>(() => ({ ...faLocale, ...props.locale }))
const formatNumber = (value: number) => (props.digits === 'fa' ? toFaDigits(value) : String(value))

const todayJalali = toJalali(new Date())
const todayKey = jalaliKey(todayJalali)

function toRange(value: DatePickerValue | undefined): DateRange {
  if (value instanceof Date) return { start: value, end: null }
  if (value && typeof value === 'object') return { start: value.start ?? null, end: value.end ?? null }
  return { start: null, end: null }
}

function fromRange(value: DateRange): DatePickerValue {
  return props.range ? { start: value.start, end: value.end } : value.start
}

function viewFor(date: Date | null) {
  const { jy, jm } = date ? toJalali(date) : todayJalali
  return { jy, jm }
}

const draft = reactive<DateRange>(toRange(props.modelValue))
const view = reactive(viewFor(draft.start))
const hoverKey = ref<number | null>(null)
const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)

function resetDraft() {
  Object.assign(draft, toRange(props.modelValue))
  Object.assign(view, viewFor(draft.start))
}

watch(
  () => props.modelValue,
  () => {
    if (props.variant === 'inline' || !open.value) resetDraft()
  },
  { deep: true },
)

// --- Disabled state ----------------------------------------------------------

function keyOf(date: Date) {
  return jalaliKey(toJalali(date))
}

function dateOfKey(key: number): Date {
  const jy = Math.floor((key - 1) / 372)
  const rest = key - 1 - jy * 372
  return toGregorian({ jy, jm: Math.floor(rest / 31) + 1, jd: (rest % 31) + 1 })
}

const disabledKeys = computed(() => new Set(props.disabledDates.map(keyOf)))
const minKey = computed(() => (props.minDate ? keyOf(props.minDate) : null))
const maxKey = computed(() => (props.maxDate ? keyOf(props.maxDate) : null))

function isDisabled(key: number): boolean {
  if (disabledKeys.value.has(key)) return true
  if (minKey.value != null && key < minKey.value) return true
  if (maxKey.value != null && key > maxKey.value) return true
  return props.isDateDisabled ? props.isDateDisabled(dateOfKey(key)) : false
}

// --- Calendar state ----------------------------------------------------------

const startKey = computed(() => (draft.start ? keyOf(draft.start) : null))
const endKey = computed(() => (draft.end ? keyOf(draft.end) : null))
const previewKey = computed(() => (props.range && draft.start && !draft.end ? hoverKey.value : null))
const views = computed(() => Array.from({ length: props.months }, (_, index) => shiftJalaliMonth(view, index)))

function shift(delta: number) {
  Object.assign(view, shiftJalaliMonth(view, delta))
}

function afterSelection(date: Date) {
  emit('select-date', date)
  if (props.variant === 'inline') {
    emit('update:modelValue', fromRange(draft))
    return
  }
  const complete = !props.range || draft.end !== null
  if (props.autoApply && complete) confirm()
}

function onDayClick(date: JalaliDate) {
  const clicked = toGregorian(date)

  if (!props.range) {
    draft.start = clicked
    draft.end = null
  } else if (draft.start === null || draft.end !== null) {
    draft.start = clicked
    draft.end = null
  } else if (jalaliKey(date) >= startKey.value!) {
    draft.end = clicked
  } else {
    draft.end = draft.start
    draft.start = clicked
  }
  afterSelection(clicked)
}

function jumpToday() {
  Object.assign(view, { jy: todayJalali.jy, jm: todayJalali.jm })
  if (isDisabled(todayKey)) return
  const today = toGregorian(todayJalali)
  draft.start = today
  draft.end = null
  afterSelection(today)
}

function confirm() {
  const value = fromRange(draft)
  emit('update:modelValue', value)
  emit('confirm', value)
  setOpen(false)
}

// --- Popover -----------------------------------------------------------------

function onDocumentPointerDown(event: PointerEvent) {
  if (rootRef.value && !rootRef.value.contains(event.target as Node)) setOpen(false)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') setOpen(false)
}

function setOpen(value: boolean) {
  if (open.value === value) return
  open.value = value
  if (value) {
    resetDraft()
    hoverKey.value = null
    document.addEventListener('pointerdown', onDocumentPointerDown)
    document.addEventListener('keydown', onKeydown)
    emit('open')
  } else {
    document.removeEventListener('pointerdown', onDocumentPointerDown)
    document.removeEventListener('keydown', onKeydown)
    emit('close')
  }
}

function toggle() {
  if (!props.disabled) setOpen(!open.value)
}

onBeforeUnmount(() => setOpen(false))

defineExpose({ open: () => setOpen(true), close: () => setOpen(false), toggle })

// --- Labels ------------------------------------------------------------------

function labelFor(date: Date) {
  const jalali = toJalali(date)
  if (props.formatDate) return props.formatDate(date, jalali)
  return `${formatNumber(jalali.jd)} ${labels.value.months[jalali.jm - 1]}`
}

function summaryFor(value: DateRange): string | null {
  if (!value.start) return null
  if (!props.range || !value.end) return labelFor(value.start)
  return `${labelFor(value.start)}${labels.value.rangeSeparator}${labelFor(value.end)}`
}

const committedLabel = computed(() => summaryFor(toRange(props.modelValue)))
const placeholderLabel = computed(() => props.placeholder ?? (props.range ? labels.value.rangePlaceholder : labels.value.placeholder))
const draftLabel = computed(() => summaryFor(draft) ?? (props.range ? labels.value.emptyRangeSummary : labels.value.emptySummary))

const calendarProps = computed(() => ({
  views: views.value,
  rtl: props.rtl,
  startKey: startKey.value,
  endKey: endKey.value,
  previewKey: previewKey.value,
  todayKey,
  isDisabled,
  locale: labels.value,
  formatNumber,
  summaryLabel: draftLabel.value,
  showToday: props.showToday,
}))
</script>
