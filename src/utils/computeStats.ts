import type { SurveyRow, Stats } from "../types";

export function computeStats(data: SurveyRow[]): Stats {
  const total = data.length || 1;
  const pct = (count: number) => Math.round((count / total) * 100);

  return {
    leavePlastic: pct(data.filter(d => d.Q1?.includes("خليتو يطير")).length),
    accuseState: pct(data.filter(d => d.Q2?.includes("على الدولة")).length),
    fatalisme: pct(data.filter(d => d.Q3?.includes("نعم") || d.Q3?.includes("مرات")).length),
    noRecycle: pct(data.filter(d => d.Q6?.includes("عمري")).length),
    emotional: pct(data.filter(d => d.Q5?.includes("نعم") || d.Q5?.includes("يمكن")).length),
    realAction: pct(data.filter(d => d.Q6?.includes("نعم")).length),
    medsTrash: pct(data.filter(d => d.Q10?.includes("نرميهم في الزبلة")).length),
    intervene: pct(data.filter(d => d.Q11?.includes("ما تعملش")).length),
  };
}
