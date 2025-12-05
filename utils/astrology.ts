import { RASIS, PLANET_RELATIONS, PLANET_STRENGTHS, PLANETS, HORA_QUALITIES } from "../constants";
import { MatchEvent, HoraSegment, MatchTheme } from "../types";

// --- Precise Sunrise / Sunset Calculation ---
export const getSunTimes = (date: Date, lat: number, lng: number) => {
  const times = { sunrise: 6.0, sunset: 18.0 }; // Fallback

  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  const rad = Math.PI / 180;
  
  // Solar Declination
  const declination = 23.45 * Math.sin(rad * (360 / 365) * (dayOfYear - 81));
  
  // Equation of Time
  const B = rad * (360 / 365) * (dayOfYear - 81);
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);

  // Hour Angle
  const cosH = -Math.tan(lat * rad) * Math.tan(declination * rad);
  
  if (cosH < -1 || cosH > 1) return times; // Polar day/night fallback

  const H = Math.acos(cosH) / rad;

  // Local Solar Time
  const solarRise = 12 - H / 15;
  const solarSet = 12 + H / 15;

  const utcRise = solarRise - (lng / 15) - (eot / 60);
  const utcSet = solarSet - (lng / 15) - (eot / 60);
  
  const offsetHours = -date.getTimezoneOffset() / 60; // Browser offset
  
  return { 
      sunrise: (utcRise + offsetHours + 24) % 24, 
      sunset: (utcSet + offsetHours + 24) % 24 
  };
};

