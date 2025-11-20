/**
 * Mock Data Generator for Command Center Dashboard
 * 
 * Generates realistic mock data for zones, alerts, footfall, and warnings
 * Used for development and testing purposes
 */

import type {
  Zone,
  Alert,
  FootfallDataPoint,
  HighDensityWarning,
  DensityLevel,
  AlertSeverity,
  AlertType,
} from '@/lib/types/command-center';

/**
 * Generate mock zones with realistic data
 */
export function generateMockZones(): Zone[] {
  const zones: Zone[] = [
    {
      id: 'zone-1',
      name: 'Main Entrance',
      coordinates: { x: 50, y: 50, width: 100, height: 80 },
      currentOccupancy: 145,
      maxCapacity: 200,
      densityLevel: 'medium' as DensityLevel,
      densityThreshold: 0.8,
      lastUpdated: new Date(),
    },
    {
      id: 'zone-2',
      name: 'Food Court',
      coordinates: { x: 200, y: 50, width: 120, height: 100 },
      currentOccupancy: 185,
      maxCapacity: 200,
      densityLevel: 'high' as DensityLevel,
      densityThreshold: 0.8,
      lastUpdated: new Date(),
    },
    {
      id: 'zone-3',
      name: 'Exhibition Hall A',
      coordinates: { x: 50, y: 180, width: 150, height: 120 },
      currentOccupancy: 95,
      maxCapacity: 300,
      densityLevel: 'low' as DensityLevel,
      densityThreshold: 0.8,
      lastUpdated: new Date(),
    },
    {
      id: 'zone-4',
      name: 'Exhibition Hall B',
      coordinates: { x: 220, y: 180, width: 150, height: 120 },
      currentOccupancy: 245,
      maxCapacity: 300,
      densityLevel: 'high' as DensityLevel,
      densityThreshold: 0.8,
      lastUpdated: new Date(),
    },
    {
      id: 'zone-5',
      name: 'Auditorium',
      coordinates: { x: 400, y: 50, width: 140, height: 150 },
      currentOccupancy: 480,
      maxCapacity: 500,
      densityLevel: 'critical' as DensityLevel,
      densityThreshold: 0.8,
      lastUpdated: new Date(),
    },
    {
      id: 'zone-6',
      name: 'Parking Area',
      coordinates: { x: 400, y: 220, width: 140, height: 80 },
      currentOccupancy: 65,
      maxCapacity: 150,
      densityLevel: 'low' as DensityLevel,
      densityThreshold: 0.8,
      lastUpdated: new Date(),
    },
    {
      id: 'zone-7',
      name: 'VIP Lounge',
      coordinates: { x: 560, y: 50, width: 80, height: 100 },
      currentOccupancy: 42,
      maxCapacity: 50,
      densityLevel: 'high' as DensityLevel,
      densityThreshold: 0.8,
      lastUpdated: new Date(),
    },
    {
      id: 'zone-8',
      name: 'Emergency Exit North',
      coordinates: { x: 560, y: 180, width: 80, height: 60 },
      currentOccupancy: 12,
      maxCapacity: 100,
      densityLevel: 'low' as DensityLevel,
      densityThreshold: 0.8,
      lastUpdated: new Date(),
    },
  ];

  return zones;
}

/**
 * Generate mock alerts with various severities
 */
