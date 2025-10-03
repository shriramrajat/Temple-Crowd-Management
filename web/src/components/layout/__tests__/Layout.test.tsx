import React from 'react'
import { render, screen } from '@/test-utils'
import { Layout } from '../Layout'

describe('Layout Component', () => {
  it('renders children correctly', () => {
    render(
      <Layout>
        <div>Main content</div>
      </Layout>
    )
    
    expect(screen.getByText('Main content')).toBeInTheDocument()
  })

  it('includes header component', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    )
    
    // Header should contain app title
    expect(screen.getByText(/my app/i)).toBeInTheDocument()
  })

  it('applies correct layout structure', () => {
    const { container } = render(
      <Layout>
        <div>Content</div>
      </Layout>
    )
    
    // Should have proper layout classes
    const layoutDiv = container.firstChild as HTMLElement
    expect(layoutDiv).toHaveClass('min-h-screen', 'bg-gray-50')
  })

  it('renders main content area', () => {
    render(
      <Layout>
        <div data-testid="main-content">Main content</div>
      </Layout>
    )
    
    const mainContent = screen.getByTestId('main-content')
    expect(mainContent).toBeInTheDocument()
    
    // Main content should be in a container with proper styling
    const mainContainer = mainContent.parentElement
    expect(mainContainer).toHaveClass('flex-1')
  })

  it('handles responsive design', () => {
    const { container } = render(
      <Layout>
        <div>Responsive content</div>
      </Layout>
    )
    
    // Should have responsive classes
    const layout = container.firstChild as HTMLElement
    expect(layout).toHaveClass('min-h-screen')
  })

  it('accepts custom className', () => {
    const { container } = render(
      <Layout className="custom-layout">
        <div>Content</div>
      </Layout>
    )
    
    const layout = container.firstChild as HTMLElement
    expect(layout).toHaveClass('custom-layout')
  })

  it('provides proper semantic structure', () => {
    render(
      <Layout>
        <main>
          <h1>Page Title</h1>
          <p>Page content</p>
        </main>
      </Layout>
    )
    
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })
})