export interface User {
  id: number;
  rank: number;
  name: string;
  badges: string[];
  wpm: number;
  accuracy: number;
  raw: number;
  consistency: number;
  date: string;
  time: string;
}

export const mockLeaderboardData: User[] = [
  {
    id: 1,
    rank: 1,
    name: 'rocket',
    badges: ['mythical'],
    wpm: 304.76,
    accuracy: 98.97,
    raw: 311.96,
    consistency: 92.70,
    date: '27 Aug 2023',
    time: '07:24'
  },
  {
    id: 2,
    rank: 2,
    name: 'fallenrelic',
    badges: [],
    wpm: 304.74,
    accuracy: 100.00,
    raw: 304.74,
    consistency: 91.40,
    date: '25 Dec 2024',
    time: '04:28'
  },
  {
    id: 3,
    rank: 3,
    name: 'saerith',
    badges: [],
    wpm: 304.60,
    accuracy: 98.48,
    raw: 315.79,
    consistency: 90.53,
    date: '24 Jun 2023',
    time: '22:20'
  },
  {
    id: 4,
    rank: 4,
    name: 'joshua728',
    badges: [],
    wpm: 294.20,
    accuracy: 98.92,
    raw: 297.40,
    consistency: 90.32,
    date: '24 Jun 2023',
    time: '22:04'
  },
  {
    id: 5,
    rank: 5,
    name: 'APackOfSmarties',
    badges: [],
    wpm: 285.55,
    accuracy: 100.00,
    raw: 285.55,
    consistency: 94.64,
    date: '18 Dec 2024',
    time: '14:44'
  },
  {
    id: 6,
    rank: 6,
    name: 'hiimnotgood',
    badges: ['60+ Account'],
    wpm: 284.77,
    accuracy: 100.00,
    raw: 284.77,
    consistency: 91.51,
    date: '11 Apr 2025',
    time: '11:40'
  },
  {
    id: 7,
    rank: 7,
    name: 'dragoncityjose',
    badges: [],
    wpm: 280.76,
    accuracy: 100.00,
    raw: 280.76,
    consistency: 95.37,
    date: '25 Mar 2025',
    time: '15:10'
  },
  {
    id: 8,
    rank: 8,
    name: 'XanderEC_YT',
    badges: [],
    wpm: 280.72,
    accuracy: 100.00,
    raw: 280.72,
    consistency: 92.23,
    date: '27 Jan 2025',
    time: '15:23'
  },
  {
    id: 9,
    rank: 9,
    name: 'slekap',
    badges: ['50+ Account'],
    wpm: 277.60,
    accuracy: 99.15,
    raw: 281.60,
    consistency: 87.96,
    date: '11 Nov 2021',
    time: '08:24'
  },
  {
    id: 10,
    rank: 10,
    name: 'carlibou',
    badges: [],
    wpm: 277.47,
    accuracy: 97.00,
    raw: 293.46,
    consistency: 92.71,
    date: '03 Dec 2024',
    time: '06:28'
  },
  {
    id: 11,
    rank: 11,
    name: 'XDmoment',
    badges: [],
    wpm: 275.95,
    accuracy: 98.03,
    raw: 284.75,
    consistency: 93.04,
    date: '19 Jan 2025',
    time: '09:39'
  },
  {
    id: 12,
    rank: 12,
    name: 'hotmama',
    badges: [],
    wpm: 274.02,
    accuracy: 98.31,
    raw: 282.81,
    consistency: 95.97,
    date: '16 Mar 2025',
    time: '02:02'
  },
  {
    id: 13,
    rank: 13,
    name: 'shazity',
    badges: [],
    wpm: 268.80,
    accuracy: 100.00,
    raw: 268.80,
    consistency: 92.22,
    date: '02 Jul 2023',
    time: '18:19'
  },
  {
    id: 14,
    rank: 14,
    name: 'Rraptor2',
    badges: [],
    wpm: 267.09,
    accuracy: 99.12,
    raw: 273.49,
    consistency: 92.80,
    date: '22 Feb 2021',
    time: '15:32'
  },
  {
    id: 15,
    rank: 15,
    name: 'typemonkey',
    badges: ['mythical'],
    wpm: 266.50,
    accuracy: 98.45,
    raw: 272.35,
    consistency: 91.75,
    date: '05 May 2024',
    time: '19:57'
  },
]; 