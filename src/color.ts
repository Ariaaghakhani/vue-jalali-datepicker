export interface DatePickerColors {
  /** Selected days and the primary button. */
  accent: string
  /** Hover state of `accent`. */
  accentHover: string
  /** Background of days inside a range. */
  accentSoft: string
  /** Today's number and text inside a range. */
  accentFg: string
  /** Text on top of `accent`. */
  onAccent: string
}

/** Any CSS color, or individual shades to override. */
export type DatePickerColor = string | Partial<DatePickerColors>

const DARK_TEXT = '#1a1a1a'
const LIGHT_TEXT = '#ffffff'

function parseRgb(color: string): [number, number, number] | null {
  const value = color.trim().toLowerCase()

  const hex = value.match(/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/)
  if (hex) {
    let digits = hex[1]!
    if (digits.length <= 4) digits = [...digits].map((d) => d + d).join('')
    return [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16)) as [number, number, number]
  }

  const rgb = value.match(/^rgba?\(\s*([\d.]+%?)[\s,]+([\d.]+%?)[\s,]+([\d.]+%?)/)
  if (rgb) {
    return [rgb[1]!, rgb[2]!, rgb[3]!].map((part) =>
      part.endsWith('%') ? (parseFloat(part) / 100) * 255 : parseFloat(part),
    ) as [number, number, number]
  }

  return null
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (c: number) => {
    const s = Math.min(Math.max(c, 0), 255) / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/**
 * Picks white or near-black text for the best WCAG contrast on `color`.
 * Returns `null` for formats it can't parse (named colors, `hsl()`, `var()`…).
 */
export function readableTextColor(color: string): string | null {
  const rgb = parseRgb(color)
  if (!rgb) return null
  const luminance = relativeLuminance(rgb)
  const contrastWithWhite = 1.05 / (luminance + 0.05)
  const contrastWithDark = (luminance + 0.05) / (relativeLuminance([26, 26, 26]) + 0.05)
  return contrastWithWhite >= contrastWithDark ? LIGHT_TEXT : DARK_TEXT
}

/**
 * Builds the `--vjdp-*` custom properties for a color prop. A string derives
 * every shade from one color via `color-mix()`, so the shades adapt to light
 * and dark surfaces; an object sets only the shades it names.
 */
export function colorVariables(color: DatePickerColor | undefined): Record<string, string> {
  if (!color) return {}

  if (typeof color === 'string') {
    const vars: Record<string, string> = {
      '--vjdp-accent': color,
      '--vjdp-accent-hover': `color-mix(in srgb, ${color} 85%, var(--vjdp-fg))`,
      '--vjdp-accent-soft': `color-mix(in srgb, ${color} 18%, var(--vjdp-bg))`,
      '--vjdp-accent-fg': `color-mix(in srgb, ${color} 55%, var(--vjdp-fg))`,
      '--vjdp-bg-hover': `color-mix(in srgb, ${color} 8%, var(--vjdp-bg))`,
    }
    const onAccent = readableTextColor(color)
    if (onAccent) vars['--vjdp-on-accent'] = onAccent
    return vars
  }

  const map: Record<keyof DatePickerColors, string> = {
    accent: '--vjdp-accent',
    accentHover: '--vjdp-accent-hover',
    accentSoft: '--vjdp-accent-soft',
    accentFg: '--vjdp-accent-fg',
    onAccent: '--vjdp-on-accent',
  }
  const vars: Record<string, string> = {}
  for (const key of Object.keys(map) as (keyof DatePickerColors)[]) {
    const value = color[key]
    if (value) vars[map[key]] = value
  }
  return vars
}