export const formatDecimalTime = (decimalTime: number) => {
  if (isNaN(decimalTime)) return "--:--";
  const hrs = Math.floor(decimalTime);
  const mins = Math.round((decimalTime - hrs) * 60);
  // Simple string formatting to avoid Date object issues
  const h = hrs % 24;
  return `${h.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// --- Sun Sign Helper ---
export const getSunRasi = (date: Date): number => {
    const start = new Date(date.getFullYear(), 3, 14); // April 14 = Aries Start
    const diff = date.getTime() - start.getTime();
    const days = diff / (1000 * 3600 * 24);
    let rasiOffset = Math.floor(days / 30.44); 
    rasiOffset = ((rasiOffset % 12) + 12) % 12;
    return rasiOffset + 1; // 1 = Aries
};

// --- Main Calculation Updated ---
export const calculateAstrology = (dateStr: string, timeStr: string, location?: { lat: number, lng: number }) => {
  if (!dateStr || !timeStr) return { lagnamId: 1, udhayamId: 1, aarudamId: 7 };

  const dateObj = new Date(dateStr);
  const [hours, minutes] = timeStr.split(':').map(Number);
  const currentDec = hours + (minutes / 60);

  // 1. Base Sun Position (Month based)
  const sunRasiId = getSunRasi(dateObj);

  // 2. Sunrise Calculation
  let sunrise = 6.0;
  if (location) {
      const times = getSunTimes(dateObj, location.lat, location.lng);
      sunrise = times.sunrise;
  }

  // Calculate time diff from sunrise in minutes
  let diffHours = currentDec - sunrise;
  if (diffHours < 0) diffHours += 24;
  const diffMinutes = diffHours * 60;

  // --- LAGNAM (Time/Longitude Base) ---
  const lagnamShift = Math.floor(diffMinutes / 120);
  let lagnamId = (sunRasiId + lagnamShift - 1) % 12 + 1;

  // --- UDHAYAM (Jamakkol Day/Night Base) ---
  const udhayamShift = Math.floor(diffMinutes / 90);
  let udhayamId = (sunRasiId + udhayamShift - 1) % 12 + 1;

  // --- AARUDAM (Bird/Panchapakshi Base) ---
  const dayIndex = dateObj.getDay(); // 0=Sun, 6=Sat
  const birdSlot = Math.floor(diffMinutes / 150); 
  const baseAarudam = ((dayIndex * 4) + (birdSlot * 7)) % 12; 
  let aarudamId = baseAarudam + 1;

  // Ensure valid ID
  if (lagnamId <= 0) lagnamId = 12;
  if (udhayamId <= 0) udhayamId = 12;
  if (aarudamId <= 0) aarudamId = 12;
  
  if (aarudamId === udhayamId) {
      aarudamId = (aarudamId % 12) + 1;
  }

  return { lagnamId, udhayamId, aarudamId };
};

export const getPlanetaryStatus = (planetId: string, rasiId: number) => {
  const strength = PLANET_STRENGTHS[planetId];
  if (!strength) return { label: 'Samam', tamilLabel: 'சமம்', color: 'text-slate-400' };

  if (strength.ucham === rasiId) return { label: 'Exalted', tamilLabel: 'உச்சம்', color: 'text-green-400 font-bold' };
  if (strength.aatchi.includes(rasiId)) return { label: 'Own House', tamilLabel: 'ஆட்சி', color: 'text-yellow-400 font-bold' };
  if (strength.neecham === rasiId) return { label: 'Debilitated', tamilLabel: 'நீச்சம்', color: 'text-red-400 font-bold' };

  const rasiLord = RASIS.find(r => r.id === rasiId)?.lord;
  if (rasiLord) {
     const relation = getRelationship(planetId, rasiLord);
     if (relation.type === 'FRIEND') return { label: 'Friend House', tamilLabel: 'நட்பு', color: 'text-blue-300' };
     if (relation.type === 'ENEMY') return { label: 'Enemy House', tamilLabel: 'பகை', color: 'text-orange-400' };
  }

  return { label: 'Neutral', tamilLabel: 'சமம்', color: 'text-slate-400' };
};

export const getRelationship = (planet1: string, planet2: string) => {
  const rel1 = PLANET_RELATIONS[planet1];
  if (rel1.friends.includes(planet2)) return { type: 'FRIEND', label: 'Friendly', tamilLabel: 'நட்பு', color: 'text-green-400' };
  if (rel1.enemies.includes(planet2)) return { type: 'ENEMY', label: 'Enemy', tamilLabel: 'பகை', color: 'text-red-500' };
  return { type: 'NEUTRAL', label: 'Neutral', tamilLabel: 'சமம்', color: 'text-slate-400' };
};

export const calculateHouseDistance = (start: number, end: number) => {
  if (end >= start) return end - start + 1;
  return (12 - start) + end + 1;
};

export const getDistanceQuality = (distance: number) => {
  if ([1, 5, 9].includes(distance)) return { label: 'Very Good', color: 'text-emerald-400' };
  if ([2, 3, 7, 11].includes(distance)) return { label: 'Good', color: 'text-blue-400' };
  if ([4, 10].includes(distance)) return { label: 'Medium', color: 'text-yellow-400' };
  if ([6, 8, 12].includes(distance)) return { label: 'Bad', color: 'text-red-500' };
  return { label: 'Neutral', color: 'text-slate-400' };
};

export const calculateDailyHoras = (dateStr: string, location: { lat: number, lng: number }): HoraSegment[] => {
  const dateObj = new Date(dateStr);
  const { sunrise, sunset } = getSunTimes(dateObj, location.lat, location.lng);
  
  const dayDuration = sunset - sunrise;
  const nightDuration = 24 - dayDuration;
  const dayHoraLength = dayDuration / 12;
  const nightHoraLength = nightDuration / 12;
  
  const dayOfWeek = dateObj.getDay(); // 0 = Sun
  const WEEKDAY_STARTS = [0, 3, 6, 2, 5, 1, 4]; // Sun, Mon, Tue...
  const HORA_SEQUENCE = ['SUN', 'VENUS', 'MERCURY', 'MOON', 'SATURN', 'JUPITER', 'MARS'];
  
  const schedule: HoraSegment[] = [];
  
  // Day Cycle
  const startPlanetIndex = WEEKDAY_STARTS[dayOfWeek];
  for (let i = 0; i < 12; i++) {
     const start = sunrise + (i * dayHoraLength);
     const end = sunrise + ((i + 1) * dayHoraLength);
     const planetId = HORA_SEQUENCE[(startPlanetIndex + i) % 7];
     const quality = HORA_QUALITIES[planetId];
     
     schedule.push({
         startTime: formatDecimalTime(start),
         endTime: formatDecimalTime(end),
         planetId,
         quality: quality.en,
         isDay: true,
         isActive: false
     });
  }
  
  // Night Cycle
  const nightStartIndex = (startPlanetIndex + 5) % 7; // 6th from day lord
  for (let i = 0; i < 12; i++) {
     let start = sunset + (i * nightHoraLength);
     let end = sunset + ((i + 1) * nightHoraLength);
     
     if (start >= 24) start -= 24;
     if (end >= 24) end -= 24;
     
     const planetId = HORA_SEQUENCE[(nightStartIndex + i) % 7];
     const quality = HORA_QUALITIES[planetId];
     
     schedule.push({
         startTime: formatDecimalTime(start),
         endTime: formatDecimalTime(end),
         planetId,
         quality: quality.en,
         isDay: false,
         isActive: false
     });
  }
  
  return schedule;
};

export const calculateHora = (dateStr: string, timeStr: string, location?: { lat: number, lng: number }) => {
    if (!location) return 'SUN';
    const schedule = calculateDailyHoras(dateStr, location);
    const [h, m] = timeStr.split(':').map(Number);
    const nowDec = h + m/60;
    for (const seg of schedule) {
        const [sh, sm] = seg.startTime.split(':').map(Number);
        const [eh, em] = seg.endTime.split(':').map(Number);
        const start = sh + sm/60;
        let end = eh + em/60;
        if (end < start) end += 24; 
        let checkNow = nowDec;
        if (checkNow < start && end > 24) checkNow += 24; 
        if (checkNow >= start && checkNow < end) return seg.planetId;
    }
    return 'SUN'; 
};

// --- DYNAMIC THEME GENERATOR ---
export const generateMatchTheme = (dateStr: string, timeStr: string): MatchTheme => {
    const input = dateStr + timeStr;
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        hash = input.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue1 = Math.abs(hash % 360);
    const hue2 = Math.abs((hash * 7) % 360);
    
    const homeGradient = `linear-gradient(135deg, hsl(${hue1}, 80%, 60%), hsl(${hue1}, 70%, 40%))`;
    const awayGradient = `linear-gradient(135deg, hsl(${hue2}, 80%, 60%), hsl(${hue2}, 70%, 40%))`;
    
    return {
        homeColor: `hsl(${hue1}, 70%, 50%)`,
        awayColor: `hsl(${hue2}, 70%, 50%)`,
        homeGradient,
        awayGradient,
        accentColor: `hsl(${(hue1 + 180) % 360}, 80%, 60%)`
    };
};

export const calculateMatchDominance = (
  startTimeStr: string,
  homeTeamName: string,
  awayTeamName: string,
  homeLordId: string,
  awayLordId: string,
  horaLordId: string,
  udhayamId: number,
  aarudamId: number,
  dateStr: string
) => {
  const events: MatchEvent[] = [];
  const [startHour, startMinute] = startTimeStr.split(':').map(Number);
  const GRAHAS = ['SUN', 'MOON', 'MARS', 'MERCURY', 'JUPITER', 'VENUS', 'SATURN'];
  const SEGMENTS = 8;
  const segmentDuration = 98 / SEGMENTS; // 98 minutes total duration
  
  let homeScore = 50;
  let awayScore = 50;

  // Day Lord Bonus
  const dateObj = new Date(dateStr);
  const dayIndex = dateObj.getDay(); 
  const DAYS_TO_PLANETS = ['SUN', 'MOON', 'MARS', 'MERCURY', 'JUPITER', 'VENUS', 'SATURN'];
  const dayLordId = DAYS_TO_PLANETS[dayIndex];

  if (homeLordId === dayLordId) homeScore += 5;
  if (awayLordId === dayLordId) awayScore += 5;

  // Distance Rule
  const distance = calculateHouseDistance(udhayamId, aarudamId);
  if ([1, 5, 9].includes(distance)) {
    homeScore += 15;
  } else if ([2, 3, 7, 11].includes(distance)) {
    homeScore += 8;
  } else if ([6, 8, 12].includes(distance)) {
    homeScore -= 15;
    awayScore += 15;
  }
  
  // Hora Lord Rule
  const homeHoraRel = getRelationship(homeLordId, horaLordId);
  const awayHoraRel = getRelationship(awayLordId, horaLordId);
  
  if (horaLordId === homeLordId) homeScore += 8;
  else if (homeHoraRel.type === 'FRIEND') homeScore += 5;
  else if (homeHoraRel.type === 'ENEMY') homeScore -= 5;
  
  if (horaLordId === awayLordId) awayScore += 8;
  else if (awayHoraRel.type === 'FRIEND') awayScore += 5;
  else if (awayHoraRel.type === 'ENEMY') awayScore -= 5;

  // Match Flow
  let flowHomePoints = 0;
  let flowAwayPoints = 0;
  let planetIndex = GRAHAS.indexOf(horaLordId);
  if (planetIndex === -1) planetIndex = 0;

  for (let i = 0; i < SEGMENTS; i++) {
    const segmentStartMin = i * segmentDuration;
    const segmentEndMin = (i + 1) * segmentDuration;
    
    const currentPlanetIndex = (planetIndex + i) % 7;
    const currentPlanetId = GRAHAS[currentPlanetIndex];
    const planetInfo = PLANETS[currentPlanetId];

    let segmentHome = 0;
    let segmentAway = 0;

    const relHome = getRelationship(homeLordId, currentPlanetId);
    const relAway = getRelationship(awayLordId, currentPlanetId);

    if (currentPlanetId === homeLordId) segmentHome += 5;
    else if (relHome.type === 'FRIEND') segmentHome += 2;
    else if (relHome.type === 'ENEMY') segmentHome -= 2;

    if (currentPlanetId === awayLordId) segmentAway += 5;
    else if (relAway.type === 'FRIEND') segmentAway += 2;
    else if (relAway.type === 'ENEMY') segmentAway -= 2;
    
    flowHomePoints += segmentHome;
    flowAwayPoints += segmentAway;

    const net = segmentHome - segmentAway;
    let dominanceColor = 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500'; 
    let description = 'Balanced Phase';
    let team = 'NEUTRAL';

    // Goal Chance Thresholds
    if (net > 3) {
        dominanceColor = 'bg-[#0f291e] text-emerald-400 border-l-4 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
        description = `${homeTeamName.toUpperCase()} - GOAL CHANCE`;
        team = 'HOME';
    } else if (net > 1) {
       dominanceColor = 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-300';
       description = `${homeTeamName} Control`;
       team = 'HOME';
    } else if (net < -3) {
        dominanceColor = 'bg-[#1e1a2e] text-purple-400 border-l-4 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]';
        description = `${awayTeamName.toUpperCase()} - GOAL CHANCE`;
        team = 'AWAY';
    } else if (net < -1) {
       dominanceColor = 'bg-purple-50 text-purple-800 border-l-4 border-purple-300';
       description = `${awayTeamName} Control`;
       team = 'AWAY';
    } else {
        dominanceColor = 'bg-amber-100 text-amber-900 border-l-4 border-amber-500';
        description = 'Tactical Battle / Mixed Phase';
    }

    const dStart = new Date(); dStart.setHours(startHour); dStart.setMinutes(startMinute + segmentStartMin);
    const dEnd = new Date(); dEnd.setHours(startHour); dEnd.setMinutes(startMinute + segmentEndMin);
    const timeLabel = `${dStart.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12:false})} - ${dEnd.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12:false})}`;

    events.push({
      minute: Math.floor(segmentStartMin),
      time: timeLabel,
      team,
      teamName: team === 'NEUTRAL' ? 'Neutral' : (team === 'HOME' ? homeTeamName : awayTeamName),
      planetCode: planetInfo.shortCode,
      planetName: planetInfo.name,
      description,
      dominanceColor,
      rawScore: net
    });
  }
  
  homeScore += flowHomePoints;
  awayScore += flowAwayPoints;

  if (homeScore < 0) homeScore = 0;
  if (awayScore < 0) awayScore = 0;
  
  const total = homeScore + awayScore;
  let homeProb = Math.round((homeScore / total) * 100);
  if (isNaN(homeProb)) homeProb = 50;
  
  const awayProb = 100 - homeProb;

  return {
    homeProb,
    awayProb,
    flowEvents: events,
    winner: homeProb > awayProb ? homeTeamName : (awayProb > homeProb ? awayTeamName : 'Draw')
  };
};