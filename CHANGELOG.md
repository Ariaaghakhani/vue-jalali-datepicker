# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/).

## 0.2.0 - 2026-10-12

### Added

- `color` prop to brand the picker with one value. Pass any CSS color and the hover, range, today and hover-tint shades are derived with `color-mix()`, adapting to light and dark themes. Text on selected days switches between white and near-black for the best contrast (hex and `rgb()` colors). Pass an object (`{ accent, accentHover, accentSoft, accentFg, onAccent }`) to set individual shades.
- `colorVariables()` and `readableTextColor()` helpers, plus the `DatePickerColor` / `DatePickerColors` types.

## 0.1.0 - 2026-10-10

### Added

- First release: Jalali date and range picker for Vue 3 with popover and inline variants, min/max/disabled dates, Persian and English locales, CSS variable theming with a dark theme, and Jalali ↔ Gregorian utilities.
