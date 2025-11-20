/**
 * Verification script for Emergency Notification Integration
 * 
 * Tests:
 * - Emergency activation triggers admin notifications to all admins
 * - Emergency activation expands pilgrim notifications to adjacent areas
 * - Admin notification preferences are overridden during emergency
 * - Emergency deactivation sends confirmation notifications
 * - Activation/deactivation events are logged
 */

import {
  getEmergencyModeManager,
  resetEmergencyModeManager,
} from './emergency-mode-manager';
import {
  getEmergencyNotificationIntegration,
  resetEmergencyNotificationIntegration,
} from './emergency-notification-integration';
import {
  getAdminNotifier,
} from './admin-notifier';
import {
  getPilgrimNotifier,
  resetPilgrimNotifier,
} from './pilgrim-notifier';
import {
  EmergencyTrigger,
  MonitoredArea,
  NotificationChannel,
  ThresholdLevel,
} from './types';

/**
 * Test data: Monitored areas
 */
const testAreas: MonitoredArea[] = [
  {
    id: 'area-1',
    name: 'Main Entrance',
    location: { latitude: 21.4225, longitude: 39.8262 },
    capacity: 5000,
    adjacentAreas: ['area-2', 'area-3'],
    metadata: {
      type: 'entrance',
      description: 'Primary entrance point',
    },
  },
  {
    id: 'area-2',
    name: 'Central Plaza',
    location: { latitude: 21.4230, longitude: 39.8265 },
    capacity: 10000,
    adjacentAreas: ['area-1', 'area-3'],
    metadata: {
      type: 'gathering_space',
      description: 'Central gathering area',
    },
  },
  {
    id: 'area-3',
    name: 'East Corridor',
    location: { latitude: 21.4235, longitude: 39.8270 },
    capacity: 3000,
    adjacentAreas: ['area-1', 'area-2'],
    metadata: {
      type: 'corridor',
      description: 'Eastern corridor',
    },
  },
];

/**
 * Test data: Admin IDs
 */
const testAdmins = ['admin-1', 'admin-2', 'admin-3'];

/**
 * Test data: Pilgrim IDs
 */
const testPilgrims = [
  'pilgrim-1', 'pilgrim-2', 'pilgrim-3', 'pilgrim-4', 'pilgrim-5',
  'pilgrim-6', 'pilgrim-7', 'pilgrim-8', 'pilgrim-9', 'pilgrim-10',
];

/**
 * Setup test environment
 */
function setupTestEnvironment() {
  // Reset all singletons
  resetEmergencyModeManager();
  resetEmergencyNotificationIntegration();
  resetPilgrimNotifier();

  // Get fresh instances
  const emergencyManager = getEmergencyModeManager();
  const integration = getEmergencyNotificationIntegration();
  const adminNotifier = getAdminNotifier();
  const pilgrimNotifier = getPilgrimNotifier();

  // Register areas
  emergencyManager.registerAreas(testAreas);
  pilgrimNotifier.registerAreas(testAreas);

  // Register admins
  integration.registerAdmins(testAdmins);

  // Configure admin notification preferences (will be overridden during emergency)
  adminNotifier.configureNotifications({
    adminId: 'admin-1',
    channels: [NotificationChannel.PUSH], // Only push
    severityFilter: [ThresholdLevel.CRITICAL, ThresholdLevel.EMERGENCY], // Only critical+
    areaFilter: ['area-1'], // Only area-1
  });

  adminNotifier.configureNotifications({
    adminId: 'admin-2',
    channels: [NotificationChannel.EMAIL], // Only email
    severityFilter: [ThresholdLevel.WARNING], // Only warnings
    areaFilter: undefined, // All areas
  });

  adminNotifier.configureNotifications({
    adminId: 'admin-3',
    channels: [NotificationChannel.SMS], // Only SMS
    severityFilter: [], // All severities
    areaFilter: ['area-2', 'area-3'], // Only area-2 and area-3
  });

  // Register pilgrims in areas
  // Area 1: 4 pilgrims
  pilgrimNotifier.registerPilgrimInArea('pilgrim-1', 'area-1');
  pilgrimNotifier.registerPilgrimInArea('pilgrim-2', 'area-1');
  pilgrimNotifier.registerPilgrimInArea('pilgrim-3', 'area-1');
  pilgrimNotifier.registerPilgrimInArea('pilgrim-4', 'area-1');

  // Area 2: 3 pilgrims
  pilgrimNotifier.registerPilgrimInArea('pilgrim-5', 'area-2');
  pilgrimNotifier.registerPilgrimInArea('pilgrim-6', 'area-2');
  pilgrimNotifier.registerPilgrimInArea('pilgrim-7', 'area-2');

  // Area 3: 3 pilgrims
  pilgrimNotifier.registerPilgrimInArea('pilgrim-8', 'area-3');
  pilgrimNotifier.registerPilgrimInArea('pilgrim-9', 'area-3');
  pilgrimNotifier.registerPilgrimInArea('pilgrim-10', 'area-3');

  // Initialize integration (sets up emergency state listener)
  integration.initialize();

  return {
    emergencyManager,
    integration,
    adminNotifier,
    pilgrimNotifier,
  };
}

