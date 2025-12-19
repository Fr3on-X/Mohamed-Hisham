import React, { useState } from 'react';
import { generateAgencyText } from '../services/geminiService';

const StrategyView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [groundingChunks, setGroundingChunks] = useState<any[]>([]);
  const [mode, setMode] = useState<'strategy' | 'creative_bridge' | 'analysis_search' | 'analysis_maps' | 'analysis_audit'>('strategy');
  const [location, setLocation] = useState<{lat: number, lng: number} | undefined>(undefined);

  const handleRun = async () => {
    setLoading(true);
    setResponse('');
    setGroundingChunks([]);

    try {
        let loc = location;
        if (mode === 'analysis_maps' && !loc) {
             // Quick geolocation fetch if maps mode and no loc
             await new Promise<void>((resolve) => {
                 navigator.geolocation.getCurrentPosition((pos) => {
                     loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                     setLocation(loc);
                     resolve();
                 }, () => resolve());
             });
        }

        let agencyMode: 'STRATEGY' | 'ANALYSIS' | 'CONTENT' | 'CREATIVE_BRIDGE' | 'ANALYSIS_AUDIT' = 'STRATEGY';
        let useThinking = false;
        let useGrounding = false;
        let useMaps = false;

        if (mode === 'strategy') {
            agencyMode = 'STRATEGY';
            useThinking = true;
        } else if (mode === 'creative_bridge') {
            agencyMode = 'CREATIVE_BRIDGE';
            // Creative bridge is standard text generation without tools
        } else if (mode === 'analysis_search') {
            agencyMode = 'ANALYSIS';
            useGrounding = true;
        } else if (mode === 'analysis_maps') {
            agencyMode = 'ANALYSIS';
            useMaps = true;
        } else if (mode === 'analysis_audit') {
            agencyMode = 'ANALYSIS_AUDIT';
        }

        const res = await generateAgencyText(
            prompt, 
            agencyMode,
            {
                useThinking,
                useGrounding,
                useMaps,
                location: loc
            }
        );
        setResponse(res.text || 'No response text.');
        setGroundingChunks(res.groundingChunks || []);
    } catch (e) {
        setResponse(`Error: ${(e as Error).message}`);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2 text-white">Strategy Core</h2>
        <p className="text-zinc-400">Notstudio OS: Strategy, Direction, & Analysis.</p>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <button 
            onClick={() => setMode('strategy')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${mode === 'strategy' ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
        >
            Strategy: Deep Dive
        </button>
        <button 
            onClick={() => setMode('creative_bridge')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${mode === 'creative_bridge' ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
        >
            Creative Direction
        </button>
        <button 
            onClick={() => setMode('analysis_audit')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${mode === 'analysis_audit' ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
        >
            Quality Control
        </button>
        <button 
            onClick={() => setMode('analysis_search')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${mode === 'analysis_search' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
        >
            Analysis: Research
        </button>
        <button 
            onClick={() => setMode('analysis_maps')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${mode === 'analysis_maps' ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
        >
            Analysis: Location
        </button>
      </div>

      <textarea
        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20 min-h-[120px]"
        placeholder={
            mode === 'strategy' ? "Define strategic pillars, positioning, or objectives..." :
            mode === 'creative_bridge' ? "Paste approved strategy here to generate creative direction..." :
            mode === 'analysis_audit' ? "Paste Strategy, Creative Direction, and Content here for audit..." :
            mode === 'analysis_search' ? "Research market trends, competitor insights..." :
            "Find agencies or creative hotspots near..."
        }
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleRun}
          disabled={loading || !prompt}
          className="bg-white text-black px-6 py-2 rounded-lg font-bold hover:bg-zinc-200 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Processing...' : 'Execute'}
        </button>
      </div>

      {(response || loading) && (
        <div className="mt-8 flex-1 overflow-auto bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
            {loading ? (
                <div className="animate-pulse text-zinc-500">Notstudio OS is thinking...</div>
            ) : (
                <div className="prose prose-invert max-w-none">
                    <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{response}</div>
                    
                    {groundingChunks.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-zinc-700">
                            <h4 className="text-sm font-bold text-zinc-400 mb-3 uppercase tracking-wider">Analysis Sources</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {groundingChunks.map((chunk: any, i) => {
                                    if (chunk.web) {
                                        return (
                                            <a key={i} href={chunk.web.uri} target="_blank" rel="noreferrer" className="block p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition">
                                                <div className="text-sm font-medium text-blue-400 truncate">{chunk.web.title}</div>
                                                <div className="text-xs text-zinc-500 truncate">{chunk.web.uri}</div>
                                            </a>
                                        );
                                    }
                                    if (chunk.maps) {
                                        return (
                                            <a key={i} href={chunk.maps.googleMapsUri} target="_blank" rel="noreferrer" className="block p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition">
                                                <div className="text-sm font-medium text-emerald-400 truncate">{chunk.maps.title}</div>
                                                <div className="text-xs text-zinc-500 truncate">{chunk.maps.formattedAddress}</div>
                                            </a>
                                        )
                                    }
                                    return null;
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default StrategyView;