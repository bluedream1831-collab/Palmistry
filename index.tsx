
import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Camera, 
  Upload, 
  Sparkles, 
  RotateCcw, 
  Zap, 
  AlertCircle,
  ChevronLeft,
  X,
  ShieldCheck,
  Smartphone,
  Sun,
  Cpu,
  Star,
  Printer,
  Maximize,
  Focus,
  Award,
  TrendingUp,
  Layers,
  Key,
  Info
} from 'lucide-react';

// --- 介面定義 ---

interface Point {
  x: number;
  y: number;
  detail?: string;
}

interface PalmLine {
  observation: string;
  meaning: string;
  points: Point[];
}

interface Talent {
  field: string;
  score: number;
  description: string;
}

interface Mount {
  name: string;
  status: string;
  meaning: string;
}

interface LifeStage {
  period: string;
  insight: string;
}

interface PalmAnalysis {
  overall: string;
  archetype: {
    name: string;
    description: string;
  };
  element: {
    type: string;
    description: string;
    traits: string[];
  };
  heartLine: PalmLine;
  headLine: PalmLine;
  lifeLine: PalmLine;
  fateLine: PalmLine;
  mounts: Mount[];
  talents: Talent[];
  lifeStages: LifeStage[];
  specialMarkings: string[];
  summaryAdvice: string;
}

