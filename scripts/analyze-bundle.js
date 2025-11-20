/**
 * Bundle Size Analyzer
 * 
 * Analyzes the bundle size impact of the SOS system.
 * Target: < 50KB added for SOS features
 * 
 * Requirements: 1.1, 1.2
 */

const fs = require('fs');
const path = require('path');

// Target bundle size for SOS features (in bytes)
const TARGET_SIZE = 50 * 1024; // 50KB

/**
 * Get file size in bytes
 */
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

/**
 * Format bytes to human-readable format
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get all files in a directory recursively
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

/**
 * Analyze SOS-related files
 */
function analyzeSOS() {
  console.log('🔍 Analyzing SOS Bundle Size...\n');

  const sosDirectories = [
    'components/sos',
    'app/api/sos',
    'app/sos',
    'hooks/use-location.ts',
    'lib/types/sos.ts',
    'lib/storage/sos-storage.ts',
    'lib/utils/geocoding.ts',
    'lib/utils/performance-monitor.ts',
  ];

  let totalSize = 0;
  const fileDetails = [];

  sosDirectories.forEach((dir) => {
    const fullPath = path.join(process.cwd(), dir);
    
    if (fs.existsSync(fullPath)) {
      if (fs.statSync(fullPath).isDirectory()) {
        const files = getAllFiles(fullPath);
        files.forEach((file) => {
          const size = getFileSize(file);
          totalSize += size;
          fileDetails.push({
            path: path.relative(process.cwd(), file),
            size,
          });
        });
      } else {
        const size = getFileSize(fullPath);
        totalSize += size;
        fileDetails.push({
          path: dir,
          size,
        });
      }
    }
  });

  // Sort by size descending
  fileDetails.sort((a, b) => b.size - a.size);

  // Display results
  console.log('📦 SOS Feature Files:\n');
  fileDetails.forEach((file) => {
    console.log(`  ${file.path.padEnd(60)} ${formatBytes(file.size).padStart(10)}`);
  });

  console.log('\n' + '─'.repeat(72));
  console.log(`  Total Size:${' '.repeat(50)}${formatBytes(totalSize).padStart(10)}`);
  console.log(`  Target Size:${' '.repeat(49)}${formatBytes(TARGET_SIZE).padStart(10)}`);
  
  const difference = totalSize - TARGET_SIZE;
  const percentage = ((totalSize / TARGET_SIZE) * 100).toFixed(1);
  
  if (totalSize <= TARGET_SIZE) {
    console.log(`  Status:${' '.repeat(54)}✅ PASS`);
    console.log(`  Under budget by:${' '.repeat(43)}${formatBytes(TARGET_SIZE - totalSize).padStart(10)}`);
  } else {
    console.log(`  Status:${' '.repeat(54)}⚠️  OVER`);
    console.log(`  Over budget by:${' '.repeat(44)}${formatBytes(difference).padStart(10)}`);
  }
  
  console.log(`  Percentage of target:${' '.repeat(40)}${percentage}%`);
  console.log('─'.repeat(72) + '\n');

  // Recommendations
  if (totalSize > TARGET_SIZE) {
    console.log('💡 Optimization Recommendations:\n');
    console.log('  1. Enable code splitting for SOS components');
    console.log('  2. Lazy load non-critical SOS features');
    console.log('  3. Minimize dependencies in SOS modules');
    console.log('  4. Use dynamic imports for heavy components');
    console.log('  5. Consider tree-shaking unused exports\n');
  }

  return {
    totalSize,
    targetSize: TARGET_SIZE,
    withinBudget: totalSize <= TARGET_SIZE,
    files: fileDetails,
  };
}

/**
 * Main execution
 */
if (require.main === module) {
  try {
    const result = analyzeSOS();
    process.exit(result.withinBudget ? 0 : 1);
  } catch (error) {
    console.error('❌ Error analyzing bundle:', error.message);
    process.exit(1);
  }
}

module.exports = { analyzeSOS, formatBytes };
