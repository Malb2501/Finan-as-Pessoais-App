import { Transaction } from '@/types'
import { formatCurrency } from './currency'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function exportToCSV(transactions: Transaction[], filename = 'transacoes.csv') {
  const headers = ['Data', 'Descrição', 'Tipo', 'Categoria', 'Valor']

  const rows = transactions.map(t => [
    format(new Date(t.date), 'dd/MM/yyyy', { locale: ptBR }),
    t.description,
    t.type === 'receita' ? 'Receita' : 'Despesa',
    t.category,
    formatCurrency(t.amount),
  ])

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')

  const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
