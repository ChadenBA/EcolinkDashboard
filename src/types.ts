export interface SurveyRow {
  Q1: string;
  Q2: string;
  Q3: string;
  Q4: string;
  Q5: string;
  Q6: string;
  Q7: string;
  Q8: string;
  Q9?: string;
  Q10: string;
  Q11: string;
}

export interface Stats {
  leavePlastic: number;
  accuseState: number;
  fatalisme: number;
  noRecycle: number;
  emotional: number;
  realAction: number;
  medsTrash: number;
  intervene: number;
}
