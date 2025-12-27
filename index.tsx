
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Camera, 
  Upload, 
  Sparkles, 
  RotateCcw, 
  Zap, 
  Heart, 
  Brain, 
  Activity, 
  Compass,
  AlertCircle,
  Eye,
  Info,
  ChevronRight,
  History,
  Save, 
  Trash2,
  Calendar,
  ChevronLeft,
  CircleDot,
  X,
  User,
  ShieldCheck,
  Lightbulb,
  Smartphone,
  Flame,
  Waves,
  Mountain,
  Wind,
  Scale,
  Smile,
  ExternalLink,
  BookOpen,
  Cpu,
  RefreshCw,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Target,
  Layers,
  Star,
  FileText,
  MessageSquareQuote,
  Printer,
  MousePointer2,
  Sun,
  Shield,
  Briefcase,
  Users,
  Award,
  Terminal
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

interface PalmMount {
  name: string;
  status: '飽滿' | '平坦' | '低陷'; 
  meaning: string;
}

interface Talent {
  field: string;
  score: number;
  description: string;
}

interface LifeStage {
  period: string;
  title: string;
  insight: string;
}

interface PalmAnalysis {
  isQualityGood: boolean;
  qualityFeedback: string;
  overall: string;
  archetype: {
    name: string;
    description: string;
  };
  element: {
    type: '金' | '木' | '水' | '火' | '土';
    description: string;
    traits: string[];
  };
  heartLine: PalmLine;
  headLine: PalmLine;
  lifeLine: PalmLine;
  fateLine: PalmLine;
  mounts: PalmMount[];
  talents: Talent[];
  socialStyle: string;
  specialMarkings: string[];
  lifeStages: LifeStage[];
  advice: string[];
  disclaimer: string;
}

interface HistoryItem {
  id: string;
  date: string;
  image: string;
  analysis: PalmAnalysis;
}

