/**
 * Verification Script for Task 14.1: Alert Logger Implementation
 * 
 * This script verifies that the AlertLogger service is properly implemented
 * and integrated with AlertEngine and AdminNotifier.
 */

import { AlertLogger, getAlertLogger, resetAlertLogger } from './alert-logger';
import { getAlertEngine, resetAlertEngine } from './alert-engine';
import { getAdminNotifier } from './admin-notifier';
import {
  AlertEvent,
  AlertType,
  ThresholdLevel,
  NotificationChannel,
  DensityUnit,
  ThresholdEvaluation,
} from './types';

/**
 * Test 1: Verify AlertLogger service class exists and has required methods
 */
function testAlertLoggerServiceClass(): boolean {
  console.log('\n=== Test 1: AlertLogger Service Class ===');
  
  try {
    const logger = new AlertLogger();
    
    // Check required methods exist
    const requiredMethods = [
      'logAlert',
      'logAcknowledgment',
      'logResolution',
      'getAlertLog',
      'getAlertLogs',
      'updateNotificationResults',
    ];
    
    for (const method of requiredMethods) {
      if (typeof (logger as any)[method] !== 'function') {
        console.error(`❌ Missing method: ${method}`);
        return false;
      }
    }
    
    console.log('✅ AlertLogger service class has all required methods');
    return true;
  } catch (error) {
    console.error('❌ Error creating AlertLogger:', error);
    return false;
  }
}

/**
 * Test 2: Verify logAlert method stores AlertLogEntry with notification results
 */
async function testLogAlert(): Promise<boolean> {
  console.log('\n=== Test 2: logAlert Method ===');
  
  try {
    resetAlertLogger();
    const logger = getAlertLogger();
    
    // Create test alert
    const testAlert: AlertEvent = {
      id: 'TEST-ALERT-001',
      type: AlertType.THRESHOLD_VIOLATION,
      severity: ThresholdLevel.CRITICAL,
      areaId: 'area-1',
      areaName: 'Main Entrance',
      densityValue: 85,
      threshold: 75,
      timestamp: Date.now(),
      metadata: {
        location: '21.422487, 39.826206',
        affectedPilgrimCount: 1500,
        suggestedActions: ['Avoid entering this area', 'Follow staff guidance'],
      },
    };
    
    // Log alert with notification results
    await logger.logAlert(testAlert, [
      {
        adminId: 'admin-1',
        channel: NotificationChannel.PUSH,
        delivered: true,
        deliveryTime: 250,
      },
      {
        adminId: 'admin-2',
        channel: NotificationChannel.EMAIL,
        delivered: true,
        deliveryTime: 450,
      },
    ], 150);
    
    // Retrieve and verify
    const logEntry = await logger.getAlertLog('TEST-ALERT-001');
    
    if (!logEntry) {
      console.error('❌ Alert log entry not found');
      return false;
    }
    
    if (logEntry.id !== 'TEST-ALERT-001') {
      console.error('❌ Alert ID mismatch');
      return false;
    }
    
    if (logEntry.notificationResults.adminNotifications.length !== 2) {
      console.error('❌ Admin notifications count mismatch');
      return false;
    }
    
    if (logEntry.notificationResults.pilgrimCount !== 150) {
      console.error('❌ Pilgrim count mismatch');
      return false;
    }
    
    console.log('✅ logAlert method correctly stores AlertLogEntry with notification results');
    return true;
  } catch (error) {
    console.error('❌ Error in logAlert test:', error);
    return false;
  }
}

/**
 * Test 3: Verify logAcknowledgment method records admin acknowledgments
 */
