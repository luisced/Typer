import { api } from './client';
import axios from 'axios';

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

export interface TestContent {
  content: string;
  type: string;
}

export const saveTest = async (testData: TestCreate): Promise<TestResponse> => {
  const response = await api.post(`${API_URL}/tests/me/typing`, testData);
  return response.data;
};

export const fetchAllTests = async (): Promise<TestResponse[]> => {
  const response = await api.get(`${API_URL}/tests/me/typing`);
  return response.data;
};

export const getTestContent = async (
  mode: 'words' | 'sentences' | 'code' | 'zen' | 'custom',
  count?: number,
  level?: 'easy' | 'medium' | 'hard',
  includeNumbers?: boolean,
  includePunctuation?: boolean,
  lang?: string
): Promise<TestContent> => {
  const params = new URLSearchParams();
  params.append('mode', mode);
  if (count) params.append('count', count.toString());
  if (level) params.append('level', level);
  if (includeNumbers !== undefined) params.append('include_numbers', includeNumbers.toString());
  if (includePunctuation !== undefined) params.append('include_punctuation', includePunctuation.toString());
  if (lang) params.append('lang', lang);

  const response = await axios.get(`${API_URL}/tests/content?${params.toString()}`);
  return response.data;
}; 