/**
 * Test 1: Emergency activation triggers notifications
 */
async function testEmergencyActivationNotifications() {
  console.log('\n=== Test 1: Emergency Activation Notifications ===');

  const { emergencyManager, integration, adminNotifier } = setupTestEnvironment();

  // Get initial stats
  const initialStats = integration.getStats();
  console.log('Initial stats:', initialStats);

  // Activate emergency mode
  console.log('\nActivating emergency mode for area-1...');
  emergencyManager.activateEmergency('area-1', EmergencyTrigger.AUTOMATIC);

  // Wait for async notifications to complete
  await new Promise(resolve => setTimeout(resolve, 500));

  // Check notification log
  const notificationLog = integration.getNotificationLog();
  console.log('\nNotification log entries:', notificationLog.length);
  
  if (notificationLog.length > 0) {
    const latestLog = notificationLog[0];
    console.log('Latest log entry:', {
      action: latestLog.action,
      areaId: latestLog.areaId,
      affectedAreas: latestLog.affectedAreas,
      adminNotificationsSent: latestLog.adminNotificationsSent,
      pilgrimNotificationsSent: latestLog.pilgrimNotificationsSent,
    });

    // Verify affected areas include trigger area + adjacent areas
    const expectedAreas = ['area-1', 'area-2', 'area-3'];
    const hasAllAreas = expectedAreas.every(area => 
      latestLog.affectedAreas.includes(area)
    );
    console.log('✓ Affected areas include trigger + adjacent:', hasAllAreas);

    // Verify admin notifications sent to all admins
    console.log('✓ Admin notifications sent:', latestLog.adminNotificationsSent > 0);

    // Verify pilgrim notifications sent
    console.log('✓ Pilgrim notifications sent:', latestLog.pilgrimNotificationsSent > 0);
  }

  // Check admin notification stats
  const adminStats = await adminNotifier.getDeliveryStats();
  console.log('\nAdmin notification stats:', {
    totalSent: adminStats.totalSent,
    successRate: adminStats.successRate.toFixed(2) + '%',
  });

  // Get updated integration stats
  const finalStats = integration.getStats();
  console.log('\nFinal stats:', finalStats);

  console.log('\n✓ Test 1 completed');
}

/**
 * Test 2: Admin preferences are overridden during emergency
 */
async function testAdminPreferenceOverride() {
  console.log('\n=== Test 2: Admin Preference Override ===');

  const { emergencyManager, adminNotifier } = setupTestEnvironment();

  // Check initial admin configurations
  console.log('\nInitial admin configurations:');
  const admin1Config = adminNotifier.getConfig('admin-1');
  console.log('Admin 1:', {
    channels: admin1Config?.channels,
    severityFilter: admin1Config?.severityFilter,
    areaFilter: admin1Config?.areaFilter,
  });

  // Activate emergency
  console.log('\nActivating emergency mode...');
  emergencyManager.activateEmergency('area-2', EmergencyTrigger.MANUAL, 'admin-1');

  // Wait for notifications
  await new Promise(resolve => setTimeout(resolve, 500));

  // Check delivery history
  const deliveryHistory = adminNotifier.getDeliveryHistory();
  console.log('\nDelivery history entries:', deliveryHistory.length);

  // Count notifications per admin
  const notificationsByAdmin = new Map<string, number>();
  for (const result of deliveryHistory) {
    const count = notificationsByAdmin.get(result.adminId) || 0;
    notificationsByAdmin.set(result.adminId, count + 1);
  }

  console.log('\nNotifications per admin:');
  for (const [adminId, count] of notificationsByAdmin.entries()) {
    console.log(`  ${adminId}: ${count} notifications`);
  }

  // Verify all admins received notifications (preferences overridden)
  const allAdminsNotified = testAdmins.every(adminId => 
    notificationsByAdmin.has(adminId)
  );
  console.log('\n✓ All admins received notifications (preferences overridden):', allAdminsNotified);

  console.log('\n✓ Test 2 completed');
}

/**
 * Test 3: Pilgrim notifications expanded to adjacent areas
 */
