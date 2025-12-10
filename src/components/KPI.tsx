interface KPIProps {
    title: string;
    value: number;
  }
  
  export const KPI: React.FC<KPIProps> = ({ title, value }) => {
    return (
      <div className="card kpi">
        <h3 className="text-gray-600">{title}</h3>
        <p className="value">{value}%</p>
      </div>
    );
  };
  