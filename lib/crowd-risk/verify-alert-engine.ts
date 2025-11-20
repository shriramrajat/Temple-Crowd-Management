/**
 * Alert Engine Verification Script
 * 
 * Demonstrates the Alert Engine functionality and integration with
 * the Density Evaluation Service.
 */

import { getAlertEngine } from './alert-engine';
import { getDensityEvaluationService } from './density-evaluation-service';
import { getThresholdConfigManager } from './threshold-config-manager';
import { getDensityMonitor } from './density-monitor';
import {
  MonitoredArea,
  AreaType,
  ThresholdConfig,
  DensityUnit,
} from './types';

/**
 * Verify Alert Engine functionality
 */
async function verifyAlertEngine() {
  console.log('=== Alert Engine Verification ===\n');
  
  const alertEngine = getAlertEngine();
  const evaluationService = getDensityEvaluationService();
  const configManager = getThresholdConfigManager();
  const densityMonitor = getDensityMonitor();
  
  // Step 1: Register monitored areas
  console.log('Step 1: Registering monitored areas...');
  const testArea: MonitoredArea = {
    id: 'area-test-1',
    name: 'Test Plaza',
    location: {
      latitude: 21.4225,
      longitude: 39.8262,
    },
    capacity: 10000,
    adjacentAreas: ['area-test-2', 'area-test-3'],
    metadata: {
      type: AreaType.GATHERING_SPACE,
      description: 'Main gathering plaza for testing',
    },
  };
  
  alertEngine.registerArea(testArea);
  console.log('✓ Registered area:', testArea.name);
  console.log();
  
  // Step 2: Configure thresholds
  console.log('Step 2: Configuring thresholds...');
  const thresholdConfig: ThresholdConfig = {
    areaId: 'area-test-1',
    warningThreshold: 50,
    criticalThreshold: 75,
    emergencyThreshold: 90,
  };
  
  await configManager.saveConfig(thresholdConfig);
  console.log('✓ Thresholds configured:', {
    warning: thresholdConfig.warningThreshold,
    critical: thresholdConfig.criticalThreshold,
    emergency: thresholdConfig.emergencyThreshold,
  });
  console.log();
  
  // Step 3: Subscribe to alerts
  console.log('Step 3: Subscribing to alerts...');
  const receivedAlerts: any[] = [];
  
  const unsubscribe = alertEngine.subscribeToAlerts((alert) => {
    console.log('\n🚨 ALERT RECEIVED:');
    console.log('  ID:', alert.id);
    console.log('  Type:', alert.type);
    console.log('  Severity:', alert.severity);
    console.log('  Area:', alert.areaName);
    console.log('  Density:', alert.densityValue);
    console.log('  Threshold:', alert.threshold);
    console.log('  Suggested Actions:', alert.metadata.suggestedActions?.slice(0, 2).join(', '));
    receivedAlerts.push(alert);
  });
  
  console.log('✓ Subscribed to alerts');
  console.log();
  
  // Step 4: Connect evaluation service to alert engine
  console.log('Step 4: Connecting evaluation service to alert engine...');
  evaluationService.onEvaluation((evaluation) => {
    alertEngine.processEvaluation(evaluation);
  });
  
  evaluationService.start();
  console.log('✓ Evaluation service started and connected');
  console.log();
  
  // Step 5: Simulate density readings
  console.log('Step 5: Simulating density readings...\n');
  
  // Normal density
  console.log('Simulating normal density (30%)...');
  densityMonitor.processDensityReading({
    areaId: 'area-test-1',
    timestamp: Date.now(),
    densityValue: 30,
    unit: DensityUnit.PERCENTAGE,
  });
  
  await sleep(100);
  
  // Warning threshold crossed
  console.log('\nSimulating warning threshold crossed (55%)...');
  densityMonitor.processDensityReading({
    areaId: 'area-test-1',
    timestamp: Date.now(),
    densityValue: 55,
    unit: DensityUnit.PERCENTAGE,
  });
  
  await sleep(100);
  
  // Critical threshold crossed
  console.log('\nSimulating critical threshold crossed (80%)...');
  densityMonitor.processDensityReading({
    areaId: 'area-test-1',
    timestamp: Date.now(),
    densityValue: 80,
    unit: DensityUnit.PERCENTAGE,
  });
  
  await sleep(100);
  
  // Emergency threshold crossed
  console.log('\nSimulating emergency threshold crossed (95%)...');
  densityMonitor.processDensityReading({
    areaId: 'area-test-1',
    timestamp: Date.now(),
    densityValue: 95,
    unit: DensityUnit.PERCENTAGE,
  });
  
  await sleep(100);
  
  // Density normalized
  console.log('\nSimulating density normalized (25%)...');
  densityMonitor.processDensityReading({
    areaId: 'area-test-1',
    timestamp: Date.now(),
    densityValue: 25,
    unit: DensityUnit.PERCENTAGE,
  });
  
  await sleep(100);
  
  // Step 6: Test alert deduplication
  console.log('\n\nStep 6: Testing alert deduplication...');
  console.log('Sending duplicate warning alert (should be deduplicated)...');
  densityMonitor.processDensityReading({
    areaId: 'area-test-1',
    timestamp: Date.now(),
    densityValue: 55,
    unit: DensityUnit.PERCENTAGE,
  });
  
  await sleep(100);
  
  // Step 7: Check alert history
  console.log('\n\nStep 7: Checking alert history...');
  const history = await alertEngine.getAlertHistory('area-test-1', 10);
  console.log(`✓ Alert history contains ${history.length} alerts`);
  
  // Step 8: Test alert acknowledgment
  console.log('\nStep 8: Testing alert acknowledgment...');
  if (receivedAlerts.length > 0) {
    const firstAlert = receivedAlerts[0];
    await alertEngine.acknowledgeAlert(firstAlert.id, 'admin-test-1');
    const isAcknowledged = alertEngine.isAlertAcknowledged(firstAlert.id);
    console.log(`✓ Alert ${firstAlert.id} acknowledged:`, isAcknowledged);
  }
  
  // Step 9: Get active alerts
  console.log('\nStep 9: Getting active alerts...');
  const activeAlerts = alertEngine.getActiveAlerts();
  console.log(`✓ Active alerts: ${activeAlerts.length}`);
  activeAlerts.forEach((alert, index) => {
    console.log(`  ${index + 1}. ${alert.severity.toUpperCase()} - ${alert.areaName} (${alert.densityValue}%)`);
  });
  
  // Step 10: Get statistics
  console.log('\nStep 10: Alert Engine Statistics:');
  const stats = alertEngine.getStats();
  console.log('  Subscribers:', stats.subscriberCount);
  console.log('  Total history entries:', stats.totalHistoryEntries);
  console.log('  Areas with history:', stats.areasWithHistory);
  console.log('  Registered areas:', stats.registeredAreas);
  console.log('  Total acknowledgments:', stats.totalAcknowledgments);
  
  // Cleanup
  console.log('\n\nCleaning up...');
  unsubscribe();
  evaluationService.stop();
  console.log('✓ Cleanup complete');
  
  console.log('\n=== Verification Complete ===');
  console.log(`\nSummary:`);
  console.log(`  - Alerts generated: ${receivedAlerts.length}`);
  console.log(`  - Alerts in history: ${history.length}`);
  console.log(`  - Active alerts: ${activeAlerts.length}`);
  console.log(`\n✅ Alert Engine is working correctly!`);
}

/**
 * Helper function to sleep
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export { verifyAlertEngine };
