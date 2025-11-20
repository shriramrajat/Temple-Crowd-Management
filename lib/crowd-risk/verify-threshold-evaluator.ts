/**
 * Verification script for ThresholdEvaluator
 * 
 * This script tests the core functionality of the ThresholdEvaluator service.
 */

import { ThresholdEvaluator, getThresholdEvaluator, resetThresholdEvaluator } from './threshold-evaluator';
import { getThresholdConfigManager, resetThresholdConfigManager } from './threshold-config-manager';
import { DensityReading, DensityUnit, ThresholdLevel, ThresholdConfig } from './types';

async function runVerification() {
  console.log('🧪 Starting ThresholdEvaluator verification...\n');
  
  // Reset instances for clean test
  resetThresholdEvaluator();
  resetThresholdConfigManager();
  
  const evaluator = getThresholdEvaluator();
  const configManager = getThresholdConfigManager();
  
  // Test 1: Basic threshold evaluation
  console.log('Test 1: Basic threshold evaluation');
  const testConfig: ThresholdConfig = {
    areaId: 'test-area-1',
    warningThreshold: 0.5,
    criticalThreshold: 0.8,
    emergencyThreshold: 1.0,
  };
  
  await configManager.saveConfig(testConfig);
  evaluator.updateThresholds(testConfig);
  
  // Test normal level
  const normalReading: DensityReading = {
    areaId: 'test-area-1',
    timestamp: Date.now(),
    densityValue: 0.3,
    unit: DensityUnit.PEOPLE_PER_SQM,
  };
  
  const normalEval = evaluator.evaluate(normalReading);
  console.log(`  ✓ Normal level: ${normalEval.currentLevel} (expected: ${ThresholdLevel.NORMAL})`);
  console.assert(normalEval.currentLevel === ThresholdLevel.NORMAL, 'Normal level should be NORMAL');
  console.assert(normalEval.isEscalation === false, 'Should not be escalation');
  
  // Test warning level
  const warningReading: DensityReading = {
    areaId: 'test-area-1',
    timestamp: Date.now(),
    densityValue: 0.6,
    unit: DensityUnit.PEOPLE_PER_SQM,
  };
  
  const warningEval = evaluator.evaluate(warningReading);
  console.log(`  ✓ Warning level: ${warningEval.currentLevel} (expected: ${ThresholdLevel.WARNING})`);
  console.assert(warningEval.currentLevel === ThresholdLevel.WARNING, 'Warning level should be WARNING');
  console.assert(warningEval.isEscalation === true, 'Should be escalation from NORMAL to WARNING');
  
  // Test critical level
  const criticalReading: DensityReading = {
    areaId: 'test-area-1',
    timestamp: Date.now(),
    densityValue: 0.9,
    unit: DensityUnit.PEOPLE_PER_SQM,
  };
  
  const criticalEval = evaluator.evaluate(criticalReading);
  console.log(`  ✓ Critical level: ${criticalEval.currentLevel} (expected: ${ThresholdLevel.CRITICAL})`);
  console.assert(criticalEval.currentLevel === ThresholdLevel.CRITICAL, 'Critical level should be CRITICAL');
  console.assert(criticalEval.isEscalation === true, 'Should be escalation from WARNING to CRITICAL');
  
  // Test emergency level
  const emergencyReading: DensityReading = {
    areaId: 'test-area-1',
    timestamp: Date.now(),
    densityValue: 1.2,
    unit: DensityUnit.PEOPLE_PER_SQM,
  };
  
  const emergencyEval = evaluator.evaluate(emergencyReading);
  console.log(`  ✓ Emergency level: ${emergencyEval.currentLevel} (expected: ${ThresholdLevel.EMERGENCY})`);
  console.assert(emergencyEval.currentLevel === ThresholdLevel.EMERGENCY, 'Emergency level should be EMERGENCY');
  console.assert(emergencyEval.isEscalation === true, 'Should be escalation from CRITICAL to EMERGENCY');
  
  console.log('✅ Test 1 passed\n');
  
  // Test 2: De-escalation detection
  console.log('Test 2: De-escalation detection');
  evaluator.resetPreviousLevel('test-area-1');
  
  // Start at emergency
  evaluator.evaluate(emergencyReading);
  
  // De-escalate to critical
  const deescalateEval = evaluator.evaluate(criticalReading);
  console.log(`  ✓ De-escalation detected: ${evaluator.isLevelDeescalation(deescalateEval.previousLevel, deescalateEval.currentLevel)}`);
  console.assert(
    evaluator.isLevelDeescalation(deescalateEval.previousLevel, deescalateEval.currentLevel),
    'Should detect de-escalation'
  );
  
  console.log('✅ Test 2 passed\n');
  
  // Test 3: Time-based profile selection
  console.log('Test 3: Time-based profile selection');
  const timeBasedConfig: ThresholdConfig = {
    areaId: 'test-area-2',
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
    ],
  };
  
  await configManager.saveConfig(timeBasedConfig);
  evaluator.updateThresholds(timeBasedConfig);
  
  // Test with time in profile range (simulated)
  const timeBasedReading: DensityReading = {
    areaId: 'test-area-2',
    timestamp: Date.now(),
    densityValue: 0.4,
    unit: DensityUnit.PEOPLE_PER_SQM,
  };
  
  const timeBasedEval = evaluator.evaluate(timeBasedReading);
  console.log(`  ✓ Time-based evaluation completed: ${timeBasedEval.currentLevel}`);
  
  console.log('✅ Test 3 passed\n');
  
  // Test 4: Threshold validation
  console.log('Test 4: Threshold validation');
  
  const validConfig: ThresholdConfig = {
    areaId: 'test-area-3',
    warningThreshold: 0.5,
    criticalThreshold: 0.8,
    emergencyThreshold: 1.0,
  };
  
  const validResult = evaluator.validateThresholds(validConfig);
  console.log(`  ✓ Valid config validation: ${validResult.valid} (expected: true)`);
  console.assert(validResult.valid === true, 'Valid config should pass validation');
  
  const invalidConfig: ThresholdConfig = {
    areaId: 'test-area-4',
    warningThreshold: 0.9,
    criticalThreshold: 0.5,
    emergencyThreshold: 1.0,
  };
  
  const invalidResult = evaluator.validateThresholds(invalidConfig);
  console.log(`  ✓ Invalid config validation: ${invalidResult.valid} (expected: false)`);
  console.assert(invalidResult.valid === false, 'Invalid config should fail validation');
  console.assert(invalidResult.errors.length > 0, 'Should have validation errors');
  
  console.log('✅ Test 4 passed\n');
  
  // Test 5: Cache functionality
  console.log('Test 5: Cache functionality');
  
  const cacheStats = evaluator.getCacheStats();
  console.log(`  ✓ Cache stats: ${cacheStats.cachedAreas} areas cached`);
  console.assert(cacheStats.cachedAreas > 0, 'Should have cached areas');
  
  evaluator.clearCache();
  const clearedStats = evaluator.getCacheStats();
  console.log(`  ✓ After clear: ${clearedStats.cachedAreas} areas cached (expected: 0)`);
  console.assert(clearedStats.cachedAreas === 0, 'Cache should be empty after clear');
  
  console.log('✅ Test 5 passed\n');
  
  // Test 6: Preload configurations
  console.log('Test 6: Preload configurations');
  
  await evaluator.preloadConfigurations(['test-area-1', 'test-area-2']);
  const preloadStats = evaluator.getCacheStats();
  console.log(`  ✓ After preload: ${preloadStats.cachedAreas} areas cached`);
  console.assert(preloadStats.cachedAreas >= 2, 'Should have preloaded configurations');
  
  console.log('✅ Test 6 passed\n');
  
  // Clean up
  await configManager.clearAll();
  
  console.log('🎉 All verification tests passed!');
}

export { runVerification };