async function testLogAcknowledgment(): Promise<boolean> {
  console.log('\n=== Test 3: logAcknowledgment Method ===');
  
  try {
    resetAlertLogger();
    const logger = getAlertLogger();
    
    // Create and log test alert
    const testAlert: AlertEvent = {
      id: 'TEST-ALERT-002',
      type: AlertType.THRESHOLD_VIOLATION,
      severity: ThresholdLevel.WARNING,
      areaId: 'area-2',
      areaName: 'Prayer Hall',
      densityValue: 65,
      threshold: 60,
      timestamp: Date.now(),
      metadata: {
        location: '21.422500, 39.826300',
      },
    };
    
    await logger.logAlert(testAlert, [], 0);
    
    // Log acknowledgment
    await logger.logAcknowledgment('TEST-ALERT-002', 'admin-1');
    
    // Retrieve and verify
    const logEntry = await logger.getAlertLog('TEST-ALERT-002');
    
    if (!logEntry) {
      console.error('❌ Alert log entry not found');
      return false;
    }
    
    if (logEntry.acknowledgments.length !== 1) {
      console.error('❌ Acknowledgments count mismatch');
      return false;
    }
    
    if (logEntry.acknowledgments[0].adminId !== 'admin-1') {
      console.error('❌ Admin ID mismatch in acknowledgment');
      return false;
    }
    
    if (!logEntry.acknowledgments[0].timestamp) {
      console.error('❌ Acknowledgment timestamp missing');
      return false;
    }
    
    // Test duplicate acknowledgment prevention
    await logger.logAcknowledgment('TEST-ALERT-002', 'admin-1');
    const logEntry2 = await logger.getAlertLog('TEST-ALERT-002');
    
    if (logEntry2!.acknowledgments.length !== 1) {
      console.error('❌ Duplicate acknowledgment not prevented');
      return false;
    }
    
    console.log('✅ logAcknowledgment method correctly records admin acknowledgments');
    return true;
  } catch (error) {
    console.error('❌ Error in logAcknowledgment test:', error);
    return false;
  }
}

/**
 * Test 4: Verify logResolution method records alert resolutions
 */
async function testLogResolution(): Promise<boolean> {
  console.log('\n=== Test 4: logResolution Method ===');
  
  try {
    resetAlertLogger();
    const logger = getAlertLogger();
    
    // Create and log test alert
    const testAlert: AlertEvent = {
      id: 'TEST-ALERT-003',
      type: AlertType.THRESHOLD_VIOLATION,
      severity: ThresholdLevel.EMERGENCY,
      areaId: 'area-3',
      areaName: 'Exit Corridor',
      densityValue: 95,
      threshold: 90,
      timestamp: Date.now(),
      metadata: {
        location: '21.422600, 39.826400',
      },
    };
    
    await logger.logAlert(testAlert, [], 0);
    
    // Log resolution
    await logger.logResolution('TEST-ALERT-003', 'admin-2', 'Crowd dispersed successfully. Additional exits opened.');
    
    // Retrieve and verify
    const logEntry = await logger.getAlertLog('TEST-ALERT-003');
    
    if (!logEntry) {
      console.error('❌ Alert log entry not found');
      return false;
    }
    
    if (!logEntry.resolution) {
      console.error('❌ Resolution not found');
      return false;
    }
    
    if (logEntry.resolution.resolvedBy !== 'admin-2') {
      console.error('❌ Resolved by admin ID mismatch');
      return false;
    }
    
    if (logEntry.resolution.notes !== 'Crowd dispersed successfully. Additional exits opened.') {
      console.error('❌ Resolution notes mismatch');
      return false;
    }
    
    if (!logEntry.resolution.resolvedAt) {
      console.error('❌ Resolution timestamp missing');
      return false;
    }
    
    console.log('✅ logResolution method correctly records alert resolutions');
    return true;
  } catch (error) {
    console.error('❌ Error in logResolution test:', error);
    return false;
  }
}

/**
 * Test 5: Verify in-memory storage mechanism
 */
