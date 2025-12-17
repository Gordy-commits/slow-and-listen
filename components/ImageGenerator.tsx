import React, { useState } from 'react';
import { Image as ImageIcon, Loader2, Wand2, Lock, AlertCircle } from 'lucide-react';
import { ImageSize } from '../types';
import { generateExhibitionImage } from '../services/geminiService';

export const ImageGenerator: React.FC = () => {
  const [hasKey, setHasKey] = useState(false);
  const [checkingKey, setCheckingKey] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<ImageSize>('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkKey = async () => {
    setCheckingKey(true);
    try {
      if ((window as any).aistudio) {
        const selected = await (window as any).aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    } catch (e) {
      console.error("Error checking key", e);
    } finally {
      setCheckingKey(false);
    }
  };

  const handleConnect = async () => {
    if ((window as any).aistudio) {
      try {
        await (window as any).aistudio.openSelectKey();
        setHasKey(true); // Assume success per instructions
        setError(null);
      } catch (e) {
        console.error("Error selecting key", e);
        setError("Failed to select API key.");
      }
    } else {
      setError("AI Studio environment not detected.");
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    try {
      const imgData = await generateExhibitionImage(prompt, size);
      if (imgData) {
        setGeneratedImage(imgData);
      } else {
        setError("No image generated.");
      }
    } catch (e: any) {
      if (e.message && e.message.includes('Requested entity was not found')) {
         setHasKey(false);
         setError("API Key session expired or invalid. Please reconnect.");
      } else {
         setError("Failed to generate image. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Initial check
  React.useEffect(() => {
    checkKey();
  }, []);

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl border border-warm-100 overflow-hidden">
      <div className="p-6 bg-warm-100/50 border-b border-warm-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-warm-200 rounded-lg text-warm-800">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-warm-900 text-lg">Visual Resonance</h3>
            <p className="text-xs text-warm-500 font-sans">Generate abstract art based on your feelings</p>
          </div>
        </div>
        {!hasKey && (
          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
            <Lock className="w-3 h-3" />
            <span>Premium Feature</span>
          </div>
        )}
      </div>

      <div className="p-6">
        {!hasKey ? (
          <div className="text-center py-10 px-4">
            <div className="mb-4 inline-block p-4 bg-warm-50 rounded-full">
              <Wand2 className="w-8 h-8 text-warm-400" />
            </div>
            <h4 className="font-serif text-xl font-bold text-warm-800 mb-2">Unlock Creation Studio</h4>
            <p className="font-sans text-warm-600 text-sm mb-6 max-w-sm mx-auto">
              Connect your Google Cloud project to generate high-resolution conceptual art using Gemini 3 Pro.
            </p>
            <button
              onClick={handleConnect}
              disabled={checkingKey}
              className="px-6 py-3 bg-warm-800 text-white font-sans font-bold rounded-full hover:bg-warm-900 transition-colors shadow-lg shadow-warm-800/20"
            >
              {checkingKey ? 'Checking...' : 'Select API Key to Start'}
            </button>
            <div className="mt-4">
               <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-xs text-warm-400 hover:underline">Read Billing Documentation</a>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-warm-700 mb-2 font-sans">What do you visualize?</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., A calm lake at dawn, reflecting the sound of a cello..."
                className="w-full h-24 p-4 bg-warm-50 border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-warm-300 font-sans text-sm resize-none text-warm-800 placeholder:text-warm-300"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-warm-700 mb-2 font-sans">Resolution</label>
              <div className="flex gap-2">
                {(['1K', '2K', '4K'] as ImageSize[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold font-sans transition-all ${
                      size === s 
                        ? 'bg-warm-800 text-white shadow-md' 
                        : 'bg-white border border-warm-200 text-warm-600 hover:bg-warm-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {error && (
               <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                  {error.includes('expired') && (
                     <button onClick={handleConnect} className="underline font-bold ml-1">Reconnect</button>
                  )}
               </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-4 bg-warm-800 text-white font-bold rounded-xl hover:bg-warm-900 transition-colors shadow-lg shadow-warm-800/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Art...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  Generate Artwork
                </>
              )}
            </button>

            {generatedImage && (
              <div className="mt-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-2xl border-4 border-white">
                  <img src={generatedImage} alt="Generated Art" className="w-full h-full object-cover" />
                </div>
                <p className="text-center text-xs text-warm-400 mt-2 italic font-serif">Generated with Gemini 3 Pro Image Preview</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};