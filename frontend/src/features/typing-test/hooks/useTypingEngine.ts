import { useState, useEffect, useCallback, useRef } from 'react';
import { calcGrossWpm, calcNetWpm, calcAccuracy } from '../utils/typing';

interface TypingStats {
  correct: number;
  incorrect: number;
  extra: number;
  missed: number;
  currentCorrect: number; // Track current correctness for accuracy
  currentIncorrect: number;
}

interface CharLog {
  attempts: number;
  errors: number;
  deltas: number[]; // Store individual timing deltas instead of cumulative time
  lastAttemptTime: number | null;
}

interface TypingEngineState {
  userInput: string;
  isActive: boolean;
  finished: boolean;
  startTime: number;
  lastKeystrokeTime: number | null;
  keystrokes: { correct: number; incorrect: number };
  charLogs: Record<string, CharLog>;
  stats: TypingStats;
}

interface TypingEngineResult extends TypingEngineState {
  grossWpm: number;
  netWpm: number;
  accuracy: number;
  handleInput: (value: string) => void;
  reset: () => void;
  endTest: () => void;
}

export const useTypingEngine = (text: string): TypingEngineResult => {
  const [state, setState] = useState<TypingEngineState>({
    userInput: '',
    isActive: false,
    finished: false,
    startTime: Date.now(),
    lastKeystrokeTime: null,
    keystrokes: { correct: 0, incorrect: 0 },
    charLogs: {},
    stats: { 
      correct: 0, 
      incorrect: 0, 
      extra: 0, 
      missed: 0,
      currentCorrect: 0,
      currentIncorrect: 0
    }
  });

  const wpmUpdateTimeoutRef = useRef<number | undefined>(undefined);
  const [debouncedWpm, setDebouncedWpm] = useState<number>(0);

  // Calculate derived values
  const grossWpm = state.startTime && state.isActive
    ? calcGrossWpm(state.userInput.length, Date.now() - state.startTime)
    : 0;

  const accuracy = state.userInput.length > 0
    ? calcAccuracy(state.stats.currentCorrect, state.userInput.length)
    : 100;
  const netWpm = Math.max(grossWpm * accuracy / 100, 0);

  // Debounce WPM updates
  useEffect(() => {
    if (wpmUpdateTimeoutRef.current) {
      window.clearTimeout(wpmUpdateTimeoutRef.current);
    }
    wpmUpdateTimeoutRef.current = window.setTimeout(() => {
      setDebouncedWpm(grossWpm);
    }, 250);
    return () => {
      if (wpmUpdateTimeoutRef.current) {
        window.clearTimeout(wpmUpdateTimeoutRef.current);
      }
    };
  }, [grossWpm]);

  const handleInput = useCallback((value: string) => {
    if (value.length > text.length) return;

    const now = Date.now();
    setState(prev => {
      // Initialize if this is the first keystroke
      if (!prev.isActive) {
        return {
          ...prev,
          isActive: true,
          startTime: now,
          lastKeystrokeTime: now,
          userInput: value
        };
      }

      // Track keystroke timing and correctness
      const currentChar = text[value.length - 1];
      const isCorrect = value[value.length - 1] === currentChar;
      const delta = prev.lastKeystrokeTime ? now - prev.lastKeystrokeTime : 0;

      // Update character logs with delta timing
      const charLogs = { ...prev.charLogs };
      if (currentChar) {
        const charLog = charLogs[currentChar] || {
          attempts: 0,
          errors: 0,
          deltas: [],
          lastAttemptTime: null
        };
        charLogs[currentChar] = {
          attempts: charLog.attempts + 1,
          errors: charLog.errors + (isCorrect ? 0 : 1),
          deltas: [...charLog.deltas, delta],
          lastAttemptTime: now
        };
      }

      // Update stats
      const stats = { ...prev.stats };
      if (value.length > prev.userInput.length) {
        // New character typed
        if (value.length > text.length) {
          stats.extra++;
        } else if (isCorrect) {
          stats.correct++;
          stats.currentCorrect++;
        } else {
          stats.incorrect++;
          stats.currentIncorrect++;
        }
      } else if (value.length < prev.userInput.length) {
        // Character deleted
        const deletedChar = prev.userInput[prev.userInput.length - 1];
        const wasCorrect = deletedChar === text[prev.userInput.length - 1];
        if (wasCorrect) {
          stats.currentCorrect--;
        } else {
          stats.currentIncorrect--;
        }
      }

      return {
        ...prev,
        userInput: value,
        lastKeystrokeTime: now,
        keystrokes: {
          correct: prev.keystrokes.correct + (isCorrect ? 1 : 0),
          incorrect: prev.keystrokes.incorrect + (isCorrect ? 0 : 1)
        },
        charLogs,
        stats
      };
    });
  }, [text]);

  const reset = useCallback(() => {
    setState({
      userInput: '',
      isActive: false,
      finished: false,
      startTime: Date.now(),
      lastKeystrokeTime: null,
      keystrokes: { correct: 0, incorrect: 0 },
      charLogs: {},
      stats: { 
        correct: 0, 
        incorrect: 0, 
        extra: 0, 
        missed: 0,
        currentCorrect: 0,
        currentIncorrect: 0
      }
    });
  }, []);

  const endTest = useCallback(() => {
    if (state.finished) return;
    setState(prev => ({
      ...prev,
      finished: true,
      isActive: false
    }));
  }, [state.finished]);

  return {
    ...state,
    grossWpm: debouncedWpm,
    netWpm,
    accuracy,
    handleInput,
    reset,
    endTest
  };
}; 