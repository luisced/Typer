import { api } from './client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface CharLog {
  char: string;
  attempts: number;
  errors: number;
  total_time: number;
}

export interface TestCreate {
  wpm: number;
  raw_wpm: number;  // gross WPM (all characters/5 / minutes)
  accuracy: number;
  consistency: number;  // typing consistency percentage
  test_type: string;
  duration: number;
  char_logs: CharLog[];
  timestamp: string;
  chars: {  // detailed character counts
    correct: number;
    incorrect: number;
    extra: number;
    missed: number;
  };
  restarts: number;  // number of times user hit reset
}

export interface TestResponse {
  id: string;
  user_id: string;
  wpm: number;
  raw_wpm: number;
  accuracy: number;
  consistency: number;
  test_type: string;
  duration: number;
  timestamp: string;
  chars: {
    correct: number;
    incorrect: number;
    extra: number;
    missed: number;
  };
  restarts: number;
  char_logs: Array<CharLog & { id: string; test_id: string }>;
}

export const saveTest = async (testData: TestCreate): Promise<TestResponse> => {
  const response = await api.post(`${API_URL}/tests/me/typing`, testData);
  return response.data;
};

export const fetchAllTests = async (): Promise<TestResponse[]> => {
  const response = await api.get(`${API_URL}/tests/me/typing`);
  return response.data;
}; 