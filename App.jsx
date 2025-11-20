// VERSI FINAL - 
import React, { useState } from 'react';

// IMPORT YANG BENAR
import { 
  Microscope, Upload, Scan, FlaskConical, Layers, Sun, Moon, 
  Info, CheckCircle2, AlertTriangle, Grid, Target, Component, XCircle 
} from 'lucide-react';

export default function AmbasaltApp() {
  // API Key Tertanam
  const [apiKey] = useState('AIzaSyAdnyhrhM6-L15i3gFqyxc7Po9vx28zrOQ');
  
  const [pplImage, setPplImage] = useState(null);
  const [pplBase64, setPplBase64] = useState(null);
  const [xplImage, setXplImage] = useState(null);
  const [xplBase64, setXplBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [usePointCounting, setUsePointCounting] = useState(false);

  const handlePPLUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPplImage(reader.result);
        setPplBase64(reader.result.split(',')[1]);
        setErrorMsg(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleXPLUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setXplImage(reader.result);
        setXplBase64(reader.result.split(',')[1]);
        setErrorMsg(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeThinSection = async () => {
    if (!pplImage && !xplImage) return;
    setLoading(true);
    setResult(null);
    setErrorMsg(null);

    try {
      const countingInstruction = usePointCounting 
        ? "LAKUKAN 'VIRTUAL POINT COUNTING': Bagi gambar menjadi grid imajiner. Hitung persentase mineral di setiap kotak grid untuk akurasi tinggi."
        : "Estimasi persentase mineral secara visual umum.";

      const contentParts = [
        { text: `Kamu adalah ahli petrografi senior. Gambar 1 = PPL, Gambar 2 = XPL.
                 TUGAS: 1. ${countingInstruction}. 2. Identifikasi NAMA BATUAN. 3. Identifikasi SEMUA MINERAL.
                 Kembalikan respons HANYA dalam format JSON valid (tanpa markdown): 
                 { "rockName": "...", "description": "...", "pointCountingStats": "...", "minerals": [{ "name": "...", "percentage": "...", "formula": "...", "opticalProps": { "relief": "...", "pleochroism": "...", "birefringence": "...", "extinction": "..." }, "description": "..." }] }` 
        }
      ];

      if (pplBase64) contentParts.push({ inline_data: { mime_type: "image/jpeg", data: pplBase64 } });
      if (xplBase64) contentParts.push({ inline_data: { mime_type: "image/jpeg", data: xplBase64 } });

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: contentParts }] })
      });

      const data = await response.json();
      
      if (data.error) throw new Error(data.error.message || "Gagal terhubung ke AI.");
      
      let textRaw = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textRaw) throw new Error("AI tidak memberikan respon.");
      
      textRaw = textRaw.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedResult = JSON.parse(textRaw);
      setResult(parsedResult);
    } catch (error) {
      console.error("Error:", error);
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const GridOverlay = () => (
    <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none z-20 opacity-40">
      {[...Array(16)].map((_, i) => (
        <div key={i} className="border border-amber-500/50 relative flex items-center justify-center">
            <div className="w-2 h-2 border-l border-t border-amber-300/80"></div> 
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 font-sans selection:bg-amber-900 selection:text-white">
      <nav className="border-b border-stone-800 bg-stone-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-stone-800 rounded-lg flex items-center justify-center shadow-lg border border-amber-500/30">
              <Microscope className="text-amber-100" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-wider text-stone-100 font-serif">AMBA<span className="text-amber-500">SALT</span></h1>
              <p className="text-[10px] text-stone-500 uppercase tracking-[0.2em] font-medium">Petrography AI Lab</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs bg-green-900/20 border border-green-800 text-green-400 px-3 py-1.5 rounded-full">
            <CheckCircle2 size={12} /> System Online
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-stone-400 flex items-center gap-2"><Layers size={18} className="text-amber-600" /> Meja Mikroskop</h2>
                <button onClick={() => setUsePointCounting(!usePointCounting)} className={`text-xs flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${usePointCounting ? 'bg-amber-900/40 border-amber-600 text-amber-400' : 'bg-stone-800 border-stone-700 text-stone-500'}`}>
                    <Grid size={14} /> {usePointCounting ? 'Grid On' : 'Grid Off'}
                </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="aspect-square rounded-full border-4 border-stone-800 bg-black relative overflow-hidden group">
                  {pplImage ? <img src={pplImage} className="w-full h-full object-cover scale-150" /> : <div className="flex flex-col items-center justify-center h-full text-stone-600"><Sun size={32} /><span className="text-xs">PPL</span></div>}
                  {usePointCounting && <GridOverlay />}
                  <input type="file" accept="image/*" onChange={handlePPLUpload} className="absolute inset-0 opacity-0 cursor-pointer z-30" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="aspect-square rounded-full border-4 border-stone-800 bg-black relative overflow-hidden group">
                  {xplImage ? <img src={xplImage} className="w-full h-full object-cover scale-150" /> : <div className="flex flex-col items-center justify-center h-full text-stone-600"><Moon size={32} /><span className="text-xs">XPL</span></div>}
                  {usePointCounting && <GridOverlay />}
                  <input type="file" accept="image/*" onChange={handleXPLUpload} className="absolute inset-0 opacity-0 cursor-pointer z-30" />
                </div>
              </div>
            </div>
            <div className="mt-8 flex flex-col items-center gap-4">
              <button onClick={analyzeThinSection} disabled={(!pplImage && !xplImage) || loading} className={`flex items-center gap-3 px-8 py-4 rounded-xl font-bold tracking-wider w-full justify-center ${(!pplImage && !xplImage) ? 'bg-stone-800 text-stone-600' : 'bg-gradient-to-r from-amber-600 to-yellow-600 text-stone-950 hover:scale-105'} transition-all`}>
                {loading ? 
                  <><Scan className="animate-spin" /> PROSES...</> : 
                  <>{usePointCounting ? <Grid size={20} /> : <Microscope size={20} />} ANALISIS</>
                }
              </button>
              {errorMsg && <div className="flex items-start gap-2 bg-red-900/30 border border-red-500/50 p-3 rounded-lg w-full"><XCircle className="text-red-400 shrink-0" size={18} /><div className="text-xs text-red-200">{errorMsg}</div></div>}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl min-h-[600px] flex flex-col relative overflow-hidden shadow-xl">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex justify-between items-center"><span className="text-xs font-mono text-amber-600 flex items-center gap-2"><FlaskConical size={14} /> LAB_RESULT_V3.0</span></div>
            {!result && !loading && <div className="flex-1 flex flex-col items-center justify-center text-stone-600 p-8 text-center"><Layers size={32} className="mb-4" /><p>Menunggu Sampel</p></div>}
            {loading && <div className="flex-1 flex flex-col items-center justify-center p-8"><div className="w-full max-w-xs h-1 bg-stone-800 rounded-full overflow-hidden"><div className="h-full bg-amber-500 animate-pulse w-2/3"></div></div><p className="text-xs text-amber-500 mt-4 animate-pulse">MENGIDENTIFIKASI...</p></div>}
            {result && !loading && (
              <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                <div className="bg-gradient-to-b from-stone-800 to-stone-900 border border-stone-700 rounded-xl p-5 shadow-lg">
                  <h2 className="text-2xl font-serif text-white font-bold mb-2">{result.rockName}</h2>
                  <p className="text-sm text-stone-400 italic">"{result.description}"</p>
                  {result.pointCountingStats && <div className="mt-3 bg-amber-950/30 border border-amber-900/50 p-2 rounded text-xs text-amber-200/80 font-mono"><Grid size={12} className="inline mr-2"/>{result.pointCountingStats}</div>}
                </div>
                <div className="space-y-4">
                  {result.minerals && result.minerals.map((m, i) => (
                    <div key={i} className="bg-stone-950 border border-stone-800 rounded-lg overflow-hidden hover:border-amber-900/30 transition-colors">
                      <div className="bg-stone-900 px-4 py-3 flex justify-between items-center border-b border-stone-800">
                        <div><h3 className="text-amber-100 font-bold text-lg">{m.name}</h3><span className="text-xs text-stone-500">{m.formula}</span></div>
                        <div className="bg-amber-950/40 text-amber-500 px-3 py-1 rounded text-sm font-bold">{m.percentage}</div>
                      </div>
                      <div className="p-4">
                         <div className="grid grid-cols-2 gap-px bg-stone-800/50 border border-stone-800 rounded mb-4 overflow-hidden">
                           <div className="bg-stone-900/80 p-3"><span className="block text-[10px] uppercase text-stone-500 font-bold mb-1">Relief</span><span className="text-sm text-stone-300">{m.opticalProps?.relief}</span></div>
                           <div className="bg-stone-900/80 p-3"><span className="block text-[10px] uppercase text-stone-500 font-bold mb-1">Birefringence</span><span className="text-sm text-amber-200/90">{m.opticalProps?.birefringence}</span></div>
                           <div className="bg-stone-900/80 p-3"><span className="block text-[10px] uppercase text-stone-500 font-bold mb-1">Pemadaman</span><span className="text-sm text-stone-300">{m.opticalProps?.extinction}</span></div>
                           <div className="bg-stone-900/80 p-3"><span className="block text-[10px] uppercase text-stone-500 font-bold mb-1">Pleokroisme</span><span className="text-stone-300 text-sm">{m.opticalProps?.pleochroism}</span></div>
                        </div>
                        <p className="text-sm text-stone-400 italic pl-3 border-l-2 border-stone-700">"{m.description}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <style>{`
        @keyframes progress { 0% { width: 0% } 50% { width: 70% } 100% { width: 100% } }
        .animate-progress { animation: progress 2s ease-in-out infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0c0a09; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #44403c; border-radius: 3px; }
      `}</style>
    </div>
  );
}


