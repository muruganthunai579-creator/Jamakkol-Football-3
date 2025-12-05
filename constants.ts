import { Rasi, Planet } from './types';

export const PLANETS: Record<string, Planet> = {
  SUN: { id: 'SUN', name: 'Sun', tamilName: 'சூரியன்', shortCode: 'Su', color: 'text-orange-500' },
  MOON: { id: 'MOON', name: 'Moon', tamilName: 'சந்திரன்', shortCode: 'Mo', color: 'text-white' },
  MARS: { id: 'MARS', name: 'Mars', tamilName: 'செவ்வாய்', shortCode: 'Ma', color: 'text-red-500' },
  MERCURY: { id: 'MERCURY', name: 'Mercury', tamilName: 'புதன்', shortCode: 'Me', color: 'text-green-500' },
  JUPITER: { id: 'JUPITER', name: 'Jupiter', tamilName: 'குரு', shortCode: 'Ju', color: 'text-yellow-400' },
  VENUS: { id: 'VENUS', name: 'Venus', tamilName: 'சுக்கிரன்', shortCode: 'Ve', color: 'text-pink-400' },
  SATURN: { id: 'SATURN', name: 'Saturn', tamilName: 'சனி', shortCode: 'Sa', color: 'text-blue-400' },
  RAHU: { id: 'RAHU', name: 'Rahu', tamilName: 'ராகு', shortCode: 'Ra', color: 'text-gray-400' },
  KETU: { id: 'KETU', name: 'Ketu', tamilName: 'கேது', shortCode: 'Ke', color: 'text-gray-400' },
};

export const RASIS: Rasi[] = [
  { id: 1, name: 'Aries', tamilName: 'மேஷம்', lord: 'MARS', lordTamil: 'செவ்வாய்', degreeStart: 0, degreeEnd: 30 },
  { id: 2, name: 'Taurus', tamilName: 'ரிஷபம்', lord: 'VENUS', lordTamil: 'சுக்கிரன்', degreeStart: 30, degreeEnd: 60 },
  { id: 3, name: 'Gemini', tamilName: 'மிதுனம்', lord: 'MERCURY', lordTamil: 'புதன்', degreeStart: 60, degreeEnd: 90 },
  { id: 4, name: 'Cancer', tamilName: 'கடகம்', lord: 'MOON', lordTamil: 'சந்திரன்', degreeStart: 90, degreeEnd: 120 },
  { id: 5, name: 'Leo', tamilName: 'சிம்மம்', lord: 'SUN', lordTamil: 'சூரியன்', degreeStart: 120, degreeEnd: 150 },
  { id: 6, name: 'Virgo', tamilName: 'கன்னி', lord: 'MERCURY', lordTamil: 'புதன்', degreeStart: 150, degreeEnd: 180 },
  { id: 7, name: 'Libra', tamilName: 'துலாம்', lord: 'VENUS', lordTamil: 'சுக்கிரன்', degreeStart: 180, degreeEnd: 210 },
  { id: 8, name: 'Scorpio', tamilName: 'விருச்சிகம்', lord: 'MARS', lordTamil: 'செவ்வாய்', degreeStart: 210, degreeEnd: 240 },
  { id: 9, name: 'Sagittarius', tamilName: 'தனுசு', lord: 'JUPITER', lordTamil: 'குரு', degreeStart: 240, degreeEnd: 270 },
  { id: 10, name: 'Capricorn', tamilName: 'மகரம்', lord: 'SATURN', lordTamil: 'சனி', degreeStart: 270, degreeEnd: 300 },
  { id: 11, name: 'Aquarius', tamilName: 'கும்பம்', lord: 'SATURN', lordTamil: 'சனி', degreeStart: 300, degreeEnd: 330 },
  { id: 12, name: 'Pisces', tamilName: 'மீனம்', lord: 'JUPITER', lordTamil: 'குரு', degreeStart: 330, degreeEnd: 360 },
];

