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
      await new Promise(r => setTimeout(r, 600));
      
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
    <div className="max-w-3xl mx-auto py-16 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
          Drop. <span className="text-indigo-500">Convert.</span> Run.
        </h2>
        <p className="text-slate-400 text-lg">
          Zero-installation binary to PowerShell script conversion.
        </p>
      </motion.div>

      <motion.div
        layout
        className={`relative group glass rounded-[2rem] border-2 transition-all duration-500 overflow-hidden
          ${dragging ? 'border-indigo-500 ring-4 ring-indigo-500/10 scale-[1.01]' : 'border-white/5 hover:border-white/10'}`}
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
        
        <div className="p-12 md:p-20 text-center flex flex-col items-center justify-center cursor-pointer">
          <div className="mb-6 relative">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500
              ${dragging ? 'bg-indigo-500 text-white shadow-2xl shadow-indigo-500/40 rotate-6' : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'}`}>
               <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
               </svg>
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-slate-200 mb-2">
            {busy ? "Encoding..." : "Choose an executable"}
          </h3>
          <p className="text-slate-500 font-medium">or drag & drop here</p>
        </div>

        {busy && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center"
          >
            <div className="relative w-12 h-12 mb-4">
              <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-white font-bold tracking-widest text-xs animate-pulse">PROCESSING</p>
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {err && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-medium"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {err}
          </motion.div>
        )}

        {res && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 space-y-6"
          >
            <div className="glass rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                 <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-white mb-1 truncate max-w-[200px] md:max-w-xs">{res.fileName}.ps1</h3>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                       <span className="font-mono">{formatBytes(res.originalSize)}</span>
                       <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                       <span>Ready</span>
                    </div>
                 </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                 <button 
                   onClick={doCopy}
                   className={`flex-1 md:flex-none px-6 py-3 rounded-xl transition-all duration-300 font-bold text-sm flex items-center justify-center gap-2
                     ${didCopy ? 'bg-green-500 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
                 >
                   {didCopy ? "Copied" : "Copy"}
                 </button>
                 <button 
                   onClick={doDownload}
                   className="flex-1 md:flex-none px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all duration-300 font-bold text-sm shadow-xl shadow-indigo-600/20"
                 >
                   Download
                 </button>
              </div>
            </div>

            <div className="glass rounded-[2rem] overflow-hidden border border-white/5">
              <div className="bg-white/5 px-8 py-3 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Preview (Truncated)</span>
              </div>
              <div className="p-8 bg-slate-950/40">
                <pre className="code-font text-xs leading-relaxed text-indigo-300/60 whitespace-pre overflow-hidden">
                  {res.ps1Code.split('\n').slice(0, 10).join('\n')}
                  {"\n"}[...] Payload Hidden to Prevent Lag
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Converter;
