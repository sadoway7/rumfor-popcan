import React, { useState } from 'react'
import { useExpenses } from '@/features/tracking/hooks/useExpenses'
import { Expense, ExpenseCategory } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/utils/cn'
import { Plus, ChevronLeft, MoreVertical, Trash2, Edit2, TrendingUp, TrendingDown, Sparkles, Calendar } from 'lucide-react'
import { useAuthStore } from '@/features/auth/authStore'

interface VendorBudgetListProps {
  marketId: string
  className?: string
}

const categories = [
  { id: 'booth-fee', label: 'Booth Fee', icon: '🏠' },
  { id: 'transportation', label: 'Transportation', icon: '🚚' },
  { id: 'accommodation', label: 'Accommodation', icon: '🏨' },
  { id: 'supplies', label: 'Supplies', icon: '📦' },
  { id: 'equipment', label: 'Equipment', icon: '🔧' },
  { id: 'marketing', label: 'Marketing', icon: '📣' },
  { id: 'food-meals', label: 'Food', icon: '🍽️' },
  { id: 'gasoline', label: 'Fuel', icon: '⛽' },
  { id: 'insurance', label: 'Insurance', icon: '🛡️' },
  { id: 'permits-licenses', label: 'Permits', icon: '📄' },
  { id: 'parking', label: 'Parking', icon: '🅿️' },
  { id: 'storage', label: 'Storage', icon: '📦' },
  { id: 'shipping', label: 'Shipping', icon: '🚢' },
  { id: 'utilities', label: 'Utilities', icon: '💡' },
  { id: 'miscellaneous', label: 'Other', icon: '📋' },
  { id: 'revenue', label: 'Revenue', icon: '💰' }
]

const budgetPresets: Record<string, { id: string; name: string; expected: number; description: string; icon: string }[]> = {
  'booth-fee': [
    { id: 'booth-standard', name: 'Standard Booth', expected: 100, description: 'Standard 10x10 booth space', icon: '🏠' },
    { id: 'booth-corner', name: 'Corner Booth', expected: 150, description: 'Corner booth with extra visibility', icon: '📍' },
    { id: 'booth-premium', name: 'Premium Location', expected: 200, description: 'High-traffic location booth', icon: '⭐' },
    { id: 'booth-double', name: 'Double Booth', expected: 200, description: 'Double space 20x10 booth', icon: '📐' }
  ],
  'transportation': [
    { id: 'transport-gas', name: 'Gas/Fuel', expected: 50, description: 'Fuel for transportation', icon: '⛽' },
    { id: 'transport-truck', name: 'Rental Truck', expected: 100, description: 'Vehicle rental for transport', icon: '🚚' },
    { id: 'transport-parking', name: 'Parking Fees', expected: 20, description: 'Parking costs for venue', icon: '🅿️' },
    { id: 'transport-shipping', name: 'Shipping/Delivery', expected: 75, description: 'Shipping items to venue', icon: '📦' }
  ],
  'accommodation': [
    { id: 'accom-hotel', name: 'Hotel Night', expected: 120, description: 'One night hotel stay', icon: '🏨' },
    { id: 'accom-extended', name: 'Extended Stay', expected: 300, description: 'Multiple night accommodation', icon: '🏢' },
    { id: 'accom-airbnb', name: 'AirBnB Stay', expected: 100, description: 'Short-term rental accommodation', icon: '🏡' }
  ],
  'supplies': [
    { id: 'supply-materials', name: 'Product Materials', expected: 200, description: 'Raw materials for products', icon: '🎨' },
    { id: 'supply-packaging', name: 'Packaging', expected: 50, description: 'Bags, boxes, and packaging materials', icon: '📦' },
    { id: 'supply-signage', name: 'Signage', expected: 75, description: 'Banners, signs, and displays', icon: '🪧' },
    { id: 'supply-business', name: 'Business Cards', expected: 30, description: 'Business cards and marketing materials', icon: '💳' }
  ],
  'equipment': [
    { id: 'equip-table', name: 'Table Rental', expected: 25, description: 'Display table rental', icon: '🪑' },
    { id: 'equip-tent', name: 'Tent/Canopy', expected: 150, description: 'Weather protection tent', icon: '⛺' },
    { id: 'equip-shelves', name: 'Display Shelves', expected: 40, description: 'Product display shelving', icon: '🗄️' },
    { id: 'equip-lighting', name: 'Lighting', expected: 30, description: 'Additional lighting for booth', icon: '💡' }
  ],
  'marketing': [
    { id: 'market-social', name: 'Social Media Ads', expected: 50, description: 'Facebook/Instagram promotion', icon: '📱' },
    { id: 'market-flyers', name: 'Printed Flyers', expected: 40, description: 'Promotional flyers and handouts', icon: '📄' },
    { id: 'market-signage', name: 'Event Signage', expected: 60, description: ' banners and event signs', icon: '🪧' },
    { id: 'market-samples', name: 'Product Samples', expected: 100, description: 'Free samples for promotion', icon: '🎁' }
  ],
  'food-meals': [
    { id: 'food-meals', name: 'Vendor Meals', expected: 40, description: 'Food for vendor team', icon: '🍽️' },
    { id: 'food-snacks', name: 'Snacks', expected: 20, description: 'Snacks and drinks for day', icon: '🥤' },
    { id: 'food-beverages', name: 'Beverages', expected: 15, description: 'Drinks for vendor team', icon: '🥤' }
  ],
  'gasoline': [
    { id: 'fuel-travel', name: 'Travel Fuel', expected: 50, description: 'Fuel to/from venue', icon: '⛽' },
    { id: 'fuel-generator', name: 'Generator Fuel', expected: 30, description: 'Fuel for power generator', icon: '⚡' }
  ],
  'insurance': [
    { id: 'ins-liability', name: 'Liability Insurance', expected: 50, description: 'Event liability coverage', icon: '🛡️' },
    { id: 'ins-event', name: 'Event Insurance', expected: 35, description: 'Special event insurance', icon: '📋' }
  ],
  'miscellaneous': [
    { id: 'other-misc', name: 'Miscellaneous', expected: 50, description: 'Other unexpected expenses', icon: '📋' },
    { id: 'other-emergency', name: 'Emergency Fund', expected: 100, description: 'Emergency cash reserve', icon: '💰' }
  ]
}

