<template>
  <div
    class="vjdp-calendar"
    :class="{ 'vjdp-calendar--elevated': elevated, 'vjdp-calendar--double': views.length > 1 }"
    :dir="rtl ? 'rtl' : 'ltr'"
    @mouseleave="emit('day-hover', null)"
  >
    <div class="vjdp-calendar__months">
      <DatePickerMonth
        v-for="(view, index) in views"
        :key="`${view.jy}-${view.jm}`"
        :class="{ 'vjdp-month--secondary': index > 0 }"
        :year="view.jy"
        :month="view.jm"
        :show-prev="index === 0"
        :show-next="index === views.length - 1 || index === 0"
        :rtl="rtl"
        :start-key="startKey"
        :end-key="endKey"
        :preview-key="previewKey"
        :today-key="todayKey"
        :is-disabled="isDisabled"
        :locale="locale"
        :format-number="formatNumber"
        @shift="emit('shift', $event)"
        @day-click="emit('day-click', $event)"
        @day-hover="emit('day-hover', $event)"
      />
    </div>

    <div v-if="showFooter" class="vjdp-footer">
      <p class="vjdp-footer__summary">{{ summaryLabel }}</p>
      <div class="vjdp-footer__actions">
        <button v-if="showToday" type="button" class="vjdp-btn" @click="emit('today')">{{ locale.today }}</button>
        <button v-if="showConfirm" type="button" class="vjdp-btn vjdp-btn--primary" @click="emit('confirm')">{{ locale.confirm }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import DatePickerMonth from './DatePickerMonth.vue'
import type { JalaliDate, JalaliMonth } from '../jalali'
import type { DatePickerLocale } from '../locale'

defineProps<{
  views: JalaliMonth[]
  rtl: boolean
  startKey: number | null
  endKey: number | null
  previewKey: number | null
  todayKey: number
  isDisabled: (key: number) => boolean
  locale: DatePickerLocale
  formatNumber: (value: number) => string
  summaryLabel: string
  showFooter: boolean
  showToday: boolean
  showConfirm: boolean
  elevated?: boolean
}>()

const emit = defineEmits<{
  shift: [delta: number]
  'day-click': [date: JalaliDate]
  'day-hover': [key: number | null]
  today: []
  confirm: []
}>()
</script>
