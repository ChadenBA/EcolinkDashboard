import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import { TrendingDown, AlertTriangle, Users, Recycle, Heart, Eye, Pill, Flame } from "lucide-react";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQHuMXUluAZfdzRj7UMU3rCUd2x7Zlgq-dZNicSx92e7IpML7Eup2JO3qGjGBBunadhTnvluP1H6tVd/pub?gid=230946886&single=true&output=csv";

interface SurveyRow {
  Q1: string; Q2: string; Q3: string; Q4: string; Q5: string;
  Q6: string; Q7: string; Q8: string; Q10: string; Q11: string;
}

interface Stats {
  leavePlastic: number;
  accuseState: number;
  fatalisme: number;
  noRecycle: number;
  emotional: number;
  realAction: number;
  medsTrash: number;
  intervene: number;
}

interface ChartItem {
  label: string;
  value: number;
  color: string;
}

const computeStats = (data: SurveyRow[]): Stats => {
  const total = data.length || 1;
  return {
    leavePlastic: Math.round((data.filter(r => r.Q1?.includes("نخلّيه") || r.Q1?.includes("يطير")).length / total) * 100),
    accuseState: Math.round((data.filter(r => r.Q2?.includes("الدولة")).length / total) * 100),
    fatalisme: Math.round((data.filter(r => r.Q3?.includes("نعم")).length / total) * 100),
    noRecycle: Math.round((data.filter(r => r.Q6?.includes("لا")).length / total) * 100),
    emotional: Math.round((data.filter(r => r.Q5?.includes("نعم")).length / total) * 100),
    realAction: Math.round((data.filter(r => r.Q5?.includes("نعم")).length / total) * 100),
    medsTrash: Math.round((data.filter(r => r.Q10?.includes("زبلة")).length / total) * 100),
    intervene: Math.round((data.filter(r => r.Q11?.includes("لا")).length / total) * 100),
  };
};

const PieChart: React.FC<{ data: ChartItem[] }> = ({ data }) => {
  const chartData = {
    labels: data.map(d => d.label),
    datasets: [{
      data: data.map(d => d.value),
      backgroundColor: data.map(d => d.color),
      borderWidth: 2,
      borderColor: "#1e293b",
      hoverOffset: 20,
    }],
  };
  return <Pie data={chartData} />;
};

