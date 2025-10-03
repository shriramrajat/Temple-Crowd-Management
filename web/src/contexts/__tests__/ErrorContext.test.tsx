import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ErrorContextProvider, useErrorContext } from '../ErrorContext';

// Test component that uses the error context
const TestComponent: React.FC = () => {
  const { state, showError, showWarning, showInfo, removeError, clearErrors, retryError } = useErrorContext();

  return (
    <div>
      <div data-testid="error-count">{state.errors.length}</div>
      <div data-testid="is-retrying">{state.isRetrying.toString()}</div>
      
      <button onClick={() => showError('Test error')}>Show Error</button>
      <button onClick={() => showWarning('Test warning')}>Show Warning</button>
      <button onClick={() => showInfo('Test info')}>Show Info</button>
      <button onClick={clearErrors}>Clear Errors</button>
      
      {state.errors.map(error => (
        <div key={error.id} data-testid={`error-${error.id}`}>
          <span>{error.message}</span>
          <span data-testid={`error-type-${error.id}`}>{error.type}</span>
          <button onClick={() => removeError(error.id)}>Remove</button>
          {error.retryable && (
            <button onClick={() => retryError(error.id)}>Retry</button>
          )}
        </div>
      ))}
    </div>
  );
};

const renderWithProvider = () => {
  return render(
    <ErrorContextProvider>
      <TestComponent />
    </ErrorContextProvider>
  );
};

describe('ErrorContext', () => {
  it('starts with empty error state', () => {
    renderWithProvider();
    
    expect(screen.getByTestId('error-count')).toHaveTextContent('0');
    expect(screen.getByTestId('is-retrying')).toHaveTextContent('false');
  });

  it('adds error when showError is called', () => {
    renderWithProvider();
    
    fireEvent.click(screen.getByText('Show Error'));
    
    expect(screen.getByTestId('error-count')).toHaveTextContent('1');
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('adds warning when showWarning is called', () => {
    renderWithProvider();
    
    fireEvent.click(screen.getByText('Show Warning'));
    
    expect(screen.getByTestId('error-count')).toHaveTextContent('1');
    expect(screen.getByText('Test warning')).toBeInTheDocument();
  });

  it('adds info when showInfo is called', () => {
    renderWithProvider();
    
    fireEvent.click(screen.getByText('Show Info'));
    
    expect(screen.getByTestId('error-count')).toHaveTextContent('1');
    expect(screen.getByText('Test info')).toBeInTheDocument();
  });

  it('removes specific error when removeError is called', () => {
    renderWithProvider();
    
    fireEvent.click(screen.getByText('Show Error'));
    fireEvent.click(screen.getByText('Show Warning'));
    
    expect(screen.getByTestId('error-count')).toHaveTextContent('2');
    
    const removeButtons = screen.getAllByText('Remove');
    fireEvent.click(removeButtons[0]);
    
    expect(screen.getByTestId('error-count')).toHaveTextContent('1');
  });

  it('clears all errors when clearErrors is called', () => {
    renderWithProvider();
    
    fireEvent.click(screen.getByText('Show Error'));
    fireEvent.click(screen.getByText('Show Warning'));
    fireEvent.click(screen.getByText('Show Info'));
    
    expect(screen.getByTestId('error-count')).toHaveTextContent('3');
    
    fireEvent.click(screen.getByText('Clear Errors'));
    
    expect(screen.getByTestId('error-count')).toHaveTextContent('0');
  });

  it('auto-dismisses non-error messages after timeout', async () => {
    jest.useFakeTimers();
    renderWithProvider();
    
    fireEvent.click(screen.getByText('Show Warning'));
    fireEvent.click(screen.getByText('Show Info'));
    
    expect(screen.getByTestId('error-count')).toHaveTextContent('2');
    
    // Fast-forward time by 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('error-count')).toHaveTextContent('0');
    });
    
    jest.useRealTimers();
  });

  it('sets correct error types', () => {
    renderWithProvider();
    
    fireEvent.click(screen.getByText('Show Error'));
    fireEvent.click(screen.getByText('Show Warning'));
    fireEvent.click(screen.getByText('Show Info'));
    
    const errorTypes = screen.getAllByTestId(/error-type-/);
    const types = errorTypes.map(el => el.textContent);
    
    expect(types).toContain('error');
    expect(types).toContain('warning');
    expect(types).toContain('info');
  });
});