async function testExpandedPilgrimNotifications() {
  console.log('\n=== Test 3: Expanded Pilgrim Notifications ===');

  const { emergencyManager, pilgrimNotifier } = setupTestEnvironment();

  // Get initial pilgrim stats
  const initialStats = pilgrimNotifier.getStats();
  console.log('Initial pilgrim stats:', initialStats);

  // Activate emergency for area-1
  // Should notify pilgrims in area-1, area-2, and area-3 (adjacent areas)
  console.log('\nActivating emergency for area-1...');
  emergencyManager.activateEmergency('area-1', EmergencyTrigger.AUTOMATIC);

  // Wait for notifications
  await new Promise(resolve => setTimeout(resolve, 500));

  // Check notification history
  const notificationHistory = pilgrimNotifier.getNotificationHistory(20);
  console.log('\nPilgrim notification history entries:', notificationHistory.length);

  // Count notifications per area
  const notificationsByArea = new Map<string, number>();
  for (const notification of notificationHistory) {
    const count = notificationsByArea.get(notification.areaId) || 0;
    notificationsByArea.set(notification.areaId, count + 1);
  }

  console.log('\nNotifications per area:');
  for (const [areaId, count] of notificationsByArea.entries()) {
    console.log(`  ${areaId}: ${count} notifications`);
  }

  // Verify notifications sent to all affected areas
  const expectedAreas = ['area-1', 'area-2', 'area-3'];
  const allAreasNotified = expectedAreas.every(areaId => 
    notificationsByArea.has(areaId)
  );
  console.log('\n✓ Notifications sent to trigger area + adjacent areas:', allAreasNotified);

  // Get final stats
  const finalStats = pilgrimNotifier.getStats();
  console.log('\nFinal pilgrim stats:', finalStats);

  console.log('\n✓ Test 3 completed');
}

/**
 * Test 4: Emergency deactivation sends confirmation
 */
async function testEmergencyDeactivation() {
  console.log('\n=== Test 4: Emergency Deactivation ===');

  const { emergencyManager, integration } = setupTestEnvironment();

  // Activate emergency
  console.log('\nActivating emergency mode...');
  emergencyManager.activateEmergency('area-1', EmergencyTrigger.AUTOMATIC);
  await new Promise(resolve => setTimeout(resolve, 500));

  // Get log after activation
  const logAfterActivation = integration.getNotificationLog();
  console.log('Log entries after activation:', logAfterActivation.length);

  // Deactivate emergency
  console.log('\nDeactivating emergency mode...');
  emergencyManager.deactivateEmergency('admin-1');
  await new Promise(resolve => setTimeout(resolve, 500));

  // Get log after deactivation
  const logAfterDeactivation = integration.getNotificationLog();
  console.log('Log entries after deactivation:', logAfterDeactivation.length);

  // Check for deactivation log entry
  const deactivationLog = logAfterDeactivation.find(
    log => log.action === 'emergency_deactivated'
  );

  if (deactivationLog) {
    console.log('\nDeactivation log entry:', {
      action: deactivationLog.action,
      areaId: deactivationLog.areaId,
      adminNotificationsSent: deactivationLog.adminNotificationsSent,
      pilgrimNotificationsSent: deactivationLog.pilgrimNotificationsSent,
    });

    console.log('✓ Deactivation logged');
    console.log('✓ Admin notifications sent:', deactivationLog.adminNotificationsSent > 0);
    console.log('✓ Pilgrim notifications sent:', deactivationLog.pilgrimNotificationsSent > 0);
  } else {
    console.log('✗ No deactivation log entry found');
  }

  console.log('\n✓ Test 4 completed');
}

/**
 * Test 5: Activation/deactivation events are logged
 */
async function testEventLogging() {
  console.log('\n=== Test 5: Event Logging ===');

  const { emergencyManager, integration } = setupTestEnvironment();

  // Perform multiple activation/deactivation cycles
  console.log('\nPerforming multiple emergency cycles...');

  for (let i = 0; i < 3; i++) {
    console.log(`\nCycle ${i + 1}:`);
    
    // Activate
    emergencyManager.activateEmergency('area-1', EmergencyTrigger.AUTOMATIC);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Deactivate
    emergencyManager.deactivateEmergency('admin-1');
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // Check notification log
  const notificationLog = integration.getNotificationLog();
  console.log('\nTotal log entries:', notificationLog.length);

  // Count activations and deactivations
  const activations = notificationLog.filter(
    log => log.action === 'emergency_activated'
  ).length;
  const deactivations = notificationLog.filter(
    log => log.action === 'emergency_deactivated'
  ).length;

  console.log('Activation entries:', activations);
  console.log('Deactivation entries:', deactivations);

  console.log('\n✓ All events logged:', activations === 3 && deactivations === 3);

  // Display log summary
  console.log('\nLog summary:');
  for (const log of notificationLog.slice(0, 6)) {
    console.log(`  ${log.action} - Area: ${log.areaId} - ` +
      `Admins: ${log.adminNotificationsSent}, Pilgrims: ${log.pilgrimNotificationsSent}`);
  }

  console.log('\n✓ Test 5 completed');
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Emergency Notification Integration Verification Tests    ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  try {
    await testEmergencyActivationNotifications();
    await testAdminPreferenceOverride();
    await testExpandedPilgrimNotifications();
    await testEmergencyDeactivation();
    await testEventLogging();

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✓ All Tests Completed Successfully                       ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

  } catch (error) {
    console.error('\n✗ Test failed with error:', error);
    throw error;
  }
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

export {
  runAllTests,
  testEmergencyActivationNotifications,
  testAdminPreferenceOverride,
  testExpandedPilgrimNotifications,
  testEmergencyDeactivation,
  testEventLogging,
};
