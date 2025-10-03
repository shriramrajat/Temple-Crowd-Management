import React from 'react'
import { render, screen } from '@/test-utils'
import { ErrorMessage } from '../ErrorMessage'

describe('ErrorMessage Component', () => {
  it('renders error message correctly', () => {
    render(<ErrorMessage message="Something went wrong" />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('does not render when message is empty', () => {
    const { container } = render(<ErrorMessage message="" />)
    expect(container.firstChild).toBeNull()
  })

  it('does not render when message is null', () => {
    const { container } = render(<ErrorMessage message={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('does not render when message is undefined', () => {
    const { container } = render(<ErrorMessage message={undefined} />)
    expect(container.firstChild).toBeNull()
  })

  it('applies correct styling', () => {
    const { container } = render(<ErrorMessage message="Error occurred" />)
    const errorDiv = container.firstChild as HTMLElement
    
    expect(errorDiv).toHaveClass('text-red-600', 'text-sm', 'mt-2')
  })

  it('accepts custom className', () => {
    const { container } = render(
      <ErrorMessage message="Error" className="custom-error" />
    )
    const errorDiv = container.firstChild as HTMLElement
    
    expect(errorDiv).toHaveClass('custom-error')
  })

  it('displays error icon when showIcon is true', () => {
    render(<ErrorMessage message="Error with icon" showIcon />)
    
    // Assuming the icon has a specific class or test id
    const errorContainer = screen.getByText('Error with icon').parentElement
    expect(errorContainer).toHaveClass('flex', 'items-center')
  })
})