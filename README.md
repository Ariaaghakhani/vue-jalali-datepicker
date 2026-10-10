# vue-jalali-datepicker

A lightweight, **zero-dependency** Persian (Jalali / Shamsi) date & range picker for **Vue 3**.

- 📅 Single date or date range, with a live hover preview of the range
- 🪟 Popover (input + calendar) or inline variants
- 📱 Two-month view that collapses to one month on narrow containers (CSS container queries)
- 🚫 `minDate`, `maxDate`, `disabledDates` and an `isDateDisabled` predicate
- 🔢 Persian or Latin digits, fully overridable labels (Persian and English locales included)
- 🎨 Themed entirely through CSS custom properties, with a built-in dark theme
- ↔️ RTL first, LTR supported
- 🧮 Exact, closed-form Jalali ↔ Gregorian conversion (no `Intl` calendar support needed), exported as utilities
- 🟦 Written in TypeScript, ~6 kB gzipped JS + 1.6 kB CSS

## Install

```bash
npm i vue-jalali-datepicker
```

## Usage

```vue
<template>
  <JalaliDatePicker v-model="date" />
  <JalaliDatePicker v-model="range" range auto-apply />
  <JalaliDatePicker v-model="date" variant="inline" :min-date="new Date()" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { JalaliDatePicker } from 'vue-jalali-datepicker'
import type { DateRange } from 'vue-jalali-datepicker'
import 'vue-jalali-datepicker/style.css'

const date = ref<Date | null>(null)
const range = ref<DateRange>({ start: null, end: null })
</script>
```

Or register globally:

```ts
import { JalaliDatePickerPlugin } from 'vue-jalali-datepicker'
import 'vue-jalali-datepicker/style.css'

app.use(JalaliDatePickerPlugin) // registers <JalaliDatePicker />
```

### Nuxt

```ts
// plugins/jalali-datepicker.ts
import { JalaliDatePickerPlugin } from 'vue-jalali-datepicker'
import 'vue-jalali-datepicker/style.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(JalaliDatePickerPlugin)
})
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `Date \| null \| DateRange` | `null` | `Date \| null` in single mode, `{ start, end }` in range mode. Dates are local-midnight `Date` objects. |
| `range` | `boolean` | `false` | Select a start/end range. |
| `variant` | `'popover' \| 'inline'` | `'popover'` | Input + floating calendar, or calendar only. |
| `months` | `1 \| 2` | `2` | Months shown side by side. The second hides below ~560px of available width. |
| `placeholder` | `string` | locale | Input placeholder (popover). |
| `minDate` / `maxDate` | `Date \| null` | `null` | Selectable bounds (inclusive). |
| `disabledDates` | `Date[]` | `[]` | Specific days that can't be selected. |
| `isDateDisabled` | `(date: Date) => boolean` | — | Custom disabling, e.g. `d => d.getDay() === 5` for Fridays. |
| `locale` | `Partial<DatePickerLocale>` | `faLocale` | Override any label; `enLocale` is exported too. |
| `digits` | `'fa' \| 'latin'` | `'fa'` | Digit set for numbers. |
| `rtl` | `boolean` | `true` | Layout direction. |
| `autoApply` | `boolean` | `false` | Popover only: commit and close once the selection is complete (hides the confirm button). |
| `showToday` | `boolean` | `true` | Show the "today" button. |
| `showFooter` | `boolean` | `true` | Inline only: show the summary/footer row. |
| `align` | `'start' \| 'end'` | `'start'` | Which edge of the trigger the popover aligns to (logical, respects `dir`). |
| `disabled` | `boolean` | `false` | Disable the popover trigger. |
| `name` | `string` | — | `name` attribute of the readonly input. |
| `formatDate` | `(date: Date, jalali: JalaliDate) => string` | — | Custom label for selected dates (defaults to `۱۸ مهر`). |

### Behaviour

- **Inline**: `update:modelValue` fires on every click.
- **Popover**: selection is a draft until the user presses *confirm* (or immediately with `autoApply`). Clicking outside or pressing <kbd>Esc</kbd> discards the draft.

## Events

| Event | Payload | When |
| --- | --- | --- |
| `update:modelValue` | `DatePickerValue` | Value committed. |
| `confirm` | `DatePickerValue` | Popover value confirmed. |
| `select-date` | `Date` | Any day clicked (or "today" pressed), before commit. |
| `open` / `close` | — | Popover toggled. |

## Slots

`#trigger="{ open, toggle, label, placeholder }"` replaces the default input/button trigger of the popover.

```vue
<JalaliDatePicker v-model="date">
  <template #trigger="{ toggle, label, placeholder }">
    <button @click="toggle">{{ label ?? placeholder }}</button>
  </template>
</JalaliDatePicker>
```

Exposed methods (via template ref): `open()`, `close()`, `toggle()`.

## Theming

Every color and size is a CSS variable set on `.vjdp-calendar` / `.vjdp-popover`. Override them on any ancestor:

```css
.my-form .vjdp-calendar,
.my-form .vjdp-popover {
  --vjdp-accent: #2563eb;
  --vjdp-accent-hover: #1d4ed8;
  --vjdp-accent-soft: #dbeafe;
  --vjdp-accent-fg: #1e40af;
  --vjdp-radius: 12px;
  --vjdp-font-family: Vazirmatn, sans-serif;
}
```

Available variables: `--vjdp-bg`, `--vjdp-bg-hover`, `--vjdp-fg`, `--vjdp-fg-muted`, `--vjdp-fg-subtle`, `--vjdp-border`, `--vjdp-border-faint`, `--vjdp-accent`, `--vjdp-accent-hover`, `--vjdp-accent-soft`, `--vjdp-accent-fg`, `--vjdp-on-accent`, `--vjdp-radius`, `--vjdp-radius-control`, `--vjdp-shadow`, `--vjdp-shadow-elevated`, `--vjdp-width`, `--vjdp-z-index`, `--vjdp-transition`, `--vjdp-font-family`.

**Dark mode:** add the `dark` (e.g. Nuxt Color Mode / Tailwind) or `vjdp-dark` class to any ancestor.

## Jalali utilities

```ts
import { toJalali, toGregorian, jalaliMonthLength, isJalaliLeapYear, toFaDigits } from 'vue-jalali-datepicker'

toJalali(new Date(2025, 2, 21))           // { jy: 1404, jm: 1, jd: 1 }
toGregorian({ jy: 1404, jm: 1, jd: 1 })   // Date: 2025-03-21 (local midnight)
jalaliMonthLength(1403, 12)               // 30
isJalaliLeapYear(1404)                    // false
toFaDigits(1404)                          // '۱۴۰۴'
```

## Development

```bash
npm install
npm run dev        # playground
npm test
npm run build
```

## Releasing

Publishing runs from GitHub Actions when a GitHub release is published (`.github/workflows/publish.yml`). It needs an `NPM_TOKEN` repository secret (an npm granular access token with publish rights).

## License

[MIT](./LICENSE) © Aria Aghakhani