export const INITIAL_CITY_SEARCH = [
  { id: 1, name: 'Chennai', latitude: 13.0827, longitude: 80.2707, country: 'India' },
  { id: 2, name: 'London', latitude: 51.5074, longitude: -0.1278, country: 'UK' },
  { id: 3, name: 'Madrid', latitude: 40.4168, longitude: -3.7038, country: 'Spain' },
  { id: 4, name: 'Manchester', latitude: 53.4808, longitude: -2.2426, country: 'UK' },
  { id: 5, name: 'Barcelona', latitude: 41.3851, longitude: 2.1734, country: 'Spain' },
  { id: 6, name: 'Paris', latitude: 48.8566, longitude: 2.3522, country: 'France' },
  { id: 7, name: 'Munich', latitude: 48.1351, longitude: 11.5820, country: 'Germany' },
  { id: 8, name: 'Milan', latitude: 45.4642, longitude: 9.1900, country: 'Italy' },
];

export const PLANET_RELATIONS: Record<string, { friends: string[], neutral: string[], enemies: string[] }> = {
  SUN: { 
    friends: ['MOON', 'MARS', 'JUPITER'], 
    neutral: ['MERCURY'], 
    enemies: ['VENUS', 'SATURN'] 
  },
  MOON: { 
    friends: ['SUN', 'MERCURY'], 
    neutral: ['MARS', 'JUPITER', 'VENUS', 'SATURN'], 
    enemies: ['RAHU', 'KETU'] 
  },
  MARS: { 
    friends: ['SUN', 'MOON', 'JUPITER'], 
    neutral: ['VENUS', 'SATURN'], 
    enemies: ['MERCURY'] 
  },
  MERCURY: { 
    friends: ['SUN', 'VENUS'], 
    neutral: ['MARS', 'JUPITER', 'SATURN'], 
    enemies: ['MOON'] 
  },
  JUPITER: { 
    friends: ['SUN', 'MOON', 'MARS'], 
    neutral: ['SATURN'], 
    enemies: ['MERCURY', 'VENUS'] 
  },
  VENUS: { 
    friends: ['MERCURY', 'SATURN'], 
    neutral: ['MARS', 'JUPITER'], 
    enemies: ['SUN', 'MOON'] 
  },
  SATURN: { 
    friends: ['MERCURY', 'VENUS'], 
    neutral: ['JUPITER'], 
    enemies: ['SUN', 'MOON', 'MARS'] 
  },
  RAHU: { 
    friends: ['VENUS', 'SATURN', 'MERCURY'], 
    neutral: ['JUPITER'], 
    enemies: ['SUN', 'MOON', 'MARS'] 
  },
  KETU: { 
    friends: ['MARS', 'VENUS', 'SATURN'], 
    neutral: ['MERCURY', 'JUPITER'], 
    enemies: ['SUN', 'MOON'] 
  },
};

export const PLANET_STRENGTHS: Record<string, { aatchi: number[], ucham: number, neecham: number }> = {
  SUN: { aatchi: [5], ucham: 1, neecham: 7 }, 
  MOON: { aatchi: [4], ucham: 2, neecham: 8 }, 
  MARS: { aatchi: [1, 8], ucham: 10, neecham: 4 }, 
  MERCURY: { aatchi: [3, 6], ucham: 6, neecham: 12 }, 
  JUPITER: { aatchi: [9, 12], ucham: 4, neecham: 10 }, 
  VENUS: { aatchi: [2, 7], ucham: 12, neecham: 6 }, 
  SATURN: { aatchi: [10, 11], ucham: 7, neecham: 1 }, 
  RAHU: { aatchi: [], ucham: 0, neecham: 0 }, 
  KETU: { aatchi: [], ucham: 0, neecham: 0 }
};

export const HORA_QUALITIES: Record<string, { en: string, ta: string, color: string }> = {
    SUN: { en: 'Vigorous', ta: 'வீரியம்', color: 'bg-orange-600 text-white' },
    MOON: { en: 'Gentle', ta: 'மென்மை', color: 'bg-white text-slate-900 border border-slate-300' },
    MARS: { en: 'Aggressive', ta: 'ஆக்ரோஷம்', color: 'bg-red-800 text-white' },
    MERCURY: { en: 'Quick', ta: 'வேகம்', color: 'bg-green-700 text-white' },
    JUPITER: { en: 'Fruitful', ta: 'சுபம்', color: 'bg-yellow-500 text-yellow-950' },
    VENUS: { en: 'Beneficial', ta: 'நன்மை', color: 'bg-white text-slate-900 border border-slate-300' },
    SATURN: { en: 'Sluggish', ta: 'மந்தம்', color: 'bg-slate-700 text-white' }
};