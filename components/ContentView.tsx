import React, { useState, useRef } from 'react';
import { generateSpeech, transcribeAudio, base64ToUint8Array, arrayBufferToBase64, generateAgencyText } from '../services/geminiService';

const ContentView: React.FC = () => {
  const [tab, setTab] = useState<'copy' | 'tts' | 'transcribe'>('copy');
  
  // Copywriting
  const [copyPrompt, setCopyPrompt] = useState('');
  const [copyOutput, setCopyOutput] = useState('');
  
  // TTS
  const [ttsText, setTtsText] = useState('');
  const [loading, setLoading] = useState(false);

  // Transcribe
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [transcription, setTranscription] = useState('');

  const handleCopyWrite = async () => {
    if (!copyPrompt) return;
    setLoading(true);
    setCopyOutput('');
    try {
        const res = await generateAgencyText(copyPrompt, 'CONTENT', {});
        setCopyOutput(res.text || 'No content generated.');
    } catch(e) {
        setCopyOutput(`Error: ${(e as Error).message}`);
    } finally {
        setLoading(false);
    }
  };

  const handleTTS = async () => {
    if (!ttsText) return;
    setLoading(true);
    try {
        const base64 = await generateSpeech(ttsText);
        const byteArray = base64ToUint8Array(base64);
        playPCM(byteArray);
    } catch (e) {
        alert((e as Error).message);
    } finally {
        setLoading(false);
    }
  };

  const playPCM = async (pcmData: Uint8Array) => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
    const buffer = audioCtx.createBuffer(1, pcmData.length / 2, 24000);
    const channelData = buffer.getChannelData(0);
    
    // Convert Int16 (from standard PCM16) to Float32
    const int16Data = new Int16Array(pcmData.buffer);
    for (let i = 0; i < int16Data.length; i++) {
        channelData[i] = int16Data[i] / 32768.0;
    }

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start();
  };

  const startRecording = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaRecorderRef.current = new MediaRecorder(stream);
          chunksRef.current = [];
          
          mediaRecorderRef.current.ondataavailable = (e) => {
              if (e.data.size > 0) chunksRef.current.push(e.data);
          };

          mediaRecorderRef.current.onstop = async () => {
              const blob = new Blob(chunksRef.current, { type: 'audio/webm' }); // Use webm for upload
              const buffer = await blob.arrayBuffer();
              const base64 = arrayBufferToBase64(buffer);
              
              setLoading(true);
              try {
                  const result = await transcribeAudio(base64, 'audio/webm');
                  setTranscription(result || "No speech detected.");
              } catch (e) {
                  setTranscription(`Error: ${(e as Error).message}`);
              } finally {
                  setLoading(false);
              }
          };

          mediaRecorderRef.current.start();
          setIsRecording(true);
      } catch (e) {
          alert("Microphone access denied");
      }
  };

  const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
      }
  };

  return (
    <div className="h-full flex flex-col p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2 text-white">Content Studio</h2>
        <p className="text-zinc-400">Copywriting, Voice Synthesis, and Transcription.</p>
      </div>

      <div className="flex gap-4 mb-8">
        <button onClick={() => setTab('copy')} className={`flex-1 py-4 rounded-xl border font-bold transition-all ${tab === 'copy' ? 'border-white bg-zinc-900 text-white' : 'border-zinc-800 text-zinc-500 hover:bg-zinc-900'}`}>
            Copywriting
        </button>
        <button onClick={() => setTab('tts')} className={`flex-1 py-4 rounded-xl border font-bold transition-all ${tab === 'tts' ? 'border-white bg-zinc-900 text-white' : 'border-zinc-800 text-zinc-500 hover:bg-zinc-900'}`}>
            Text to Speech
        </button>
        <button onClick={() => setTab('transcribe')} className={`flex-1 py-4 rounded-xl border font-bold transition-all ${tab === 'transcribe' ? 'border-white bg-zinc-900 text-white' : 'border-zinc-800 text-zinc-500 hover:bg-zinc-900'}`}>
            Transcribe
        </button>
      </div>

      {tab === 'copy' && (
         <div className="flex-1 flex flex-col gap-4">
             <div className="flex-1 flex flex-col">
                <textarea
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20 min-h-[150px] mb-4"
                    placeholder="Paste Strategy & Creative Direction here to generate copy..."
                    value={copyPrompt}
                    onChange={(e) => setCopyPrompt(e.target.value)}
                />
                <div className="flex justify-end">
                    <button
                        onClick={handleCopyWrite}
                        disabled={loading || !copyPrompt}
                        className="bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-zinc-200 disabled:opacity-50"
                    >
                        {loading ? 'Writing...' : 'Generate Copy'}
                    </button>
                </div>
             </div>
             {copyOutput && (
                 <div className="mt-4 p-6 bg-zinc-900 rounded-xl border border-zinc-800 whitespace-pre-wrap font-mono text-sm">
                     {copyOutput}
                 </div>
             )}
         </div>
      )}

      {tab === 'tts' && (
        <div className="space-y-4">
            <textarea
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20 min-h-[150px]"
                placeholder="Enter text to synthesize..."
                value={ttsText}
                onChange={(e) => setTtsText(e.target.value)}
            />
            <div className="flex justify-end">
                <button
                    onClick={handleTTS}
                    disabled={loading || !ttsText}
                    className="bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-zinc-200 disabled:opacity-50"
                >
                    {loading ? 'Synthesizing...' : 'Generate Voice'}
                </button>
            </div>
            <p className="text-xs text-zinc-500 text-right mt-2">Plays immediately upon completion.</p>
        </div>
      )}
      
      {tab === 'transcribe' && (
        <div className="space-y-4 flex flex-col items-center justify-center bg-zinc-900/30 rounded-xl p-12 border border-zinc-800">
             <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 cursor-pointer transition-all ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-zinc-800 hover:bg-zinc-700'}`}
                  onClick={isRecording ? stopRecording : startRecording}
             >
                <span className="material-icons text-3xl text-white">{isRecording ? 'Stop' : 'Rec'}</span>
             </div>
             <p className="text-zinc-400 mb-6">{isRecording ? "Recording... tap to stop" : "Tap to record and transcribe"}</p>
             
             {loading && <p className="text-blue-400">Transcribing...</p>}
             
             {transcription && (
                 <div className="w-full bg-black p-4 rounded-lg border border-zinc-700 mt-6">
                     <p className="text-white whitespace-pre-wrap">{transcription}</p>
                 </div>
             )}
        </div>
      )}
    </div>
  );
};

export default ContentView;