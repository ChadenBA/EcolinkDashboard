import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import {
  TrendingDown,
  AlertTriangle,
  Users,
  Recycle,
  Heart,
  Pill,
  Flame,
  Trash,
  Hand,
  Leaf,
  Wind,
  Droplets,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Skull,
  Biohazard,
  Clock,
  AlertOctagon,
} from "lucide-react";

import {
  Bar,
  Pie,

  Radar
} from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Images
import MousePointing from "../assets/images/Gemini_Generated_Image_mjvvuzmjvvuzmjvv-removebg-preview.png";
import MouseRunning from "../assets/images/mouse-running.png";
// Audio
import GaspSound from "../assets/gasp_SJHmiqB.mp3";
import drumSound from "../assets/short-drum-roll-and-impact-crash.mp3";


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

// -------------------------
// 🔗 GOOGLE SHEET
// -------------------------
const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQHuMXUluAZfdzRj7UMU3rCUd2x7Zlgq-dZNicSx92e7IpML7Eup2JO3qGjGBBunadhTnvluP1H6tVd/pub?gid=230946886&single=true&output=csv";

// -------------------------
interface SurveyRow {
  Q1: string;
  Q2: string;
  Q3: string;
  Q4: string;
  Q5: string;
  Q6: string;
  Q7: string;
  Q8: string;
  Q9: string;
  Q10: string;
  Q11: string;
}

// -------------------------
// -------------------------
interface Stats {
  leavePlastic: number;
  accuseState: number;
  fatalisme: number;
  emotional: number;
  noRecycle: number;
  plasticBags: number;
  medsTrash: number;
  smallExcuses: number;
  careAction: number;
  globalAwareness: number;
  // New metrics
  ecoScore: number;
  actionGap: number;
  negativityIndex: number;
  // Shock Metrics
  totalPlasticBagsYear: number;
  legacyCount: number; // Lifetime items
  decompositionLoad: number; // Cumulative years
  // Dynamic Fact
  criticalFact: { subject: string; text: string };
}

