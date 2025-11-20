/**
 * Verification Script for Threshold Evaluator Integration
 * 
 * Tests the integration between DensityMonitor and ThresholdEvaluator
 * Requirements: 1.2, 6.3, 4.2
 */

import { getDensityMonitor, resetDensityMonitor } from './density-monitor';
import { getThresholdEvaluator, resetThresholdEvaluator } from './threshold-evaluator';
import { getDensityEvaluationService, resetDensityEvaluationService } from './density-evaluation-service';
import { ThresholdConfig, ThresholdLevel, DensityUnit } from './types';

/**
 * Test 1: Verify density updates trigger evaluations
 * Requirement 1.2: Connect density updates to threshold evaluation
 */
async function testDensityToEvaluationFlow() {
  console.log('\n=== Test 1: Density to Evaluation Flow ===');
  
  // Reset services
  resetDensityMonitor();
  resetThresholdEvaluator();
  resetDensityEvaluationService();
  
  const densityMonitor = getDensityMonitor();
  const evaluationService = getDensityEvaluationService();
  
  // Set up threshold configuration
  const testConfig: ThresholdConfig = {
    areaId: 'test-area-1',
    warningThreshold: 0.5,
    criticalThreshold: 0.8,
    emergencyThreshold: 1.0,
  };
  
  await evaluationService.updateThresholdConfig(testConfig);
  
  // Track evaluations
  const evaluations: any[] = [];
  evaluationService.onEvaluation((evaluation) => {
    evaluations.push(evaluation);
    console.log(`Evaluation received: ${evaluation.areaId} - ${evaluation.currentLevel} (${evaluation.densityValue})`);
  });
  
  // Start services
  densityMonitor.startMonitoring(['test-area-1']);
  evaluationService.start();
  
  // Wait for initial mock data
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Trigger threshold violations
  console.log('Triggering warning threshold violation...');
  densityMonitor.triggerMockViolation('test-area-1', 0.6);
  await new Promise(resolve => setTimeout(resolve, 100));
  
  console.log('Triggering critical threshold violation...');
  densityMonitor.triggerMockViolation('test-area-1', 0.9);
  await new Promise(resolve => setTimeout(resolve, 100));
  
  console.log('Triggering emergency threshold violation...');
  densityMonitor.triggerMockViolation('test-area-1', 1.2);
  await new Promise(resolve => setTimeout(resolve, 100));
  
  console.log('Returning to normal...');
  densityMonitor.triggerMockViolation('test-area-1', 0.3);
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Verify evaluations were received
  console.log(`\nTotal evaluations received: ${evaluations.length}`);
  
  // Check for escalations
  const escalations = evaluations.filter(e => e.isEscalation);
  console.log(`Escalations detected: ${escalations.length}`);
  
  // Verify threshold levels
  const hasWarning = evaluations.some(e => e.currentLevel === ThresholdLevel.WARNING);
  const hasCritical = evaluations.some(e => e.currentLevel === ThresholdLevel.CRITICAL);
  const hasEmergency = evaluations.some(e => e.currentLevel === ThresholdLevel.EMERGENCY);
  
  console.log(`Warning level detected: ${hasWarning}`);
  console.log(`Critical level detected: ${hasCritical}`);
  console.log(`Emergency level detected: ${hasEmergency}`);
  
  // Cleanup
  evaluationService.stop();
  densityMonitor.stopMonitoring('test-area-1');
  
  const success = evaluations.length >= 4 && hasWarning && hasCritical && hasEmergency;
  console.log(`\nTest 1: ${success ? 'PASSED ✓' : 'FAILED ✗'}`);
  return success;
}

/**
 * Test 2: Verify configuration update propagation
 * Requirement 6.3: Configuration update propagation (10-second target)
 */
