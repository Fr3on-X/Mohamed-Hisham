import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { base64ToUint8Array, float32ToPCM16, arrayBufferToBase64, NOTSTUDIO_SYSTEM_INSTRUCTION, LIVE_MODE_INSTRUCTION } from '../services/geminiService';

const LiveView: React.FC = () => {
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState("Disconnected");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Audio Refs
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Connection Ref
  const sessionRef = useRef<any>(null); 
  const stopSignal = useRef(false);

  const startSession = async () => {
    setStatus("Connecting...");
    stopSignal.current = false;

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Setup Audio Contexts
        const inputCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
        const outputCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
        inputContextRef.current = inputCtx;
        outputContextRef.current = outputCtx;

        const outputNode = outputCtx.createGain();
        outputNode.connect(outputCtx.destination);

        // Get Stream
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
        }

        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
                },
                systemInstruction: NOTSTUDIO_SYSTEM_INSTRUCTION + "\n\n" + LIVE_MODE_INSTRUCTION,
            },
            callbacks: {
                onopen: () => {
                    setStatus("Live");
                    setActive(true);

                    // --- Audio Streaming Setup ---
                    const source = inputCtx.createMediaStreamSource(stream);
                    const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
                    scriptProcessor.onaudioprocess = (e) => {
                        if (stopSignal.current) return;
                        const inputData = e.inputBuffer.getChannelData(0);
                        
                        // Convert Float32 to PCM16 Uint8
                        const pcm16 = float32ToPCM16(inputData);
                        const base64 = arrayBufferToBase64(pcm16.buffer);
                        
                        sessionPromise.then(session => {
                            session.sendRealtimeInput({
                                media: {
                                    mimeType: 'audio/pcm;rate=16000',
                                    data: base64
                                }
                            });
                        });
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(inputCtx.destination);

                    // --- Video Streaming Setup ---
                    const interval = window.setInterval(async () => {
                        if (stopSignal.current) {
                            clearInterval(interval);
                            return;
                        }
                        if (videoRef.current && canvasRef.current) {
                            const v = videoRef.current;
                            const c = canvasRef.current;
                            const ctx = c.getContext('2d');
                            if (ctx) {
                                c.width = v.videoWidth * 0.5; // Scale down for performance
                                c.height = v.videoHeight * 0.5;
                                ctx.drawImage(v, 0, 0, c.width, c.height);
                                const base64 = c.toDataURL('image/jpeg', 0.6).split(',')[1];
                                
                                sessionPromise.then(session => {
                                    session.sendRealtimeInput({
                                        media: {
                                            mimeType: 'image/jpeg',
                                            data: base64
                                        }
                                    });
                                });
                            }
                        }
                    }, 1000); // 1 FPS for video context
                },
                onmessage: async (msg: LiveServerMessage) => {
                    const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    if (audioData && outputCtx) {
                        const rawBytes = base64ToUint8Array(audioData);
                        
                        // Decode
                        const audioBuffer = outputCtx.createBuffer(1, rawBytes.length / 2, 24000);
                        const channelData = audioBuffer.getChannelData(0);
                        const dataInt16 = new Int16Array(rawBytes.buffer);
                        for(let i=0; i<dataInt16.length; i++) {
                            channelData[i] = dataInt16[i] / 32768.0;
                        }

                        const source = outputCtx.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputNode);
                        
                        // Scheduling
                        const currentTime = outputCtx.currentTime;
                        const startTime = Math.max(nextStartTimeRef.current, currentTime);
                        source.start(startTime);
                        nextStartTimeRef.current = startTime + audioBuffer.duration;
                        
                        sourcesRef.current.add(source);
                        source.onended = () => {
                            sourcesRef.current.delete(source);
                        };
                    }
                },
                onclose: () => {
                    setStatus("Disconnected");
                    setActive(false);
                },
                onerror: (e) => {
                    console.error(e);
                    setStatus("Error");
                    setActive(false);
                }
            }
        });
        
    } catch (e) {
        console.error(e);
        setStatus("Initialization Failed");
    }
  };

  const stopSession = () => {
    stopSignal.current = true;
    setActive(false);
    setStatus("Disconnected");
    
    // Cleanup Audio
    if (inputContextRef.current) inputContextRef.current.close();
    if (outputContextRef.current) outputContextRef.current.close();
    
    // Stop Tracks
    if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(t => t.stop());
    }
    
    window.location.reload(); 
  };

  return (
    <div className="h-full flex flex-col p-6 max-w-5xl mx-auto items-center">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 text-white">Live War Room</h2>
            <p className="text-zinc-400">Real-time multimodal decision support. Notstudio OS Active.</p>
        </div>

        <div className="relative w-full max-w-2xl bg-black rounded-2xl overflow-hidden border border-zinc-800 aspect-video shadow-2xl">
            <video ref={videoRef} className="w-full h-full object-cover opacity-80" muted />
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs font-mono border border-zinc-700">
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${active ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                {status}
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {!active && status !== "Connecting..." && (
                    <div className="text-zinc-500 font-mono">Camera Feed Standby</div>
                )}
            </div>
        </div>

        <div className="mt-8 flex gap-4">
            {!active ? (
                <button 
                    onClick={startSession}
                    className="bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-zinc-200 transition-transform hover:scale-105"
                >
                    Enter War Room
                </button>
            ) : (
                <button 
                    onClick={stopSession}
                    className="bg-red-600 text-white px-8 py-4 rounded-full font-bold hover:bg-red-700 transition-transform hover:scale-105"
                >
                    End Session
                </button>
            )}
        </div>
        
        <div className="mt-8 text-sm text-zinc-500 max-w-lg text-center">
            Uses <span className="text-zinc-300">gemini-2.5-flash-native-audio</span>. 
            Ensure your microphone and camera permissions are granted.
        </div>
    </div>
  );
};

export default LiveView;