export function generateMockAlerts(count: number = 20): Alert[] {
  const zones = generateMockZones();
  const alerts: Alert[] = [];
  const severities: AlertSeverity[] = ['info', 'warning', 'critical'];
  const types: AlertType[] = ['high-density', 'capacity', 'system', 'safety'];
  
  const messages = {
    'high-density': 'High crowd density detected',
    'capacity': 'Approaching maximum capacity',
    'system': 'System notification',
    'safety': 'Safety protocol activated',
  };

  for (let i = 0; i < count; i++) {
    const zone = zones[Math.floor(Math.random() * zones.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    
    // Generate timestamps in the past 2 hours
    const minutesAgo = Math.floor(Math.random() * 120);
    const timestamp = new Date(Date.now() - minutesAgo * 60 * 1000);

    alerts.push({
      id: `alert-${i + 1}`,
      timestamp,
      severity,
      zoneId: zone.id,
      zoneName: zone.name,
      type,
      message: messages[type],
      acknowledged: Math.random() > 0.7,
    });
  }

  // Sort by timestamp descending (newest first)
  return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * Generate mock footfall data for a given time range
 */
export function generateMockFootfallData(
  timeRange: 'hourly' | 'daily' | 'weekly',
  zoneId?: string
): FootfallDataPoint[] {
  const data: FootfallDataPoint[] = [];
  const now = new Date();
  
  let dataPoints: number;
  let intervalMinutes: number;
  
  switch (timeRange) {
    case 'hourly':
      dataPoints = 60; // Last 60 minutes
      intervalMinutes = 1;
      break;
    case 'daily':
      dataPoints = 24; // Last 24 hours
      intervalMinutes = 60;
      break;
    case 'weekly':
      dataPoints = 7 * 24; // Last 7 days (hourly)
      intervalMinutes = 60;
      break;
  }

  for (let i = dataPoints - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * intervalMinutes * 60 * 1000);
    
    // Generate realistic footfall patterns (higher during day, lower at night)
    const hour = timestamp.getHours();
    const baseCount = hour >= 9 && hour <= 21 ? 150 : 30;
    const variance = Math.random() * 50 - 25;
    const count = Math.max(0, Math.floor(baseCount + variance));

    data.push({
      timestamp,
      count,
      zoneId,
    });
  }

  return data;
}

/**
 * Generate mock high-density warnings
 */
export function generateMockWarnings(): HighDensityWarning[] {
  const zones = generateMockZones();
  const warnings: HighDensityWarning[] = [];

  // Generate warnings for zones with high or critical density
  zones.forEach((zone) => {
    if (zone.densityLevel === 'high' || zone.densityLevel === 'critical') {
      const occupancyRate = zone.currentOccupancy / zone.maxCapacity;
      
      warnings.push({
        id: `warning-${zone.id}`,
        zoneId: zone.id,
        zoneName: zone.name,
        currentDensity: occupancyRate,
        threshold: zone.densityThreshold,
        timestamp: new Date(Date.now() - Math.random() * 30 * 60 * 1000), // Within last 30 minutes
        status: 'active',
      });
    }
  });

  return warnings;
}

/**
 * Generate a random zone update for WebSocket simulation
 */
export function generateRandomZoneUpdate() {
  const zones = generateMockZones();
  const zone = zones[Math.floor(Math.random() * zones.length)];
  
  // Randomly adjust occupancy
  const change = Math.floor(Math.random() * 20) - 10;
  const newOccupancy = Math.max(0, Math.min(zone.maxCapacity, zone.currentOccupancy + change));
  const occupancyRate = newOccupancy / zone.maxCapacity;
  
  let densityLevel: DensityLevel;
  if (occupancyRate >= 0.9) densityLevel = 'critical';
  else if (occupancyRate >= 0.7) densityLevel = 'high';
  else if (occupancyRate >= 0.4) densityLevel = 'medium';
  else densityLevel = 'low';

  return {
    zoneId: zone.id,
    occupancy: newOccupancy,
    densityLevel,
    timestamp: new Date(),
  };
}

/**
 * Generate a random alert for WebSocket simulation
 */
export function generateRandomAlert(): Alert {
  const zones = generateMockZones();
  const zone = zones[Math.floor(Math.random() * zones.length)];
  const severities: AlertSeverity[] = ['info', 'warning', 'critical'];
  const types: AlertType[] = ['high-density', 'capacity', 'system', 'safety'];
  
  const type = types[Math.floor(Math.random() * types.length)];
  const severity = severities[Math.floor(Math.random() * severities.length)];
  
  const messages = {
    'high-density': `High crowd density detected in ${zone.name}`,
    'capacity': `${zone.name} approaching maximum capacity`,
    'system': `System notification for ${zone.name}`,
    'safety': `Safety protocol activated in ${zone.name}`,
  };

  return {
    id: `alert-${Date.now()}`,
    timestamp: new Date(),
    severity,
    zoneId: zone.id,
    zoneName: zone.name,
    type,
    message: messages[type],
    acknowledged: false,
  };
}