async function testStorageMechanism(): Promise<boolean> {
  console.log('\n=== Test 5: Storage Mechanism ===');
  
  try {
    resetAlertLogger();
    const logger = getAlertLogger();
    
    // Create multiple test alerts
    for (let i = 1; i <= 5; i++) {
      const testAlert: AlertEvent = {
        id: `TEST-ALERT-STORAGE-${i}`,
        type: AlertType.THRESHOLD_VIOLATION,
        severity: ThresholdLevel.WARNING,
        areaId: `area-${i}`,
        areaName: `Test Area ${i}`,
        densityValue: 60 + i,
        threshold: 60,
        timestamp: Date.now() + i * 1000,
        metadata: {
          location: `21.${i}, 39.${i}`,
        },
      };
      
      await logger.logAlert(testAlert, [], 0);
    }
    
    // Test getAlertLogs
    const allLogs = await logger.getAlertLogs();
    if (allLogs.length !== 5) {
      console.error('❌ Storage count mismatch');
      return false;
    }
    
    // Test filtering by area
    const areaLogs = await logger.getAlertLogsByArea('area-1');
    if (areaLogs.length !== 1) {
      console.error('❌ Area filtering failed');
      return false;
    }
    
    // Test limit
    const limitedLogs = await logger.getAlertLogs({ limit: 3 });
    if (limitedLogs.length !== 3) {
      console.error('❌ Limit filtering failed');
      return false;
    }
    
    // Test storage size
    const size = logger.getStorageSize();
    if (size !== 5) {
      console.error('❌ Storage size mismatch');
      return false;
    }
    
    console.log('✅ In-memory storage mechanism works correctly');
    return true;
  } catch (error) {
    console.error('❌ Error in storage mechanism test:', error);
    return false;
  }
}

/**
 * Test 6: Verify integration with AlertEngine (auto-logging)
 */
async function testAlertEngineIntegration(): Promise<boolean> {
  console.log('\n=== Test 6: AlertEngine Integration ===');
  
  try {
    resetAlertLogger();
    resetAlertEngine();
    
    const logger = getAlertLogger();
    const engine = getAlertEngine();
    
    // Register a test area
    engine.registerArea({
      id: 'area-test',
      name: 'Test Area',
      location: { latitude: 21.422487, longitude: 39.826206 },
      capacity: 1000,
      adjacentAreas: [],
      metadata: {
        type: 'entrance' as any,
        description: 'Test area for integration',
      },
    });
    
    // Create threshold evaluation that will trigger an alert
    const evaluation: ThresholdEvaluation = {
      areaId: 'area-test',
      currentLevel: ThresholdLevel.CRITICAL,
      previousLevel: ThresholdLevel.NORMAL,
      densityValue: 85,
      threshold: 75,
      timestamp: Date.now(),
      isEscalation: true,
    };
    
    // Process evaluation (should auto-log to AlertLogger)
    engine.processEvaluation(evaluation);
    
    // Wait a bit for async logging
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check if alert was logged
    const logs = await logger.getAlertLogs();
    
    if (logs.length === 0) {
      console.error('❌ AlertEngine did not auto-log alert');
      return false;
    }
    
    const logEntry = logs[0];
    if (logEntry.alertEvent.areaId !== 'area-test') {
      console.error('❌ Auto-logged alert area ID mismatch');
      return false;
    }
    
    console.log('✅ AlertEngine integration works correctly (auto-logging)');
    return true;
  } catch (error) {
    console.error('❌ Error in AlertEngine integration test:', error);
    return false;
  }
}

/**
 * Test 7: Verify integration with AlertEngine (acknowledgment logging)
 */
