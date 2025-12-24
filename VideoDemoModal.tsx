import React, { useState, useEffect } from 'react';
import { X, Loader2, Play, Sparkles, AlertCircle, CheckCircle2, Clapperboard, MonitorPlay } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface VideoDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VideoDemoModal: React.FC<VideoDemoModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<'idle' | 'checking_key' | 'generating' | 'fetching' | 'ready' | 'error'>('idle');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('Initializing AI Video Core...');

  const loadingMessages = [
    "Contacting Gemini Veo 3.1 Clusters...",
    "Synthesizing visual grocery aisles...",
    "Rendering autonomous retail robotics...",
    "Mapping holographic stock data...",
    "Simulating fresh produce lighting...",
    "Encoding cinematic retail demo...",
    "Finalizing 4K retail assets..."
  ];

  useEffect(() => {
    let messageIdx = 0;
    let interval: any;
    if (status === 'generating') {
      interval = setInterval(() => {
        messageIdx = (messageIdx + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIdx]);
      }, 8000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const handleStartGeneration = async () => {
    setStatus('checking_key');
    try {
      // Step 1: Check for API Key (Mandatory for Veo)
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
        // Assume success after dialog trigger per guidelines
      }

      setStatus('generating');
      setError(null);

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Step 2: Request Video Generation
      let operation = await (ai as any).models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: 'A cinematic, high-speed fly-through of a high-end modern grocery store. Vibrant organic produce aisles with glowing digital price tags, sleek wooden shelves, autonomous floor cleaning robots, hyper-realistic lighting, 4k resolution, clean and fresh retail aesthetic.',
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      // Step 3: Poll for Completion
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await (ai as any).operations.getVideosOperation({ operation: operation });
      }

      // Step 4: Fetch Video Bytes
      setStatus('fetching');
      setLoadingMessage("Downloading high-fidelity reel...");
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      
      if (!downloadLink) throw new Error("Video generation failed - no URI returned.");

      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      if (!response.ok) {
        if (response.status === 404) {
           setStatus('idle');
           await (window as any).aistudio.openSelectKey();
           return;
        }
        throw new Error("Failed to download video stream.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setStatus('ready');

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during generation.");
      setStatus('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
      <div className="relative bg-slate-900 w-full max-w-4xl rounded-[40px] overflow-hidden border border-slate-800 shadow-2xl flex flex-col aspect-video">
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
          {status === 'idle' && (
            <div className="space-y-8 animate-in fade-in zoom-in duration-500">
               <div className="w-24 h-24 bg-indigo-600/20 rounded-[32px] flex items-center justify-center mx-auto border border-indigo-500/30">
                  <Clapperboard className="h-10 w-10 text-indigo-400" />
               </div>
               <div>
                  <h2 className="text-3xl font-black text-white tracking-tight">Generate Retail Demo Reel</h2>
                  <p className="text-slate-400 mt-4 max-w-md mx-auto text-lg leading-relaxed">
                    Experience OptiStock in a retail environment. We'll use <b>Veo 3.1</b> to synthesize a custom cinematic visualization of your grocery supply chain.
                  </p>
                  <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-amber-400 bg-amber-400/10 px-4 py-2 rounded-full w-fit mx-auto border border-amber-400/20">
                     <AlertCircle className="h-3.5 w-3.5" /> Requires Paid Gemini API Key
                  </div>
               </div>
               <button 
                onClick={handleStartGeneration}
                className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition shadow-2xl shadow-indigo-500/20 flex items-center gap-3 mx-auto"
               >
                  <Sparkles className="h-5 w-5" /> Start AI Synthesis
               </button>
               <p className="text-slate-500 text-xs font-medium italic">Estimated generation time: 60-120 seconds.</p>
            </div>
          )}

          {(status === 'generating' || status === 'fetching' || status === 'checking_key') && (
            <div className="space-y-8 flex flex-col items-center animate-in fade-in duration-500">
               <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                  <Loader2 className="h-16 w-16 text-indigo-500 animate-spin relative z-10" />
               </div>
               <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white tracking-tight">{loadingMessage}</h3>
                  <div className="flex items-center gap-2 justify-center">
                     <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></span>
                     <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                     <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
               </div>
               <div className="max-w-xs w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 animate-shimmer" style={{ width: '100%', background: 'linear-gradient(90deg, transparent, #6366f1, transparent)', backgroundSize: '200% 100%' }}></div>
               </div>
            </div>
          )}

          {status === 'ready' && videoUrl && (
            <div className="w-full h-full flex flex-col animate-in fade-in duration-1000">
               <video 
                src={videoUrl} 
                className="w-full h-full object-cover" 
                controls 
                autoPlay 
                loop 
                playsInline
               />
               <div className="absolute bottom-10 left-10 flex items-center gap-3 bg-black/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <span className="text-white font-black text-sm uppercase tracking-widest">Retail Optimization Demo</span>
               </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6 animate-in zoom-in duration-300">
               <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto border border-rose-500/30">
                  <AlertCircle className="h-10 w-10 text-rose-500" />
               </div>
               <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white">Generation Halted</h3>
                  <p className="text-rose-400/80 font-medium max-w-sm mx-auto">{error}</p>
               </div>
               <div className="flex gap-4 justify-center">
                  <button 
                    onClick={handleStartGeneration}
                    className="px-8 py-4 bg-white text-slate-900 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-100 transition"
                  >
                    Retry Synthesis
                  </button>
                  <button 
                    onClick={onClose}
                    className="px-8 py-4 bg-slate-800 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-700 transition"
                  >
                    Close
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};