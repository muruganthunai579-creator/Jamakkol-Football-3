import { GoogleGenAI, Type } from "@google/genai";
import { MatchDetails, PredictionResult, Rasi, City } from "../types";
import { RASIS, PLANETS } from "../constants";

// Initialize the API client
// We assume process.env.API_KEY is available as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getPrediction = async (
  match: MatchDetails,
  udhayamId: number,
  aarudamId: number,
  calculatedWinner: string,
  homeProb: number,
  awayProb: number
): Promise<PredictionResult> => {
  
  const homeRasi = RASIS.find(r => r.id === udhayamId)!;
  const awayRasi = RASIS.find(r => r.id === aarudamId)!;
  
  const homeLord = PLANETS[homeRasi.lord];
  const awayLord = PLANETS[awayRasi.lord];

  const systemInstruction = "Act as an expert Jamakkol Prasanam Astrologer and Football Analyst.";

  const prompt = `
    Match: ${match.homeTeam} vs ${match.awayTeam}
    
    Astrology Logic (Already Calculated):
    - Udhayam (Home): ${homeRasi.name} (Lord: ${homeLord.name})
    - Aarudam (Away): ${awayRasi.name} (Lord: ${awayLord.name})
    - Calculated Winner: ${calculatedWinner}
    - Probabilities: ${match.homeTeam} (${homeProb}%) vs ${match.awayTeam} (${awayProb}%)
    
    Generate a SHORT, punchy astrological reasoning (max 40 words) that explains WHY ${calculatedWinner} wins based on the planetary lords (${homeLord.name} vs ${awayLord.name}).
    Also suggest a "Lucky Time" window (e.g. "30-45 mins").
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reasoning: { type: Type.STRING },
            luckyTime: { type: Type.STRING },
          },
          required: ["reasoning", "luckyTime"],
        },
      }
    });

    const json = JSON.parse(response.text || "{}");
    
    return {
      winner: calculatedWinner,
      reasoning: json.reasoning || "Planetary alignments favor the stronger lord.",
      homeStrength: homeProb,
      awayStrength: awayProb,
      luckyTime: json.luckyTime || "2nd Half"
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      winner: calculatedWinner, // Fallback to math
      reasoning: "The stars align with the mathematical probability.",
      homeStrength: homeProb,
      awayStrength: awayProb,
      luckyTime: "Mid-Game"
    };
  }
};

export const searchCities = async (query: string): Promise<City[]> => {
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`);
    const data = await res.json();
    if (data.results) {
       return data.results.map((item: any, idx: number) => ({
         id: 1000 + idx,
         name: item.name,
         latitude: item.latitude,
         longitude: item.longitude,
         country: item.country || 'Unknown'
       }));
    }
    return [];
  } catch (err) { 
    console.error("Geo fetch failed", err); 
    return [];
  }
}