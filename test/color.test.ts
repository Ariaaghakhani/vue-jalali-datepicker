import { describe, expect, it } from 'vitest'
import { colorVariables, readableTextColor } from '../src/color'

describe('readableTextColor', () => {
  it('picks white on dark colors and dark text on light colors', () => {
    expect(readableTextColor('#1d4ed8')).toBe('#ffffff')
    expect(readableTextColor('#000')).toBe('#ffffff')
    expect(readableTextColor('#facc15')).toBe('#1a1a1a')
    expect(readableTextColor('#fff')).toBe('#1a1a1a')
  })

  it('understands rgb() and 8-digit hex', () => {
    expect(readableTextColor('rgb(22, 163, 74)')).toBe('#1a1a1a')
    expect(readableTextColor('rgba(30 64 175 / 0.9)')).toBe('#ffffff')
    expect(readableTextColor('#1d4ed8ff')).toBe('#ffffff')
  })

  it('returns null for formats it cannot parse', () => {
    expect(readableTextColor('rebeccapurple')).toBeNull()
    expect(readableTextColor('var(--brand)')).toBeNull()
  })
})

describe('colorVariables', () => {
  it('is empty without a color', () => {
    expect(colorVariables(undefined)).toEqual({})
    expect(colorVariables('')).toEqual({})
  })

  it('derives all shades from a single color', () => {
    const vars = colorVariables('#1d4ed8')
    expect(vars['--vjdp-accent']).toBe('#1d4ed8')
    expect(vars['--vjdp-accent-hover']).toContain('color-mix(in srgb, #1d4ed8')
    expect(vars['--vjdp-accent-soft']).toContain('var(--vjdp-bg)')
    expect(vars['--vjdp-accent-fg']).toContain('var(--vjdp-fg)')
    expect(vars['--vjdp-on-accent']).toBe('#ffffff')
  })

  it('keeps the default text color when the color is not parseable', () => {
    expect(colorVariables('var(--brand)')).not.toHaveProperty('--vjdp-on-accent')
  })

  it('maps an object to only the shades it sets', () => {
    expect(colorVariables({ accent: 'teal', onAccent: 'white' })).toEqual({
      '--vjdp-accent': 'teal',
      '--vjdp-on-accent': 'white',
    })
  })
})
