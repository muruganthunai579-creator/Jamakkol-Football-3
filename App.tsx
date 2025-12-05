import React, { useState, useEffect } from 'react';
import { Search, Trophy, Loader2, MapPin, Calendar, Clock } from 'lucide-react';
import RasiGrid from './components/RasiGrid';
import { calculateAstrology, calculateMatchDominance, calculateHora, generateMatchTheme } from './utils/astrology';
import { getPrediction, searchCities } from './services/geminiService';
import { INITIAL_CITY_SEARCH, PLANETS, RASIS, HORA_QUALITIES } from './constants';
import { City, MatchDetails, PredictionResult, MatchTheme } from './types';

function App() {
  const [matchDetails, setMatchDetails] = useState<MatchDetails>({
    homeTeam: 'Chennaiyin FC',
    awayTeam: 'Kerala Blasters',
    date: new Date().toISOString().split('T')[0],
    time: '16:30',
    location: null
  });

  const [astroData, setAstroData] = useState({ udhayamId: 1, aarudamId: 7, lagnamId: 1 });
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [matchFlow, setMatchFlow] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<City[]>(INITIAL_CITY_SEARCH);
  const [isSearchingLoc, setIsSearchingLoc] = useState(false);
  
  // Dynamic Theme State
  const [theme, setTheme] = useState<MatchTheme>(generateMatchTheme(matchDetails.date, matchDetails.time));

  // Derived Logic
  const udhayamRasi = RASIS.find(r => r.id === astroData.udhayamId)!;
  const aarudamRasi = RASIS.find(r => r.id === astroData.aarudamId)!;
  const udhayamLord = PLANETS[udhayamRasi.lord];
  const aarudamLord = PLANETS[aarudamRasi.lord];
  const locationCoords = matchDetails.location ? { lat: matchDetails.location.latitude, lng: matchDetails.location.longitude } : undefined;
  
  const currentHoraPlanetId = calculateHora(matchDetails.date, matchDetails.time, locationCoords);
  const horaLord = PLANETS[currentHoraPlanetId];
  const horaQuality = HORA_QUALITIES[currentHoraPlanetId] || { color: 'bg-slate-700 text-white', en: '', ta: '' };

  // Update theme when date/time changes
  useEffect(() => {
     setTheme(generateMatchTheme(matchDetails.date, matchDetails.time));
  }, [matchDetails.date, matchDetails.time]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (citySearch.length > 2 && showCityDropdown) {
        setIsSearchingLoc(true);
        try {
          const results = await searchCities(citySearch);
          setSearchResults(results);
        } catch (err) { 
          console.error("Search failed"); 
        } finally { 
          setIsSearchingLoc(false); 
        }
      } else if (citySearch.length <= 2) {
        setSearchResults(INITIAL_CITY_SEARCH.filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase())));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [citySearch, showCityDropdown]);

  const selectCity = (city: City) => {
    setMatchDetails(prev => ({ ...prev, location: city }));
    setCitySearch(`${city.name}, ${city.country}`);
    setShowCityDropdown(false);
  };

  useEffect(() => {
    if (matchDetails.date && matchDetails.time && matchDetails.location) {
      const { lagnamId, udhayamId, aarudamId } = calculateAstrology(matchDetails.date, matchDetails.time, locationCoords);
      setAstroData({ lagnamId, udhayamId, aarudamId });
      setPrediction(null); 
      setMatchFlow([]); 
    }
  }, [matchDetails.date, matchDetails.time, matchDetails.homeTeam, matchDetails.awayTeam, matchDetails.location]);

  const handlePredict = async () => {
    if (!matchDetails.location) { alert("Please select a location first."); return; }
    setLoading(true);
    
    const { homeProb, awayProb, flowEvents, winner } = calculateMatchDominance(
       matchDetails.time, matchDetails.homeTeam, matchDetails.awayTeam,
       udhayamLord.id, aarudamLord.id, horaLord.id,
       astroData.udhayamId, astroData.aarudamId, matchDetails.date
    );

    setMatchFlow(flowEvents);
    const result = await getPrediction(matchDetails, astroData.udhayamId, astroData.aarudamId, winner, homeProb, awayProb);
    setPrediction(result);
    setLoading(false);
    
    setTimeout(() => { document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' }); }, 100);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white font-inter pb-20 selection:bg-purple-500 selection:text-white">
      
      {/* Dynamic Header */}
      <div className="border-b border-white/10 p-4 sticky top-0 z-50 shadow-2xl backdrop-blur-md bg-[#0a0f1c]/80">
        <div className="container mx-auto max-w-6xl flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg shadow" style={{ background: theme.homeGradient }}>
                    <Trophy className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-black italic uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    Jamakkol Predictor
                </h1>
            </div>
            {matchDetails.location && (
                 <div className="hidden md:flex items-center gap-2 text-xs font-bold bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span>{matchDetails.location.name}</span>
                 </div>
            )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            
            {/* Left Column: Inputs & Chart (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
                
                {/* Match Config Card */}
                <div className="bg-[#111827] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-40 h-40 opacity-20 rounded-full blur-3xl pointer-events-none" style={{ background: theme.homeColor }}></div>
                    
                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Match Setup</h3>
                        {matchDetails.location && (
                             <div className={`px-2 py-1 rounded text-[10px] font-bold shadow border border-white/10 flex items-center gap-2 ${horaQuality.color}`}>
                                <span>{horaLord.tamilName} Hora</span>
                             </div>
                        )}
                    </div>

                    <div className="space-y-4 relative z-10">
                         {/* Teams Input */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] uppercase text-slate-500 font-bold mb-1 block">Home Team</label>
                                <input type="text" value={matchDetails.homeTeam} onChange={(e) => setMatchDetails({...matchDetails, homeTeam: e.target.value})} className="w-full bg-[#0a0f1c] border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 focus:outline-none transition-all" />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase text-slate-500 font-bold mb-1 block">Away Team</label>
                                <input type="text" value={matchDetails.awayTeam} onChange={(e) => setMatchDetails({...matchDetails, awayTeam: e.target.value})} className="w-full bg-[#0a0f1c] border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none transition-all" />
                            </div>
                        </div>

                        {/* Date/Time */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="relative">
                                <label className="text-[10px] uppercase text-slate-500 font-bold mb-1 block">Date</label>
                                <div className="relative">
                                    <input type="date" value={matchDetails.date} onChange={(e) => setMatchDetails({...matchDetails, date: e.target.value})} className="w-full bg-[#0a0f1c] border border-slate-700 rounded-lg p-2.5 text-sm text-slate-300 focus:border-slate-500 focus:outline-none pl-9" />
                                    <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                                </div>
                            </div>
                            <div className="relative">
                                <label className="text-[10px] uppercase text-slate-500 font-bold mb-1 block">Time</label>
                                <div className="relative">
                                    <input type="time" value={matchDetails.time} onChange={(e) => setMatchDetails({...matchDetails, time: e.target.value})} className="w-full bg-[#0a0f1c] border border-slate-700 rounded-lg p-2.5 text-sm text-slate-300 focus:border-slate-500 focus:outline-none pl-9" />
                                    <Clock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="relative">
                            <label className="text-[10px] uppercase text-slate-500 font-bold mb-1 block">Stadium</label>
                            <div className="relative">
                                <input type="text" value={citySearch} onChange={(e) => { setCitySearch(e.target.value); setShowCityDropdown(true); if (e.target.value === '') setMatchDetails({...matchDetails, location: null}); }} onFocus={() => setShowCityDropdown(true)} placeholder="Search Location..." className="w-full bg-[#0a0f1c] border border-slate-700 rounded-lg p-2.5 text-sm text-slate-300 focus:border-slate-500 focus:outline-none pl-9" />
                                <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                                <div className="absolute right-3 top-3 text-slate-500">{isSearchingLoc ? <Loader2 className="w-4 h-4 animate-spin"/> : null}</div>
                            </div>
                            
                            {showCityDropdown && citySearch.length > 0 && (
                                <div className="absolute z-50 left-0 right-0 mt-1 bg-[#1e293b] border border-slate-700 rounded-lg shadow-2xl max-h-48 overflow-y-auto">
                                    {searchResults.map(city => (
                                    <div key={city.id} onClick={() => selectCity(city)} className="px-4 py-3 text-xs hover:bg-white/5 cursor-pointer flex justify-between items-center border-b border-white/5 last:border-0">
                                        <span className="text-white font-bold">{city.name}</span>
                                        <span className="text-slate-400">{city.country}</span>
                                    </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <button onClick={handlePredict} disabled={loading || !matchDetails.location} className={`mt-6 w-full py-4 rounded-lg font-black text-sm tracking-widest uppercase transition-all shadow-xl relative overflow-hidden group ${loading || !matchDetails.location ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'text-white'}`} style={!loading && matchDetails.location ? { background: theme.homeGradient } : {}}>
                        <span className="relative z-10">{loading ? 'Running Astro Calculations...' : 'Generate Prediction'}</span>
                        {!loading && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>}
                    </button>
                </div>

                <div className="flex justify-center">
                    <RasiGrid 
                        udhayamId={astroData.udhayamId} 
                        aarudamId={astroData.aarudamId}
                        lagnamId={astroData.lagnamId}
                        date={matchDetails.date}
                        time={matchDetails.time}
                        locationName={matchDetails.location?.name || ''}
                    />
                 </div>
            </div>

            {/* Right Column: Results (7 Cols) */}
            <div className="lg:col-span-7">
                {prediction && (
                    <div id="results-section" className="animate-fade-in-up space-y-6">
                        
                        {/* VS HEADER */}
                        <div className="flex w-full rounded-2xl overflow-hidden shadow-2xl h-24 relative border border-white/10">
                            {/* Home Side */}
                            <div className="flex-1 flex flex-col justify-center px-6 relative overflow-hidden" style={{ background: theme.homeGradient }}>
                                <div className="absolute -right-10 top-0 bottom-0 w-20 bg-black/20 skew-x-12 blur-md"></div>
                                <span className="text-[10px] font-black uppercase opacity-60">Home Team</span>
                                <h2 className="text-xl md:text-2xl font-black text-white uppercase leading-none tracking-tight truncate shadow-sm">{matchDetails.homeTeam}</h2>
                                <span className="text-xs font-bold mt-1 opacity-90">Udhayam</span>
                            </div>
                            
                            {/* VS Badge */}
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                                <div className="bg-[#0a0f1c] text-white font-black text-xl italic px-4 py-2 rounded-xl border-2 border-white/10 shadow-xl">
                                    VS
                                </div>
                            </div>

                            {/* Away Side */}
                            <div className="flex-1 flex flex-col items-end justify-center px-6 relative overflow-hidden text-right" style={{ background: theme.awayGradient }}>
                                <div className="absolute -left-10 top-0 bottom-0 w-20 bg-black/20 -skew-x-12 blur-md"></div>
                                <span className="text-[10px] font-black uppercase opacity-60">Away Team</span>
                                <h2 className="text-xl md:text-2xl font-black text-white uppercase leading-none tracking-tight truncate shadow-sm">{matchDetails.awayTeam}</h2>
                                <span className="text-xs font-bold mt-1 opacity-90">Aarudam</span>
                            </div>
                        </div>

                        {/* WIN PROBABILITY */}
                        <div className="bg-[#111827] border border-white/5 rounded-2xl p-6 shadow-xl">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                                Match Win Probability (Astro)
                            </h3>
                            
                            <div className="h-12 w-full bg-[#0a0f1c] rounded-lg overflow-hidden flex relative border border-white/5">
                                <div 
                                    className="h-full flex items-center justify-start pl-4 text-sm font-black text-white relative"
                                    style={{ width: `${prediction.homeStrength}%`, background: theme.homeGradient }}
                                >
                                    <span className="z-10 drop-shadow-md">{matchDetails.homeTeam.substring(0,3).toUpperCase()} {prediction.homeStrength}%</span>
                                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/20 to-transparent"></div>
                                </div>
                                <div 
                                    className="h-full flex items-center justify-end pr-4 text-sm font-black text-white relative"
                                    style={{ width: `${prediction.awayStrength}%`, background: theme.awayGradient }}
                                >
                                    <span className="z-10 drop-shadow-md">{matchDetails.awayTeam.substring(0,3).toUpperCase()} {prediction.awayStrength}%</span>
                                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/20 to-transparent"></div>
                                </div>
                            </div>
                            
                            <div className="mt-3 flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                <span>Home Advantage</span>
                                <span>Neutral</span>
                                <span>Away Advantage</span>
                            </div>
                        </div>

                        {/* MATCH FLOW (1st Innings / 2nd Innings style) */}
                        <div className="space-y-4">
                            {/* First Half */}
                            <div className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                                <div className="px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-white/5 flex items-center gap-2">
                                    <div className="w-2 h-2 rotate-45" style={{ background: theme.homeColor }}></div>
                                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">1st Half (0-49 mins)</h3>
                                </div>
                                <div className="p-1 space-y-1">
                                    {matchFlow.slice(0, 4).map((event, idx) => (
                                        <div key={idx} className={`w-full px-4 py-3 rounded-lg flex items-center justify-between ${event.dominanceColor}`}>
                                            <div className="flex items-center gap-3">
                                                <span className="bg-black/20 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-current opacity-80">{event.time}</span>
                                                <span className="text-xs font-black uppercase tracking-wide">{event.description}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Second Half */}
                            <div className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                                <div className="px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-white/5 flex items-center gap-2">
                                    <div className="w-2 h-2 rotate-45" style={{ background: theme.awayColor }}></div>
                                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">2nd Half (49-98 mins)</h3>
                                </div>
                                <div className="p-1 space-y-1">
                                    {matchFlow.slice(4, 8).map((event, idx) => (
                                        <div key={idx} className={`w-full px-4 py-3 rounded-lg flex items-center justify-between ${event.dominanceColor}`}>
                                            <div className="flex items-center gap-3">
                                                <span className="bg-black/20 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-current opacity-80">{event.time}</span>
                                                <span className="text-xs font-black uppercase tracking-wide">{event.description}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* FINAL CALL */}
                        <div className="bg-[#0f172a] border border-slate-700/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                            
                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Final Astro Match Call</h3>
                            
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="text-slate-500 font-medium">Predicted Winner:</span>
                                    <span 
                                        className="font-black text-lg px-3 py-1 rounded bg-white/5 border border-white/10"
                                        style={{ color: prediction.winner === matchDetails.homeTeam ? theme.homeColor : theme.awayColor }}
                                    >
                                        {prediction.winner} 🏆
                                    </span>
                                </div>
                                <div className="bg-[#1e293b] p-4 rounded-xl border border-white/5">
                                    <p className="text-sm italic text-slate-300 leading-relaxed">"{prediction.reasoning}"</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <div className="bg-[#1e293b] p-3 rounded-lg border-l-4 border-red-500">
                                         <span className="block text-[10px] font-bold text-slate-500 uppercase">Risk Window</span>
                                         <span className="text-xs font-bold text-red-400">Avoid 6th & 8th House transit times</span>
                                    </div>
                                    <div className="bg-[#1e293b] p-3 rounded-lg border-l-4 border-emerald-500">
                                         <span className="block text-[10px] font-bold text-slate-500 uppercase">Lucky Phase</span>
                                         <span className="text-xs font-bold text-emerald-400">{prediction.luckyTime}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}

export default App;