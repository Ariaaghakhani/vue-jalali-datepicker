import type { App, Plugin } from 'vue'
import './style.css'
import JalaliDatePicker from './components/JalaliDatePicker.vue'

export { JalaliDatePicker }
export { default as JalaliCalendar } from './components/DatePickerCalendar.vue'
export * from './jalali'
export * from './locale'
export type * from './types'

export const JalaliDatePickerPlugin: Plugin = {
  install(app: App, options: { name?: string } = {}) {
    app.component(options.name ?? 'JalaliDatePicker', JalaliDatePicker)
  },
}

export default JalaliDatePicker
