
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
  Info,
  ChevronRight,
  Settings
} from 'lucide-react';

// --- 全域手相知識庫 (內建) ---
const PALM_KNOWLEDGE = {
  elements: ["木型 (長形掌)", "火型 (尖形掌)", "土型 (厚實掌)", "金型 (方正掌)", "水型 (圓潤掌)"],
  mounts: ["木星丘 (野心)", "土星丘 (責任)", "太陽丘 (才華)", "水星丘 (機智)", "金星丘 (活力)"],
  majorLines: ["生命線 (活力軌跡)", "智慧線 (決策邏輯)", "感情線 (情感共鳴)", "命運線 (社會價值)"]
};

// --- Types ---
interface Point { x: number; y: number; }
interface PalmLine { observation: string; meaning: string; points: Point[]; }
interface Talent { field: string; score: number; description: string; }
interface Mount { name: string; status: string; meaning: string; }
interface LifeStage { period: string; insight: string; }

interface PalmAnalysis {
  overall: string;
  archetype: { name: string; description: string; };
  element: { type: string; description: string; traits: string[]; };
  heartLine: PalmLine;
  headLine: PalmLine;
  lifeLine: PalmLine;
  fateLine: PalmLine;
  mounts: Mount[];
  talents: Talent[];
  lifeStages: LifeStage[];
  summaryAdvice: string;
}

