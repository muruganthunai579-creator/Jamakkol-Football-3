export interface Planet {
  id: string;
  name: string;
  tamilName: string;
  shortCode: string; // e.g. "Su", "Mo"
  color: string;
}

export interface Rasi {
  id: number;
  name: string;
  tamilName: string;
  lord: string; // Planet ID
  lordTamil: string;
  degreeStart: number;
  degreeEnd: number;
}

export interface City {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
}

export interface MatchDetails {
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  location: City | null;
}

export interface PredictionResult {
  winner: string;
  reasoning: string;
  homeStrength: number;
  awayStrength: number;
  luckyTime: string;
}

export interface MatchEvent {
  minute: number;
  time: string;
  team: string; // 'HOME' or 'AWAY'
  teamName: string;
  planetCode: string; // The planet causing this
  planetName: string; // Full name for display
  description: string;
  dominanceColor: string; // Tailwind class
  rawScore: number; // For determining flow band color
}

export interface HoraSegment {
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  planetId: string;
  quality: string; // e.g. "Vigorous", "Gentle"
  isDay: boolean;
  isActive: boolean;
}

export interface MatchTheme {
  homeColor: string; // Hex or HSL
  awayColor: string; // Hex or HSL
  homeGradient: string; // CSS linear-gradient
  awayGradient: string; // CSS linear-gradient
  accentColor: string;
}