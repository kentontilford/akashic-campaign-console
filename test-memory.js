const v8 = require('v8');
const os = require('os');

console.log('=== System Memory Info ===');
console.log('Total system memory:', (os.totalmem() / 1024 / 1024 / 1024).toFixed(2), 'GB');
console.log('Free system memory:', (os.freemem() / 1024 / 1024 / 1024).toFixed(2), 'GB');
console.log('');

console.log('=== Node.js Heap Info ===');
const heapStats = v8.getHeapStatistics();
console.log('Heap size limit:', (heapStats.heap_size_limit / 1024 / 1024).toFixed(2), 'MB');
console.log('Total heap size:', (heapStats.total_heap_size / 1024 / 1024).toFixed(2), 'MB');
console.log('Used heap size:', (heapStats.used_heap_size / 1024 / 1024).toFixed(2), 'MB');
console.log('');

console.log('=== Testing with --max-old-space-size=4096 ===');
console.log('Run with: node --max-old-space-size=4096 test-memory.js');