// --- Styles ---
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@300;400;600&display=swap');

  :root {
    --bg: #030305;
    --card: #16161e;
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
    -webkit-tap-highlight-color: transparent;
  }

  .font-mystic {
    font-family: 'Cinzel', serif;
  }

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

  @keyframes nebula-flow {
    0% { transform: scale(1) translate(0, 0); opacity: 0.3; }
    50% { transform: scale(1.1) translate(2%, 2%); opacity: 0.4; }
    100% { transform: scale(1) translate(0, 0); opacity: 0.3; }
  }

  .nebula-layer {
    position: absolute;
    border-radius: 50%;
    filter: blur(120px);
    mix-blend-mode: screen;
    pointer-events: none;
    animation: nebula-flow 30s infinite ease-in-out;
  }

  .line-marker {
    position: absolute;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    cursor: pointer;
    z-index: 30;
    border: 2px solid white;
    box-shadow: 0 0 10px rgba(0,0,0,0.5);
    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .marker-tooltip {
    position: absolute;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    width: 180px;
    padding: 12px;
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 14px;
    color: white;
    font-size: 11px;
    pointer-events: none;
    opacity: 0;
    transition: all 0.2s ease;
    z-index: 100;
    text-align: center;
  }

  .line-marker:hover .marker-tooltip {
    opacity: 1;
    transform: translateX(-50%) translateY(-5px);
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
    letter-spacing: 0.1em;
  }

  .talent-bar {
    height: 6px;
    background: rgba(255,255,255,0.05);
    border-radius: 999px;
    overflow: hidden;
  }

  .talent-progress {
    height: 100%;
    background: linear-gradient(90deg, var(--primary), var(--secondary));
    border-radius: 999px;
  }

  @media print {
    @page { margin: 1cm; }
    body, html { background: white !important; color: black !important; }
    .no-print { display: none !important; }
    .glass { background: white !important; border: 1px solid #ddd !important; box-shadow: none !important; backdrop-filter: none !important; }
    .text-white, .text-gray-100, .text-gray-400 { color: black !important; }
    .text-accent, .text-primary { color: #444 !important; }
    main { max-width: 100% !important; margin: 0 !important; }
    .talent-bar { border: 1px solid #eee !important; }
    .talent-progress { background: #888 !important; }
    section { page-break-inside: avoid; }
  }
`;

// --- Components ---

const NebulaBackground = () => (
  <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#030305] no-print">
    <div className="nebula-layer w-[100vw] h-[100vw] bg-primary/10 top-[-10%] left-[-10%]" />
    <div className="nebula-layer w-[120vw] h-[120vw] bg-secondary/5 bottom-[-20%] right-[-10%]" />
  </div>
);

const ObservationGuide = () => (
  <div className="space-y-6 mb-10 no-print">
    <h3 className="text-xs font-bold text-accent uppercase tracking-[0.3em] flex items-center">
      <Info className="w-4 h-4 mr-2" /> 高高品質觀測指南
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[
        { icon: <Sun className="w-5 h-5 text-yellow-400" />, title: '明亮環境', desc: '在自然光下拍攝最為準確，避免閃光燈造成的反光' },
        { icon: <Smartphone className="w-5 h-5 text-blue-400" />, title: '對焦清晰', desc: '確保掌紋清晰不模糊' },
        { icon: <MousePointer2 className="w-5 h-5 text-green-400" />, title: '手掌平放', desc: '五指自然微張，手掌完全平整對準鏡頭' }
      ].map((item, i) => (
        <div key={i} className="glass p-5 rounded-2xl border-white/5 flex flex-col items-center text-center hover:border-white/20 transition-all">
          <div className="mb-3 p-3 bg-white/5 rounded-full">{item.icon}</div>
          <h4 className="text-[11px] font-bold text-white mb-1">{item.title}</h4>
          <p className="text-[9px] text-gray-500 leading-relaxed">{item.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

const App = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingText, setLoadingText] = useState('初始化智慧引擎...');
  const [result, setResult] = useState<PalmAnalysis | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [viewingHistory, setViewingHistory] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isProfileEntered, setIsProfileEntered] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const [age, setAge] = useState<string>('28');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('female');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('palm_history');
    if (saved) try { setHistory(JSON.parse(saved)); } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    if (analyzing) {
      const texts = [
        '啟動視覺神經元...',
        '定位掌中丘位...',
        '掃描八大星丘能量強度...',
        '破譯智慧與感性比例...',
        '分析潛能與職業路徑...',
        '偵測特殊標記紋路...',
        '計算生命演化趨勢...'
      ];
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
            { text: `你是一位融合心理學、職涯規劃與傳統手相統計學的頂尖大師。請針對這張 ${age}歲 ${gender === 'male' ? '男性' : '女性'} 的手掌照片進行深度「數位人格觀測」。
            
            ⚠️ 核心準則：
            1. 分析必須極度詳盡且專業。
            2. 包含：性格原型、五行掌型、八大掌丘狀況（木星丘、土星丘、太陽丘、水星丘、金星丘、月丘、第一/二火星丘）、四大主線（感情、智慧、生命、事業）。
            3. 特色分析：新增「天賦潛能場域」（給予具體職涯方向評分）、「社交互動風格」、「特殊記號偵測」（如星紋、井字、神祕十字）。
            4. 語氣：理性、啟發性、溫暖，並拒絕任何宿命或封建迷信。
            5. 回傳繁體中文 (zh-TW) 之純 JSON。` }
          ]
        },
        config: {
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 0 },
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isQualityGood: { type: Type.BOOLEAN },
              qualityFeedback: { type: Type.STRING },
              overall: { type: Type.STRING },
              archetype: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING } } },
              element: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, description: { type: Type.STRING }, traits: { type: Type.ARRAY, items: { type: Type.STRING } } } },
              heartLine: { type: Type.OBJECT, properties: { observation: { type: Type.STRING }, meaning: { type: Type.STRING }, points: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER }, detail: { type: Type.STRING } } } } } },
              headLine: { type: Type.OBJECT, properties: { observation: { type: Type.STRING }, meaning: { type: Type.STRING }, points: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER }, detail: { type: Type.STRING } } } } } },
              lifeLine: { type: Type.OBJECT, properties: { observation: { type: Type.STRING }, meaning: { type: Type.STRING }, points: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER }, detail: { type: Type.STRING } } } } } },
              fateLine: { type: Type.OBJECT, properties: { observation: { type: Type.STRING }, meaning: { type: Type.STRING }, points: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER }, detail: { type: Type.STRING } } } } } },
              mounts: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, status: { type: Type.STRING }, meaning: { type: Type.STRING } } } },
              talents: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { field: { type: Type.STRING }, score: { type: Type.NUMBER }, description: { type: Type.STRING } } } },
              socialStyle: { type: Type.STRING },
              specialMarkings: { type: Type.ARRAY, items: { type: Type.STRING } },
              lifeStages: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { period: { type: Type.STRING }, title: { type: Type.STRING }, insight: { type: Type.STRING } } } },
              advice: { type: Type.ARRAY, items: { type: Type.STRING } },
              disclaimer: { type: Type.STRING }
            },
            required: ['overall', 'element', 'mounts', 'talents', 'socialStyle', 'disclaimer']
          }
        }
      });

      if (!response.text) throw new Error("AI 未回傳內容");
      const parsed = JSON.parse(response.text.trim().replace(/^```(json)?\n?/, '').replace(/\n?```$/, ''));
      setResult(parsed);
    } catch (err: any) { 
      console.error("Analysis Error:", err);
      setError(`系統目前繁忙或設定有誤：${err.message || '連線逾時'}。請稍後再試。`); 
    } finally { 
      setAnalyzing(false); 
    }
  };

  const saveToHistory = () => {
    if (!result || !image) return;
    const newItem: HistoryItem = { id: Date.now().toString(), date: new Date().toLocaleString('zh-TW'), image, analysis: result };
    const updatedHistory = [newItem, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('palm_history', JSON.stringify(updatedHistory));
    setSavedSuccess(true);
  };

  const handlePrint = () => {
    if (!result) return;
    setTimeout(() => window.print(), 200);
  };

  const reset = () => {
    setImage(null); 
    setResult(null); 
    setAnalyzing(false); 
    setError(null); 
    setSavedSuccess(false);
    setIsCameraReady(false);
    if (videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    setIsCameraActive(false);
  };

  const captureImage = () => {
    if (canvasRef.current && videoRef.current && isCameraReady) {
      const ctx = canvasRef.current.getContext('2d');
      const vWidth = videoRef.current.videoWidth;
      const vHeight = videoRef.current.videoHeight;
      if (vWidth === 0 || vHeight === 0) return;
      canvasRef.current.width = vWidth;
      canvasRef.current.height = vHeight;
      ctx?.drawImage(videoRef.current, 0, 0);
      setImage(canvasRef.current.toDataURL('image/jpeg', 0.8)); 
      reset();
    }
  };

  return (
    <div className="min-h-screen pb-12 relative bg-[#030305] text-gray-100">
      <style>{styles}</style>
      <NebulaBackground />
      
      <div className="w-full py-2 disclaimer-banner text-[10px] text-center text-red-200 font-bold sticky top-0 z-50 backdrop-blur-md no-print border-b border-red-500/10">
        <ShieldAlert size={12} className="inline mr-2 text-red-400" />
        <span>理性觀測：本分析僅供性格參考與自我察覺。</span>
      </div>

      <header className="pt-8 pb-4 text-center px-4 no-print">
        <div className="mb-2 flex justify-center"><div className="ai-badge"><Cpu size={10} /><span>Deep Palm AI v3.0</span></div></div>
        <h1 className="text-4xl font-mystic font-bold mb-2 tracking-tighter">星命手相</h1>
        <div className="flex items-center justify-center space-x-2 text-gray-500 text-[10px] uppercase tracking-[0.2em]">
          <CircleDot size={8} className="text-primary animate-pulse" />
          <span>深度性格與潛能解析系統</span>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6">
        {/* --- 錯誤提示區塊 --- */}
        {error && (
          <div className="mb-6 p-5 rounded-[1.5rem] glass border-red-500/20 text-red-200 no-print flex flex-col animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 mt-0.5 text-red-400 flex-shrink-0" />
              <div>
                <p className="text-[11px] leading-relaxed font-bold mb-3">{error}</p>
                <div className="flex space-x-4">
                  <button onClick={() => { setError(null); if (!image) setIsProfileEntered(false); }} className="text-[10px] font-bold uppercase tracking-widest text-accent hover:underline flex items-center">
                    <RotateCcw className="w-3 h-3 mr-1" /> 重試操作
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- 第一步：指南與設定 --- */}
        {!isProfileEntered && !viewingHistory && (
          <div className="space-y-6 animate-in fade-in duration-700">
            <ObservationGuide />

            <section className="glass p-10 rounded-[2.5rem] border-white/10 shadow-2xl">
              <h3 className="text-xs font-bold mb-8 text-accent uppercase tracking-[0.3em] flex items-center">
                <ShieldCheck className="w-4 h-4 mr-2" /> 觀測對象設定
              </h3>
              
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">目前年齡</label>
                  <div className="flex items-center bg-white/5 rounded-2xl border border-white/10 px-6 py-4 focus-within:border-primary/50 transition-all">
                    <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full bg-transparent outline-none text-white font-bold text-2xl" />
                    <span className="text-xs text-gray-600 font-mystic">Years</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">命格性別</label>
                  <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10">
                    <button onClick={() => setGender('male')} className={`flex-1 py-4 rounded-xl text-xs font-bold font-mystic transition-all ${gender === 'male' ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>乾 (男)</button>
                    <button onClick={() => setGender('female')} className={`flex-1 py-4 rounded-xl text-xs font-bold font-mystic transition-all ${gender === 'female' ? 'bg-secondary text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>坤 (女)</button>
                  </div>
                </div>

                <div className="disclaimer-box group">
                  <p className="text-[10px] italic leading-relaxed text-gray-400">本系統運用 AI 進行性格統計分析。其結果應視為認識自我的工具。請保持開放與理性的心態。</p>
                  <div className={`flex items-center mt-4 cursor-pointer p-3 rounded-xl transition-all ${disclaimerAccepted ? 'bg-primary/10' : 'hover:bg-white/5'}`} onClick={() => setDisclaimerAccepted(!disclaimerAccepted)}>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-all ${disclaimerAccepted ? 'bg-primary border-primary' : 'border-white/20'}`}>
                      {disclaimerAccepted && <X size={12} strokeWidth={3} />}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${disclaimerAccepted ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>我已了解並拒絕迷信</span>
                  </div>
                </div>

                <button 
                  onClick={() => setIsProfileEntered(true)} 
                  disabled={!age || !disclaimerAccepted} 
                  className="w-full py-5 rounded-2xl bg-gradient-to-r from-primary/80 to-secondary/80 text-white font-bold font-mystic tracking-widest disabled:opacity-20 transition-all active:scale-95 shadow-xl hover:brightness-110"
                >
                  下一步：獲取影像
                </button>
              </div>
            </section>
          </div>
        )}

        {/* --- 獲取影像方式 --- */}
        {isProfileEntered && !image && !isCameraActive && !viewingHistory && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 no-print">
            <button onClick={() => setIsProfileEntered(false)} className="flex items-center text-gray-500 text-[9px] font-bold uppercase tracking-widest hover:text-white transition-all"><ChevronLeft size={12} className="mr-1" /> 返回設定</button>
            <div className="grid grid-cols-1 gap-4">
              <button onClick={async () => {
                try {
                  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                  if (videoRef.current) { videoRef.current.srcObject = stream; setIsCameraActive(true); }
                } catch (err: any) {
                  setError("無法啟動相機。請確認已授予相機權限，或嘗試使用「從相簿挑選」。");
                }
              }} className="glass p-12 rounded-[2.5rem] flex flex-col items-center group hover:border-primary/40 transition-all">
                <Camera className="text-primary w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold font-mystic text-white">啟動實時掃描</h3>
                <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest text-center">使用後置鏡頭以確保最佳細節</p>
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="w-full glass p-8 rounded-[2rem] flex flex-col items-center hover:border-secondary/40 transition-all">
                <Upload className="text-secondary w-6 h-6 mb-2" />
                <h3 className="text-sm font-bold font-mystic text-gray-400">從相簿挑選照片</h3>
                <input type="file" ref={fileInputRef} onChange={(e) => { 
                  const f = e.target.files?.[0]; 
                  if (f) { const r = new FileReader(); r.onloadend = () => setImage(r.result as string); r.readAsDataURL(f); } 
                }} className="hidden" accept="image/*" />
              </button>
            </div>
          </div>
        )}

        {/* --- 相機畫面 --- */}
        {isCameraActive && (
          <div className="relative rounded-[2.5rem] overflow-hidden aspect-[3/4] bg-black shadow-2xl border border-white/10 no-print animate-in fade-in duration-500">
            <video ref={videoRef} autoPlay playsInline onLoadedMetadata={() => setIsCameraReady(true)} className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[85%] h-[75%] border-2 border-dashed border-white/20 rounded-[3rem] relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-px bg-white/10 animate-pulse" />
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-[9px] text-white/50 uppercase tracking-[0.2em] whitespace-nowrap font-bold">請將手掌平放並對齊框內</div>
              </div>
            </div>
            {!isCameraReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <RefreshCw size={24} className="text-white animate-spin" />
              </div>
            )}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-6">
              <button onClick={reset} className="p-4 bg-black/60 rounded-full border border-white/10 text-white hover:bg-black/80 transition-colors"><RotateCcw size={20} /></button>
              <button onClick={captureImage} disabled={!isCameraReady} className={`w-20 h-20 rounded-full border-[6px] border-black/40 active:scale-90 shadow-2xl transition-all ${isCameraReady ? 'bg-white scale-100' : 'bg-gray-600 scale-90 opacity-50'}`} />
            </div>
          </div>
        )}

        {/* --- 確認分析 --- */}
        {image && !result && !analyzing && (
          <div className="space-y-6 animate-in fade-in no-print">
            <div className="relative rounded-[2rem] overflow-hidden border border-white/5 max-w-sm mx-auto shadow-2xl">
              <img src={image} className="w-full block" alt="Target" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <button onClick={() => setImage(null)} className="absolute top-4 right-4 p-2 bg-black/40 rounded-full text-white hover:bg-black/60 transition-colors shadow-lg"><RotateCcw size={14} /></button>
            </div>
            
            <button 
              onClick={analyzePalm} 
              className="w-full py-6 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-lg font-mystic tracking-widest shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center"
            >
              <Zap className="mr-2 w-6 h-6 fill-white" /> 開始深度解析
            </button>
          </div>
        )}

        {/* --- 解析中 --- */}
        {analyzing && (
          <div className="text-center py-20 no-print">
            <div className="relative w-40 h-60 mx-auto mb-10 rounded-[2rem] overflow-hidden glass border border-white/10 shadow-[0_0_50px_rgba(139,92,246,0.2)]">
              <img src={image!} className="w-full h-full object-cover opacity-40" alt="Processing" />
              <div className="scan-line" />
            </div>
            <p className="text-accent text-xl font-mystic tracking-[0.4em] animate-pulse">核心引擎解析中...</p>
            <p className="text-gray-500 text-[10px] mt-4 uppercase tracking-[0.2em] px-10 leading-relaxed font-bold">{loadingText}</p>
          </div>
        )}

        {/* --- 分析結果報告 --- */}
        {result && (
          <div id="printable-report" className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="text-center space-y-4">
              <div className="ai-badge border-accent/20 text-accent"><Star size={10} className="fill-accent" /><span>{result.archetype.name}</span></div>
              <p className="text-3xl text-white font-mystic tracking-wider italic leading-relaxed px-4">「{result.overall}」</p>
              <p className="text-[12px] text-gray-400 leading-relaxed italic px-8">{result.archetype.description}</p>
            </div>

            <div className="relative rounded-[3rem] overflow-hidden glass border border-white/20 shadow-2xl">
              <img src={image!} alt="Final Analysis" className="w-full h-auto opacity-70 block" />
              {([
                { key: 'heartLine', color: '#ef4444' },
                { key: 'headLine', color: '#3b82f6' },
                { key: 'lifeLine', color: '#22c55e' },
                { key: 'fateLine', color: '#a855f7' }
              ] as const).map(({ key, color }) => (
                (result as any)[key]?.points?.map((p: Point, i: number) => (
                  <div key={`${key}-${i}`} className="line-marker" style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%`, backgroundColor: color }}>
                    <div className="marker-tooltip no-print"><div className="font-bold mb-1 uppercase text-[9px]" style={{ color }}>{(result as any)[key].observation}</div>{p.detail}</div>
                  </div>
                ))
              ))}
              <div className="absolute bottom-8 right-8 z-20">
                <div className="px-5 py-3 glass border-white/10 rounded-2xl flex items-center space-x-3">
                  <ElementIcon type={result.element.type} />
                  <div className="text-left">
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">五行掌型</div>
                    <div className="text-xs font-mystic font-bold text-white">{result.element.type}之掌</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-4 pt-10 no-print">
              <div className="grid grid-cols-2 gap-4">
                <button onClick={saveToHistory} disabled={savedSuccess} className={`flex-1 py-5 rounded-2xl border font-bold font-mystic text-base transition-all ${savedSuccess ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-primary/20 text-white border-primary/20 shadow-lg active:scale-95 hover:bg-primary/30'}`}>
                  {savedSuccess ? '已存入命譜' : '存檔保存'}
                </button>
                <button onClick={handlePrint} className="flex-1 py-5 rounded-2xl border border-accent/20 bg-accent/10 text-accent font-bold font-mystic text-base transition-all shadow-lg flex items-center justify-center space-x-2 active:scale-95 hover:bg-accent/20">
                  <Printer size={18} /><span>列印報告</span>
                </button>
              </div>
              <button onClick={reset} className="w-full py-4 rounded-2xl glass text-gray-500 font-bold font-mystic text-sm border-white/5 active:opacity-60 hover:text-gray-300 transition-colors">
                啟動新命觀測
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-20 text-center flex flex-col items-center pb-12 opacity-30 px-6 no-print">
        <p className="text-[9px] text-gray-500 max-w-xs leading-loose mb-6">手相隨心而變，AI 分析僅供大數據統計參考。人生由您的選擇決定。</p>
        <div className="font-mystic tracking-[0.6em] text-[8px] uppercase">AI Palmistry Analyst &bull; v3.0 Powered by Gemini</div>
      </footer>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

const ElementIcon = ({ type }: { type: string }) => {
  switch (type) {
    case '火': return <Flame className="w-5 h-5 text-orange-400" />;
    case '水': return <Waves className="w-5 h-5 text-blue-400" />;
    case '木': return <Wind className="w-5 h-5 text-green-400" />;
    case '金': return <Sparkles className="w-5 h-5 text-yellow-200" />;
    case '土': return <Mountain className="w-5 h-5 text-amber-600" />;
    default: return <CircleDot className="w-5 h-5 text-gray-400" />;
  }
};

createRoot(document.getElementById('root')!).render(<App />);
