/**
 * Connection Status Indicator Component
 * 
 * Displays the current SSE connection state with visual indicators.
 * Requirements: 1.1, 2.1, 4.4
 * Task: 12.1 - Connection status indicator for SSE connections
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Connection state types
 */
export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error' | 'reconnecting';

/**
 * Connection status props
 */
interface ConnectionStatusProps {
  state: ConnectionState;
  className?: string;
  showLabel?: boolean;
}

/**
 * Get indicator color based on connection state
 */
function getIndicatorColor(state: ConnectionState): string {
  switch (state) {
    case 'connected':
      return 'bg-green-500';
    case 'connecting':
    case 'reconnecting':
      return 'bg-yellow-500';
    case 'disconnected':
    case 'error':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

/**
 * Get label text based on connection state
 */
function getLabel(state: ConnectionState): string {
  switch (state) {
    case 'connected':
      return 'Connected';
    case 'connecting':
      return 'Connecting...';
    case 'reconnecting':
      return 'Reconnecting...';
    case 'disconnected':
      return 'Disconnected';
    case 'error':
      return 'Connection Error';
    default:
      return 'Unknown';
  }
}

/**
 * Connection Status Indicator Component
 * 
 * Shows a colored dot with optional label to indicate connection state:
 * - Green: Connected
 * - Yellow: Connecting/Reconnecting
 * - Red: Disconnected/Error
 */
export function ConnectionStatus({ state, className, showLabel = true }: ConnectionStatusProps) {
  const indicatorColor = getIndicatorColor(state);
  const label = getLabel(state);
  
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative flex items-center justify-center">
        {/* Pulsing animation for connecting/reconnecting states */}
        {(state === 'connecting' || state === 'reconnecting') && (
          <span className={cn(
            'absolute inline-flex h-3 w-3 rounded-full opacity-75 animate-ping',
            indicatorColor
          )} />
        )}
        
        {/* Status dot */}
        <span className={cn(
          'relative inline-flex h-2.5 w-2.5 rounded-full',
          indicatorColor
        )} />
      </div>
      
      {/* Label */}
      {showLabel && (
        <span className="text-sm text-muted-foreground">
          {label}
        </span>
      )}
    </div>
  );
}

/**
 * Compact connection status (dot only, with tooltip)
 */
export function ConnectionStatusCompact({ state, className }: Omit<ConnectionStatusProps, 'showLabel'>) {
  const indicatorColor = getIndicatorColor(state);
  const label = getLabel(state);
  
  return (
    <div 
      className={cn('relative flex items-center justify-center', className)}
      title={label}
    >
      {/* Pulsing animation for connecting/reconnecting states */}
      {(state === 'connecting' || state === 'reconnecting') && (
        <span className={cn(
          'absolute inline-flex h-3 w-3 rounded-full opacity-75 animate-ping',
          indicatorColor
        )} />
      )}
      
      {/* Status dot */}
      <span className={cn(
        'relative inline-flex h-2.5 w-2.5 rounded-full',
        indicatorColor
      )} />
    </div>
  );
}
