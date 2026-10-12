<template>
  <main style="max-width: 960px; margin: 0 auto; padding: 24px; display: grid; grid-template-columns: minmax(0, 1fr); gap: 48px">
    <section>
      <h2>Popover — single date</h2>
      <JalaliDatePicker v-model="single" />
      <pre>{{ format(single) }}</pre>
    </section>

    <section>
      <h2>Popover — range, auto apply</h2>
      <JalaliDatePicker v-model="range" range auto-apply />
      <pre>{{ format(range) }}</pre>
    </section>

    <section>
      <h2>Inline — min/max + disabled dates</h2>
      <JalaliDatePicker v-model="inline" variant="inline" :min-date="today" :max-date="inSixtyDays" :disabled-dates="disabled" />
      <pre>{{ format(inline) }}</pre>
    </section>

    <section>
      <h2>Inline — one month, Latin digits, English labels, no Fridays</h2>
      <JalaliDatePicker v-model="english" variant="inline" :months="1" digits="latin" :rtl="false" :locale="enLocale" :is-date-disabled="isFriday" />
      <pre>{{ format(english) }}</pre>
    </section>

    <section>
      <h2>Custom color</h2>
      <div style="display: flex; gap: 8px; margin-bottom: 12px">
        <button v-for="swatch in swatches" :key="swatch" type="button" :style="{ background: swatch, width: '32px', height: '32px', border: 0, borderRadius: '50%', cursor: 'pointer' }" @click="brand = swatch" />
      </div>
      <JalaliDatePicker v-model="colored" variant="inline" range :color="brand" />
    </section>

    <section class="vjdp-dark" style="background: #120d0c; padding: 24px; border-radius: 16px">
      <h2 style="color: #f3e9e4">Dark theme</h2>
      <JalaliDatePicker v-model="dark" variant="inline" range />
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { JalaliDatePicker, enLocale } from '../src'
import type { DatePickerValue, DateRange } from '../src'

const single = ref<Date | null>(null)
const range = ref<DateRange>({ start: null, end: null })
const inline = ref<Date | null>(null)
const english = ref<Date | null>(null)
const dark = ref<DateRange>({ start: null, end: null })
const colored = ref<DateRange>({ start: null, end: null })
const swatches = ['#2563eb', '#16a34a', '#7c3aed', '#facc15', '#0f172a']
const brand = ref(swatches[0]!)

function daysFromToday(offset: number) {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return date
}

const today = daysFromToday(0)
const inSixtyDays = daysFromToday(60)
const disabled = [daysFromToday(3), daysFromToday(4), daysFromToday(10)]
const isFriday = (date: Date) => date.getDay() === 5

function format(value: DatePickerValue) {
  const iso = (date: Date | null) => (date ? date.toDateString() : 'null')
  if (value instanceof Date || value === null) return iso(value)
  return `${iso(value.start)} → ${iso(value.end)}`
}
</script>
