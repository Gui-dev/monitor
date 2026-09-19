import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GradientGauge } from './gradient-gauge'

describe('<GradientGauge />', () => {
  it('should render with default height', () => {
    const { container } = render(<GradientGauge value={50} />)
    const gauge = container.firstChild as HTMLElement
    expect(gauge.className).toContain('h-2')
  })

  it('should render with custom height', () => {
    const { container } = render(<GradientGauge value={50} height="h-4" />)
    const gauge = container.firstChild as HTMLElement
    expect(gauge.className).toContain('h-4')
  })

  it('should calculate percent correctly', () => {
    const { container } = render(<GradientGauge value={75} max={100} />)
    const fill = container.querySelector('[style*="width"]') as HTMLElement
    expect(fill.style.width).toBe('75%')
  })

  it('should cap at 100%', () => {
    const { container } = render(<GradientGauge value={150} max={100} />)
    const fill = container.querySelector('[style*="width"]') as HTMLElement
    expect(fill.style.width).toBe('100%')
  })

  it('should handle zero value', () => {
    const { container } = render(<GradientGauge value={0} />)
    const fill = container.querySelector('[style*="width"]') as HTMLElement
    expect(fill.style.width).toBe('0%')
  })
})
