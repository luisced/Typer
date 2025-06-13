import type { TestResponse } from '../api/tests';

interface CharLog {
  attempts: number;
  errors: number;
  deltas: number[];
  lastAttemptTime: number | null;
}

/**
 * Aggregates character logs from multiple tests into a single data structure
 * suitable for the keyboard visualization component
 */
export const aggregateCharLogs = (tests: TestResponse[]): Record<string, CharLog> => {
  const aggregated: Record<string, CharLog> = {};

  // Process each test
  tests.forEach((test) => {
    if (!test.char_logs || !Array.isArray(test.char_logs)) return;

    // Process each character log in the test
    test.char_logs.forEach((log) => {
      const char = log.char.toLowerCase();
      
      if (!aggregated[char]) {
        // Initialize if this is the first time we see this character
        aggregated[char] = {
          attempts: 0,
          errors: 0,
          deltas: [],
          lastAttemptTime: null
        };
      }

      // Aggregate the data
      aggregated[char].attempts += log.attempts;
      aggregated[char].errors += log.errors;
      
      // Calculate average delta for this test and add it to deltas array
      // Since we only have total_time, we'll create an approximation
      if (log.attempts > 0) {
        const avgDelta = log.total_time / log.attempts;
        // Add this delta for each attempt to maintain proper weighting
        for (let i = 0; i < log.attempts; i++) {
          aggregated[char].deltas.push(avgDelta);
        }
      }
      
      // Update last attempt time to the most recent test
      aggregated[char].lastAttemptTime = new Date(test.timestamp).getTime();
    });
  });

  return aggregated;
};

/**
 * Converts a single test's char_logs to the format expected by KeyboardVisualization
 */
export const convertSingleTestCharLogs = (charLogs: any[]): Record<string, CharLog> => {
  if (!charLogs || !Array.isArray(charLogs)) return {};
  
  const converted: Record<string, CharLog> = {};
  
  charLogs.forEach((log) => {
    if (log.char && typeof log.attempts === 'number' && typeof log.errors === 'number') {
      // Convert total_time to an array of deltas (approximation)
      const avgDelta = log.total_time / (log.attempts || 1);
      const deltas = Array(log.attempts).fill(avgDelta);
      
      converted[log.char.toLowerCase()] = {
        attempts: log.attempts,
        errors: log.errors,
        deltas: deltas,
        lastAttemptTime: Date.now() // Approximation since we don't have this data
      };
    }
  });
  
  return converted;
}; 