async function testAlertEngineAcknowledgmentIntegration(): Promise<boolean> {
  console.log('\n=== Test 7: AlertEngine Acknowledgment Integration ===');
  
  try {
    resetAlertLogger();
    resetAlertEngine();
    
    const logger = getAlertLogger();
    const engine = getAlertEngine();
    
    // Create and log a test alert directly
    const testAlert: AlertEvent = {
      id: 'TEST-ACK-INTEGRATION',
      type: AlertType.THRESHOLD_VIOLATION,
      severity: ThresholdLevel.WARNING,
      areaId: 'area-ack',
      areaName: 'Acknowledgment Test Area',
      densityValue: 70,
      threshold: 65,
      timestamp: Date.now(),
      metadata: {
        location: '21.422487, 39.826206',
      },
    };
    
    await logger.logAlert(testAlert, [], 0);
    
    // Acknowledge through AlertEngine (should log to AlertLogger)
    await engine.acknowledgeAlert('TEST-ACK-INTEGRATION', 'admin-test');
    
    // Wait a bit for async logging
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check if acknowledgment was logged
    const logEntry = await logger.getAlertLog('TEST-ACK-INTEGRATION');
    
    if (!logEntry) {
      console.error('❌ Alert log entry not found');
      return false;
    }
    
    if (logEntry.acknowledgments.length === 0) {
      console.error('❌ AlertEngine did not log acknowledgment');
      return false;
    }
    
    if (logEntry.acknowledgments[0].adminId !== 'admin-test') {
      console.error('❌ Acknowledgment admin ID mismatch');
      return false;
    }
    
    console.log('✅ AlertEngine acknowledgment integration works correctly');
    return true;
  } catch (error) {
    console.error('❌ Error in AlertEngine acknowledgment integration test:', error);
    return false;
  }
}

/**
 * Test 8: Verify integration with AdminNotifier (notification results logging)
 */
async function testAdminNotifierIntegration(): Promise<boolean> {
  console.log('\n=== Test 8: AdminNotifier Integration ===');
  
  try {
    resetAlertLogger();
    
    const logger = getAlertLogger();
    const notifier = getAdminNotifier();
    
    // Create test alert
    const testAlert: AlertEvent = {
      id: 'TEST-NOTIFIER-INTEGRATION',
      type: AlertType.THRESHOLD_VIOLATION,
      severity: ThresholdLevel.CRITICAL,
      areaId: 'area-notifier',
      areaName: 'Notifier Test Area',
      densityValue: 88,
      threshold: 80,
      timestamp: Date.now(),
      metadata: {
        location: '21.422487, 39.826206',
      },
    };
    
    // Log alert first
    await logger.logAlert(testAlert, [], 0);
    
    // Send alert through AdminNotifier (should update notification results)
    await notifier.sendAlert(testAlert, ['admin-1', 'admin-2']);
    
    // Wait a bit for async logging
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check if notification results were updated
    const logEntry = await logger.getAlertLog('TEST-NOTIFIER-INTEGRATION');
    
    if (!logEntry) {
      console.error('❌ Alert log entry not found');
      return false;
    }
    
    if (logEntry.notificationResults.adminNotifications.length === 0) {
      console.error('❌ AdminNotifier did not update notification results');
      return false;
    }
    
    console.log('✅ AdminNotifier integration works correctly');
    return true;
  } catch (error) {
    console.error('❌ Error in AdminNotifier integration test:', error);
    return false;
  }
}

/**
 * Run all verification tests
 */
async function runAllTests(): Promise<void> {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Task 14.1: Alert Logger Implementation Verification      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  const results = [
    testAlertLoggerServiceClass(),
    await testLogAlert(),
    await testLogAcknowledgment(),
    await testLogResolution(),
    await testStorageMechanism(),
    await testAlertEngineIntegration(),
    await testAlertEngineAcknowledgmentIntegration(),
    await testAdminNotifierIntegration(),
  ];
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log(`║  Test Results: ${passed}/${total} tests passed${' '.repeat(31 - passed.toString().length - total.toString().length)}║`);
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  if (passed === total) {
    console.log('\n✅ All tests passed! Task 14.1 is complete.');
    console.log('\nImplemented features:');
    console.log('  ✓ AlertLogger service class with all required methods');
    console.log('  ✓ logAlert method stores AlertLogEntry with notification results');
    console.log('  ✓ logAcknowledgment method records admin acknowledgments');
    console.log('  ✓ logResolution method records alert resolutions');
    console.log('  ✓ In-memory storage mechanism with persistence option');
    console.log('  ✓ Integration with AlertEngine (auto-logging)');
    console.log('  ✓ Integration with AlertEngine (acknowledgment logging)');
    console.log('  ✓ Integration with AdminNotifier (notification results logging)');
  } else {
    console.log('\n❌ Some tests failed. Please review the errors above.');
  }
}

// Run tests
runAllTests().catch(console.error);
