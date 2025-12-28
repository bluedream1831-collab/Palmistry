
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
  Info,
  ChevronLeft,
  CircleDot,
  X,
  ShieldCheck,
  Smartphone,
  Flame,
  Waves,
  Mountain,
  Wind,
  Cpu,
  RefreshCw,
  Star,
  Printer,
  MousePointer2,
  Sun,
  Eye,
  Maximize,
  Focus,
  Activity,
  Award,
  TrendingUp,
  Target,
  Layers,
  Heart,
  Brain,
  Shield,
  Briefcase
} from 'lucide-react';

// --- Types ---

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

// --- Styles ---
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@300;400;600&display=swap');

  :root {
    --bg: #030305;
    --primary: #8b5cf6;
    --secondary: #d946ef;
    --accent: #fbbf24;
    --text: #f3f4f6;
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
    background: rgba(22, 22, 30, 0.75);
    backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .scan-line {
    position: absolute;
    width: 100%;
    height: 4px;
    background: linear-gradient(to bottom, transparent, var(--accent), transparent);
    box-shadow: 0 0 15px var(--accent);
    z-index: 20;
    animation: scan 2s ease-in-out infinite;
  }

  @keyframes scan {
    0% { top: 0; }
    50% { top: 100%; }
    100% { top: 0; }
  }

  .line-marker {
    position: absolute;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    z-index: 30;
    border: 2px solid white;
    box-shadow: 0 0 10px rgba(0,0,0,0.5);
  }

  .marker-tooltip {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 150px;
    padding: 8px;
    background: rgba(0, 0, 0, 0.9);
    border-radius: 10px;
    color: white;
    font-size: 10px;
    pointer-events: none;
    z-index: 100;
  }

  .ai-badge {
    background: rgba(139, 92, 246, 0.1);
    border: 1px solid rgba(139, 92, 246, 0.3);
    color: var(--primary);
    font-size: 10px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    text-transform: uppercase;
  }

  .talent-bar {
    height: 6px;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.05);
    overflow: hidden;
  }

  .talent-progress {
    height: 100%;
    background: linear-gradient(90deg, var(--primary), var(--secondary));
    transition: width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .life-stage-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent);
    position: relative;
    z-index: 1;
  }

  .life-stage-line {
    width: 2px;
    height: 100%;
    background: rgba(251, 191, 36, 0.2);
    position: absolute;
    left: 3px;
    top: 0;
  }
