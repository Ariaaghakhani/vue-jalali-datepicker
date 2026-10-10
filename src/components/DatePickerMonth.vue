<template>
  <div class="vjdp-month">
    <div class="vjdp-month__header">
      <button
        v-if="showPrev"
        type="button"
        class="vjdp-nav"
        :aria-label="locale.prevMonth"
        @click="emit('shift', -1)"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="rtl ? 'M9 6l6 6-6 6' : 'M15 6l-6 6 6 6'" /></svg>
      </button>
      <span v-else class="vjdp-nav vjdp-nav--placeholder" />

      <p class="vjdp-month__title">{{ formatNumber(year) }} {{ locale.months[month - 1] }}</p>

      <button
        v-if="showNext"
        type="button"
        class="vjdp-nav vjdp-nav--next"
        :aria-label="locale.nextMonth"
        @click="emit('shift', 1)"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="rtl ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'" /></svg>
      </button>
      <span v-else class="vjdp-nav vjdp-nav--placeholder" />
    </div>

    <div class="vjdp-weekdays">
      <span v-for="weekday in locale.weekdays" :key="weekday">{{ weekday }}</span>
    </div>

    <div class="vjdp-days" role="grid">
      <div v-for="cell in cells" :key="cell.blank ? `blank-${cell.index}` : cell.key" class="vjdp-cell">
        <button
          v-if="!cell.blank"
          type="button"
          class="vjdp-day"
          :class="dayClass(cell.key)"
          :disabled="isDisabled(cell.key)"
          :aria-selected="cell.key === startKey || cell.key === endKey"
          :aria-current="cell.key === todayKey ? 'date' : undefined"
          @click="emit('day-click', { jy: year, jm: month, jd: cell.day })"
          @mouseenter="emit('day-hover', cell.key)"
        >
          {{ formatNumber(cell.day) }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { jalaliFirstWeekday, jalaliKey, jalaliMonthLength } from '../jalali'
import type { JalaliDate } from '../jalali'
import type { DatePickerLocale } from '../locale'

const props = defineProps<{
  year: number
  month: number
  showPrev: boolean
  showNext: boolean
  rtl: boolean
  startKey: number | null
  endKey: number | null
  previewKey: number | null
  todayKey: number
  isDisabled: (key: number) => boolean
  locale: DatePickerLocale
  formatNumber: (value: number) => string
}>()

const emit = defineEmits<{
  shift: [delta: number]
  'day-click': [date: JalaliDate]
  'day-hover': [key: number]
}>()

const effectiveEndKey = computed(() => props.endKey ?? props.previewKey)
const lowKey = computed(() => (props.startKey != null && effectiveEndKey.value != null ? Math.min(props.startKey, effectiveEndKey.value) : null))
const highKey = computed(() => (props.startKey != null && effectiveEndKey.value != null ? Math.max(props.startKey, effectiveEndKey.value) : null))

type Cell = { blank: true, index: number } | { blank: false, day: number, key: number }

const cells = computed<Cell[]>(() => {
  const leadingBlanks = jalaliFirstWeekday(props.year, props.month)
  const length = jalaliMonthLength(props.year, props.month)
  const blanks = Array.from({ length: leadingBlanks }, (_, index) => ({ blank: true as const, index }))
  const days = Array.from({ length }, (_, index) => {
    const day = index + 1
    return { blank: false as const, day, key: jalaliKey({ jy: props.year, jm: props.month, jd: day }) }
  })
  return [...blanks, ...days]
})

function dayClass(key: number) {
  const isEdge = key === props.startKey || key === props.endKey
  const inRange = lowKey.value != null && highKey.value != null && key > lowKey.value && key < highKey.value
  return {
    'vjdp-day--selected': isEdge,
    'vjdp-day--in-range': !isEdge && inRange,
    'vjdp-day--today': !isEdge && !inRange && key === props.todayKey,
  }
}
</script>
