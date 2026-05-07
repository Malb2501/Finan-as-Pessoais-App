'use client'

import { useState, useMemo } from 'react'
import { Transaction, TransactionFilters, Category } from '@/types'
import { CATEGORIES } from '@/lib/categories'
import { formatCurrency } from '@/lib/utils/currency'
import { exportToCSV } from '@/lib/utils/csv'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Download, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import TransactionDialog from './TransactionDialog'

interface TransactionsClientProps {
  transactions: Transaction[]
  userId: string
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export default function TransactionsClient({ transactions: initialTransactions, userId }: TransactionsClientProps) {
  const [transactions, setTransactions] = useState(initialTransactions)
  const [filters, setFilters] = useState<TransactionFilters>({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    category: 'all',
    search: '',
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const supabase = createClient()

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const date = new Date(t.date)
      if (filters.month && date.getMonth() + 1 !== filters.month) return false
      if (filters.year && date.getFullYear() !== filters.year) return false
      if (filters.category && filters.category !== 'all' && t.category !== filters.category) return false
      if (filters.search && !t.description.toLowerCase().includes(filters.search.toLowerCase())) return false
      return true
    })
  }, [transactions, filters])

  async function handleDelete(id: string) {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) {
      toast.error('Erro ao excluir transação')
    } else {
      setTransactions(prev => prev.filter(t => t.id !== id))
      toast.success('Transação excluída')
    }
  }

  function handleEdit(transaction: Transaction) {
    setEditingTransaction(transaction)
    setDialogOpen(true)
  }

  function handleSaved(transaction: Transaction, isEdit: boolean) {
    if (isEdit) {
      setTransactions(prev => prev.map(t => t.id === transaction.id ? transaction : t))
    } else {
      setTransactions(prev => [transaction, ...prev])
    }
    setDialogOpen(false)
    setEditingTransaction(null)
  }

  const years = Array.from(
    new Set(transactions.map(t => new Date(t.date).getFullYear()))
  ).sort((a, b) => b - a)

  if (!years.includes(new Date().getFullYear())) {
    years.unshift(new Date().getFullYear())
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Transações</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportToCSV(filtered)}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button size="sm" onClick={() => { setEditingTransaction(null); setDialogOpen(true) }}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Transação
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Select
              value={String(filters.month)}
              onValueChange={v => setFilters(f => ({ ...f, month: Number(v) }))}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={String(filters.year)}
              onValueChange={v => setFilters(f => ({ ...f, year: Number(v) }))}
            >
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.category}
              onValueChange={v => setFilters(f => ({ ...f, category: v as Category | 'all' }))}
            >
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {CATEGORIES.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Buscar descrição..."
              className="w-52"
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              Nenhuma transação encontrada.
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map(t => (
                <div key={t.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{t.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{t.category}</Badge>
                        <span className="text-xs text-gray-500">
                          {format(new Date(t.date), 'dd/MM/yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    <span className={`text-sm font-semibold ${t.type === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'receita' ? '+' : '-'}{formatCurrency(t.amount)}
                    </span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(t)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => handleDelete(t.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <TransactionDialog
        open={dialogOpen}
        onOpenChange={open => { setDialogOpen(open); if (!open) setEditingTransaction(null) }}
        transaction={editingTransaction}
        userId={userId}
        onSaved={handleSaved}
      />
    </div>
  )
}