async function testConfigurationUpdatePropagation() {
  console.log('\n=== Test 2: Configuration Update Propagation ===');
  
  // Reset services
  resetDensityMonitor();
  resetThresholdEvaluator();
  resetDensityEvaluationService();
  
  const densityMonitor = getDensityMonitor();
  const evaluationService = getDensityEvaluationService();
  
  // Set up initial configuration
  const initialConfig: ThresholdConfig = {
    areaId: 'test-area-2',
    warningThreshold: 0.5,
    criticalThreshold: 0.8,
    emergencyThreshold: 1.0,
  };
  
  await evaluationService.updateThresholdConfig(initialConfig);
  
  // Start services
  densityMonitor.startMonitoring(['test-area-2']);
  evaluationService.start();
  
  // Wait for initial data
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Set density to 0.6 (should be WARNING with initial config)
  console.log('Setting density to 0.6 with initial config...');
  densityMonitor.triggerMockViolation('test-area-2', 0.6);
  await new Promise(resolve => setTimeout(resolve, 100));
  
  let evaluation = evaluationService.getCachedEvaluation('test-area-2');
  console.log(`Current level: ${evaluation?.currentLevel} (expected: WARNING)`);
  const initialLevelCorrect = evaluation?.currentLevel === ThresholdLevel.WARNING;
  
  // Update configuration (lower warning threshold)
  console.log('\nUpdating configuration (warning threshold: 0.3)...');
  const startTime = Date.now();
  
  const updatedConfig: ThresholdConfig = {
    areaId: 'test-area-2',
    warningThreshold: 0.3,
    criticalThreshold: 0.6,
    emergencyThreshold: 0.9,
  };
  
  await evaluationService.updateThresholdConfig(updatedConfig);
  const updateTime = Date.now() - startTime;
  
  console.log(`Configuration update took: ${updateTime}ms`);
  
  // Verify new configuration is applied
  await new Promise(resolve => setTimeout(resolve, 100));
  evaluation = evaluationService.getCachedEvaluation('test-area-2');
  console.log(`Current level after update: ${evaluation?.currentLevel} (expected: CRITICAL)`);
  const updatedLevelCorrect = evaluation?.currentLevel === ThresholdLevel.CRITICAL;
  
  // Verify update time is within 10 seconds
  const updateTimeOk = updateTime < 10000;
  console.log(`Update time within 10s: ${updateTimeOk}`);
  
  // Cleanup
  evaluationService.stop();
  densityMonitor.stopMonitoring('test-area-2');
  
  const success = initialLevelCorrect && updatedLevelCorrect && updateTimeOk;
  console.log(`\nTest 2: ${success ? 'PASSED ✓' : 'FAILED ✗'}`);
  return success;
}

/**
 * Test 3: Verify evaluation result caching
 * Requirement 4.2: Add evaluation result caching for performance
 */
async function testEvaluationCaching() {
  console.log('\n=== Test 3: Evaluation Result Caching ===');
  
  // Reset services
  resetDensityMonitor();
  resetThresholdEvaluator();
  resetDensityEvaluationService();
  
  const densityMonitor = getDensityMonitor();
  const evaluationService = getDensityEvaluationService();
  
  // Set up configuration
  const config: ThresholdConfig = {
    areaId: 'test-area-3',
    warningThreshold: 0.5,
    criticalThreshold: 0.8,
    emergencyThreshold: 1.0,
  };
  
  await evaluationService.updateThresholdConfig(config);
  
  // Start services
  densityMonitor.startMonitoring(['test-area-3']);
  evaluationService.start();
  
  // Wait for initial data
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Trigger evaluation
  console.log('Triggering evaluation...');
  densityMonitor.triggerMockViolation('test-area-3', 0.7);
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Check cache
  const cachedEvaluation = evaluationService.getCachedEvaluation('test-area-3');
  console.log(`Cached evaluation found: ${cachedEvaluation !== null}`);
  console.log(`Cached level: ${cachedEvaluation?.currentLevel}`);
  
  // Get stats
  const stats = evaluationService.getStats();
  console.log(`\nService stats:`);
  console.log(`- Running: ${stats.isRunning}`);
  console.log(`- Subscribers: ${stats.subscriberCount}`);
  console.log(`- Cached evaluations: ${stats.cachedEvaluations}`);
  console.log(`- Threshold cache: ${stats.thresholdCacheStats.cachedAreas} areas`);
  
  // Wait for cache to expire (5 seconds)
  console.log('\nWaiting for cache to expire (5 seconds)...');
  await new Promise(resolve => setTimeout(resolve, 5500));
  
  const expiredCache = evaluationService.getCachedEvaluation('test-area-3');
  console.log(`Cache after expiry: ${expiredCache !== null ? 'still valid' : 'expired'}`);
  
  // Cleanup
  evaluationService.stop();
  densityMonitor.stopMonitoring('test-area-3');
  
  const success = cachedEvaluation !== null && stats.cachedEvaluations > 0;
  console.log(`\nTest 3: ${success ? 'PASSED ✓' : 'FAILED ✗'}`);
  return success;
}