// -------------------------
const computeStats = (data: SurveyRow[]): Stats => {
  const total = data.length || 1;
  const pct = (count: number) => Math.round((count / total) * 100);

  const statsObj = {
    leavePlastic: pct(data.filter(d => d.Q1?.match(/طار|خليتو/)).length),
    accuseState: pct(data.filter(d => d.Q2?.includes("الدولة")).length),
    fatalisme: pct(data.filter(d => d.Q3?.includes("نعم")).length),
    emotional: pct(data.filter(d => d.Q5?.includes("نعم")).length),
    noRecycle: pct(data.filter(d => d.Q6?.match(/عمري|قليل/)).length),
    plasticBags: pct(data.filter(d => d.Q7?.match(/8|10|أكثر/)).length),
    medsTrash: pct(data.filter(d => d.Q9?.includes("زبلة")).length),
    smallExcuses: pct(data.filter(d => d.Q10?.match(/مرّة|برشا/)).length),
    careAction: pct(data.filter(d => d.Q11?.includes("ترميهم")).length),
    globalAwareness: pct(data.filter(d => d.Q8?.match(/صدمة|ذنب/)).length),
  };

  // Composite Metrics
  const positivityScore = (statsObj.careAction + statsObj.globalAwareness + statsObj.emotional) / 3;
  const negativityScore = (statsObj.leavePlastic + statsObj.noRecycle + statsObj.plasticBags + statsObj.medsTrash) / 4;

  // Eco Score calculation
  const rawScore = 0.7 * (100 - negativityScore) + 0.3 * positivityScore;

  // --- SHOCK METRICS CALCULATION ---
  let totalBagsWeek = 0;
  data.forEach(d => {
    const ans = d.Q7 || "";
    if (ans.match(/أكثر/)) totalBagsWeek += 15;
    else if (ans.match(/8|10/)) totalBagsWeek += 9;
    else if (ans.match(/4|7/)) totalBagsWeek += 6;
    else if (ans.match(/1|3/)) totalBagsWeek += 2;
    else totalBagsWeek += 3;
  });

  const avgBagsPerPerson = data.length ? (totalBagsWeek / data.length) : 3;
  const totalPlasticBagsYear = Math.round(avgBagsPerPerson * 52);
  const legacyCount = Math.round(totalPlasticBagsYear * 60);
  const decompositionLoad = legacyCount * 450;

  // --- CRITICAL FACT EXTRACTION ---
  const negatives = [
    { key: 'leavePlastic', val: statsObj.leavePlastic, subject: 'ترك البلاستيك', fact: `⚠️ ${statsObj.leavePlastic}% منكم اعترفوا بترك البلاستيك يطير في الطبيعة ولم يهتموا بمصيره!` },
    { key: 'medsTrash', val: statsObj.medsTrash, subject: 'رمي الأدوية', fact: `💊 ${statsObj.medsTrash}% من المشاركين يرمون الأدوية والسموم في القمامة العادية، مسببة تلوث المياه.` },
    { key: 'plasticBags', val: statsObj.plasticBags, subject: 'إدمان الأكياس', fact: `🛍️ ${statsObj.plasticBags}% من الإجابات تظهر استخداماً مفرطاً وخطيراً للأكياس البلاستيكية أسبوعياً.` },
    { key: 'noRecycle', val: statsObj.noRecycle, subject: 'غياب الفرز', fact: `🗑️ ${statsObj.noRecycle}% منكم لا يقومون بفرز القمامة في منازلهم نهائياً. كل هذا يذهب للمصبات!` },
    { key: 'accuseState', val: statsObj.accuseState, subject: 'اللوم السلبي', fact: `🗣️ ${statsObj.accuseState}% يكتفون بلوم الدولة والمجتمع بينما لا يغيرون عاداتهم الشخصية.` },
  ];

  // Find the max negative trait
  const critical = negatives.reduce((prev, current) => (prev.val > current.val) ? prev : current);

  return {
    ...statsObj,
    ecoScore: Math.round(rawScore),
    actionGap: Math.max(0, statsObj.globalAwareness - statsObj.careAction),
    negativityIndex: Math.round((statsObj.accuseState + statsObj.fatalisme + statsObj.smallExcuses) / 3),
    totalPlasticBagsYear,
    legacyCount,
    decompositionLoad,
    criticalFact: { subject: critical.subject, text: critical.fact },
  };
};

// -------------------------
interface ChartItem {
  label: string;
  value: number;
  color: string;
}

// -------------------------
const PieChart: React.FC<{ data: ChartItem[] }> = ({ data }) => (
  <Pie
    data={{
      labels: data.map(d => d.label),
      datasets: [
        {
          data: data.map(d => d.value),
          backgroundColor: data.map(d => d.color),
          borderColor: '#ffffff',
          borderWidth: 2,
        },
      ],
    }}
  />
);

const BarChart: React.FC<{ data: ChartItem[] }> = ({ data }) => (
  <Bar
    data={{
      labels: data.map(d => d.label),
      datasets: [
        {
          label: "النسبة %",
          data: data.map(d => d.value),
          backgroundColor: data.map(d => d.color),
          borderRadius: 8,
        },
      ],
    }}
    options={{
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
        x: { grid: { display: false } }
      }
    }}
  />
);



const RadarChart: React.FC<{ data: ChartItem[] }> = ({ data }) => (
  <Radar
    data={{
      labels: data.map(d => d.label),
      datasets: [
        {
          label: "الوعي البيئي",
          data: data.map(d => d.value),
          backgroundColor: 'rgba(20, 184, 166, 0.2)',
          borderColor: '#14b8a6',
          pointBackgroundColor: '#14b8a6',
        },
      ],
    }}
    options={{
      scales: {
        r: {
          angleLines: { color: 'rgba(0,0,0,0.1)' },
          grid: { color: 'rgba(0,0,0,0.1)' },
          pointLabels: { font: { size: 12 } }
        }
      }
    }}
  />
);

