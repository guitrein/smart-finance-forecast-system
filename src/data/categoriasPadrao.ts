
import { Categoria } from '@/types';

export const categoriasPadrao: Omit<Categoria, 'id' | 'criadoEm'>[] = [
  {
    nome: 'Salário',
    descricao: 'Salário e remuneração principal',
    icone: '💰',
    cor: '#10b981'
  },
  {
    nome: 'Freelance',
    descricao: 'Trabalhos extras e freelances',
    icone: '💼',
    cor: '#3b82f6'
  },
  {
    nome: 'Alimentação',
    descricao: 'Supermercado, restaurantes e delivery',
    icone: '🍽️',
    cor: '#f59e0b'
  },
  {
    nome: 'Transporte',
    descricao: 'Combustível, transporte público e manutenção',
    icone: '🚗',
    cor: '#8b5cf6'
  },
  {
    nome: 'Moradia',
    descricao: 'Aluguel, financiamento e contas da casa',
    icone: '🏠',
    cor: '#06b6d4'
  },
  {
    nome: 'Saúde',
    descricao: 'Plano de saúde, médicos e medicamentos',
    icone: '🏥',
    cor: '#ef4444'
  },
  {
    nome: 'Lazer',
    descricao: 'Entretenimento, viagens e hobbies',
    icone: '🎭',
    cor: '#ec4899'
  },
  {
    nome: 'Educação',
    descricao: 'Cursos, livros e material educativo',
    icone: '📚',
    cor: '#84cc16'
  },
  {
    nome: 'Outros',
    descricao: 'Outras receitas e despesas',
    icone: '📦',
    cor: '#6b7280'
  }
];