/**
 * Test 4: Verify time-based profile selection
 * Requirement 6.2: Time-based profile selection
 */
async function testTimeBasedProfiles() {
  console.log('\n=== Test 4: Time-Based Profile Selection ===');
  
  // Reset services
  resetDensityMonitor();
  resetThresholdEvaluator();
  resetDensityEvaluationService();
  
  const densityMonitor = getDensityMonitor();
  const evaluationService = getDensityEvaluationService();
  const thresholdEvaluator = getThresholdEvaluator();
  
  // Set up configuration with time profiles
  const config: ThresholdConfig = {
    areaId: 'test-area-4',
    warningThreshold: 0.5,
    criticalThreshold: 0.8,
    emergencyThreshold: 1.0,
    timeProfile: [
      {
        startTime: '08:00',
        endTime: '12:00',
        thresholds: {
          warningThreshold: 0.3,
          criticalThreshold: 0.5,
          emergencyThreshold: 0.7,
        },
      },
      {
        startTime: '18:00',
        endTime: '22:00',
        thresholds: {
          warningThreshold: 0.6,
          criticalThreshold: 0.9,
          emergencyThreshold: 1.2,
        },
      },
    ],
  };
  
  await evaluationService.updateThresholdConfig(config);
  
  // Get active thresholds (should use base or profile based on current time)
  const activeThresholds = await thresholdEvaluator.getActiveThresholds('test-area-4');
  console.log('Active thresholds:', activeThresholds);
  
  const hasThresholds = activeThresholds !== null;
  console.log(`Active thresholds loaded: ${hasThresholds}`);
  
  if (activeThresholds) {
    console.log(`Warning: ${activeThresholds.warningThreshold}`);
    console.log(`Critical: ${activeThresholds.criticalThreshold}`);
    console.log(`Emergency: ${activeThresholds.emergencyThreshold}`);
  }
  
  const success = hasThresholds;
  console.log(`\nTest 4: ${success ? 'PASSED ✓' : 'FAILED ✗'}`);
  return success;
}

/**
 * Run all verification tests
 */
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Threshold Evaluator Integration Verification Tests       ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  const results = {
    test1: false,
    test2: false,
    test3: false,
    test4: false,
  };
  
  try {
    results.test1 = await testDensityToEvaluationFlow();
  } catch (error) {
    console.error('Test 1 error:', error);
  }
  
  try {
    results.test2 = await testConfigurationUpdatePropagation();
  } catch (error) {
    console.error('Test 2 error:', error);
  }
  
  try {
    results.test3 = await testEvaluationCaching();
  } catch (error) {
    console.error('Test 3 error:', error);
  }
  
  try {
    results.test4 = await testTimeBasedProfiles();
  } catch (error) {
    console.error('Test 4 error:', error);
  }
  
  // Summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Test Summary                                              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`Test 1 (Density to Evaluation Flow):        ${results.test1 ? '✓ PASSED' : '✗ FAILED'}`);
  console.log(`Test 2 (Configuration Update Propagation):  ${results.test2 ? '✓ PASSED' : '✗ FAILED'}`);
  console.log(`Test 3 (Evaluation Caching):                ${results.test3 ? '✓ PASSED' : '✗ FAILED'}`);
  console.log(`Test 4 (Time-Based Profiles):               ${results.test4 ? '✓ PASSED' : '✗ FAILED'}`);
  
  const passedCount = Object.values(results).filter(r => r).length;
  const totalCount = Object.keys(results).length;
  
  console.log(`\nTotal: ${passedCount}/${totalCount} tests passed`);
  
  if (passedCount === totalCount) {
    console.log('\n🎉 All tests passed! Integration is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the output above.');
  }
  
  // Cleanup
  resetDensityMonitor();
  resetThresholdEvaluator();
  resetDensityEvaluationService();
}

export { runAllTests };
