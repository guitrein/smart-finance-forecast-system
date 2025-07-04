
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
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:shadow-lg transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Receitas</p>
            <p className="text-2xl font-bold mt-1 text-green-400">{formatarMoeda(receitas)}</p>
            <p className="text-sm text-slate-500 mt-1">Entradas do período</p>
          </div>
          <div className="text-3xl text-green-400 opacity-80">
            <TrendingUp className="w-8 h-8" />
          </div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:shadow-lg transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Despesas</p>
            <p className="text-2xl font-bold mt-1 text-red-400">{formatarMoeda(despesas)}</p>
            <p className="text-sm text-slate-500 mt-1">Saídas do período</p>
          </div>
          <div className="text-3xl text-red-400 opacity-80">
            <TrendingDown className="w-8 h-8" />
          </div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:shadow-lg transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Saldo</p>
            <p className={`text-2xl font-bold mt-1 ${saldo >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
              {formatarMoeda(saldo)}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {saldo >= 0 ? 'Resultado positivo' : 'Resultado negativo'}
            </p>
          </div>
          <div className={`text-3xl opacity-80 ${saldo >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
            <DollarSign className="w-8 h-8" />
          </div>
        </div>
      </div>
    </div>
  );
};