// -------------------------
// MAIN DASHBOARD
// -------------------------
export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    Papa.parse(CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as Record<string, string>[];
        const mapped: SurveyRow[] = rows.map(r => ({
          Q1: r["آخر مرّة كيّس بلاستيك طار من يدك أو من سيارتك… شنوّة عملت؟"] || "",
          Q2: r["كي تمشي للبحر وتلقى البلاستيك في الماء، تتغشّ على الدولة ولا على الشعب؟"] || "",
          Q3: r['هل عمرك قلت “موش أنا إلي باش نصلّح الدنيا”؟'] || "",
          Q4: r["وقت تشري حاجة بلاستيك في عوض حاجة قابلة لإعادة الاستعمال، علاش؟"] || "",
          Q5: r["كي تشوف فيديو سلحفاة تختنق بسبب البلاستيك… هل تغيّر عاداتك؟"] || "",
          Q6: r["هل تفرّز الزبلة في دارك؟"] || "",
          Q7: r["قدّاش تستعمل من شكارة بلاستيك في الأسبوع؟"] || "",
          Q8: r["لو نقولّك إنك تخلّف أكثر من 20,000 قطعة بلاستيك طول حياتك… كيفاش تحسّ؟"] || "",
          Q9: r["شنوّة تعمل بالأدوية القديمة أو منتهية الصلوحية؟"] || "",
          Q10: r['قدّاش من مرّة قلت: "ما يهمّش، حاجة صغيرة"؟'] || "",
          Q11: r['" كي يبدا عند دبابس ولا بلاستيك "'] || "",
        }));
        setStats(computeStats(mapped));
      },
    });
  }, []);

  const handleReveal = () => {
    if (isRolling) return;
    setIsRolling(true);

    // Pre-load Gasp Sound (Local Asset)
    const gasp = new Audio(GaspSound);
    gasp.volume = 1.0;
    gasp.load();

    // 1. Play Drum Roll
    const drum = new Audio(drumSound);
    drum.volume = 0.6;
    drum.loop = true;
    drum.play().catch(e => console.error("Drum play failed:", e));

    // 2. Wait for drama...
    setTimeout(() => {
      drum.pause();
      setIsRolling(false);
      setIsRevealed(true);

      // 3. Play Gasp Sound
      gasp.play().catch(e => console.error("Gasp play failed:", e));
    }, 2500);
  };

  // Intro Screen
  if (!isRevealed) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
        <div className="absolute w-96 h-96 bg-red-600 rounded-full blur-[150px] opacity-20 animate-pulse top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>

        <div className="relative z-10 text-center max-w-2xl">
          <AlertOctagon className="w-20 h-20 text-red-500 mx-auto mb-8 animate-bounce" />
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6">هل أنت مستعد لمواجهة الحقيقة؟</h1>
          <p className="text-slate-400 text-xl mb-12">النتائج صادمة... والأرقام لا تكذب.</p>

          <button
            onClick={handleReveal}
            disabled={isRolling}
            className={`
               px-10 py-6 text-2xl font-bold rounded-full shadow-[0_0_40px_rgba(239,68,68,0.5)]
               transition-all duration-300 transform hover:scale-105 active:scale-95
               ${isRolling ? 'bg-slate-700 cursor-wait' : 'bg-red-600 hover:bg-red-700 text-white'}
             `}
          >
            {isRolling ? 'جاري تحليل الكوارث...' : 'اكشف المستور! 🚨'}
          </button>
        </div>
      </div>
    );
  }

  // Loading Stats
  if (!stats) return (
    <div className="min-h-screen bg-eco-gradient flex items-center justify-center">
      <div className="text-eco-primary text-2xl font-bold animate-pulse">Loading Data...</div>
    </div>
  );



  // 1. Raw Data Cards (Keep for KPI display)
  const cards = [
    { key: "leavePlastic", title: "ترك البلاستيك يطير", value: stats.leavePlastic, icon: Wind, color: "#f87171" },
    { key: "accuseState", title: "لوم الدولة", value: stats.accuseState, icon: AlertTriangle, color: "#fb923c" },
    { key: "fatalisme", title: "الانهزامية", value: stats.fatalisme, icon: TrendingDown, color: "#facc15" },
    { key: "emotional", title: "التأثر العاطفي", value: stats.emotional, icon: Heart, color: "#ec4899" },
    { key: "noRecycle", title: "عدم الفرز", value: stats.noRecycle, icon: Trash, color: "#a78bfa" },
    { key: "plasticBags", title: "استعمال الشكاير", value: stats.plasticBags, icon: Droplets, color: "#60a5fa" },
    { key: "medsTrash", title: "رمي الأدوية", value: stats.medsTrash, icon: Pill, color: "#34d399" },
    { key: "smallExcuses", title: "تبرير الأخطاء", value: stats.smallExcuses, icon: Flame, color: "#ef4444" },
    { key: "careAction", title: "التصرف الصحيح", value: stats.careAction, icon: Hand, color: "#22c55e" },
    { key: "globalAwareness", title: "الوعي البيئي", value: stats.globalAwareness, icon: Leaf, color: "#14b8a6" },
  ];

  // 2. Prepared Datasets for specific Charts
  const plasticHabitsData = [
    { label: "ترك البلاستيك", value: stats.leavePlastic, color: "#f87171" },
    { label: "عدم الفرز", value: stats.noRecycle, color: "#a78bfa" },
    { label: "استعمال الشكاير", value: stats.plasticBags, color: "#60a5fa" },
    { label: "رمي الأدوية", value: stats.medsTrash, color: "#34d399" },
  ];

  const indicesData = [
    { label: "Eco Score (نقاط البيئة)", value: stats.ecoScore, color: "#10b981" }, // Emerald-500
    { label: "Action Gap (الفجوة)", value: stats.actionGap, color: "#f43f5e" },   // Rose-500
    { label: "Negativity (السلبية)", value: stats.negativityIndex, color: "#64748b" }, // Slate-500
  ];

  const radarData = cards.map(c => ({
    label: c.title,
    value: c.value,
    color: c.color,
  }));

  return (
    <div className={`min-h-screen bg-eco-gradient p-6 font-sans text-slate-800 overflow-x-hidden relative`}>

      {/* DECORATIVE BACKGROUND ELEMENTS */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-sky-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-delayed"></div>

      {/* HEADER / HERO SECTION */}
      <header className="relative z-10 max-w-7xl mx-auto mb-12 text-center animate-fade-in">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="relative">
            <img src={MousePointing} alt="Mascot" className="w-48 md:w-64 animate-float drop-shadow-2xl" />
          </div>
          <div className="text-center md:text-right">
            <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 mb-4">
              الصدمة البيئية
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 font-medium">لوحة قيادة تفاعلية للوعي البيئي</p>
            <div className="mt-4 inline-flex items-center gap-2 bg-white/50 px-4 py-2 rounded-full shadow-sm text-sm text-emerald-700">
              <Recycle className="w-4 h-4" />
              <span>لنحمي كوكبنا معاً</span>
            </div>
          </div>
        </div>
      </header>

      {/* KPI SCROLLABLE ROW (Optional, or Grid) */}
      <div className="relative z-10 max-w-7xl mx-auto mb-12">
        <h2 className="text-2xl font-bold text-slate-700 mb-6 px-4 border-r-4 border-emerald-500 mr-4">المؤشرات التفصيلية</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.key}
                className="glass-card p-8 flex flex-col items-center text-center transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
              >
                <Icon className="w-16 h-16 mb-4" style={{ color: card.color }} />
                <span className="text-lg font-bold text-slate-500 mb-2">{card.title}</span>
                <span className="text-5xl font-black text-slate-700">{card.value}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

        {/* 1. COMPOSITE INDICES (Bar) */}
        <div className="glass-card p-6 min-h-[600px] flex flex-col justify-center animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h2 className="text-xl font-bold text-slate-700 mb-6 flex items-center gap-2">
            <BarChartIcon className="w-5 h-5 text-sky-500" /> تحليل المؤشرات
          </h2>
          <BarChart data={indicesData} />
          <p className="text-xs text-slate-400 mt-4 text-center">
            مقارنة بين الوعي العام، الفجوة في التصرف، ومؤشر السلبية.
          </p>
        </div>

        {/* 2. PLASTIC HABITS (Pie) */}
        <div className="glass-card p-8 min-h-[400px] flex flex-col justify-center animate-slide-up" style={{ animationDelay: '300ms' }}>
          <h2 className="text-xl font-bold text-slate-700 mb-6 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-red-400" /> عادات البلاستيك
          </h2>
          <PieChart data={plasticHabitsData} />
        </div>

        {/* 3. DETAILED VIEW (Radar) */}
        <div
          className="glass-card p-10 min-h-[500px] flex flex-col justify-center animate-slide-up relative lg:col-span-1 md:col-span-2"
          style={{ animationDelay: '400ms' }}
        >
          <div className="absolute top-4 right-4 opacity-10">
            <Leaf className="w-32 h-32 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-700 mb-6 flex items-center gap-4">
            <Users className="w-8 h-8 text-teal-500" /> البصمة الكاملة
          </h2>
          <div className="h-[350px] flex justify-center">
            <RadarChart data={radarData} />
          </div>
        </div>



      </div>

      {/* SHOCK / REALITY CHECK SECTION */}
      <div className="relative z-10 max-w-5xl mx-auto my-16 p-8 bg-slate-900 rounded-3xl shadow-2xl border border-red-900/50 overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-red-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-pulse"></div>

        <div className="relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-red-950/80 text-red-400 px-4 py-1 rounded-full text-xs font-mono mb-6 border border-red-900/50 animate-bounce">
            <AlertOctagon className="w-4 h-4" />
            <span>WARNING: BIOLOGICAL HAZARD DETECTED</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
            الحقيقة المرعبة
          </h2>
          <p className="text-red-400 font-mono text-lg mb-12">أرقام لا تكذب... ومستقبل لا يرحم</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* STAT 1 */}
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-red-500 transition-colors duration-300">
              <Skull className="w-12 h-12 text-red-500 mx-auto mb-4 animate-pulse" />
              <div className="text-4xl font-black text-white mb-1 counter-up">
                {stats.legacyCount.toLocaleString()}
              </div>
              <div className="text-sm text-slate-400 font-bold uppercase tracking-wider">قطعة تتركها خلفك</div>
              <p className="text-xs text-slate-500 mt-2">ميراثك السام للأجيال القادمة</p>
            </div>

            {/* STAT 2 */}
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-red-500 transition-colors duration-300">
              <Biohazard className="w-12 h-12 text-amber-500 mx-auto mb-4 animate-[spin_10s_linear_infinite]" />
              <div className="text-4xl font-black text-white mb-1">
                {(stats.decompositionLoad / 1000).toFixed(1)}k
              </div>
              <div className="text-sm text-slate-400 font-bold uppercase tracking-wider">سنة للتحلل</div>
              <p className="text-xs text-slate-500 mt-2">مجموع السنوات التي سيبقى فيها بلاستيكك حياً</p>
            </div>

            {/* STAT 3 */}
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-red-500 transition-colors duration-300">
              <Clock className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <div className="text-4xl font-black text-white mb-1">
                {stats.totalPlasticBagsYear}
              </div>
              <div className="text-sm text-slate-400 font-bold uppercase tracking-wider">كيس سنوياً</div>
              <p className="text-xs text-slate-500 mt-2">تخيل جبل النفايات هذا في غرفة نومك</p>
            </div>
          </div>

          {/* DYNAMIC FACT BOX */}
          <div className="max-w-3xl mx-auto bg-red-950/30 border border-red-500/30 p-6 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>
            <h3 className="text-red-400 font-bold uppercase tracking-widest text-xs mb-2">
              المشكلة رقم 1: {stats.criticalFact.subject}
            </h3>
            <p className="text-xl md:text-2xl text-white font-medium leading-relaxed">
              "{stats.criticalFact.text}"
            </p>
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <footer className="relative z-10 text-center py-10 mt-10 text-slate-500">
        <div className="flex justify-center items-center gap-4 mb-4">
          <img src={MouseRunning} alt="Running" className="w-16 h-16 animate-bounce" />
          <p className="text-lg">كل خطوة صغيرة بتعمل فرق كبير!</p>
        </div>
        <p className="text-sm">© 2025 EcoLink-Dashboard. Made with 💚 for the planet.</p>
      </footer>

    </div>
  );
};