// --- 視覺設計 ---
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@300;400;600&display=swap');

  :root {
    --bg: #050508;
    --primary: #a855f7;
    --secondary: #ec4899;
    --accent: #f59e0b;
    --text: #f8fafc;
  }

  body {
    margin: 0;
    padding: 0;
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', sans-serif;
    overflow-x: hidden;
  }

  .font-mystic { font-family: 'Cinzel', serif; }

  .glass {
    background: rgba(15, 15, 25, 0.7);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .scan-line {
    position: absolute;
    width: 100%;
    height: 3px;
    background: linear-gradient(to bottom, transparent, var(--primary), transparent);
    box-shadow: 0 0 20px var(--primary);
    z-index: 20;
    animation: scan 2.5s ease-in-out infinite;
  }

  @keyframes scan {
    0% { top: 10%; opacity: 0; }
    50% { top: 90%; opacity: 1; }
    100% { top: 10%; opacity: 0; }
  }

  .line-marker {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    z-index: 30;
    border: 1.5px solid white;
    box-shadow: 0 0 12px rgba(0,0,0,0.8);
    transition: all 0.3s ease;
  }

  .line-marker:hover {
    transform: translate(-50%, -50%) scale(1.5);
    z-index: 100;
  }

  .ai-badge {
    background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1));
    border: 1px solid rgba(168, 85, 247, 0.3);
    color: #d8b4fe;
    font-size: 9px;
    font-weight: 700;
    padding: 5px 12px;
    border-radius: 99px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    letter-spacing: 0.1em;
  }

  .talent-bar {
    height: 4px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.05);
    overflow: hidden;
  }

  .talent-progress {
    height: 100%;
    background: linear-gradient(90deg, var(--primary), var(--secondary));
    transition: width 2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .shimmer {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;

const App = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingText, setLoadingText] = useState('觀測星宿排列...');
  const [result, setResult] = useState<PalmAnalysis | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProfileEntered, setIsProfileEntered] = useState(false);
  const [age, setAge] = useState<string>('25');
  const [gender, setGender] = useState<'male' | 'female'>('female');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 循環載入文字
  useEffect(() => {
    if (analyzing) {
      const texts = ['連結星命引擎...', '讀取掌丘能量...', '解析三大主線...', '運算流年命盤...', '生成靈魂建議...'];
      let i = 0;
      const interval = setInterval(() => {
        setLoadingText(texts[i % texts.length]);
        i++;
      }, 2000); 
      return () => clearInterval(interval);
    }
  }, [analyzing]);

  const handleOpenKeySelection = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setError(null);
    }
  };

  const analyzePalm = async () => {
    if (!image) return;
    setAnalyzing(true);
    setError(null);
    
    try {
      // 每次點擊都動態獲取實例，確保金鑰最新
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      const base64Data = image.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
            { text: `你是精通古今中外手相學、心理學與神祕學的頂級大師。
            請分析這張 ${age} 歲 ${gender === 'male' ? '男' : '女'} 性的手相。
            要求：
            1. 給予非常有深度、富有人文關懷的解析。
            2. points 欄位提供 0.0 到 1.0 的座標，對應主要掌線的位置（生命線、智慧線、感情線）。
            3. 回傳完整且結構嚴密的 JSON。` }
          ]
        },
        config: {
          thinkingConfig: { thinkingBudget: 2000 },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overall: { type: Type.STRING },
              archetype: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING } } },
              element: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, description: { type: Type.STRING }, traits: { type: Type.ARRAY, items: { type: Type.STRING } } } },
              heartLine: { type: Type.OBJECT, properties: { observation: { type: Type.STRING }, meaning: { type: Type.STRING }, points: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } } } } } },
              headLine: { type: Type.OBJECT, properties: { observation: { type: Type.STRING }, meaning: { type: Type.STRING }, points: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } } } } } },
              lifeLine: { type: Type.OBJECT, properties: { observation: { type: Type.STRING }, meaning: { type: Type.STRING }, points: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } } } } } },
              fateLine: { type: Type.OBJECT, properties: { observation: { type: Type.STRING }, meaning: { type: Type.STRING }, points: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } } } } } },
              mounts: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, status: { type: Type.STRING }, meaning: { type: Type.STRING } } } },
              talents: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { field: { type: Type.STRING }, score: { type: Type.NUMBER }, description: { type: Type.STRING } } } },
              lifeStages: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { period: { type: Type.STRING }, insight: { type: Type.STRING } } } },
              specialMarkings: { type: Type.ARRAY, items: { type: Type.STRING } },
              summaryAdvice: { type: Type.STRING }
            }
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      setResult(parsed as PalmAnalysis);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("not found") || err.message?.includes("API_KEY") || !process.env.API_KEY) {
        setError("金鑰尚未連結或已失效。請點擊按鈕重啟引擎。");
      } else {
        setError("星象訊號微弱，解析失敗。請確保照片中的手掌清晰無遮擋。");
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null); setResult(null); setAnalyzing(false); setError(null);
    if (videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    setIsCameraActive(false);
  };

  return (
    <div className="min-h-screen pb-12 bg-[#050508] text-gray-100 selection:bg-primary/30">
      <style>{styles}</style>
      
      {/* --- 背景效果 --- */}
      <div className="fixed inset-0 pointer-events-none -z-10 opacity-30">
        <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-secondary/10 rounded-full blur-[100px]" />
      </div>

      <header className="pt-16 pb-8 text-center px-4 no-print">
        <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full">
          <Star className="text-accent fill-accent animate-pulse" size={12} />
          <span className="text-[10px] font-bold tracking-[0.2em] text-accent uppercase">Celestial Oracle AI</span>
        </div>
        <h1 className="text-5xl font-mystic font-bold mb-3 tracking-tight text-white">星命手相</h1>
        <p className="text-gray-500 text-[10px] uppercase tracking-[0.4em] font-medium">Deep Palmistry & Spiritual Insights</p>
      </header>

      <main className="max-w-xl mx-auto px-6 relative">
        
        {/* --- 錯誤提示與手動選取 --- */}
        {error && (
          <div className="mb-8 p-6 glass border-red-500/30 rounded-3xl animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-4 mb-4 text-red-300">
              <AlertCircle size={24} className="shrink-0" />
              <p className="text-xs leading-relaxed">{error}</p>
            </div>
            {error.includes("金鑰") && (
              <button onClick={handleOpenKeySelection} className="w-full py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-[11px] font-bold text-red-200 hover:bg-red-500/20 transition-all uppercase tracking-widest flex items-center justify-center gap-2">
                <Key size={14} /> 重新連結星命金鑰
              </button>
            )}
          </div>
        )}

        {/* --- 第一步：基本設定 --- */}
        {!isProfileEntered ? (
          <div className="glass p-10 rounded-[2.5rem] border-white/5 shadow-2xl space-y-8 animate-in fade-in duration-700">
            <h3 className="text-[11px] font-bold text-primary uppercase tracking-[0.3em] flex items-center gap-3">
              <ShieldCheck size={18} /> 建立靈魂檔案
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">目前歲數</label>
                <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-2xl font-bold focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none" />
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">命格性別</label>
                <div className="flex gap-4">
                  {[ { k: 'male', l: '乾 (男)' }, { k: 'female', l: '坤 (女)' } ].map((item) => (
                    <button key={item.k} onClick={() => setGender(item.k as any)} className={`flex-1 py-5 rounded-2xl font-mystic text-xs border transition-all duration-300 ${gender === item.k ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'border-white/10 text-gray-500 hover:bg-white/5'}`}>{item.l}</button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button onClick={() => setIsProfileEntered(true)} className="w-full py-6 rounded-3xl bg-gradient-to-r from-primary to-secondary text-white font-bold font-mystic tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">啟動觀測儀式</button>
              </div>
            </div>
          </div>
        ) : !image ? (
          /* --- 第二步：採集影像 --- */
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <button onClick={async () => {
              try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                if (videoRef.current) { videoRef.current.srcObject = stream; setIsCameraActive(true); }
              } catch (err) { setError("相機啟動失敗。請確認瀏覽器權限或手動上傳照片。"); }
            }} className="w-full glass p-12 rounded-[3rem] border-primary/20 flex flex-col items-center group hover:border-primary/40 transition-all">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-all">
                <Camera className="text-primary" size={36} />
              </div>
              <h3 className="text-xl font-bold font-mystic text-white">啟動實時採集</h3>
              <p className="text-[10px] text-gray-500 mt-3 uppercase tracking-widest">請確保環境光線柔和且手掌清晰</p>
            </button>

            <div className="grid grid-cols-1 gap-4">
              <button onClick={() => fileInputRef.current?.click()} className="glass p-6 rounded-[2rem] border-white/5 flex flex-center gap-4 hover:bg-white/5 transition-all justify-center">
                <Upload className="text-gray-500" size={18} />
                <span className="text-[11px] font-mystic text-gray-400">從命錄（相簿）選取</span>
                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) { const r = new FileReader(); r.onloadend = () => setImage(r.result as string); r.readAsDataURL(f); }
                }} />
              </button>
              
              <button onClick={() => setIsProfileEntered(false)} className="py-4 text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] flex items-center justify-center hover:text-gray-400 transition-all">
                <ChevronLeft size={14} /> 返回修改檔案
              </button>
            </div>
          </div>
        ) : !result && !analyzing ? (
          /* --- 第三步：預覽與確認 --- */
          <div className="space-y-8 text-center animate-in zoom-in duration-500">
            <div className="relative inline-block group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl glass">
                <img src={image} className="w-full max-h-[500px] object-cover" />
                <button onClick={() => setImage(null)} className="absolute top-6 right-6 p-4 bg-black/50 backdrop-blur-xl rounded-full text-white hover:bg-black/80 transition-all"><RotateCcw size={18} /></button>
              </div>
            </div>
            
            <button onClick={analyzePalm} className="w-full py-7 rounded-[2rem] bg-gradient-to-r from-primary via-secondary to-accent text-white font-bold text-xl font-mystic tracking-[0.3em] shadow-2xl shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all">探尋命運軌跡</button>
          </div>
        ) : analyzing ? (
          /* --- 第四步：解析中 --- */
          <div className="text-center py-24 space-y-10">
            <div className="relative w-40 h-40 mx-auto">
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              <div className="absolute inset-4 rounded-full border-2 border-secondary/10 border-b-secondary animate-spin [animation-duration:3s]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={48} className="text-accent animate-pulse" />
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-accent font-mystic text-lg tracking-[0.4em] animate-pulse uppercase">{loadingText}</p>
              <p className="text-[10px] text-gray-600 uppercase tracking-widest">AI Engine is processing your palm data</p>
            </div>
          </div>
        ) : (
          /* --- 第五步：報告展現 --- */
          <div className="space-y-12 animate-in fade-in duration-1000 pb-24">
            
            {/* 核心頭銜 */}
            <div className="text-center space-y-5">
              <div className="ai-badge"><Star size={10} /><span>{result.archetype?.name || "天命之人"}</span></div>
              <h2 className="text-3xl font-mystic text-white leading-tight px-4">「{result.overall}」</h2>
              <p className="text-xs text-gray-400 leading-relaxed px-10">{result.archetype?.description}</p>
            </div>

            {/* 影像標記圖 */}
            <div className="relative rounded-[3.5rem] overflow-hidden glass border-white/20 shadow-2xl">
              <img src={image} className="w-full opacity-70" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
              
              {/* 三大主線座標點 */}
              {[
                { data: result.heartLine, color: '#ec4899' },
                { data: result.headLine, color: '#3b82f6' },
                { data: result.lifeLine, color: '#22c55e' },
                { data: result.fateLine, color: '#a855f7' }
              ].map((line, idx) => (
                line.data?.points?.map((p, i) => (
                  <div key={`${idx}-${i}`} className="line-marker" style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%`, backgroundColor: line.color }} />
                ))
              ))}
              
              <div className="absolute bottom-8 left-8 flex gap-4 no-print">
                <div className="flex items-center gap-2 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/5"><div className="w-2 h-2 rounded-full bg-[#ec4899]" /><span className="text-[9px] uppercase tracking-tighter">感情</span></div>
                <div className="flex items-center gap-2 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/5"><div className="w-2 h-2 rounded-full bg-[#3b82f6]" /><span className="text-[9px] uppercase tracking-tighter">智慧</span></div>
                <div className="flex items-center gap-2 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/5"><div className="w-2 h-2 rounded-full bg-[#22c55e]" /><span className="text-[9px] uppercase tracking-tighter">生命</span></div>
              </div>
            </div>

            {/* 五行與特質 */}
            <section className="glass p-10 rounded-[2.5rem] border-white/5 space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <Layers className="text-accent" size={24} />
                <div>
                  <h3 className="text-sm font-bold text-white">五行體質：{result.element?.type}</h3>
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Elemental Constitution</p>
                </div>
              </div>
              <p className="text-[11px] text-gray-300 leading-relaxed border-l border-accent/20 pl-4">{result.element?.description}</p>
              <div className="flex flex-wrap gap-2 pt-2">
                {result.element?.traits?.map((t, i) => (
                  <span key={i} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] text-gray-400 font-medium">#{t}</span>
                ))}
              </div>
            </section>

            {/* 天賦雷達圖譜 */}
            <section className="glass p-10 rounded-[2.5rem] border-white/5 space-y-8">
              <div className="flex items-center gap-4">
                <Award className="text-primary" size={24} />
                <div>
                  <h3 className="text-sm font-bold text-white">靈魂潛能指標</h3>
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Innate Potentials</p>
                </div>
              </div>
              <div className="space-y-8">
                {result.talents?.map((t, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-[12px] font-bold text-gray-200">{t.field}</span>
                      <span className="text-[11px] font-mystic text-accent">{t.score}%</span>
                    </div>
                    <div className="talent-bar"><div className="talent-progress" style={{ width: `${t.score}%` }} /></div>
                    <p className="text-[10px] text-gray-500 leading-relaxed italic">{t.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 八卦掌丘 */}
            <section className="grid grid-cols-2 gap-4">
              {result.mounts?.map((m, i) => (
                <div key={i} className="glass p-6 rounded-3xl border-white/5 group hover:border-primary/20 transition-all">
                  <h4 className="text-[10px] font-bold text-accent mb-1 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent" />{m.name}</h4>
                  <div className="text-[11px] font-bold text-white mb-2 uppercase tracking-tighter">{m.status}</div>
                  <p className="text-[9px] text-gray-500 leading-relaxed line-clamp-3">{m.meaning}</p>
                </div>
              ))}
            </section>

            {/* 人生階段 */}
            <section className="glass p-10 rounded-[2.5rem] border-white/5">
              <div className="flex items-center gap-4 mb-10">
                <TrendingUp className="text-secondary" size={24} />
                <div>
                  <h3 className="text-sm font-bold text-white">大運流年解析</h3>
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Life Cycle Progression</p>
                </div>
              </div>
              <div className="space-y-12">
                {result.lifeStages?.map((s, i) => (
                  <div key={i} className="relative pl-10 border-l border-white/10 group">
                    <div className="absolute left-[-5px] top-0 w-[9px] h-[9px] rounded-full bg-secondary shadow-[0_0_10px_rgba(236,72,153,0.5)] group-hover:scale-125 transition-all" />
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{s.period}</span>
                      <p className="text-[11px] text-gray-300 leading-relaxed">{s.insight}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 總結與祝福 */}
            <div className="p-10 glass bg-gradient-to-br from-primary/10 to-transparent rounded-[2.5rem] border-primary/20 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={100} /></div>
              <p className="text-xs text-primary font-bold uppercase tracking-[0.4em] mb-4 flex justify-center items-center gap-2"><Sparkles size={14} /> Oracle's Final Blessing</p>
              <p className="text-[13px] text-gray-200 leading-[1.8] font-medium italic">「{result.summaryAdvice}」</p>
            </div>

            <div className="grid grid-cols-2 gap-4 no-print">
              <button onClick={() => window.print()} className="py-5 rounded-2xl glass border-accent/30 text-accent font-mystic text-xs flex items-center justify-center gap-3 hover:bg-accent/5 transition-all">
                <Printer size={16} /> 刻印天命（列印）
              </button>
              <button onClick={reset} className="py-5 rounded-2xl bg-white/5 border border-white/10 text-gray-500 font-mystic text-xs flex items-center justify-center gap-2 hover:text-white transition-all">
                <RotateCcw size={16} /> 重啟輪迴
              </button>
            </div>
          </div>
        )}

        {/* --- 相機全螢幕模態窗 --- */}
        {isCameraActive && (
          <div className="fixed inset-0 z-[100] bg-black flex flex-col">
            <video ref={videoRef} autoPlay playsInline className="flex-1 object-cover" />
            
            {/* 掃描框引導 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="w-[85%] h-[65%] border-2 border-dashed border-white/20 rounded-[4rem] relative">
                <div className="scan-line" />
                <div className="absolute bottom-[-60px] left-1/2 -translate-x-1/2 text-[10px] text-white/40 uppercase tracking-[0.2em] whitespace-nowrap font-bold">請將手掌平放並對齊中央框線</div>
              </div>
            </div>

            <div className="p-12 flex justify-between items-center bg-black/90 backdrop-blur-3xl px-16">
              <button onClick={reset} className="p-5 bg-white/5 rounded-full text-white hover:bg-white/10 transition-all"><X /></button>
              
              <button onClick={() => {
                if (canvasRef.current && videoRef.current) {
                  canvasRef.current.width = videoRef.current.videoWidth;
                  canvasRef.current.height = videoRef.current.videoHeight;
                  canvasRef.current.getContext('2d')?.drawImage(videoRef.current, 0, 0);
                  setImage(canvasRef.current.toDataURL('image/jpeg'));
                  reset();
                }
              }} className="group relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 bg-white/10 rounded-full animate-ping [animation-duration:3s]" />
                <div className="absolute inset-0 border-4 border-white rounded-full scale-110" />
                <div className="w-18 h-18 bg-white rounded-full group-active:scale-90 transition-all" />
              </button>
              
              <div className="w-16" /> {/* Spacer */}
            </div>
          </div>
        )}
      </main>

      <footer className="mt-20 py-12 text-center opacity-20 no-print">
        <p className="text-[10px] tracking-widest font-medium text-gray-400">AI ANALYSIS IS FOR SELF-REFLECTION ONLY</p>
        <p className="text-[8px] mt-2 text-gray-600 font-mystic tracking-widest uppercase">Version 3.8.1-PRO &bull; Celestial Engine</p>
      </footer>
      <canvas ref={canvasRef} hidden />
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