// --- Styles ---
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@300;400;600&display=swap');

  :root {
    --bg: #030305;
    --primary: #8b5cf6;
    --secondary: #d946ef;
    --accent: #f59e0b;
    --text: #f3f4f6;
  }

  body {
    margin: 0;
    padding: 0;
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', sans-serif;
    -webkit-print-color-adjust: exact;
  }

  .font-mystic { font-family: 'Cinzel', serif; }

  .glass {
    background: rgba(15, 15, 25, 0.75);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .scan-line {
    position: absolute;
    width: 100%;
    height: 4px;
    background: linear-gradient(to bottom, transparent, var(--primary), transparent);
    box-shadow: 0 0 25px var(--primary);
    z-index: 20;
    animation: scan 2s ease-in-out infinite;
  }

  @keyframes scan {
    0% { top: 0%; opacity: 0; }
    50% { top: 100%; opacity: 1; }
    100% { top: 0%; opacity: 0; }
  }

  .line-marker {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    z-index: 30;
    border: 2px solid white;
    box-shadow: 0 0 10px rgba(0,0,0,0.8);
  }

  .talent-progress {
    height: 100%;
    background: linear-gradient(90deg, var(--primary), var(--secondary));
    transition: width 2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .pulse-glow {
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% { transform: scale(1); opacity: 0.8; }
    50% { transform: scale(1.05); opacity: 1; }
    100% { transform: scale(1); opacity: 0.8; }
  }

  @media print {
    .no-print { display: none !important; }
    body { background: white; color: black; }
    .glass { background: white; border: 1px solid #ddd; backdrop-filter: none; }
    .text-gray-400, .text-gray-500 { color: #666; }
    .text-white { color: black; }
  }
`;

const App = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingText, setLoadingText] = useState('初始化啟示引擎...');
  const [result, setResult] = useState<PalmAnalysis | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [age, setAge] = useState<string>('28');
  const [gender, setGender] = useState<'male' | 'female'>('female');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (analyzing) {
      const texts = ['連結星盤...', '讀取掌丘...', '分析命運...', '生成報告...'];
      let i = 0;
      const interval = setInterval(() => {
        setLoadingText(texts[i % texts.length]);
        i++;
      }, 2000); 
      return () => clearInterval(interval);
    }
  }, [analyzing]);

  const handleOpenKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setError(null);
      setShowSetupGuide(false);
    } else {
      setShowSetupGuide(true);
    }
  };

  const analyzePalm = async () => {
    if (!image) return;
    setAnalyzing(true);
    setError(null);
    setResult(null);
    setShowSetupGuide(false);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      const base64Data = image.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
            { text: `你是一位融合了東方手相與現代性格心理學的大師。
            分析這張 ${age} 歲 ${gender === 'male' ? '男' : '女'} 性的手。
            請參考內建手相知識庫：
            - 五行體質：${PALM_KNOWLEDGE.elements.join(', ')}
            - 丘位能量：${PALM_KNOWLEDGE.mounts.join(', ')}
            - 主要線條：${PALM_KNOWLEDGE.majorLines.join(', ')}
            
            回傳 JSON 格式，包含整體評語、五行、掌丘狀態、天賦百分比、人生週期(4段)與建議。
            points 請提供 0.0-1.0 座標點。` }
          ]
        },
        config: {
          thinkingConfig: { thinkingBudget: 4000 },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overall: { type: Type.STRING },
              archetype: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING } } },
              element: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, description: { type: Type.STRING }, traits: { type: Type.ARRAY, items: { type: Type.STRING } } } },
              heartLine: { type: Type.OBJECT, properties: { points: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } } } } } },
              headLine: { type: Type.OBJECT, properties: { points: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } } } } } },
              lifeLine: { type: Type.OBJECT, properties: { points: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } } } } } },
              mounts: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, status: { type: Type.STRING }, meaning: { type: Type.STRING } } } },
              talents: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { field: { type: Type.STRING }, score: { type: Type.NUMBER }, description: { type: Type.STRING } } } },
              lifeStages: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { period: { type: Type.STRING }, insight: { type: Type.STRING } } } },
              summaryAdvice: { type: Type.STRING }
            }
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      setResult(parsed as PalmAnalysis);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("API_KEY") || err.message?.includes("not found")) {
        setError("未偵測到星命金鑰。如果您是在 Vercel 上使用，請確認環境變數已配置。");
        setShowSetupGuide(true);
      } else {
        setError("採集訊號混亂。請確保手掌平放、光線明亮且無遮擋。");
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null); setResult(null); setAnalyzing(false); setError(null); setShowSetupGuide(false);
    if (videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    setIsCameraActive(false);
  };

  return (
    <div className="min-h-screen pb-20 bg-[#030305] text-gray-100 selection:bg-primary/30">
      <style>{styles}</style>
      
      {/* 背景裝飾 */}
      <div className="fixed inset-0 pointer-events-none -z-10 no-print">
        <div className="absolute top-[-20%] left-[-10%] w-[100vw] h-[100vw] bg-primary/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[100vw] h-[100vw] bg-secondary/5 rounded-full blur-[140px]" />
      </div>

      <header className="pt-20 pb-12 text-center px-6 no-print">
        <div className="mb-4 flex justify-center"><div className="ai-badge flex items-center gap-2 px-4 py-1.5 glass rounded-full text-xs border-primary/20"><Star size={12} className="text-accent fill-accent" /><span>AI PRO v4.2 &bull; Celestial Engine</span></div></div>
        <h1 className="text-6xl font-mystic font-bold mb-4 tracking-tighter text-white">星命手相</h1>
        <p className="text-gray-500 text-[10px] uppercase tracking-[0.5em] font-medium">Deep Wisdom & Pattern Recognition</p>
      </header>

      <main className="max-w-xl mx-auto px-6 relative">
        
        {/* --- 錯誤與金鑰設置指引 --- */}
        {(error || showSetupGuide) && (
          <div className="mb-10 p-8 glass border-accent/30 rounded-[2.5rem] animate-in slide-in-from-top-4 duration-500">
            <div className="flex gap-4 mb-6">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center shrink-0">
                <Settings className="text-accent" size={24} />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white font-mystic">API 連結故障排除</h3>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  {window.aistudio 
                    ? "檢測到金鑰尚未對齊。請點擊按鈕重啟引擎。" 
                    : "在 Vercel 部署環境中，您必須在專案設定的 Environment Variables 中添加 API_KEY 變數，解析引擎方能啟動。"}
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <button onClick={handleOpenKey} className="w-full py-4 bg-accent text-black font-bold rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-all">
                <Key size={14} /> {window.aistudio ? "重新連結金鑰" : "開啟 Vercel 金鑰設置教學"}
              </button>
              <button onClick={() => setShowSetupGuide(false)} className="w-full py-3 text-[10px] text-gray-600 font-bold uppercase tracking-widest">暫時忽略</button>
            </div>
          </div>
        )}

        {/* --- 初始：基本檔案 --- */}
        {!image && !analyzing && !result ? (
          <div className="space-y-12 animate-in fade-in duration-1000">
            <section className="glass p-12 rounded-[3rem] border-white/5 shadow-2xl space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-[11px] font-bold text-primary uppercase tracking-[0.4em] flex items-center gap-3">
                  <ShieldCheck size={18} /> 採集對象設定
                </h3>
                <div className="px-3 py-1 bg-white/5 rounded-full text-[9px] text-gray-500 font-bold uppercase">Ready</div>
              </div>
              
              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">目前年歲 (Age)</label>
                  <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-2xl font-bold focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none" />
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">性別能量 (Polarity)</label>
                  <div className="flex gap-4">
                    {[ { k: 'male', l: '乾 (男)' }, { k: 'female', l: '坤 (女)' } ].map((g) => (
                      <button key={g.k} onClick={() => setGender(g.k as any)} className={`flex-1 py-5 rounded-2xl font-mystic text-xs border transition-all ${gender === g.k ? 'bg-primary border-primary text-white shadow-lg' : 'border-white/10 text-gray-500 hover:bg-white/5'}`}>{g.l}</button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 gap-6">
              <button onClick={async () => {
                try {
                  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                  if (videoRef.current) { videoRef.current.srcObject = stream; setIsCameraActive(true); }
                } catch (err) { setError("相機啟動失敗。請確認瀏覽器權限。"); }
              }} className="group relative w-full glass p-16 rounded-[4rem] border-primary/20 flex flex-col items-center hover:border-primary/50 transition-all overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Camera className="text-primary w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold font-mystic text-white">啟動實時掃描</h3>
                <p className="text-[9px] text-gray-500 mt-2 uppercase tracking-[0.3em]">Live Bio-Pattern Recognition</p>
              </button>
              
              <button onClick={() => fileInputRef.current?.click()} className="py-6 rounded-3xl border border-white/5 glass text-gray-500 font-mystic text-xs flex items-center justify-center gap-3 hover:text-white transition-all">
                <Upload size={16} /> 從命錄（相簿）選取舊有數據
                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) { const r = new FileReader(); r.onloadend = () => setImage(r.result as string); r.readAsDataURL(f); }
                }} />
              </button>
            </div>
          </div>
        ) : !result && !analyzing && image ? (
          /* --- 採集完成：等待確認 --- */
          <div className="space-y-8 text-center animate-in zoom-in duration-500">
            <div className="relative inline-block">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-[3.5rem] blur opacity-20" />
              <div className="relative rounded-[3rem] overflow-hidden border border-white/20 glass shadow-2xl">
                <img src={image} className="w-full max-h-[500px] object-cover" />
                <div className="absolute top-6 right-6 flex gap-3">
                  <button onClick={() => setImage(null)} className="p-4 bg-black/60 backdrop-blur-xl rounded-full text-white border border-white/10 hover:bg-black/90 transition-all"><RotateCcw size={18} /></button>
                </div>
              </div>
            </div>
            
            <button onClick={analyzePalm} className="w-full py-8 rounded-[2.5rem] bg-gradient-to-r from-primary via-secondary to-accent text-white font-bold text-2xl font-mystic tracking-[0.3em] shadow-2xl shadow-primary/30 hover:scale-[1.01] active:scale-95 transition-all">啟動深度觀測</button>
          </div>
        ) : analyzing ? (
          /* --- 掃描中 --- */
          <div className="text-center py-32 space-y-12">
            <div className="relative w-48 h-48 mx-auto">
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              <div className="absolute inset-4 rounded-full border-2 border-secondary/10 border-b-secondary animate-spin [animation-duration:3s]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={56} className="text-accent animate-pulse" />
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-accent font-mystic text-2xl tracking-[0.5em] animate-pulse uppercase">{loadingText}</p>
              <div className="flex justify-center gap-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          </div>
        ) : result ? (
          /* --- 結果呈現 --- */
          <div className="space-y-16 animate-in fade-in duration-1000 pb-24">
            
            <div className="text-center space-y-6">
              <div className="ai-badge inline-flex border-accent/20 text-accent"><Award size={10} /><span>{result.archetype?.name}</span></div>
              <h2 className="text-4xl font-mystic text-white leading-tight px-6">「{result.overall}」</h2>
              <p className="text-xs text-gray-400 leading-relaxed px-12">{result.archetype?.description}</p>
            </div>

            <div className="relative rounded-[4rem] overflow-hidden glass border-white/20 shadow-2xl">
              <img src={image!} className="w-full opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* 繪製解析點位 */}
              {[result.heartLine, result.headLine, result.lifeLine].map((line, idx) => (
                line?.points?.map((p, i) => (
                  <div key={`${idx}-${i}`} className="line-marker" style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%`, backgroundColor: ['#ec4899', '#3b82f6', '#22c55e'][idx] }} />
                ))
              ))}

              <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end no-print">
                <div className="space-y-2">
                  <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-[#ec4899]" /><span className="text-[9px] font-bold uppercase tracking-widest text-white/60">感情線 Path of Heart</span></div>
                  <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-[#3b82f6]" /><span className="text-[9px] font-bold uppercase tracking-widest text-white/60">智慧線 Logic Flow</span></div>
                  <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-[#22c55e]" /><span className="text-[9px] font-bold uppercase tracking-widest text-white/60">生命線 Vitality Trace</span></div>
                </div>
                <div className="text-[8px] text-white/30 uppercase tracking-[0.3em] font-bold">Mapped by Celestial Engine</div>
              </div>
            </div>

            {/* 詳細報表區塊 */}
            <div className="grid grid-cols-1 gap-6">
              <section className="glass p-10 rounded-[3rem] border-white/5 space-y-6">
                <div className="flex items-center gap-4">
                  <Layers className="text-accent" size={24} />
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">五行屬性：{result.element.type}</h3>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed italic border-l-2 border-accent/20 pl-6">{result.element.description}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {result.element.traits.map((t, i) => (
                    <span key={i} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] text-gray-400 font-medium">#{t}</span>
                  ))}
                </div>
              </section>

              <section className="glass p-10 rounded-[3rem] border-white/5 space-y-10">
                <div className="flex items-center gap-4">
                  <Award className="text-primary" size={24} />
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">靈魂天賦圖譜</h3>
                </div>
                <div className="space-y-8">
                  {result.talents.map((t, i) => (
                    <div key={i} className="space-y-3">
                      <div className="flex justify-between items-end">
                        <span className="text-[12px] font-bold text-gray-200">{t.field}</span>
                        <span className="text-[11px] font-mystic text-accent">{t.score}%</span>
                      </div>
                      <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                        <div className="talent-progress" style={{ width: `${t.score}%` }} />
                      </div>
                      <p className="text-[10px] text-gray-500 leading-relaxed italic">{t.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              <div className="grid grid-cols-2 gap-4">
                {result.mounts.map((m, i) => (
                  <div key={i} className="glass p-6 rounded-[2rem] border-white/5 group hover:border-primary/20 transition-all">
                    <h4 className="text-[10px] font-bold text-accent mb-2 flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-accent" />{m.name}</h4>
                    <div className="text-[11px] font-bold text-white mb-2 uppercase tracking-tighter">{m.status}</div>
                    <p className="text-[9px] text-gray-500 leading-relaxed">{m.meaning}</p>
                  </div>
                ))}
              </div>

              <section className="glass p-10 rounded-[3rem] border-white/5 space-y-10">
                <div className="flex items-center gap-4 mb-4">
                  <TrendingUp className="text-secondary" size={24} />
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">人生階段演化</h3>
                </div>
                <div className="space-y-12 relative">
                  {result.lifeStages.map((stage, i) => (
                    <div key={i} className="relative pl-12 border-l border-white/10">
                      <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-secondary shadow-[0_0_12px_rgba(217,70,239,0.5)]" />
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{stage.period}</span>
                        <p className="text-[11px] text-gray-300 leading-relaxed">{stage.insight}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="p-12 glass bg-primary/5 border-primary/20 rounded-[3rem] text-center space-y-4">
                <p className="text-[10px] text-primary font-bold uppercase tracking-[0.5em]">Oracle's Insight</p>
                <p className="text-[14px] text-gray-200 leading-[1.8] font-medium italic">「{result.summaryAdvice}」</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 no-print">
              <button onClick={() => window.print()} className="py-6 rounded-3xl border border-accent/30 glass text-accent font-mystic text-xs flex items-center justify-center gap-3 hover:bg-accent/5 transition-all"><Printer size={18} /> 刻印天命 (列印報告)</button>
              <button onClick={reset} className="py-6 rounded-3xl bg-white/5 border border-white/10 text-gray-500 font-mystic text-xs flex items-center justify-center gap-2 hover:text-white transition-all"><RotateCcw size={16} /> 重新啟動輪迴</button>
            </div>
          </div>
        ) : null}

        {/* --- 全螢幕相機 --- */}
        {isCameraActive && (
          <div className="fixed inset-0 z-[100] bg-black flex flex-col">
            <video ref={videoRef} autoPlay playsInline className="flex-1 object-cover" />
            
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="w-[85%] h-[65%] border-2 border-dashed border-white/20 rounded-[4rem] relative">
                <div className="scan-line" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center px-10">
                  <div className="text-[10px] text-white/30 uppercase tracking-[0.4em] font-bold mb-4">Alignment in Progress</div>
                </div>
              </div>
            </div>

            <div className="p-14 flex justify-between items-center bg-black/90 backdrop-blur-3xl px-20">
              <button onClick={reset} className="p-5 bg-white/5 rounded-full text-white hover:bg-white/10 transition-all"><X size={24} /></button>
              
              <button onClick={() => {
                if (canvasRef.current && videoRef.current) {
                  canvasRef.current.width = videoRef.current.videoWidth;
                  canvasRef.current.height = videoRef.current.videoHeight;
                  canvasRef.current.getContext('2d')?.drawImage(videoRef.current, 0, 0);
                  setImage(canvasRef.current.toDataURL('image/jpeg'));
                  reset();
                }
              }} className="group relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-white rounded-full scale-110 group-active:scale-95 transition-all" />
                <div className="absolute inset-2 bg-white rounded-full scale-95 group-active:scale-90 transition-all" />
              </button>
              
              <div className="w-14" />
            </div>
          </div>
        )}
      </main>

      <footer className="mt-24 pb-12 text-center opacity-20 no-print">
        <p className="text-[10px] tracking-[0.4em] font-medium text-gray-400">ANALYSIS IS FOR SELF-REFLECTION ONLY • CELESTIAL PRO 4.2</p>
      </footer>
      <canvas ref={canvasRef} hidden />
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