`;

const NebulaBackground = () => (
  <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#030305] no-print">
    <div className="absolute top-[-10%] left-[-10%] w-[100vw] h-[100vw] bg-primary/10 rounded-full filter blur-[120px]" />
    <div className="absolute bottom-[-20%] right-[-10%] w-[120vw] h-[120vw] bg-secondary/5 rounded-full filter blur-[120px]" />
  </div>
);

const App = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingText, setLoadingText] = useState('初始化智慧引擎...');
  const [result, setResult] = useState<PalmAnalysis | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProfileEntered, setIsProfileEntered] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const [age, setAge] = useState<string>('28');
  const [gender, setGender] = useState<'male' | 'female'>('female');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (analyzing) {
      const texts = ['定位掌中丘位...', '破譯智慧與感性比例...', '分析潛能路徑...', '計算演化趨勢...', '構建命運圖譜...'];
      let i = 0;
      const interval = setInterval(() => {
        setLoadingText(texts[i % texts.length]);
        i++;
      }, 1500); 
      return () => clearInterval(interval);
    }
  }, [analyzing]);

  const analyzePalm = async () => {
    if (!image) return;
    setAnalyzing(true); 
    setResult(null); 
    setError(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      const base64Data = image.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
            { text: `你是一位資深神祕學手相專家。請分析這張 ${age}歲 ${gender === 'male' ? '男' : '女'} 性手掌照片。
            請提供極其詳細且豐富的分析結果，包含：
            1. 整體特徵與命運原型
            2. 五行掌型屬性與具體特徵描述
            3. 四大主線（感情、智慧、生命、事業）的精確走向與多個標註點
            4. 八大掌丘（木、土、日、水、金、月及火星丘）的飽滿狀況與含義
            5. 六大核心天賦指標（創造力、執行力、領悟力、意志力、交際力、穩定度）的 0-100 評分
            6. 人生三階段（啟蒙、巔峰、守成）的針對性見解
            7. 任何特殊印記（如十字紋、星紋、魚紋等）的識別
            請以繁體中文 (zh-TW) 回傳 JSON 格式。` }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overall: { type: Type.STRING },
              archetype: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING } } },
              element: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, description: { type: Type.STRING }, traits: { type: Type.ARRAY, items: { type: Type.STRING } } } },
              heartLine: { type: Type.OBJECT, properties: { observation: { type: Type.STRING }, meaning: { type: Type.STRING }, points: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER }, detail: { type: Type.STRING } } } } } },
              headLine: { type: Type.OBJECT, properties: { observation: { type: Type.STRING }, meaning: { type: Type.STRING }, points: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER }, detail: { type: Type.STRING } } } } } },
              lifeLine: { type: Type.OBJECT, properties: { observation: { type: Type.STRING }, meaning: { type: Type.STRING }, points: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER }, detail: { type: Type.STRING } } } } } },
              fateLine: { type: Type.OBJECT, properties: { observation: { type: Type.STRING }, meaning: { type: Type.STRING }, points: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER }, detail: { type: Type.STRING } } } } } },
              mounts: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, status: { type: Type.STRING }, meaning: { type: Type.STRING } } } },
              talents: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { field: { type: Type.STRING }, score: { type: Type.NUMBER }, description: { type: Type.STRING } } } },
              lifeStages: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { period: { type: Type.STRING }, insight: { type: Type.STRING } } } },
              specialMarkings: { type: Type.ARRAY, items: { type: Type.STRING } },
              summaryAdvice: { type: Type.STRING }
            },
            required: ['overall', 'element', 'talents', 'mounts']
          }
        }
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      setResult(parsed as PalmAnalysis);
    } catch (err: any) { 
      console.error(err);
      setError("AI 解析核心暫時無法回應。請檢查您的網路或確認 API 金鑰是否正確設定。");
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
    <div className="min-h-screen pb-12 relative bg-[#030305] text-gray-100">
      <style>{styles}</style>
      <NebulaBackground />
      
      <header className="pt-12 pb-6 text-center px-4 no-print">
        <div className="mb-2 flex justify-center"><div className="ai-badge"><Cpu size={10} /><span>Deep Palm AI v3.5</span></div></div>
        <h1 className="text-4xl font-mystic font-bold mb-2 tracking-tighter">星命手相</h1>
        <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em]">全維度性格與宿命解析系統</p>
      </header>

      <main className="max-w-xl mx-auto px-6">
        {error && (
          <div className="mb-6 p-4 rounded-2xl glass border-red-500/20 text-red-300 text-xs flex items-center space-x-3">
            <AlertCircle size={16} />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto opacity-50 hover:opacity-100"><X size={14} /></button>
          </div>
        )}

        {!isProfileEntered ? (
          <section className="glass p-10 rounded-[2.5rem] border-white/10 shadow-2xl">
            <h3 className="text-xs font-bold mb-8 text-accent uppercase tracking-[0.3em] flex items-center">
              <ShieldCheck className="w-4 h-4 mr-2" /> 觀測對象設定
            </h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3 block">目前年齡</label>
                <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xl font-bold focus:border-primary transition-all outline-none text-white" />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3 block">命格性別</label>
                <div className="flex gap-4">
                  {['male', 'female'].map((g) => (
                    <button key={g} onClick={() => setGender(g as any)} className={`flex-1 py-4 rounded-xl font-mystic text-xs border transition-all ${gender === g ? 'bg-primary border-primary text-white shadow-lg' : 'border-white/10 text-gray-500 hover:bg-white/5'}`}>{g === 'male' ? '乾 (男)' : '坤 (女)'}</button>
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer" onClick={() => setDisclaimerAccepted(!disclaimerAccepted)}>
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded border ${disclaimerAccepted ? 'bg-primary border-primary' : 'border-white/30'}`} />
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">我已了解此分析僅供自我察覺</span>
                </div>
              </div>
              <button onClick={() => setIsProfileEntered(true)} disabled={!disclaimerAccepted} className="w-full py-5 rounded-2xl bg-gradient-to-r from-primary/80 to-secondary/80 text-white font-bold font-mystic tracking-widest disabled:opacity-20 shadow-xl">進入觀測</button>
            </div>
          </section>
        ) : !image ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <section className="glass p-8 rounded-[2rem] border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold text-accent uppercase tracking-[0.3em] flex items-center">
                  <Star className="w-4 h-4 mr-2 fill-accent" /> 完美觀測指南
                </h3>
                <span className="text-[9px] text-gray-500 font-bold uppercase">Quality Guide</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <Sun className="text-primary" />, title: '明亮光線', desc: '避免陰影遮擋掌紋。' },
                  { icon: <Focus className="text-secondary" />, title: '清晰對焦', desc: '確保細紋清晰可見。' },
                  { icon: <Maximize className="text-accent" />, title: '手掌平放', desc: '手指張開避免彎曲。' },
                  { icon: <Smartphone className="text-green-400" />, title: '對齊框線', desc: '拍攝時填滿畫面。' }
                ].map((item, i) => (
                  <div key={i} className="guide-card p-4 rounded-2xl border border-white/5 bg-white/[0.02] flex flex-col items-center text-center hover:border-white/20 transition-all">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3">
                      {item.icon}
                    </div>
                    <h4 className="text-[11px] font-bold text-white mb-1">{item.title}</h4>
                    <p className="text-[9px] text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <div className="grid grid-cols-1 gap-4">
              <button onClick={async () => {
                try {
                  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                  if (videoRef.current) { videoRef.current.srcObject = stream; setIsCameraActive(true); }
                } catch (err) {
                  setError("相機啟動失敗，請確認權限或從相簿挑選。");
                }
              }} className="glass p-10 rounded-[2rem] flex flex-col items-center group border-primary/20 hover:border-primary/40 transition-all active:scale-[0.98]">
                <Camera className="text-primary w-10 h-10 mb-3 group-hover:scale-110 transition-all" />
                <h3 className="text-lg font-bold font-mystic text-white">開啟相機觀測</h3>
                <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest">使用實時鏡頭精準定位</p>
              </button>
              
              <button onClick={() => fileInputRef.current?.click()} className="glass p-6 rounded-[2rem] flex flex-col items-center border-white/5 hover:border-white/20 transition-all active:scale-[0.98]">
                <Upload className="text-gray-400 w-5 h-5 mb-2" />
                <span className="text-xs font-mystic text-gray-400">從相簿上傳舊有命錄</span>
                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) { const r = new FileReader(); r.onloadend = () => setImage(r.result as string); r.readAsDataURL(f); }
                }} />
              </button>
              
              <button onClick={() => setIsProfileEntered(false)} className="py-4 text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] flex items-center justify-center hover:text-gray-400 transition-colors">
                <ChevronLeft size={12} className="mr-1" /> 返回重新設定對象
              </button>
            </div>
          </div>
        ) : !result && !analyzing ? (
          <div className="space-y-6 text-center animate-in zoom-in duration-300">
            <div className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl inline-block max-w-[85%]">
              <img src={image} className="w-full h-auto" />
              <button onClick={() => setImage(null)} className="absolute top-6 right-6 p-3 bg-black/60 rounded-full text-white backdrop-blur-md hover:bg-black/80 transition-all shadow-xl border border-white/10"><RotateCcw size={16} /></button>
            </div>
            <button onClick={analyzePalm} className="w-full py-6 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-lg font-mystic tracking-widest shadow-xl active:scale-95 transition-all">啟動深度解析</button>
          </div>
        ) : analyzing ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 mx-auto mb-8 glass rounded-full flex items-center justify-center relative overflow-hidden">
              <div className="scan-line" />
              <Sparkles size={40} className="text-primary animate-pulse" />
            </div>
            <p className="text-accent font-mystic tracking-widest animate-pulse">{loadingText}</p>
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in duration-1000 pb-20">
            {/* --- 標題區 --- */}
            <div className="text-center space-y-4">
              <div className="ai-badge text-accent border-accent/20"><Star size={10} /><span>{result.archetype?.name || '性格觀測'}</span></div>
              <h2 className="text-2xl font-mystic text-white leading-relaxed px-4 italic">「{result.overall}」</h2>
              <p className="text-xs text-gray-400 leading-relaxed px-8">{result.archetype?.description}</p>
            </div>
            
            {/* --- 視覺化圖示 --- */}
            <div className="relative rounded-[3rem] overflow-hidden glass border-white/20 shadow-2xl">
              <img src={image} className="w-full opacity-60" />
              {['heartLine', 'headLine', 'lifeLine', 'fateLine'].map((lineKey, idx) => (
                (result as any)[lineKey]?.points?.map((p: any, i: number) => (
                  <div key={i} className="line-marker" style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%`, backgroundColor: ['#ef4444', '#3b82f6', '#22c55e', '#a855f7'][idx] }}>
                    <div className="marker-tooltip">{(result as any)[lineKey].observation}</div>
                  </div>
                ))
              ))}
            </div>

            {/* --- 五行特質 --- */}
            <section className="glass p-8 rounded-[2rem] border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-accent/10"><Layers size={18} className="text-accent" /></div>
                <div>
                  <h3 className="text-sm font-bold text-white">五行屬性：{result.element.type}掌</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Elemental Quality</p>
                </div>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed mb-6">{result.element.description}</p>
              <div className="flex flex-wrap gap-2">
                {result.element.traits.map((trait, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-gray-400">#{trait}</span>
                ))}
              </div>
            </section>

            {/* --- 天賦評分 --- */}
            <section className="glass p-8 rounded-[2rem] border-white/10">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-primary/10"><Award size={18} className="text-primary" /></div>
                <div>
                  <h3 className="text-sm font-bold text-white">潛能天賦圖譜</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Potential Metrics</p>
                </div>
              </div>
              <div className="space-y-6">
                {result.talents.map((t, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-[11px] font-bold text-gray-200">{t.field}</span>
                      <span className="text-[10px] font-mystic text-accent">{t.score}%</span>
                    </div>
                    <div className="talent-bar">
                      <div className="talent-progress" style={{ width: `${t.score}%`, transitionDelay: `${i * 100}ms` }} />
                    </div>
                    <p className="text-[9px] text-gray-500 leading-relaxed">{t.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* --- 掌丘位置 --- */}
            <section className="grid grid-cols-2 gap-4">
              {result.mounts.map((m, i) => (
                <div key={i} className="glass p-5 rounded-2xl border-white/5 hover:border-white/20 transition-all">
                  <h4 className="text-[10px] font-bold text-accent mb-1">{m.name}</h4>
                  <div className="text-[9px] font-bold text-white mb-2 uppercase tracking-tighter">{m.status}</div>
                  <p className="text-[9px] text-gray-500 leading-relaxed">{m.meaning}</p>
                </div>
              ))}
            </section>

            {/* --- 命運階段 --- */}
            <section className="glass p-8 rounded-[2rem] border-white/10">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-secondary/10"><TrendingUp size={18} className="text-secondary" /></div>
                <div>
                  <h3 className="text-sm font-bold text-white">人生週期解析</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Life Cycle Insight</p>
                </div>
              </div>
              <div className="space-y-8 relative">
                {result.lifeStages.map((stage, i) => (
                  <div key={i} className="flex gap-6 relative">
                    {i < result.lifeStages.length - 1 && <div className="life-stage-line" style={{ top: '12px', height: 'calc(100% + 16px)' }} />}
                    <div className="life-stage-dot mt-1 shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{stage.period}</span>
                      <p className="text-[11px] text-gray-300 leading-relaxed">{stage.insight}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* --- 特殊印記 & 建議 --- */}
            <section className="space-y-4">
              {result.specialMarkings.length > 0 && (
                <div className="p-6 glass border-white/10 rounded-2xl flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-orange-500/10"><Zap size={18} className="text-orange-400" /></div>
                  <div>
                    <h4 className="text-[11px] font-bold text-white mb-2 uppercase tracking-widest">識別到特殊印記</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.specialMarkings.map((m, i) => (
                        <span key={i} className="text-[10px] text-orange-200 bg-orange-500/10 px-2 py-1 rounded">#{m}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="p-8 glass bg-primary/5 border-primary/20 rounded-[2rem]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/20"><Sparkles size={18} className="text-primary" /></div>
                  <h3 className="text-sm font-bold text-white font-mystic">觀測者建議</h3>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed italic">「{result.summaryAdvice}」</p>
              </div>
            </section>

            <div className="grid grid-cols-2 gap-4 no-print">
              <button onClick={() => window.print()} className="py-5 rounded-2xl border border-accent/20 glass text-accent font-mystic flex items-center justify-center gap-2 hover:bg-accent/5 transition-all"><Printer size={18} />列印報告</button>
              <button onClick={reset} className="py-5 rounded-2xl bg-white/5 border border-white/10 text-gray-500 font-mystic hover:text-gray-300 transition-all">重新觀測</button>
            </div>
          </div>
        )}

        {isCameraActive && (
          <div className="fixed inset-0 z-[100] bg-black flex flex-col">
            <video ref={videoRef} autoPlay playsInline onLoadedMetadata={() => setIsCameraReady(true)} className="flex-1 object-cover" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[80%] h-[60%] border-2 border-dashed border-white/30 rounded-[3rem] relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-white/10"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-10 text-[9px] text-white/50 uppercase tracking-widest font-bold whitespace-nowrap">請將手掌對齊框內並保持穩定</div>
              </div>
            </div>
            <div className="p-10 flex justify-center gap-10 bg-black/80 backdrop-blur-md items-center">
              <button onClick={reset} className="p-4 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all"><RotateCcw /></button>
              <button onClick={() => {
                if (canvasRef.current && videoRef.current) {
                  canvasRef.current.width = videoRef.current.videoWidth;
                  canvasRef.current.height = videoRef.current.videoHeight;
                  canvasRef.current.getContext('2d')?.drawImage(videoRef.current, 0, 0);
                  setImage(canvasRef.current.toDataURL('image/jpeg'));
                  reset();
                }
              }} className="w-20 h-20 rounded-full border-4 border-white bg-white/20 active:scale-95 transition-all flex items-center justify-center">
                <div className="w-16 h-16 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)]"></div>
              </button>
              <div className="w-12" />
            </div>
          </div>
        )}
      </main>

      <footer className="mt-20 text-center opacity-30 px-6 no-print">
        <p className="text-[9px] text-gray-500 leading-loose">AI 分析僅供參考。人生由您的選擇決定。</p>
        <div className="font-mystic text-[8px] uppercase tracking-[0.5em] mt-2">AI Palmistry Specialist &bull; v3.5</div>
      </footer>
      <canvas ref={canvasRef} hidden />
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
