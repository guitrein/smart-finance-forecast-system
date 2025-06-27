
import { StatCard } from '../StatCard';

interface EstatisticasDashboardProps {
  receitas: number;
  despesas: number;
  saldo: number;
  formatarMoeda: (valor: number) => string;
}

export const EstatisticasDashboard = ({ 
  receitas, 
  despesas, 
  saldo, 
  formatarMoeda 
}: EstatisticasDashboardProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        title="Receitas"
        value={formatarMoeda(receitas)}
        icon="💰"
        color="green"
      />
      <StatCard
        title="Despesas"
        value={formatarMoeda(despesas)}
        icon="💸"
        color="red"
      />
      <StatCard
        title="Saldo"
        value={formatarMoeda(saldo)}
        icon={saldo >= 0 ? "📈" : "📉"}
        color={saldo >= 0 ? "green" : "red"}
      />
    </div>
  );
};
