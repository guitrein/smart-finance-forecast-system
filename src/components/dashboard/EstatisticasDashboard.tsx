
import { StatCard } from '../StatCard';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

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
      <div className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Receitas</p>
            <p className="text-2xl font-bold mt-1 text-green-600">{formatarMoeda(receitas)}</p>
            <p className="text-sm text-muted-foreground mt-1">Entradas do período</p>
          </div>
          <div className="p-3 bg-green-50 rounded-full">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Despesas</p>
            <p className="text-2xl font-bold mt-1 text-red-600">{formatarMoeda(despesas)}</p>
            <p className="text-sm text-muted-foreground mt-1">Saídas do período</p>
          </div>
          <div className="p-3 bg-red-50 rounded-full">
            <TrendingDown className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Saldo</p>
            <p className={`text-2xl font-bold mt-1 ${saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatarMoeda(saldo)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {saldo >= 0 ? 'Resultado positivo' : 'Resultado negativo'}
            </p>
          </div>
          <div className={`p-3 rounded-full ${saldo >= 0 ? 'bg-blue-50' : 'bg-red-50'}`}>
            <DollarSign className={`w-6 h-6 ${saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
          </div>
        </div>
      </div>
    </div>
  );
};
