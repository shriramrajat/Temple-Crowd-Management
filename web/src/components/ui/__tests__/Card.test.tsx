import React from 'react'
import { render, screen } from '@/test-utils'
import { Card } from '../Card'

describe('Card Component', () => {
  it('renders children correctly', () => {
    render(
      <Card>
        <h2>Card Title</h2>
        <p>Card content</p>
      </Card>
    )
    
    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('applies default styling', () => {
    const { container } = render(<Card>Test content</Card>)
    const card = container.firstChild as HTMLElement
    
    expect(card).toHaveClass('bg-white', 'rounded-lg', 'shadow-md', 'p-6')
  })

  it('accepts custom className', () => {
    const { container } = render(
      <Card className="custom-class">Test content</Card>
    )
    const card = container.firstChild as HTMLElement
    
    expect(card).toHaveClass('custom-class')
  })

  it('forwards additional props', () => {
    const { container } = render(
      <Card data-testid="test-card">Test content</Card>
    )
    const card = container.firstChild as HTMLElement
    
    expect(card).toHaveAttribute('data-testid', 'test-card')
  })

  it('renders as different HTML elements when specified', () => {
    const { container } = render(
      <Card as="section">Test content</Card>
    )
    const card = container.firstChild as HTMLElement
    
    expect(card.tagName).toBe('SECTION')
  })
})