const BarChart: React.FC<{ data: ChartItem[] }> = ({ data }) => {
  const chartData = {
    labels: data.map(d => d.label),
    datasets: [{
      label: "النسبة المئوية",
      data: data.map(d => d.value),
      backgroundColor: data.map(d => d.color),
      borderRadius: 6,
      barPercentage: 0.6,
    }],
  };
  const options = {
    plugins: { legend: { display: false } },
    responsive: true,
    scales: {
      y: { beginAtZero: true, max: 100, ticks: { color: "#cbd5e1", stepSize: 20 } },
      x: { ticks: { color: "#cbd5e1" } }
    }
  };
  return <Bar data={chartData} options={options} />;
};

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({});

  useEffect(() => {
    Papa.parse(CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as Record<string, string>[];
        const mappedData: SurveyRow[] = rows.map((r) => ({
          Q1: r["آخر مرّة كيّس بلاستيك طار من يدك أو من سيارتك… شنوّة عملت؟"] || "",
          Q2: r["كي تمشي للبحر وتلقى البلاستيك في الماء، تتغشّ على الدولة ولا على الشعب؟"] || "",
          Q3: r['هل عمرك قلت "موش أنا إلي باش نصلّح الدنيا"?'] || "",
          Q4: r["وقت تشري حاجة بلاستيك في عوض حاجة قابلة لإعادة الاستعمال، علاش؟"] || "",
          Q5: r["كي تشوف فيديو سلحفاة تختنق بسبب البلاستيك… هل تغيّر عاداتك؟"] || "",
          Q6: r["هل تفرّز الزبلة في دارك؟"] || "",
          Q7: r["لو نقولّك إنك تخلّف أكثر من 20,000 قطعة بلاستيك طول حياتك… كيفاش تحسّ؟"] || "",
          Q8: r["تتصوّر الناس في الخارج كيفاش يشوفو التوانسة كي يجيّونا؟"] || "",
          Q10: r["شنوّة تعمل بالأدوية القديمة أو منتهية الصلوحية؟"] || "",
          Q11: r["كي تشوف حدّ يرمي الزبلة… شنوّة تعمل؟"] || "",
        }));
        setStats(computeStats(mappedData));
        setLoading(false);
      },
      error: (err) => { console.error(err); setLoading(false); },
    });
  }, []);

  useEffect(() => {
    if (stats) {
      Object.entries(stats).forEach(([key, value], i) => {
        let current = 0;
        const increment = value / 30;
        const timer = setInterval(() => {
          current += increment;
          setAnimatedValues(prev => ({ ...prev, [key]: Math.min(Math.floor(current), value) }));
          if (current >= value) clearInterval(timer);
        }, 20 + i * 5);
      });
    }
  }, [stats]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <p className="text-white text-xl animate-pulse">جاري تحميل البيانات...</p>
    </div>
  );

  if (!stats) return null;

  const cards = [
    { title: "ترك البلاستيك يطير", key: "leavePlastic", value: stats.leavePlastic, icon: TrendingDown, color: "#ef4444" },
    { title: "لوم الدولة", key: "accuseState", value: stats.accuseState, icon: AlertTriangle, color: "#f97316" },
    { title: "فقدان الأمل", key: "fatalisme", value: stats.fatalisme, icon: Users, color: "#eab308" },
    { title: "عدم الفرز", key: "noRecycle", value: stats.noRecycle, icon: Recycle, color: "#a855f7" },
    { title: "تأثير عاطفي", key: "emotional", value: stats.emotional, icon: Heart, color: "#ec4899" },
    { title: "عمل فعلي", key: "realAction", value: stats.realAction, icon: Eye, color: "#10b981" },
    { title: "رمي الأدوية", key: "medsTrash", value: stats.medsTrash, icon: Pill, color: "#3b82f6" },
    { title: "تدخل ضعيف", key: "intervene", value: stats.intervene, icon: Flame, color: "#dc2626" },
  ];

  const pieData = cards.map(c => ({ label: c.title, value: c.value, color: c.color }));
  const barData = cards.map(c => ({ label: c.title, value: c.value, color: c.value > 50 ? "#ef4444" : "#3b82f6" }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="text-center">
          <h1 className="text-6xl font-extrabold bg-gradient-to-r from-red-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
            💥  الصدمة 💥
          </h1>
          <p className="text-purple-300 text-lg mt-2">تحليل السلوكيات البيئية</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((c) => {
            const Icon = c.icon;
            const displayValue = animatedValues[c.key] || 0;
            return (
              <div key={c.key} className="relative group rounded-2xl bg-slate-800/70 backdrop-blur-lg p-6 border border-slate-700 hover:border-purple-500 transition-transform duration-300 hover:scale-105 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r from-white to-slate-500`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {c.value > 50 && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-500/20 text-red-400 animate-pulse">⚠️ تنبيه</span>
                  )}
                </div>
                <h3 className="text-slate-300 text-sm mb-2">{c.title}</h3>
                <div className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">{displayValue}%</div>
                <div className="mt-4 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000 ease-out" style={{ width: `${displayValue}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-800/70 backdrop-blur-lg p-8 rounded-2xl border border-slate-700 hover:border-purple-500 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></span> 
            </h2>
            <PieChart data={pieData} />
          </div>
          <div className="bg-slate-800/70 backdrop-blur-lg p-8 rounded-2xl border border-slate-700 hover:border-purple-500 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></span> 
            </h2>
            <BarChart data={barData} />
          </div>
        </div>
      </div>
    </div>
  );
};
