'use client'

import { useState, useEffect } from 'react'
import { Transaction, TransactionType, Category } from '@/types'
import { CATEGORIES } from '@/lib/categories'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface TransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: Transaction | null
  userId: string
  onSaved: (transaction: Transaction, isEdit: boolean) => void
  defaultType?: TransactionType
}

function todayLocalISO() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const defaultForm = {
  description: '',
  amount: '',
  date: todayLocalISO(),
  type: 'despesa' as TransactionType,
  category: 'Outros' as Category,
}

export default function TransactionDialog({ open, onOpenChange, transaction, userId, onSaved, defaultType }: TransactionDialogProps) {
  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const isEdit = !!transaction

  useEffect(() => {
    if (transaction) {
      setForm({
        description: transaction.description,
        amount: String(transaction.amount),
        date: transaction.date,
        type: transaction.type,
        category: transaction.category,
      })
    } else {
      setForm({ ...defaultForm, date: todayLocalISO(), type: defaultType ?? 'despesa' })
    }
  }, [transaction, open, defaultType])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const payload = {
      description: form.description,
      amount: parseFloat(form.amount.replace(',', '.')),
      date: form.date,
      type: form.type,
      category: form.category,
      user_id: userId,
    }

    if (isNaN(payload.amount) || payload.amount <= 0) {
      toast.error('Valor inválido')
      setLoading(false)
      return
    }

    if (isEdit) {
      const { data, error } = await supabase
        .from('transactions')
        .update(payload)
        .eq('id', transaction.id)
        .select()
        .single()

      if (error) {
        toast.error('Erro ao atualizar: ' + error.message)
      } else {
        toast.success('Transação atualizada')
        onSaved(data as Transaction, true)
      }
    } else {
      const { data, error } = await supabase
        .from('transactions')
        .insert(payload)
        .select()
        .single()

      if (error) {
        toast.error('Erro ao salvar: ' + error.message)
      } else {
        toast.success('Transação adicionada')
        onSaved(data as Transaction, false)
      }
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Transação' : 'Nova Transação'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input
              placeholder="Ex: Supermercado, Salário..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={form.type}
                onValueChange={v => setForm(f => ({ ...f, type: v as TransactionType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={form.category}
                onValueChange={v => setForm(f => ({ ...f, category: v as Category }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : isEdit ? 'Atualizar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
