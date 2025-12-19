import React, { useState, useRef } from 'react';
import { generateImage, editImage, generateVideo, generateAgencyText, generateDesignDraft, refineDesign } from '../services/geminiService';

const CreativeView: React.FC = () => {
  const [subMode, setSubMode] = useState<'direction' | 'gen' | 'edit' | 'video' | 'design'>('direction');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultMedia, setResultMedia] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [directionOutput, setDirectionOutput] = useState('');
  
  // Refinement State
  const [isRefining, setIsRefining] = useState(false);
  
  // Image Configs
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imgSize, setImgSize] = useState('1K');
  
  // Image Edit / Design
  const productInputRef = useRef<HTMLInputElement>(null);
  const refInputRef = useRef<HTMLInputElement>(null);

  const [productBase64, setProductBase64] = useState<string | null>(null);
  const [productMime, setProductMime] = useState<string>('');
  
  const [refBase64, setRefBase64] = useState<string | null>(null);
  const [refMime, setRefMime] = useState<string>('');

  // Re-used for generic Edit
  const [editBase64, setEditBase64] = useState<string | null>(null);
  const [editMime, setEditMime] = useState<string>('');
  const editInputRef = useRef<HTMLInputElement>(null);


  const handleGenericFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditMime(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setEditBase64(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductMime(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setProductBase64(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRefFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRefMime(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setRefBase64(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRefine = () => {
      if (resultMedia.length > 0) {
          const src = resultMedia[0];
          const [header, base64] = src.split(',');
          const mime = header.match(/:(.*?);/)?.[1] || 'image/png';
          
          // Use the previous result as the new base for refinement
          setProductBase64(base64);
          setProductMime(mime);
          
          setResultMedia([]); 
          setDirectionOutput('');
          setIsRefining(true);
          
          setPrompt(`- Improve lighting on the product
- Make the background darker
- Increase depth and contrast
- Adjust camera angle slightly
- Clean the edges`);
      }
  };

  const handleCancelRefinement = () => {
      setIsRefining(false);
      setPrompt('');
      setProductBase64(null); // Clear the 'generated' product base
      if (productInputRef.current) productInputRef.current.value = '';
  };

  const handleGenerate = async () => {
    setLoading(true);
    setResultMedia([]);
    setVideoUrl(null);
    if (subMode !== 'design') setDirectionOutput(''); 
    
    try {
      if (subMode === 'direction') {
          setDirectionOutput('');
          const res = await generateAgencyText(prompt, 'VISUAL_DIR');
          setDirectionOutput(res.text || 'No direction generated.');
      } else if (subMode === 'gen') {
        const images = await generateImage(prompt, aspectRatio, imgSize);
        setResultMedia(images);
      } else if (subMode === 'edit' && editBase64) {
        const images = await editImage(prompt, editBase64, editMime);
        setResultMedia(images);
      } else if (subMode === 'design' && productBase64) {
        setDirectionOutput('');
        
        if (isRefining) {
             // Use Refinement Service
             const res = await refineDesign(prompt, { data: productBase64, mimeType: productMime });
             setResultMedia(res.images);
             setDirectionOutput(res.text);
        } else {
            // Standard Design Draft Service
            const inputs: { type: 'product' | 'reference'; data: string; mimeType: string }[] = [
                { type: 'product', data: productBase64, mimeType: productMime }
            ];
            if (refBase64) {
                inputs.push({ type: 'reference', data: refBase64, mimeType: refMime });
            }

            const res = await generateDesignDraft(prompt, inputs);
            setResultMedia(res.images);
            setDirectionOutput(res.text);
        }

      } else if (subMode === 'video') {
        const url = await generateVideo(prompt, aspectRatio === '1:1' ? '16:9' : aspectRatio); 
        setVideoUrl(url);
      }
    } catch (e) {
      alert(`Error: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2 text-white">Creative Lab</h2>
        <p className="text-zinc-400">Establish visual direction, generate high-fidelity assets, and produce video concepts.</p>
      </div>

      <div className="flex border-b border-zinc-800 mb-6 overflow-x-auto">
        {[
            { id: 'direction', label: 'Visual Direction' },
            { id: 'gen', label: 'Generate Concept' },
            { id: 'design', label: 'Design Execution' },
            { id: 'edit', label: 'Edit Asset' },
            { id: 'video', label: 'Video Storyboard' }
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => { 
                setSubMode(m.id as any); 
                setResultMedia([]); 
                setVideoUrl(null); 
                setDirectionOutput(''); 
                setIsRefining(false);
            }}
            className={`px-6 py-3 font-medium capitalize border-b-2 transition-colors whitespace-nowrap ${
              subMode === m.id ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-4">
          
          {subMode === 'direction' && (
              <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 text-sm text-zinc-400">
                  <p className="mb-2"><strong className="text-white">Role:</strong> Creative Director</p>
                  <p>Input the Creative Bridge framework to receive a detailed visual brief, color direction, and mood guidelines.</p>
              </div>
          )}
          
          {subMode === 'design' && (
              <div className={`p-4 rounded-xl border text-sm transition-colors ${isRefining ? 'bg-indigo-900/20 border-indigo-500/50' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>
                  {isRefining ? (
                      <>
                        <p className="mb-2 text-indigo-400 font-bold uppercase tracking-wide">Refinement Mode Active</p>
                        <p className="text-zinc-300 mb-4">You are refining a previous generation. The AI will preserve the base image and apply only your specific changes.</p>
                        <button onClick={handleCancelRefinement} className="text-xs text-white underline">Cancel Refinement</button>
                      </>
                  ) : (
                      <>
                        <p className="mb-2"><strong className="text-white">Role:</strong> AI Design Assistant</p>
                        <p>Upload a product image and an optional style reference. The assistant will combine them based on your instructions.</p>
                      </>
                  )}
              </div>
          )}

          {subMode === 'edit' && (
             <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
                <label className="block text-sm font-medium text-zinc-400 mb-2">Upload Source Image</label>
                <input 
                    type="file" 
                    ref={editInputRef} 
                    onChange={handleGenericFileChange} 
                    accept="image/*"
                    className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700"
                />
                {editBase64 && (
                    <div className="mt-4">
                        <img 
                            src={`data:${editMime};base64,${editBase64}`} 
                            alt="Input Preview" 
                            className="w-full h-32 object-cover rounded-lg border border-zinc-700"
                        />
                    </div>
                )}
             </div>
          )}

          {subMode === 'design' && !isRefining && (
             <div className="space-y-4">
                 {/* Product Input */}
                 <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
                    <label className="block text-sm font-medium text-zinc-200 mb-2">1. Product Image (Required)</label>
                    <input 
                        type="file" 
                        ref={productInputRef} 
                        onChange={handleProductFileChange} 
                        accept="image/*"
                        className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700"
                    />
                    {productBase64 && (
                        <div className="mt-4">
                            <img 
                                src={`data:${productMime};base64,${productBase64}`} 
                                alt="Product Preview" 
                                className="w-full h-24 object-cover rounded-lg border border-zinc-700"
                            />
                        </div>
                    )}
                 </div>

                 {/* Reference Input */}
                 <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
                    <label className="block text-sm font-medium text-zinc-200 mb-2">2. Reference Style (Optional)</label>
                    <input 
                        type="file" 
                        ref={refInputRef} 
                        onChange={handleRefFileChange} 
                        accept="image/*"
                        className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700"
                    />
                    {refBase64 && (
                        <div className="mt-4">
                            <img 
                                src={`data:${refMime};base64,${refBase64}`} 
                                alt="Ref Preview" 
                                className="w-full h-24 object-cover rounded-lg border border-zinc-700"
                            />
                        </div>
                    )}
                 </div>
             </div>
          )}
          
          {subMode === 'design' && isRefining && productBase64 && (
               <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
                    <label className="block text-sm font-medium text-zinc-200 mb-2">Base Image (Being Refined)</label>
                    <div className="mt-4">
                        <img 
                            src={`data:${productMime};base64,${productBase64}`} 
                            alt="Base for Refinement" 
                            className="w-full h-32 object-cover rounded-lg border border-zinc-700 opacity-75"
                        />
                    </div>
               </div>
          )}

          {(subMode === 'gen' || subMode === 'video') && (
            <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
                <label className="block text-sm font-medium text-zinc-400 mb-2">Aspect Ratio</label>
                <select 
                    value={aspectRatio} 
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-2 text-white"
                >
                    {subMode === 'video' ? (
                        <>
                            <option value="16:9">16:9 (Landscape)</option>
                            <option value="9:16">9:16 (Portrait)</option>
                        </>
                    ) : (
                        <>
                            <option value="1:1">1:1 (Square)</option>
                            <option value="16:9">16:9 (Landscape)</option>
                            <option value="9:16">9:16 (Portrait)</option>
                            <option value="3:4">3:4</option>
                            <option value="4:3">4:3</option>
                        </>
                    )}
                </select>
            </div>
          )}

          {subMode === 'gen' && (
             <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
                <label className="block text-sm font-medium text-zinc-400 mb-2">Quality / Size</label>
                <select 
                    value={imgSize} 
                    onChange={(e) => setImgSize(e.target.value)}
                    className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-2 text-white"
                >
                    <option value="1K">1K (Standard)</option>
                    <option value="2K">2K (High Res)</option>
                    <option value="4K">4K (Ultra)</option>
                </select>
             </div>
          )}
        </div>

        {/* Input & Output */}
        <div className="lg:col-span-2 flex flex-col gap-4">
            <textarea
                className={`w-full bg-zinc-900 border rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20 min-h-[120px] ${isRefining ? 'border-indigo-500/50' : 'border-zinc-700'}`}
                placeholder={
                    subMode === 'direction' ? "Paste Creative Bridge framework here..." :
                    subMode === 'gen' ? "A futuristic brutalist office with neon accents..." :
                    subMode === 'edit' ? "Add a red skateboard to the robot..." :
                    isRefining ? "List specific changes (e.g. 'Make the lighting warmer', 'Crop in closer')..." :
                    subMode === 'design' ? "Describe design objective, platform (e.g. Instagram), and brand details..." :
                    "A neon hologram of a cat driving at top speed..."
                }
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
            />
            
            <div className="flex justify-end">
                <button
                    onClick={handleGenerate}
                    disabled={loading || !prompt || (subMode === 'edit' && !editBase64) || (subMode === 'design' && !productBase64)}
                    className={`px-8 py-3 rounded-lg font-bold disabled:opacity-50 transition-colors ${
                        isRefining 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-500' 
                        : 'bg-white text-black hover:bg-zinc-200'
                    }`}
                >
                    {loading ? (subMode === 'direction' ? 'Thinking...' : 'Processing...') : (
                        subMode === 'direction' ? 'Generate Brief' : 
                        isRefining ? 'Refine Asset' : 'Generate Asset'
                    )}
                </button>
            </div>

            {/* Output Display Logic */}
            
            {/* Visual Direction Mode: Text Only */}
            {subMode === 'direction' && (directionOutput || loading) && (
                <div className="mt-4 p-6 bg-zinc-900 rounded-xl border border-zinc-800 min-h-[300px]">
                    {loading ? (
                        <div className="animate-pulse text-zinc-500">Notstudio Creative Director is drafting the brief...</div>
                    ) : (
                        <div className="prose prose-invert max-w-none whitespace-pre-wrap font-mono text-sm leading-relaxed">
                            {directionOutput}
                        </div>
                    )}
                </div>
            )}

            {/* Design Draft Mode: Text + Image */}
            {subMode === 'design' && (
                 <div className="flex flex-col gap-4">
                    {(resultMedia.length > 0 || loading) && (
                        <div className="mt-4 min-h-[300px] bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800 flex flex-col items-center justify-center p-4">
                            {loading ? (
                                <div className="text-zinc-500 animate-pulse">Designing draft...</div>
                            ) : resultMedia.length > 0 ? (
                                <div className="flex flex-col gap-4 w-full">
                                    <div className="grid grid-cols-1 gap-4 w-full">
                                        {resultMedia.map((src, i) => (
                                            <img key={i} src={src} alt="Design Draft" className="w-full h-auto rounded-lg shadow-xl" />
                                        ))}
                                    </div>
                                    <button 
                                        onClick={handleRefine}
                                        className="self-end bg-zinc-800 text-white border border-zinc-700 px-6 py-2 rounded-lg font-medium hover:bg-zinc-700 transition-colors flex items-center gap-2"
                                    >
                                        <span className="material-icons text-sm">auto_fix_high</span>
                                        Refine this Design
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    )}
                    {directionOutput && (
                        <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800">
                             <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Design Notes</h4>
                             <div className="prose prose-invert max-w-none whitespace-pre-wrap font-mono text-sm leading-relaxed">
                                {directionOutput}
                             </div>
                        </div>
                    )}
                 </div>
            )}

            {/* Other Modes (Gen, Edit, Video): Image/Video Only */}
            {subMode !== 'direction' && subMode !== 'design' && (
                <div className="mt-4 min-h-[300px] bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800 flex items-center justify-center p-4">
                    {loading ? (
                        <div className="text-zinc-500 animate-pulse">Rendering media... This may take a moment.</div>
                    ) : resultMedia.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 w-full">
                            {resultMedia.map((src, i) => (
                                <img key={i} src={src} alt="Generated" className="w-full h-auto rounded-lg shadow-xl" />
                            ))}
                        </div>
                    ) : videoUrl ? (
                        <video controls src={videoUrl} className="w-full rounded-lg shadow-xl" autoPlay loop />
                    ) : (
                        <div className="text-zinc-600">Assets will appear here.</div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default CreativeView;