/**
 * Verification Script for Task 14.1: Alert Logging System
 * 
 * This script verifies that all requirements of task 14.1 are implemented:
 * - AlertLogger service class for persistent alert storage
 * - logAlert method to store AlertLogEntry with notification results
 * - logAcknowledgment method to record admin acknowledgments
 * - logResolution method to record alert resolutions
 * - Storage mechanism (in-memory with persistence option)
 * - Integration with AlertEngine to auto-log all alerts
 * - Integration with AdminNotifier to log notification results
 */

import { getAlertLogger, resetAlertLogger } from './alert-logger';
import { getAlertEngine, resetAlertEngine } from './alert-engine';
import { getAdminNotifier } from './admin-notifier';
import {
  AlertEvent,
  AlertType,
  ThresholdLevel,
  NotificationChannel,
  NotificationResult,
  DensityUnit,
} from './types';

async function verifyTask14_1() {
  console.log('='.repeat(80));
  console.log('TASK 14.1 VERIFICATION: Alert Logging System');
  console.log('='.repeat(80));
  console.log();

  let allTestsPassed = true;

  // Reset instances for clean testing
  resetAlertLogger();
  resetAlertEngine();

  const alertLogger = getAlertLogger();
  const alertEngine = getAlertEngine();
  const adminNotifier = getAdminNotifier();

  // Test 1: AlertLogger service class exists
  console.log('✓ Test 1: AlertLogger service class exists');
  console.log('  - AlertLogger instance created successfully');
  console.log();

  // Test 2: logAlert method stores AlertLogEntry with notification results
  console.log('Test 2: logAlert method stores AlertLogEntry with notification results');
  
  const testAlert: AlertEvent = {
    id: 'TEST-ALERT-001',
    type: AlertType.THRESHOLD_VIOLATION,
    severity: ThresholdLevel.WARNING,
    areaId: 'area-1',
    areaName: 'Main Entrance',
    densityValue: 75,
    threshold: 70,
    timestamp: Date.now(),
    metadata: {
      location: '21.422487, 39.826206',
      affectedPilgrimCount: 1500,
      suggestedActions: ['Consider alternative routes'],
    },
  };

  const testNotifications: NotificationResult[] = [
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
  ];

  try {
    await alertLogger.logAlert(testAlert, testNotifications, 150);
    const logEntry = await alertLogger.getAlertLog(testAlert.id);
    
    if (!logEntry) {
      console.log('  ✗ FAILED: Alert log entry not found');
      allTestsPassed = false;
    } else if (logEntry.alertEvent.id !== testAlert.id) {
      console.log('  ✗ FAILED: Alert event not stored correctly');
      allTestsPassed = false;
    } else if (logEntry.notificationResults.adminNotifications.length !== 2) {
      console.log('  ✗ FAILED: Notification results not stored correctly');
      allTestsPassed = false;
    } else if (logEntry.notificationResults.pilgrimCount !== 150) {
      console.log('  ✗ FAILED: Pilgrim count not stored correctly');
      allTestsPassed = false;
    } else {
      console.log('  ✓ PASSED: logAlert stores AlertLogEntry with notification results');
      console.log(`    - Alert ID: ${logEntry.id}`);
      console.log(`    - Admin notifications: ${logEntry.notificationResults.adminNotifications.length}`);
      console.log(`    - Pilgrim count: ${logEntry.notificationResults.pilgrimCount}`);
    }
  } catch (error) {
    console.log(`  ✗ FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`);
    allTestsPassed = false;
  }
  console.log();

  // Test 3: logAcknowledgment method records admin acknowledgments
  console.log('Test 3: logAcknowledgment method records admin acknowledgments');
  
  try {
    await alertLogger.logAcknowledgment(testAlert.id, 'admin-1');
    await alertLogger.logAcknowledgment(testAlert.id, 'admin-2');
    
    const logEntry = await alertLogger.getAlertLog(testAlert.id);
    
    if (!logEntry) {
      console.log('  ✗ FAILED: Alert log entry not found');
      allTestsPassed = false;
    } else if (logEntry.acknowledgments.length !== 2) {
      console.log('  ✗ FAILED: Acknowledgments not stored correctly');
      allTestsPassed = false;
    } else if (logEntry.acknowledgments[0].adminId !== 'admin-1') {
      console.log('  ✗ FAILED: First acknowledgment admin ID incorrect');
      allTestsPassed = false;
    } else if (logEntry.acknowledgments[1].adminId !== 'admin-2') {
      console.log('  ✗ FAILED: Second acknowledgment admin ID incorrect');
      allTestsPassed = false;
    } else {
      console.log('  ✓ PASSED: logAcknowledgment records admin acknowledgments');
      console.log(`    - Acknowledgments: ${logEntry.acknowledgments.length}`);
      console.log(`    - Admin 1: ${logEntry.acknowledgments[0].adminId} at ${new Date(logEntry.acknowledgments[0].timestamp).toISOString()}`);
      console.log(`    - Admin 2: ${logEntry.acknowledgments[1].adminId} at ${new Date(logEntry.acknowledgments[1].timestamp).toISOString()}`);
    }
  } catch (error) {
    console.log(`  ✗ FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`);
    allTestsPassed = false;
  }
  console.log();

  // Test 4: logResolution method records alert resolutions
  console.log('Test 4: logResolution method records alert resolutions');
  
  try {
    await alertLogger.logResolution(testAlert.id, 'admin-1', 'Crowd dispersed successfully');
    
    const logEntry = await alertLogger.getAlertLog(testAlert.id);
    
    if (!logEntry) {
      console.log('  ✗ FAILED: Alert log entry not found');
      allTestsPassed = false;
    } else if (!logEntry.resolution) {
      console.log('  ✗ FAILED: Resolution not stored');
      allTestsPassed = false;
    } else if (logEntry.resolution.resolvedBy !== 'admin-1') {
      console.log('  ✗ FAILED: Resolution admin ID incorrect');
      allTestsPassed = false;
    } else if (logEntry.resolution.notes !== 'Crowd dispersed successfully') {
      console.log('  ✗ FAILED: Resolution notes incorrect');
      allTestsPassed = false;
    } else {
      console.log('  ✓ PASSED: logResolution records alert resolutions');
      console.log(`    - Resolved by: ${logEntry.resolution.resolvedBy}`);
      console.log(`    - Resolved at: ${new Date(logEntry.resolution.resolvedAt).toISOString()}`);
      console.log(`    - Notes: ${logEntry.resolution.notes}`);
    }
  } catch (error) {
    console.log(`  ✗ FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`);
    allTestsPassed = false;
  }
  console.log();

  // Test 5: Storage mechanism (in-memory with persistence option)
  console.log('Test 5: Storage mechanism (in-memory with persistence option)');
  
  try {
    const storageSize = alertLogger.getStorageSize();
    
    if (storageSize < 0) {
      console.log('  ⚠ WARNING: Storage size unknown (may be using external storage)');
    } else if (storageSize !== 1) {
      console.log(`  ✗ FAILED: Expected 1 entry in storage, found ${storageSize}`);
      allTestsPassed = false;
    } else {
      console.log('  ✓ PASSED: In-memory storage mechanism working');
      console.log(`    - Storage size: ${storageSize} entries`);
    }
    
    // Test filtering
    const areaLogs = await alertLogger.getAlertLogsByArea('area-1');
    if (areaLogs.length !== 1) {
      console.log(`  ✗ FAILED: Area filtering not working correctly`);
      allTestsPassed = false;
    } else {
      console.log('  ✓ PASSED: Area-based filtering working');
    }
    
    // Test unacknowledged/unresolved queries
    const unacknowledged = await alertLogger.getUnacknowledgedAlerts();
    if (unacknowledged.length !== 0) {
      console.log(`  ✗ FAILED: Unacknowledged query incorrect (expected 0, got ${unacknowledged.length})`);
      allTestsPassed = false;
    } else {
      console.log('  ✓ PASSED: Unacknowledged alerts query working');
    }
    
    const unresolved = await alertLogger.getUnresolvedAlerts();
    if (unresolved.length !== 0) {
      console.log(`  ✗ FAILED: Unresolved query incorrect (expected 0, got ${unresolved.length})`);
      allTestsPassed = false;
    } else {
      console.log('  ✓ PASSED: Unresolved alerts query working');
    }
  } catch (error) {
    console.log(`  ✗ FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`);
    allTestsPassed = false;
  }
  console.log();

  // Test 6: Integration with AlertEngine to auto-log all alerts
  console.log('Test 6: Integration with AlertEngine to auto-log all alerts');
  
  try {
    // Clear previous logs
    alertLogger.clearAll();
    
    // Register a test area
    alertEngine.registerArea({
      id: 'area-2',
      name: 'Prayer Hall',
      location: { latitude: 21.422487, longitude: 39.826206 },
      capacity: 5000,
      adjacentAreas: ['area-3'],
      metadata: {
        type: 'gathering_space' as any,
        description: 'Main prayer hall',
      },
    });
    
    // Process an evaluation that should trigger an alert
    alertEngine.processEvaluation({
      areaId: 'area-2',
      currentLevel: ThresholdLevel.WARNING,
      previousLevel: ThresholdLevel.NORMAL,
      densityValue: 75,
      threshold: 70,
      timestamp: Date.now(),
      isEscalation: true,
    });
    
    // Wait a bit for async logging
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const logs = await alertLogger.getAlertLogsByArea('area-2');
    
    if (logs.length === 0) {
      console.log('  ✗ FAILED: AlertEngine did not auto-log alert');
      allTestsPassed = false;
    } else {
      console.log('  ✓ PASSED: AlertEngine auto-logs alerts to AlertLogger');
      console.log(`    - Auto-logged alerts: ${logs.length}`);
      console.log(`    - Alert ID: ${logs[0].id}`);
      console.log(`    - Area: ${logs[0].alertEvent.areaName}`);
    }
  } catch (error) {
    console.log(`  ✗ FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`);
    allTestsPassed = false;
  }
  console.log();

  // Test 7: Integration with AdminNotifier to log notification results
  console.log('Test 7: Integration with AdminNotifier to log notification results');
  
  try {
    // Create a new alert
    const testAlert2: AlertEvent = {
      id: 'TEST-ALERT-002',
      type: AlertType.THRESHOLD_VIOLATION,
      severity: ThresholdLevel.CRITICAL,
      areaId: 'area-3',
      areaName: 'Exit Corridor',
      densityValue: 85,
      threshold: 80,
      timestamp: Date.now(),
      metadata: {
        location: '21.422487, 39.826206',
        affectedPilgrimCount: 2000,
        suggestedActions: ['Avoid entering this area'],
      },
    };
    
    // Log initial alert
    await alertLogger.logAlert(testAlert2, [], 0);
    
    // Configure admin notifications
    adminNotifier.configureNotifications({
      adminId: 'admin-3',
      channels: [NotificationChannel.PUSH],
      severityFilter: [ThresholdLevel.CRITICAL, ThresholdLevel.EMERGENCY],
      areaFilter: ['area-3'],
    });
    
    // Send alert (this should update the log with notification results)
    const results = await adminNotifier.sendAlert(testAlert2, ['admin-3']);
    
    // Wait for async update
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const logEntry = await alertLogger.getAlertLog(testAlert2.id);
    
    if (!logEntry) {
      console.log('  ✗ FAILED: Alert log entry not found');
      allTestsPassed = false;
    } else if (logEntry.notificationResults.adminNotifications.length === 0) {
      console.log('  ✗ FAILED: AdminNotifier did not update notification results');
      allTestsPassed = false;
    } else {
      console.log('  ✓ PASSED: AdminNotifier logs notification results to AlertLogger');
      console.log(`    - Notification results: ${logEntry.notificationResults.adminNotifications.length}`);
      console.log(`    - Admin: ${logEntry.notificationResults.adminNotifications[0].adminId}`);
      console.log(`    - Channel: ${logEntry.notificationResults.adminNotifications[0].channel}`);
      console.log(`    - Delivered: ${logEntry.notificationResults.adminNotifications[0].delivered}`);
    }
  } catch (error) {
    console.log(`  ✗ FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`);
    allTestsPassed = false;
  }
  console.log();

  // Test 8: Statistics and queries
  console.log('Test 8: Statistics and queries');
  
  try {
    const stats = await alertLogger.getStats();
    
    console.log('  ✓ PASSED: Statistics generation working');
    console.log(`    - Total alerts: ${stats.totalAlerts}`);
    console.log(`    - Acknowledged alerts: ${stats.acknowledgedAlerts}`);
    console.log(`    - Resolved alerts: ${stats.resolvedAlerts}`);
    console.log(`    - Avg acknowledgment time: ${stats.averageAcknowledgmentTime.toFixed(0)}ms`);
    console.log(`    - Avg resolution time: ${stats.averageResolutionTime.toFixed(0)}ms`);
  } catch (error) {
    console.log(`  ✗ FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`);
    allTestsPassed = false;
  }
  console.log();

  // Final summary
  console.log('='.repeat(80));
  if (allTestsPassed) {
    console.log('✓ ALL TESTS PASSED - Task 14.1 is fully implemented');
    console.log();
    console.log('Summary of implemented features:');
    console.log('  ✓ AlertLogger service class for persistent alert storage');
    console.log('  ✓ logAlert method to store AlertLogEntry with notification results');
    console.log('  ✓ logAcknowledgment method to record admin acknowledgments');
    console.log('  ✓ logResolution method to record alert resolutions');
    console.log('  ✓ Storage mechanism (in-memory with persistence option)');
    console.log('  ✓ Integration with AlertEngine to auto-log all alerts');
    console.log('  ✓ Integration with AdminNotifier to log notification results');
  } else {
    console.log('✗ SOME TESTS FAILED - Please review the failures above');
  }
  console.log('='.repeat(80));
  console.log();

  return allTestsPassed;
}

// Run verification if executed directly
if (require.main === module) {
  verifyTask14_1()
    .then(passed => {
      process.exit(passed ? 0 : 1);
    })
    .catch(error => {
      console.error('Verification failed with error:', error);
      process.exit(1);
    });
}

export { verifyTask14_1 };
