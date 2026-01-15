import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fileToBase64, generatePowerShellScript, formatBytes } from '../utils/converter';
import { ConversionResult } from '../types';

const Converter: React.FC = () => {
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<ConversionResult | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [didCopy, setDidCopy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.exe')) {
      if (!confirm("Proceed with non-EXE file?")) return;
    }

    setBusy(true);
    setErr(null);
    setRes(null);
    try {
      await new Promise(r => setTimeout(r, 1200)); // Sustained feel
      const b64 = await fileToBase64(file);
      const code = generatePowerShellScript(file.name, b64);
      setRes({
        fileName: file.name,
        originalSize: file.size,
        ps1Code: code,
        timestamp: Date.now()
      });
    } catch (e) {
      setErr("Process failed. File might be too large.");
    } finally {
      setBusy(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const doCopy = () => {
    if (res) {
      navigator.clipboard.writeText(res.ps1Code);
      setDidCopy(true);
      setTimeout(() => setDidCopy(false), 2000);
    }
  };

  const doDownload = () => {
    if (res) {
      const blob = new Blob([res.ps1Code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${res.fileName}.ps1`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-[#050506] text-slate-300 font-sans selection:bg-indigo-500/30">
      <style>{`
        .monolith-brushed {
          background: linear-gradient(135deg, #111114 0%, #09090b 100%);
          position: relative;
          overflow: hidden;
        }
        .monolith-brushed::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 1px,
            rgba(255,255,255,0.015) 1px,
            rgba(255,255,255,0.015) 2px
          );
          pointer-events: none;
        }
        .tectonic-edge {
          box-shadow: 
            0 -1px 0 0 rgba(255,255,255,0.05),
            0 1px 0 0 rgba(0,0,0,0.8),
            inset 0 1px 1px 0 rgba(255,255,255,0.05);
        }
        .scanner-line {
          height: 2px;
          background: linear-gradient(90deg, transparent, #6366f1, transparent);
          width: 100%;
          position: absolute;
          z-index: 30;
          top: 0;
          animation: scan 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(400px); opacity: 0; }
        }
        .code-font { font-family: 'JetBrains Mono', 'Fira Code', monospace; }
      `}</style>

      <div className="max-w-4xl mx-auto py-24 px-6 relative">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-20 text-center"
        >
          <div className="inline-block px-3 py-1 mb-6 rounded-full border border-white/5 bg-white/5 text-[10px] font-bold tracking-[0.2em] uppercase text-indigo-400">
            Secure Binary Obfuscation
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter italic">
            BINARY<span className="text-indigo-500">.</span>PS1
          </h1>
          <p className="text-slate-500 text-xl max-w-xl mx-auto font-light leading-relaxed">
            Encapsulate executables into portable PowerShell scripts with tectonic-grade reliability.
          </p>
        </motion.div>

        {/* Interaction Zone */}
        <motion.div
          layout
          className={`monolith-brushed tectonic-edge rounded-sm transition-all duration-700 ease-out 
            ${dragging ? 'scale-[1.02] ring-1 ring-indigo-500/50' : 'scale-100 ring-1 ring-white/5'}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={inputRef} 
            className="hidden" 
            onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
            accept=".exe"
          />
          
          <div className="relative h-[400px] flex flex-col items-center justify-center cursor-pointer group">
            {busy && <div className="scanner-line" />}
            
            {/* Visual Centerpiece */}
            <div className="relative mb-8">
               <motion.div 
                animate={dragging ? { rotate: 180, scale: 1.1 } : { rotate: 0, scale: 1 }}
                className="w-24 h-24 border border-white/10 flex items-center justify-center bg-black/40 backdrop-blur-xl relative z-10"
               >
                 <svg className={`w-8 h-8 transition-colors duration-500 ${busy ? 'text-indigo-500 animate-pulse' : 'text-slate-400 group-hover:text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1} d="M12 4v16m8-8H4" />
                 </svg>
               </motion.div>
               {/* Decorative corners */}
               <div className="absolute -top-2 -left-2 w-4 h-4 border-t border-l border-indigo-500/50" />
               <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b border-r border-indigo-500/50" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-sm font-bold tracking-[0.3em] uppercase text-white">
                {busy ? "Analyzing Structure" : "Initialize Transfer"}
              </h3>
              <p className="text-xs text-slate-600 uppercase tracking-widest font-medium">
                {busy ? "Encoding Stream..." : "Drop Executable or Click to Browse"}
              </p>
            </div>

            {/* Background Texture Logic */}
            <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
               <div className="absolute top-0 left-0 p-4 text-[8px] font-mono text-indigo-500 uppercase tracking-tight">System.Ready</div>
               <div className="absolute bottom-0 right-0 p-4 text-[8px] font-mono text-indigo-500 uppercase tracking-tight line-through opacity-50">Log_Null</div>
            </div>
          </div>

          <AnimatePresence>
            {busy && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-20 flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="flex gap-1 mb-4 justify-center">
                    {[0, 1, 2].map(i => (
                      <motion.div 
                        key={i}
                        animate={{ height: [8, 24, 8] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                        className="w-1 bg-indigo-500"
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold tracking-[0.4em] text-white uppercase">Processing Data</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Feedback Messages */}
        <AnimatePresence mode="wait">
          {err && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="mt-8 p-5 bg-red-950/20 border-l-2 border-red-500 text-red-400 text-xs font-bold uppercase tracking-widest flex items-center gap-4"
            >
              <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
              {err}
            </motion.div>
          )}

          {res && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 space-y-4"
            >
              {/* Result Slab */}
              <div className="monolith-brushed tectonic-edge p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-white/5 border border-white/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="square" strokeWidth={1.5} d="M9 12l2 2 4-4" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold text-white tracking-tight truncate max-w-[240px]">
                      {res.fileName}.ps1
                    </h4>
                    <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold text-slate-500">
                      <span>{formatBytes(res.originalSize)}</span>
                      <span className="text-indigo-900">|</span>
                      <span className="text-indigo-400">Status: Encoded</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <button 
                    onClick={doCopy}
                    className={`flex-1 md:flex-none h-14 px-8 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300
                      ${didCopy ? 'bg-indigo-500 text-white' : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'}`}
                  >
                    {didCopy ? "Copied" : "Copy Source"}
                  </button>
                  <button 
                    onClick={doDownload}
                    className="flex-1 md:flex-none h-14 px-10 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(79,70,229,0.3)] transition-all"
                  >
                    Download
                  </button>
                </div>
              </div>

              {/* Preview Slab */}
              <div className="monolith-brushed tectonic-edge overflow-hidden border border-white/5">
                <div className="bg-white/5 px-6 py-3 border-b border-white/5 flex items-center justify-between">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Code Preview // Truncated</span>
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-white/10" />
                    <div className="w-2 h-2 rounded-full bg-white/10" />
                  </div>
                </div>
                <div className="p-8 bg-[#020203]">
                  <pre className="code-font text-[11px] leading-relaxed text-indigo-300/40 whitespace-pre overflow-hidden italic">
                    {res.ps1Code.split('\n').slice(0, 8).join('\n')}
                    {"\n"}...
                    {"\n"}# [PAYLOAD SEALED FOR PERFORMANCE]
                  </pre>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Structural Decoration */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
    </div>
  );
};

export default Converter;

