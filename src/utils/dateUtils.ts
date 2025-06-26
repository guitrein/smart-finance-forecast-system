
// Utilitários para cálculo de datas de vencimento de cartões
export const calcularDataVencimentoCartao = (
  dataCompra: string,
  diaVencimentoCartao: number,
  numeroParcela: number = 1
): string => {
  const dataCompraObj = new Date(dataCompra);
  let mesVencimento = dataCompraObj.getMonth();
  let anoVencimento = dataCompraObj.getFullYear();

  // Se a compra foi após o dia de vencimento, vai para o próximo mês
  if (dataCompraObj.getDate() > diaVencimentoCartao) {
    mesVencimento += 1;
  }

  // Adicionar os meses das parcelas (parcela 1 = 0 meses adicionais)
  mesVencimento += (numeroParcela - 1);

  // Ajustar ano se necessário
  while (mesVencimento > 11) {
    mesVencimento -= 12;
    anoVencimento += 1;
  }

  // Criar data de vencimento
  const dataVencimento = new Date(anoVencimento, mesVencimento, diaVencimentoCartao);
  
  return dataVencimento.toISOString().split('T')[0];
};

export const calcularProximasDatasParcelas = (
  dataCompra: string,
  diaVencimentoCartao: number,
  numeroParcelas: number
): string[] => {
  const datas: string[] = [];
  
  for (let i = 1; i <= numeroParcelas; i++) {
    const data = calcularDataVencimentoCartao(dataCompra, diaVencimentoCartao, i);
    datas.push(data);
  }
  
  return datas;
};

// Gerar ID único para agrupamento de parcelas
export const gerarIdGrupoParcelamento = (): string => {
  return `parcelas_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Calcular frequência em meses
export const calcularMesesFrequencia = (frequencia: string): number => {
  switch (frequencia) {
    case 'mensal': return 1;
    case 'bimestral': return 2;
    case 'trimestral': return 3;
    case 'semestral': return 6;
    case 'anual': return 12;
    default: return 1;
  }
};

// Gerar datas para lançamentos recorrentes
export const gerarDatasRecorrentes = (
  dataInicial: string,
  frequencia: string,
  numeroParcelas?: number
): string[] => {
  const datas: string[] = [];
  const dataInicialObj = new Date(dataInicial);
  const mesesFrequencia = calcularMesesFrequencia(frequencia);
  const limite = numeroParcelas || 24; // Gerar até 24 meses se não especificado
  
  for (let i = 0; i < limite; i++) {
    const novaData = new Date(dataInicialObj);
    novaData.setMonth(novaData.getMonth() + (i * mesesFrequencia));
    datas.push(novaData.toISOString().split('T')[0]);
  }
  
  return datas;
};

// Formatar data para exibição
export const formatarDataBR = (data: string): string => {
  return new Date(data).toLocaleDateString('pt-BR');
};

// Verificar se data está vencida
export const isDataVencida = (data: string): boolean => {
  const hoje = new Date();
  const dataVencimento = new Date(data);
  hoje.setHours(0, 0, 0, 0);
  dataVencimento.setHours(0, 0, 0, 0);
  return dataVencimento < hoje;
};

// Calcular dias até vencimento
export const diasAteVencimento = (data: string): number => {
  const hoje = new Date();
  const dataVencimento = new Date(data);
  hoje.setHours(0, 0, 0, 0);
  dataVencimento.setHours(0, 0, 0, 0);
  return Math.ceil((dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
};
