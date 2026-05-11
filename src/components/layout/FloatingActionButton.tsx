'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, TrendingUp, TrendingDown } from 'lucide-react'
import { Transaction, TransactionType } from '@/types'
import TransactionDialog from '@/components/transactions/TransactionDialog'

export default function FloatingActionButton({ userId }: { userId: string }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<TransactionType>('despesa')
  const router = useRouter()

  function handleSelect(type: TransactionType) {
    setSelectedType(type)
    setMenuOpen(false)
    setDialogOpen(true)
  }

  function handleSaved(_transaction: Transaction, _isEdit: boolean) {
    setDialogOpen(false)
    router.refresh()
  }

  return (
    <>
      {menuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {menuOpen && (
          <>
            <div className="flex items-center gap-3 animate-in slide-in-from-bottom-2 fade-in duration-150">
              <span className="bg-popover text-popover-foreground text-sm font-medium px-3 py-1.5 rounded-lg shadow-md border border-border">
                Receita
              </span>
              <button
                onClick={() => handleSelect('receita')}
                className="h-12 w-12 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg flex items-center justify-center transition-colors"
                aria-label="Nova receita"
              >
                <TrendingUp className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 animate-in slide-in-from-bottom-2 fade-in duration-150 delay-75">
              <span className="bg-popover text-popover-foreground text-sm font-medium px-3 py-1.5 rounded-lg shadow-md border border-border">
                Despesa
              </span>
              <button
                onClick={() => handleSelect('despesa')}
                className="h-12 w-12 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg flex items-center justify-center transition-colors"
                aria-label="Nova despesa"
              >
                <TrendingDown className="h-5 w-5" />
              </button>
            </div>
          </>
        )}

        <button
          onClick={() => setMenuOpen(v => !v)}
          className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl flex items-center justify-center transition-all"
          aria-label={menuOpen ? 'Fechar menu' : 'Nova transação'}
        >
          {menuOpen
            ? <X className="h-6 w-6 transition-transform" />
            : <Plus className="h-6 w-6 transition-transform" />
          }
        </button>
      </div>

      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        transaction={null}
        userId={userId}
        defaultType={selectedType}
        onSaved={handleSaved}
      />
    </>
  )
}