const categoryColors: Record<string, string> = {
  'booth-fee': 'bg-blue-100 text-blue-700',
  'transportation': 'bg-purple-100 text-purple-700',
  'accommodation': 'bg-teal-100 text-teal-700',
  'supplies': 'bg-amber-100 text-amber-700',
  'equipment': 'bg-rose-100 text-rose-700',
  'marketing': 'bg-pink-100 text-pink-700',
  'food-meals': 'bg-orange-100 text-orange-700',
  'gasoline': 'bg-red-100 text-red-700',
  'insurance': 'bg-cyan-100 text-cyan-700',
  'permits-licenses': 'bg-indigo-100 text-indigo-700',
  'parking': 'bg-yellow-100 text-yellow-700',
  'storage': 'bg-violet-100 text-violet-700',
  'shipping': 'bg-emerald-100 text-emerald-700',
  'utilities': 'bg-sky-100 text-sky-700',
  'miscellaneous': 'bg-gray-100 text-gray-700',
  'revenue': 'bg-green-100 text-green-700'
}

export const VendorBudgetList: React.FC<VendorBudgetListProps> = ({ marketId, className }) => {
  const { user } = useAuthStore()
  const { expenses, isLoading, error, createExpense, deleteExpense, updateExpense } = useExpenses(marketId)
  const [showPresets, setShowPresets] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [newCategory, setNewCategory] = useState<ExpenseCategory>('booth-fee')
  const [newTitle, setNewTitle] = useState('')
  const [newExpected, setNewExpected] = useState('')
  const [newActual, setNewActual] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newDate, setNewDate] = useState('')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (confirm('Delete this budget item?')) {
      await deleteExpense(id)
    }
    setOpenMenuId(null)
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setNewCategory(expense.category)
    setNewTitle(expense.title)
    setNewExpected(expense.amount.toString())
    setNewActual(expense.amount.toString()) // For now, actual = expected in expense system
    setNewDescription(expense.description || '')
    setNewDate(expense.date ? expense.date.split('T')[0] : '')
    setShowForm(true)
    setOpenMenuId(null)
  }

  const handleSave = async () => {
    if (!newTitle.trim() || !newExpected) return

    const expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'> = {
      vendorId: user?.id || '',
      marketId,
      category: newCategory,
      title: newTitle,
      amount: parseFloat(newActual || newExpected),
      description: newDescription,
      date: newDate || new Date().toISOString().split('T')[0]
    }

    if (editingExpense) {
      await updateExpense(editingExpense.id, expenseData)
    } else {
      await createExpense(expenseData)
    }
    setShowForm(false)
    setEditingExpense(null)
    resetForm()
  }

  const resetForm = () => {
    setNewCategory('booth-fee')
    setNewTitle('')
    setNewExpected('')
    setNewActual('')
    setNewDescription('')
    setNewDate('')
  }

  const handleSelectPreset = (preset: any) => {
    setNewCategory(preset.category as ExpenseCategory)
    setNewTitle(preset.name)
    setNewExpected(preset.expected.toString())
    setNewActual('')
    setNewDescription(preset.description)
    setNewDate('')
    setShowPresets(false)
    setSelectedCategory(null)
    setShowForm(true)
  }

  const handlePresetFromForm = () => {
    setShowForm(false)
    setShowPresets(true)
  }

  // Calculate totals
  const totalExpected = expenses.reduce((sum, item) => sum + item.amount, 0)
  const totalActual = expenses.reduce((sum, item) => sum + item.amount, 0) // For now, actual = expected
  const variance = totalActual - totalExpected

  // Ultra-compact budget item
  const BudgetCompactItem = ({ expense }: { expense: Expense }) => {
    return (
      <div className="flex items-center gap-2 py-2 px-2.5 rounded-lg border bg-surface touch-manipulation min-h-[44px]">
        {/* Category badge */}
        <span className={cn(
          "inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap flex-shrink-0",
          categoryColors[expense.category] || 'bg-gray-100 text-gray-700'
        )}>
          {categories.find(c => c.id === expense.category)?.label.split(' ')[0] || expense.category}
        </span>

        {/* Title and description */}
        <div className="flex-1 min-w-0">
          <span className="block text-sm font-medium truncate">{expense.title}</span>
          {expense.description && (
            <span className="block text-xs text-muted-foreground truncate">{expense.description}</span>
          )}
        </div>

        {/* Expected amount */}
        <div className="text-xs text-muted-foreground whitespace-nowrap">
          ${expense.amount.toLocaleString()}
        </div>

        {/* Actual amount */}
        <div className="text-sm font-semibold whitespace-nowrap">
          ${expense.amount.toLocaleString()}
        </div>

        {/* Variance - shows 0 for now */}
        <div className="text-xs text-muted-foreground font-medium min-w-[40px] text-right">
          $0
        </div>

        {/* Actions menu */}
        <div className="relative">
          <button
            onClick={() => setOpenMenuId(openMenuId === expense.id ? null : expense.id)}
            className="p-1.5 rounded hover:bg-surface/50 touch-manipulation"
          >
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </button>
          
          {openMenuId === expense.id && (
            <div className="absolute right-0 top-full mt-1 bg-background border rounded-lg shadow-lg py-1 z-10 min-w-[100px]">
              <button
                onClick={() => handleEdit(expense)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-surface flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(expense.id)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-surface text-red-600 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <Card className={cn("p-6 text-center", className)}>
        <div className="animate-pulse">Loading...</div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn("p-6 text-center", className)}>
        <p className="text-red-500 text-sm">Error loading budget</p>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        {expenses.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {expenses.length} items
          </span>
        )}
        <div className="flex gap-1 ml-auto">
          <Button
            size="sm"
            onClick={() => { resetForm(); setEditingExpense(null); setShowPresets(true); }}
            className="h-8 px-3"
            variant="outline"
          >
            <Sparkles className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => { resetForm(); setEditingExpense(null); setShowForm(true); }}
            className="h-8 px-3"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Budget Items */}
      {expenses.length > 0 && (
        <div className="space-y-1">
          {expenses.map((expense: Expense) => (
            <BudgetCompactItem key={expense.id} expense={expense} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {expenses.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          <p className="text-sm">No budget items yet</p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowPresets(true)}
            className="mt-1 text-xs"
          >
            Add from presets
          </Button>
        </div>
      )}

      {/* Footer Summary */}
      {expenses.length > 0 && (
        <Card className="p-3 bg-surface border border-border">
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Expected</div>
                <div className="text-sm font-bold">${totalExpected.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Actual</div>
                <div className="text-sm font-bold">${totalActual.toLocaleString()}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Variance</div>
              <div className={cn(
                "text-sm font-bold flex items-center gap-1",
                variance === 0 ? 'text-foreground' :
                variance > 0 ? 'text-red-600' : 'text-emerald-600'
              )}>
                {variance !== 0 && (
                  variance > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
                )}
                {variance > 0 ? '+' : ''}${Math.abs(variance).toLocaleString()}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Presets Modal */}
      <Modal 
        isOpen={showPresets} 
        onClose={() => { setShowPresets(false); setSelectedCategory(null); }}
        title={selectedCategory ? `${categories.find(c => c.id === selectedCategory)?.icon} ${categories.find(c => c.id === selectedCategory)?.label}` : 'Budget Presets'}
        showCloseButton={true}
        className="sm:max-w-sm sm:rounded-xl max-w-none max-h-[85vh] m-0 sm:m-auto"
      >
        <div className="h-full flex flex-col">
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-1 p-3 -mx-3 text-sm text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          )}

          <div className="flex-1 -mx-4 px-4">
            {!selectedCategory ? (
              <div className="grid grid-cols-2 gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className="flex flex-col items-center gap-1.5 p-4 rounded-xl bg-surface hover:bg-surface-2 transition-colors touch-manipulation"
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-xs font-medium text-center">{cat.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {budgetPresets[selectedCategory]?.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset({ ...preset, category: selectedCategory })}
                    className="w-full text-left p-3.5 rounded-xl bg-surface hover:bg-surface-2 transition-colors touch-manipulation"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{preset.icon}</div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold">{preset.name}</div>
                        <div className="text-xs text-muted-foreground mb-2">{preset.description}</div>
                        <div className="text-sm font-bold text-accent">${preset.expected.toLocaleString()}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Add/Edit Budget Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingExpense ? 'Edit Budget Item' : 'Add Budget Item'}
        showCloseButton={true}
        className="sm:max-w-sm sm:rounded-xl max-w-none max-h-[85vh] m-0 sm:m-auto"
      >
        <div className="h-full flex flex-col -mx-4">
          {!editingExpense && (
            <div className="px-4 pb-2 border-b">
              <Button
                size="sm"
                onClick={handlePresetFromForm}
                className="w-full justify-center font-medium h-10"
                variant="outline"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Use a Preset
              </Button>
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-4">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as ExpenseCategory)}
                  className="w-full p-2.5 border-2 rounded-lg bg-background focus:border-accent outline-none"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Name *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Item name"
                  className="w-full p-3 text-base border-2 rounded-lg bg-background focus:border-accent outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Expected *</label>
                  <input
                    type="number"
                    value={newExpected}
                    onChange={e => setNewExpected(e.target.value)}
                    placeholder="0"
                    className="w-full p-3 border-2 rounded-lg bg-background focus:border-accent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Actual</label>
                  <input
                    type="number"
                    value={newActual}
                    onChange={e => setNewActual(e.target.value)}
                    placeholder="0"
                    className="w-full p-3 border-2 rounded-lg bg-background focus:border-accent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                <textarea
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="Add details..."
                  rows={2}
                  className="w-full p-3 border-2 rounded-lg bg-background focus:border-accent outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full pl-9 pr-3 p-2.5 border-2 rounded-lg bg-background focus:border-accent outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t space-y-2">
            <Button
              className="w-full h-10"
              onClick={handleSave}
              disabled={!newTitle.trim() || !newExpected}
            >
              {editingExpense ? 'Save Changes' : 'Add Budget Item'}
            </Button>

            {editingExpense && (
              <Button
                variant="ghost"
                className="w-full h-10 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => {
                  handleDelete(editingExpense.id)
                  setShowForm(false)
                }}
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}
