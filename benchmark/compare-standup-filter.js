const { performance } = require('perf_hooks');

// Generate test data
function generateData(count, stringDays = true) {
  const standups = [];
  for (let i = 0; i < count; i++) {
    const time = `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:00`;
    const days = [];
    for (let d = 0; d < 5; d++) {
      const dayVal = Math.floor(Math.random() * 7);
      days.push(stringDays ? String(dayVal) : dayVal);
    }
    standups.push({ id: i, time, days });
  }
  return standups;
}

const smallData = generateData(10);
const largeData = generateData(100000, false); // mixed/numbers
const duePattern = "1_13:00";

function testOld(standups, duePattern) {
  return standups.filter((standup) =>
    standup.days.map((day) => `${day}_${standup.time}`).includes(duePattern)
  );
}

function testNew(standups, duePattern) {
  const [dueDay, dueTime] = duePattern.split("_");
  return standups.filter((standup) => {
    const days = Array.isArray(standup.days) ? standup.days : [];
    return standup.time === dueTime && days.some((day) => String(day) === dueDay);
  });
}

function runBenchmark(name, data, iterations) {
  console.log(`\nRunning ${name} (${iterations} iterations)...`);

  // Warmup
  for (let i = 0; i < 100; i++) {
    testOld(data, duePattern);
    testNew(data, duePattern);
  }

  const startOld = performance.now();
  for (let i = 0; i < iterations; i++) {
    testOld(data, duePattern);
  }
  const endOld = performance.now();

  const startNew = performance.now();
  for (let i = 0; i < iterations; i++) {
    testNew(data, duePattern);
  }
  const endNew = performance.now();

  const timeOld = endOld - startOld;
  const timeNew = endNew - startNew;

  console.log(`Old method: ${timeOld.toFixed(2)} ms`);
  console.log(`New method: ${timeNew.toFixed(2)} ms`);
  console.log(`Improvement: ${((timeOld - timeNew) / timeOld * 100).toFixed(2)}% faster`);
}

runBenchmark("Realistic Data Volume (10 items)", smallData, 10000);
runBenchmark("Large Synthetic Volume (100,000 items)", largeData, 100);
