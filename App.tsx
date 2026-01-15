import React from 'react';
import Header from './components/Header';
import Converter from './components/Converter';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-500/30">
      <Header />
      
      <main className="flex-grow relative">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none"></div>
        
        <Converter />
        
        <div className="fixed bottom-4 right-6 pointer-events-none opacity-20 select-none hidden md:block">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
            Made by Wizkna Open-Source
          </p>
        </div>
      </main>

      <footer className="py-12 px-6 border-t border-white/5 bg-slate-950/20">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-sm text-slate-400 font-medium">
              Made by Wizkna Open-Source EXE To PS1 Converter
            </p>
            <p className="text-xs text-slate-600 mt-1">Files processed locally.</p>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
            <a 
              href="https://github.com/wizknafed/EXE2PS1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-white transition-colors"
            >
              Source
            </a>
            <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
            <span className="text-indigo-500/50">v2.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;