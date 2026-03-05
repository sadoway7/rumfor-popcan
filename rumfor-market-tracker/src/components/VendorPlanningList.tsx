import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  useDroppable,
  UniqueIdentifier,
  pointerWithin,
  rectIntersection,
  CollisionDetection,
  DragStartEvent,
  DragOverEvent,
  DropAnimation,
  defaultDropAnimation,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { usePlanning } from '@/features/tracking/hooks/usePlanning'
import { useTodos } from '@/features/tracking/hooks/useTodos'
import { useExpenses } from '@/features/tracking/hooks/useExpenses'
import { useFolders } from '@/features/tracking/hooks/useFolders'
import { Todo, Expense, TodoPriority, ExpenseCategory, PlanningItem, PlanningFolder, FolderColor } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/DropdownMenu'
import { cn } from '@/utils/cn'
import { Plus, ChevronLeft, ChevronDown, ChevronRight, MoreVertical, Trash2, Edit2, Check, Clock, AlertTriangle, Sparkles, GripVertical, DollarSign, ListTodo, FolderPlus, Folder as FolderIcon, ArrowDown, SlidersHorizontal } from 'lucide-react'
import { useAuthStore } from '@/features/auth/authStore'
import { formatLocalDate } from '@/utils/formatDate'
import * as Icons from 'lucide-react'

interface VendorPlanningListProps {
  marketId: string
  className?: string
  externalShowAddModal?: boolean
  onExternalModalClose?: () => void
}

const todoCategories = [
  { id: 'setup', label: 'Setup', icon: '📦' },
  { id: 'products', label: 'Products', icon: '🛒' },
  { id: 'marketing', label: 'Marketing', icon: '📣' },
  { id: 'logistics', label: 'Logistics', icon: '🚚' },
  { id: 'post-event', label: 'Post-event', icon: '🎉' },
  { id: 'misc', label: 'Misc', icon: '📋' }
]

const expenseCategories = [
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

const todoPresets: Record<string, string[]> = {
  setup: ['Complete vendor application', 'Review market rules', 'Design booth layout', 'Obtain permits', 'Set up payment'],
  products: ['Prepare inventory', 'Price all products', 'Organize display', 'Prepare samples', 'Update descriptions'],
  marketing: ['Create materials', 'Post on social media', 'Design flyers', 'Contact media', 'Update website'],
  logistics: ['Arrange transport', 'Prepare equipment', 'Pack materials', 'Plan booth setup', 'Confirm accommodation'],
  'post-event': ['Clean up area', 'Process payments', 'Follow up customers', 'Review sales', 'Plan next market'],
  misc: ['Take photos', 'Network with vendors', 'Check weather', 'Review feedback', 'Update records']
}

const budgetPresets: Record<string, { id: string; name: string; expected: number; description: string; icon: string }[]> = {
  'booth-fee': [
    { id: 'booth-standard', name: 'Standard Booth', expected: 100, description: 'Standard 10x10 booth space', icon: '🏠' },
    { id: 'booth-corner', name: 'Corner Booth', expected: 150, description: 'Corner booth with extra visibility', icon: '📍' },
  ],
  'transportation': [
    { id: 'transport-gas', name: 'Gas/Fuel', expected: 50, description: 'Fuel for transportation', icon: '⛽' },
    { id: 'transport-truck', name: 'Rental Truck', expected: 100, description: 'Vehicle rental for transport', icon: '🚚' },
  ],
  'supplies': [
    { id: 'supply-packaging', name: 'Packaging', expected: 50, description: 'Bags, boxes, and packaging materials', icon: '📦' },
    { id: 'supply-signage', name: 'Signage', expected: 75, description: 'Banners, signs, and displays', icon: '🪧' },
  ],
}

const priorityConfig = {
  urgent: { color: 'bg-red-100 text-red-700', icon: <AlertTriangle className="w-3 h-3" /> },
  high: { color: 'bg-orange-100 text-orange-700', icon: null },
  medium: { color: 'bg-yellow-100 text-yellow-700', icon: null },
  low: { color: 'bg-gray-100 text-gray-600', icon: null }
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
  'miscellaneous': 'bg-gray-100 text-gray-700',
  'revenue': 'bg-green-100 text-green-700'
}

const folderColorMap: Record<FolderColor, { bg: string; border: string; text: string }> = {
  gray: { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-700' },
  red: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700' },
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700' },
  lime: { bg: 'bg-lime-50', border: 'border-lime-300', text: 'text-lime-700' },
  green: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700' },
  teal: { bg: 'bg-teal-50', border: 'border-teal-300', text: 'text-teal-700' },
  cyan: { bg: 'bg-cyan-50', border: 'border-cyan-300', text: 'text-cyan-700' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-300', text: 'text-indigo-700' },
  violet: { bg: 'bg-violet-50', border: 'border-violet-300', text: 'text-violet-700' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700' },
  fuchsia: { bg: 'bg-fuchsia-50', border: 'border-fuchsia-300', text: 'text-fuchsia-700' },
  pink: { bg: 'bg-pink-50', border: 'border-pink-300', text: 'text-pink-700' },
}

const iconMap: Record<string, React.ReactNode> = {
  'folder': <FolderIcon className="w-4 h-4" />,
  'briefcase': <Icons.Briefcase className="w-4 h-4" />,
  'package': <Icons.Package className="w-4 h-4" />,
  'truck': <Icons.Truck className="w-4 h-4" />,
  'dollar-sign': <Icons.DollarSign className="w-4 h-4" />,
  'calendar': <Icons.Calendar className="w-4 h-4" />,
  'star': <Icons.Star className="w-4 h-4" />,
  'tag': <Icons.Tag className="w-4 h-4" />,
  'bookmark': <Icons.Bookmark className="w-4 h-4" />,
  'flag': <Icons.Flag className="w-4 h-4" />,
  'shopping-cart': <Icons.ShoppingCart className="w-4 h-4" />,
  'gift': <Icons.Gift className="w-4 h-4" />,
  'home': <Icons.Home className="w-4 h-4" />,
  'map-pin': <Icons.MapPin className="w-4 h-4" />,
  'clock': <Icons.Clock className="w-4 h-4" />,
}

interface DropIndicatorProps {
  dropId: string
  isDragging: boolean
}

const DropIndicator: React.FC<DropIndicatorProps> = ({ dropId, isDragging }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: dropId,
    data: { isDropZone: true, dropId }
  })
  
  if (!isDragging) return null
  
  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "h-1 rounded transition-all duration-150 flex items-center justify-center",
        isOver ? "h-10 bg-accent/20 border-2 border-dashed border-accent rounded-lg my-1" : "my-0.5"
      )}
    >
      {isOver && (
        <div className="w-full h-1 bg-accent rounded-full" />
      )}
    </div>
  )
}

interface RootDropZoneProps {
  isOver: boolean
  position?: 'top' | 'bottom'
}

const RootDropZone: React.FC<RootDropZoneProps> = ({ isOver, position = 'top' }) => {
  const { setNodeRef, isOver: droppableOver } = useDroppable({
    id: position === 'top' ? 'root-drop-zone-top' : 'root-drop-zone-bottom',
    data: { isRootZone: true, position }
  })
  
  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "h-2 rounded transition-all duration-200",
        (isOver || droppableOver) ? "bg-accent/30 border-2 border-dashed border-accent h-12 scale-y-110" : ""
      )}
    />
  )
}

interface EmptyRootDropZoneProps {}

const EmptyRootDropZone: React.FC<EmptyRootDropZoneProps> = () => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'root-drop-zone-empty',
    data: { isRootZone: true }
  })
  
  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "flex items-center justify-center py-4 border-2 border-dashed rounded-lg text-sm transition-all",
        isOver 
          ? "border-accent bg-accent/20 text-accent font-medium" 
          : "border-muted-foreground/30 text-muted-foreground"
      )}
    >
      Drag items here to remove from folder
    </div>
  )
}

interface FolderRowProps {
  folder: PlanningFolder
  isCollapsed: boolean
  onToggleCollapse: () => void
  onRename: (name: string) => void
  onDelete: () => void
  onChangeColor?: (color: FolderColor) => void
  onAddTodo?: () => void
  onAddBudget?: () => void
  itemCount: number
  onDropItem: (itemId: string, itemType: 'todo' | 'expense') => void
  items?: PlanningItem[]
  onToggleTodo?: (id: string) => void
  onEditTodo?: (todo: Todo) => void
  onEditExpense?: (expense: Expense) => void
  onDeleteTodo?: (id: string) => void
  onDeleteExpense?: (id: string) => void
  onUpdateExpenseActual?: (id: string, actual: number | undefined) => void
  openMenuId?: string | null
  setOpenMenuId?: (id: string | null) => void
}

const FolderRow: React.FC<FolderRowProps> = ({ 
  folder, 
  isCollapsed, 
  onToggleCollapse, 
  onRename, 
  onDelete, 
  onChangeColor,
  onAddTodo,
  onAddBudget,
  itemCount, 
  onDropItem,
  items = [],
  onToggleTodo,
  onEditTodo,
  onEditExpense,
  onDeleteTodo,
  onDeleteExpense,
  onUpdateExpenseActual,
  openMenuId,
  setOpenMenuId
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(folder.name)
  const [showMenu, setShowMenu] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [menuPosition, setMenuPosition] = useState<'bottom' | 'top'>('bottom')
  const inputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const colors = folderColorMap[folder.color] || folderColorMap.blue
  const dragOpenTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const wasAutoOpenedRef = useRef(false)

  const { setNodeRef, isOver } = useDroppable({
    id: `folder-${folder.id}`,
    data: { folderId: folder.id, isFolder: true }
  })

  useEffect(() => {
    if (isOver && isCollapsed) {
      dragOpenTimeoutRef.current = setTimeout(() => {
        onToggleCollapse()
        wasAutoOpenedRef.current = true
      }, 600)
    } else if (!isOver) {
      if (dragOpenTimeoutRef.current) {
        clearTimeout(dragOpenTimeoutRef.current)
        dragOpenTimeoutRef.current = null
      }
      if (wasAutoOpenedRef.current && !isCollapsed) {
        onToggleCollapse()
        wasAutoOpenedRef.current = false
      }
    }
    return () => {
      if (dragOpenTimeoutRef.current) {
        clearTimeout(dragOpenTimeoutRef.current)
      }
    }
  }, [isOver, isCollapsed, onToggleCollapse])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleToggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!showMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const menuHeight = 250
      setMenuPosition(spaceBelow < menuHeight ? 'top' : 'bottom')
    }
    setShowMenu(!showMenu)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  const handleSave = () => {
    if (editName.trim() && editName !== folder.name) {
      onRename(editName.trim())
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setEditName(folder.name)
      setIsEditing(false)
    }
  }

  const IconComponent = iconMap[folder.icon] || <FolderIcon className="w-4 h-4" />

  return (
    <div className="space-y-1">
      <div
        ref={setNodeRef}
        className={cn(
          "flex items-center gap-2 py-2 px-3 rounded-xl border bg-surface touch-manipulation min-h-[48px] transition-colors",
          colors.bg,
          colors.border,
          isOver && "ring-2 ring-accent ring-offset-2"
        )}
      >
        {/* Clickable content area */}
        <div 
          className="flex-1 flex items-center gap-2 cursor-pointer"
          onClick={() => !isEditing && onToggleCollapse()}
        >
          {/* Icon */}
          <div className={cn("flex-shrink-0", colors.text)}>
            {IconComponent}
          </div>

          {/* Name */}
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 px-2 py-0.5 text-sm font-medium bg-white border-2 border-accent rounded outline-none"
            />
          ) : (
            <span className={cn("flex-1 text-sm font-medium", colors.text)}>
              {folder.name}
            </span>
          )}

          {/* Chevron - on right side */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {itemCount}
            </span>
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="relative" ref={menuRef}>
          <button
            ref={buttonRef}
            onClick={handleToggleMenu}
            className="p-1.5 rounded hover:bg-black/5 touch-manipulation"
          >
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </button>
          {showMenu && (
            <div className="absolute right-0 bottom-full mb-1 bg-white rounded-xl shadow-lg py-2 z-20 min-w-[160px]">
              <button
                onClick={(e) => { e.stopPropagation(); onAddTodo?.(); setShowMenu(false); }}
                className="w-full px-3 py-3 text-left text-base hover:bg-surface flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Task
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onAddBudget?.(); setShowMenu(false); }}
                className="w-full px-3 py-3 text-left text-base hover:bg-surface flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4" /> Add Budget
              </button>
              <div className="border-t my-1" />
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowColorPicker(!showColorPicker); }}
                  className="w-full px-3 py-3 text-left text-base hover:bg-surface flex items-center justify-between gap-2"
                >
                  <span className="flex items-center gap-2">
                    <div className={cn("w-4 h-4 rounded", colors.bg, colors.border, "border")} />
                    Color
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                {showColorPicker && (
                  <div className="absolute right-full top-0 mr-2 bg-white rounded-xl shadow-lg p-3 z-30 min-w-[140px]">
                    <div className="grid grid-cols-4 gap-2">
                      {Object.keys(folderColorMap).map((color) => (
                        <button
                          key={color}
                          onClick={(e) => { e.stopPropagation(); onChangeColor?.(color as FolderColor); setShowColorPicker(false); setShowMenu(false); }}
                          className={cn(
                            "w-8 h-8 rounded border-2 transition-all flex-shrink-0",
                            folderColorMap[color as FolderColor].bg,
                            folderColorMap[color as FolderColor].border,
                            folder.color === color ? "ring-2 ring-accent ring-offset-1" : "hover:scale-110"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setIsEditing(true); setShowMenu(false); }}
                className="w-full px-3 py-3 text-left text-base hover:bg-surface flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" /> Rename
              </button>
              <div className="border-t my-1" />
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); setShowMenu(false); }}
                className="w-full px-3 py-3 text-left text-base hover:bg-surface text-red-600 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Folder Contents */}
      {!isCollapsed && items.length > 0 && (
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <div className={cn("ml-6 space-y-1 border-l-2 border-dashed pl-2", colors.border)}>
            {items.map(item => (
              <SortableItem
                key={item.id}
                item={item}
                onToggleTodo={onToggleTodo || (() => {})}
                onEditTodo={onEditTodo || (() => {})}
                onEditExpense={onEditExpense || (() => {})}
                onDeleteTodo={onDeleteTodo || (() => {})}
                onDeleteExpense={onDeleteExpense || (() => {})}
                onUpdateExpenseActual={onUpdateExpenseActual || (() => {})}
                openMenuId={openMenuId || null}
                setOpenMenuId={setOpenMenuId || (() => {})}
              />
            ))}
          </div>
        </SortableContext>
      )}
    </div>
  )
}

interface FolderHeaderProps {
  folder: PlanningFolder
  isCollapsed: boolean
  onToggleCollapse: () => void
  onRename: (name: string) => void
  onDelete: () => void
  onChangeColor?: (color: FolderColor) => void
  onAddTodo?: () => void
  onAddBudget?: () => void
  itemCount: number
}

const FolderHeader: React.FC<FolderHeaderProps> = ({
  folder,
  isCollapsed,
  onToggleCollapse,
  onRename,
  onDelete,
  onChangeColor,
  onAddTodo,
  onAddBudget,
  itemCount
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(folder.name)
  const [showMenu, setShowMenu] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [menuPosition, setMenuPosition] = useState<'bottom' | 'top'>('bottom')
  const inputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const colors = folderColorMap[folder.color] || folderColorMap.blue
  const dragOpenTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const wasAutoOpenedRef = useRef(false)

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: `folder-${folder.id}`,
    data: { type: 'folder', folder }
  })

  const { setNodeRef: setDroppableRef, isOver: droppableOver } = useDroppable({
    id: `folder-${folder.id}`,
    data: { folderId: folder.id, isFolder: true }
  })

  // Combine refs
  const setNodeRef = (node: HTMLElement | null) => {
    setSortableRef(node)
    setDroppableRef(node)
  }

  useEffect(() => {
    if (droppableOver && isCollapsed) {
      dragOpenTimeoutRef.current = setTimeout(() => {
        onToggleCollapse()
        wasAutoOpenedRef.current = true
      }, 600)
    } else if (!droppableOver) {
      if (dragOpenTimeoutRef.current) {
        clearTimeout(dragOpenTimeoutRef.current)
        dragOpenTimeoutRef.current = null
      }
      if (wasAutoOpenedRef.current && !isCollapsed) {
        onToggleCollapse()
        wasAutoOpenedRef.current = false
      }
    }
    return () => {
      if (dragOpenTimeoutRef.current) {
        clearTimeout(dragOpenTimeoutRef.current)
      }
    }
  }, [droppableOver, isCollapsed, onToggleCollapse])

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? transition : 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: isDragging ? 0.5 : 1,
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleToggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!showMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const menuHeight = 250
      setMenuPosition(spaceBelow < menuHeight ? 'top' : 'bottom')
    }
    setShowMenu(!showMenu)
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  const handleSave = () => {
    if (editName.trim() && editName !== folder.name) {
      onRename(editName.trim())
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setEditName(folder.name)
      setIsEditing(false)
    }
  }

  const IconComponent = iconMap[folder.icon] || <FolderIcon className="w-6 h-6" />

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 py-2 px-3 rounded-xl border bg-surface touch-manipulation min-h-[48px] transition-all duration-200",
        colors.bg,
        colors.border,
        droppableOver && "ring-2 ring-accent ring-offset-2 scale-[1.02] shadow-lg"
      )}
    >
      {/* Clickable content area */}
      <div 
        className="flex-1 flex items-center gap-3 cursor-pointer"
        onClick={() => !isEditing && onToggleCollapse()}
      >
        {/* Icon */}
        <div className={cn("flex-shrink-0", colors.text)}>
          {IconComponent}
        </div>

        {/* Name */}
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 px-2 py-0.5 text-base font-semibold bg-white border-2 border-accent rounded outline-none"
          />
        ) : (
          <span className={cn("flex-1 text-base font-semibold", colors.text)}>
            {folder.name}
          </span>
        )}

        {/* Chevron - on right side */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {itemCount} items
          </span>
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          className="p-1.5 rounded hover:bg-black/5 touch-manipulation"
        >
          <MoreVertical className="w-4 h-4 text-muted-foreground" />
        </button>
        {showMenu && (
            <div className="absolute right-0 bottom-full mb-1 bg-white rounded-xl shadow-lg py-2 z-20 min-w-[160px]">
              <button
                onClick={(e) => { e.stopPropagation(); onAddTodo?.(); setShowMenu(false); }}
                className="w-full px-3 py-3 text-left text-base hover:bg-surface flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Task
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onAddBudget?.(); setShowMenu(false); }}
                className="w-full px-3 py-3 text-left text-base hover:bg-surface flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4" /> Add Budget
              </button>
              <div className="border-t my-1" />
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowColorPicker(!showColorPicker); }}
                  className="w-full px-3 py-3 text-left text-base hover:bg-surface flex items-center justify-between gap-2"
                >
                  <span className="flex items-center gap-2">
                    <div className={cn("w-4 h-4 rounded", colors.bg, colors.border, "border")} />
                    Color
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                {showColorPicker && (
                  <div className="absolute right-full top-0 mr-2 bg-white rounded-xl shadow-lg p-3 z-30 min-w-[140px]">
                    <div className="grid grid-cols-4 gap-2">
                      {Object.keys(folderColorMap).map((color) => (
                        <button
                          key={color}
                          onClick={(e) => { e.stopPropagation(); onChangeColor?.(color as FolderColor); setShowColorPicker(false); setShowMenu(false); }}
                          className={cn(
                            "w-8 h-8 rounded border-2 transition-all flex-shrink-0",
                            folderColorMap[color as FolderColor].bg,
                            folderColorMap[color as FolderColor].border,
                            folder.color === color ? "ring-2 ring-accent ring-offset-1" : "hover:scale-110"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setIsEditing(true); setShowMenu(false); }}
                className="w-full px-3 py-3 text-left text-base hover:bg-surface flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" /> Rename
              </button>
              <div className="border-t my-1" />
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); setShowMenu(false); }}
                className="w-full px-3 py-3 text-left text-base hover:bg-surface text-red-600 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          )}
      </div>
    </div>
  )
}

interface SortableItemProps {
  item: PlanningItem
  onToggleTodo: (id: string) => void
  onEditTodo: (todo: Todo) => void
  onEditExpense: (expense: Expense) => void
  onDeleteTodo: (id: string) => void
  onDeleteExpense: (id: string) => void
  onUpdateExpenseActual: (id: string, actual: number | undefined) => void
  openMenuId: string | null
  setOpenMenuId: (id: string | null) => void
  isInFolder?: boolean
  menuRef?: React.RefObject<HTMLDivElement>
}

const SortableItem: React.FC<SortableItemProps> = ({
  item,
  onToggleTodo,
  onEditTodo,
  onEditExpense,
  onDeleteTodo,
  onDeleteExpense,
  onUpdateExpenseActual,
  openMenuId,
  setOpenMenuId,
  isInFolder = false,
  menuRef
}) => {
  const [isEditingActual, setIsEditingActual] = useState(false)
  const [actualValue, setActualValue] = useState('')
  const localMenuRef = useRef<HTMLDivElement>(null)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  // Use local ref for click outside detection
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openMenuId && localMenuRef.current && !localMenuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null)
      }
    }
    if (openMenuId === (item.type === 'todo' ? (item.data as Todo).id : (item.data as Expense).id)) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openMenuId, item.type, item.data])

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: 'none',
    opacity: isDragging ? 0.5 : 1,
  }

  if (item.type === 'todo') {
    const todo = item.data as Todo
    const days = todo.dueDate ? Math.ceil((new Date(todo.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
    const isOverdue = days !== null && days < 0 && !todo.completed
    const priority = priorityConfig[todo.priority]

    return (
      <div ref={setNodeRef} style={style} className={cn(
        "flex items-center gap-2 py-3 px-3 rounded-2xl border bg-surface touch-manipulation min-h-[56px]",
        todo.completed && "border-transparent",
        isOverdue && "border-red-200 bg-red-50/50"
      )}>
        <button {...attributes} {...listeners} className="touch-none p-1 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground">
          <GripVertical className="w-5 h-5" />
        </button>

        <button
          onClick={() => onToggleTodo(todo.id)}
          className={cn(
            "w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center transition-all border-2",
            todo.completed ? 'bg-accent border-accent text-white' : 'border-muted-foreground/40 hover:border-accent bg-white'
          )}
        >
          {todo.completed && <Check className="w-4 h-4" />}
        </button>

        <div className="flex-1 min-w-0">
          <span className={cn("block text-sm font-medium truncate", todo.completed && "line-through text-muted-foreground")}>
            {todo.title}
          </span>
          {todo.description && (
            <span className={cn("block text-xs text-muted-foreground truncate", todo.completed && "line-through")}>
              {todo.description}
            </span>
          )}
          {todo.dueDate && (
            <span className={cn(
              "text-xs flex items-center gap-0.5 mt-0.5",
              isOverdue ? "text-red-600 font-medium" : "text-muted-foreground"
            )}>
              <Clock className="w-3 h-3" />
              {isOverdue ? `${Math.abs(days!)}d overdue` : days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : new Date(todo.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>

        {todo.priority === 'urgent' && (
          <span className={cn("text-xs flex items-center gap-0.5 px-1.5 py-0.5 rounded flex-shrink-0", priority.color)}>
            {priority.icon}
          </span>
        )}

        <div className="relative" ref={localMenuRef}>
          <button onClick={() => setOpenMenuId(openMenuId === todo.id ? null : todo.id)} className="p-1.5 rounded hover:bg-surface/50 touch-manipulation">
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </button>
          {openMenuId === todo.id && (
            <div className="absolute right-0 bottom-full mb-1 bg-white rounded-xl shadow-lg py-2 z-10 min-w-[120px]">
              <button onClick={() => { onEditTodo(todo); setOpenMenuId(null); }} className="w-full px-3 py-3 text-left text-base hover:bg-surface flex items-center gap-2">
                <Edit2 className="w-4 h-4" /> Edit
              </button>
              <button onClick={() => onDeleteTodo(todo.id)} className="w-full px-3 py-3 text-left text-base hover:bg-surface text-red-600 flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  const expense = item.data as Expense
  const actualAmount = expense.actualAmount
  const variance = actualAmount !== undefined ? actualAmount - expense.amount : null

  const startEditing = () => {
    setActualValue(actualAmount !== undefined ? actualAmount.toString() : '')
    setIsEditingActual(true)
  }

  const handleActualSave = () => {
    const newActual = actualValue === '' ? undefined : parseFloat(actualValue)
    if (newActual === undefined || (!isNaN(newActual) && newActual >= 0)) {
      onUpdateExpenseActual(expense.id, newActual)
    }
    setIsEditingActual(false)
  }

 return (
    <div ref={setNodeRef} style={style} className={cn(
      "flex items-center gap-2 py-3 px-3 rounded-2xl border bg-surface touch-manipulation min-h-[56px]"
    )}>
      <button {...attributes} {...listeners} className="touch-none p-1 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground">
        <GripVertical className="w-5 h-5" />
      </button>

      <div className="flex flex-col items-center gap-1">
        {isEditingActual ? (
          <input
            type="number"
            value={actualValue}
            onChange={(e) => setActualValue(e.target.value)}
            onBlur={handleActualSave}
            onKeyDown={(e) => { if (e.key === 'Enter') handleActualSave(); else if (e.key === 'Escape') setIsEditingActual(false); }}
            className="w-[64px] text-sm font-semibold text-center px-1.5 py-0 border-2 border-accent rounded-md bg-surface focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none leading-none h-[26px]"
            autoFocus
          />
        ) : (
          <button
            onClick={startEditing}
            className={cn(
              "text-sm whitespace-nowrap text-center px-1.5 rounded-md transition-colors h-[26px] leading-none min-w-[44px]",
              actualAmount === undefined
                ? "font-medium text-muted-foreground/60 border-2 border-muted-foreground/40 hover:text-foreground hover:border-accent"
                : "font-bold text-foreground border-2 border-accent hover:bg-muted/30"
            )}
          >
            {actualAmount !== undefined ? `$${actualAmount.toLocaleString()}` : '-'}
          </button>
        )}
        <span className="text-[11px] text-muted-foreground/80 font-medium whitespace-nowrap leading-none">
          ${expense.amount.toLocaleString()}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <span className="block text-sm font-medium truncate">{expense.title}</span>
        {expense.description && <span className="block text-xs text-muted-foreground truncate">{expense.description}</span>}
      </div>

      <span className={cn(
        "inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap flex-shrink-0",
        categoryColors[expense.category] || 'bg-gray-100 text-gray-700'
      )}>
        {expenseCategories.find(c => c.id === expense.category)?.label.split(' ')[0]?.substring(0, 4) || expense.category}
      </span>

      <div className="relative" ref={localMenuRef}>
        <button onClick={() => setOpenMenuId(openMenuId === expense.id ? null : expense.id)} className="p-1.5 rounded hover:bg-surface/50 touch-manipulation">
          <MoreVertical className="w-4 h-4 text-muted-foreground" />
        </button>
        {openMenuId === expense.id && (
          <div className="absolute right-0 bottom-full mb-1 bg-white rounded-xl shadow-lg py-2 z-10 min-w-[120px]">
            <button onClick={() => { onEditExpense(expense); setOpenMenuId(null); }} className="w-full px-3 py-3 text-left text-base hover:bg-surface flex items-center gap-2">
              <Edit2 className="w-4 h-4" /> Edit
            </button>
            <button onClick={() => onDeleteExpense(expense.id)} className="w-full px-3 py-3 text-left text-base hover:bg-surface text-red-600 flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export const VendorPlanningList: React.FC<VendorPlanningListProps> = ({ 
  marketId, 
  className,
  externalShowAddModal,
  onExternalModalClose 
}) => {
  const { user } = useAuthStore()
  const { planningItems, todos, expenses, isLoading, error, updateOrder, isUpdatingOrder } = usePlanning(marketId)
  const { toggleTodo, deleteTodo: deleteTodoApi, createTodo, updateTodo } = useTodos(marketId)
  const { createExpense, deleteExpense: deleteExpenseApi, updateExpense } = useExpenses(marketId)
  const { folders, createFolder, updateFolder, deleteFolder, moveItemToFolder, isCreating: isCreatingFolder } = useFolders(marketId)

  const [showTodoPresets, setShowTodoPresets] = useState(false)
  const [showBudgetPresets, setShowBudgetPresets] = useState(false)
  const [selectedTodoCategory, setSelectedTodoCategory] = useState<string | null>(null)
  const [selectedBudgetCategory, setSelectedBudgetCategory] = useState<string | null>(null)
  const [showTodoForm, setShowTodoForm] = useState(false)
  const [showBudgetForm, setShowBudgetForm] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set())
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [activeItem, setActiveItem] = useState<PlanningItem | null>(null)
  const [pendingFolderId, setPendingFolderId] = useState<string | null>(null)
  const [showFolderDropdown, setShowFolderDropdown] = useState(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const folderDropdownRef = useRef<HTMLDivElement>(null)
  const categoryDropdownRef = useRef<HTMLDivElement>(null)
  const hasInitializedFolders = useRef(false)
  const expandTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [newTodoTitle, setNewTodoTitle] = useState('')
  const [newTodoDescription, setNewTodoDescription] = useState('')
  const [newTodoCategory, setNewTodoCategory] = useState('setup')
  const [newTodoPriority, setNewTodoPriority] = useState<TodoPriority>('medium')
  const [newTodoDueDate, setNewTodoDueDate] = useState('')

  const [newBudgetCategory, setNewBudgetCategory] = useState<ExpenseCategory>('booth-fee')
  const [newBudgetTitle, setNewBudgetTitle] = useState('')
  const [newBudgetExpected, setNewBudgetExpected] = useState('')
  const [newBudgetActual, setNewBudgetActual] = useState('')
  const [newBudgetDescription, setNewBudgetDescription] = useState('')
  const [newBudgetDate, setNewBudgetDate] = useState('')

  // Handle external modal trigger from bottom nav
  useEffect(() => {
    if (externalShowAddModal) {
      resetTodoForm()
      resetBudgetForm()
      setEditingTodo(null)
      setEditingExpense(null)
      setShowTodoForm(true)
    }
  }, [externalShowAddModal])

  // Sync internal state with external modal close
  const handleExternalModalClose = () => {
    setShowTodoForm(false)
    setShowBudgetForm(false)
    onExternalModalClose?.()
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openMenuId && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null)
      }
      if (showFolderDropdown && folderDropdownRef.current && !folderDropdownRef.current.contains(e.target as Node)) {
        setShowFolderDropdown(false)
      }
      if (showCategoryDropdown && categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setShowCategoryDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openMenuId, showFolderDropdown, showCategoryDropdown])

  useEffect(() => {
    return () => {
      if (expandTimeoutRef.current) {
        clearTimeout(expandTimeoutRef.current)
      }
    }
  }, [])

  // Initialize collapsed state from folder data (only once on mount)
  useEffect(() => {
    if (hasInitializedFolders.current || folders.length === 0) return
    hasInitializedFolders.current = true
    const collapsed = new Set<string>()
    folders.forEach(f => {
      if (f.isCollapsed) collapsed.add(f.id)
    })
    if (collapsed.size > 0) {
      setCollapsedFolders(collapsed)
    }
  }, [folders])

  // Group items by folder
  const { rootItems, folderItems } = useMemo(() => {
    const root: PlanningItem[] = []
    const inFolder: Record<string, PlanningItem[]> = {}
    
    folders.forEach(f => { inFolder[f.id] = [] })
    
    planningItems.forEach(item => {
      const folderId = (item.data as any).folderId
      if (folderId && inFolder[folderId]) {
        inFolder[folderId].push(item)
      } else {
        root.push(item)
      }
    })
    
    return { rootItems: root, folderItems: inFolder }
  }, [planningItems, folders])

  const toggleFolderCollapse = (folderId: string) => {
    setCollapsedFolders(prev => {
      const next = new Set(prev)
      if (next.has(folderId)) {
        next.delete(folderId)
        updateFolder(folderId, { isCollapsed: false })
      } else {
        next.add(folderId)
        updateFolder(folderId, { isCollapsed: true })
      }
      return next
    })
  }

  const expandFolder = (folderId: string) => {
    setCollapsedFolders(prev => {
      if (prev.has(folderId)) {
        updateFolder(folderId, { isCollapsed: false })
        const next = new Set(prev)
        next.delete(folderId)
        return next
      }
      return prev
    })
  }

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return
    createFolder({
      marketId,
      name: newFolderName.trim(),
      color: 'blue',
      icon: 'folder'
    })
    setNewFolderName('')
    setShowFolderModal(false)
  }

  const handleRenameFolder = (folderId: string, name: string) => {
    updateFolder(folderId, { name })
  }

  const handleDeleteFolder = (folderId: string) => {
    if (confirm('Delete this folder? Items will be moved to root.')) {
      deleteFolder(folderId, 'root')
    }
  }

  const handleChangeFolderColor = (folderId: string, color: FolderColor) => {
    updateFolder(folderId, { color })
  }

  const handleAddTodoToFolder = (folderId: string) => {
    setPendingFolderId(folderId)
    setShowTodoForm(true)
  }

  const handleAddBudgetToFolder = (folderId: string) => {
    setPendingFolderId(folderId)
    setShowBudgetForm(true)
  }

  const handleDropItemToFolder = (itemId: string, itemType: 'todo' | 'expense', folderId: string) => {
    moveItemToFolder(itemId, itemType, folderId)
  }

  // Use planning items directly - they come sorted from usePlanning
  const items = planningItems

  const sensors = useSensors(
    useSensor(PointerSensor, { 
      activationConstraint: { 
        distance: 5,
        delay: 100,
        tolerance: 5
      } 
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Custom collision detection: prioritize folder drops, then closest item
  const customCollisionDetection: CollisionDetection = useCallback((args) => {
    // First, check if pointer is over a folder header (for folder drops)
    const pointerCollisions = pointerWithin(args)
    const folderCollision = pointerCollisions.find(({ id }) => 
      String(id).startsWith('folder-')
    )
    
    if (folderCollision) {
      return [folderCollision]
    }
    
    // Then use closestCenter for reordering
    return closestCenter(args)
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return
    
    const activeId = String(active.id)
    const overId = String(over.id)
    
    // Check if dropped on root drop zone
    if (overId === 'root-drop-zone-top' || overId === 'root-drop-zone-bottom' || overId === 'root-drop-zone-empty') {
      const itemId = activeId.replace(/^(todo-|expense-)/, '')
      const itemType = activeId.startsWith('todo-') ? 'todo' : 'expense'
      moveItemToFolder(itemId, itemType, null)
      return
    }
    
    // Check if dropped on a folder header (not an item inside)
    if (overId.startsWith('folder-')) {
      const folderId = overId.replace('folder-', '')
      const itemId = activeId.replace(/^(todo-|expense-)/, '')
      const itemType = activeId.startsWith('todo-') ? 'todo' : 'expense'
      moveItemToFolder(itemId, itemType, folderId)
      return
    }
    
    if (active.id === over.id) return

    // Find source list and item
    let sourceList: PlanningItem[] = []
    let sourceFolderId: string | null = null
    let activeItem: PlanningItem | null = null
    
    // Check root items
    const activeRootIndex = rootItems.findIndex(item => item.id === activeId)
    if (activeRootIndex !== -1) {
      sourceList = rootItems
      sourceFolderId = null
      activeItem = rootItems[activeRootIndex]
    } else {
      // Check folder items
      for (const folderId of Object.keys(folderItems)) {
        const folderList = folderItems[folderId]
        const idx = folderList.findIndex(item => item.id === activeId)
        if (idx !== -1) {
          sourceList = folderList
          sourceFolderId = folderId
          activeItem = folderList[idx]
          break
        }
      }
    }
    
    if (!activeItem) return

    // Find target list (where we're dropping)
    let targetList: PlanningItem[] = []
    let targetFolderId: string | null = null
    
    // Check root items for drop target
    const overRootIndex = rootItems.findIndex(item => item.id === overId)
    if (overRootIndex !== -1) {
      targetList = rootItems
      targetFolderId = null
    } else {
      // Check folder items for drop target
      for (const folderId of Object.keys(folderItems)) {
        const folderList = folderItems[folderId]
        const idx = folderList.findIndex(item => item.id === overId)
        if (idx !== -1) {
          targetList = folderList
          targetFolderId = folderId
          break
        }
      }
    }
    
    if (targetList.length === 0) return

    const overIndex = targetList.findIndex(item => item.id === overId)
    if (overIndex === -1) return

    // Cross-list move (root <-> folder or folder <-> folder)
    if (sourceFolderId !== targetFolderId) {
      const realId = activeId.replace(/^(todo-|expense-)/, '')
      const itemType = activeId.startsWith('todo-') ? 'todo' : 'expense'
      
      // Move to new folder (optimistic update will handle UI)
      moveItemToFolder(realId, itemType, targetFolderId)
      
      // Update sort order immediately (no delay)
      const newList = [...targetList]
      newList.splice(overIndex, 0, activeItem)
      const orderUpdates = newList.map((item, index) => ({
        id: item.id,
        type: item.type,
        sortOrder: index
      }))
      updateOrder(orderUpdates)
      return
    }

    // Same-list reorder
    const oldIndex = sourceList.findIndex(item => item.id === activeId)
    if (oldIndex === -1) return
    
    const newItems = arrayMove(sourceList, oldIndex, overIndex)

    const orderUpdates = newItems.map((item, index) => ({
      id: item.id,
      type: item.type,
      sortOrder: index
    }))
    updateOrder(orderUpdates)
  }, [rootItems, folderItems, updateOrder, moveItemToFolder])

  const handleToggleTodo = (id: string) => {
    toggleTodo(id)
    setOpenMenuId(null)
  }

  const handleDeleteTodo = (id: string) => {
    if (confirm('Delete this task?')) {
      deleteTodoApi(id)
    }
    setOpenMenuId(null)
  }

  const handleDeleteExpense = (id: string) => {
    if (confirm('Delete this budget item?')) {
      deleteExpenseApi(id)
    }
    setOpenMenuId(null)
  }

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo)
    setNewTodoTitle(todo.title)
    setNewTodoDescription(todo.description || '')
    setNewTodoCategory(todo.category)
    setNewTodoPriority(todo.priority)
    setNewTodoDueDate(todo.dueDate ? todo.dueDate.split('T')[0] : '')
    setShowTodoForm(true)
    setOpenMenuId(null)
  }

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense)
    setNewBudgetCategory(expense.category)
    setNewBudgetTitle(expense.title)
    setNewBudgetExpected(expense.amount.toString())
    setNewBudgetActual(expense.actualAmount !== undefined ? expense.actualAmount.toString() : '')
    setNewBudgetDescription(expense.description || '')
    setNewBudgetDate(expense.date ? expense.date.split('T')[0] : '')
    setShowBudgetForm(true)
    setOpenMenuId(null)
  }

  const handleUpdateExpenseActual = (id: string, actual: number | undefined) => {
    updateExpense(id, { actualAmount: actual })
  }

  const handleSaveTodo = async () => {
    if (!newTodoTitle.trim()) return
    if (editingTodo) {
      await updateTodo(editingTodo.id, { title: newTodoTitle, description: newTodoDescription, category: newTodoCategory, priority: newTodoPriority, dueDate: newTodoDueDate || undefined })
    } else {
      createTodo({ title: newTodoTitle, description: newTodoDescription, category: newTodoCategory, priority: newTodoPriority, dueDate: newTodoDueDate || undefined, folderId: pendingFolderId })
    }
    setShowTodoForm(false)
    setEditingTodo(null)
    resetTodoForm()
    setPendingFolderId(null)
    onExternalModalClose?.()
  }

  const handleSaveBudget = async () => {
    if (!newBudgetTitle.trim() || !newBudgetExpected) return
    const expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'> = {
      vendorId: user?.id || '',
      marketId,
      category: newBudgetCategory,
      title: newBudgetTitle,
      amount: parseFloat(newBudgetExpected),
      actualAmount: newBudgetActual !== '' ? parseFloat(newBudgetActual) : undefined,
      description: newBudgetDescription,
      date: newBudgetDate || formatLocalDate(new Date().toISOString()),
      folderId: pendingFolderId
    }
    if (editingExpense) {
      await updateExpense(editingExpense.id, expenseData)
    } else {
      await createExpense(expenseData)
    }
    setShowBudgetForm(false)
    setEditingExpense(null)
    resetBudgetForm()
    setPendingFolderId(null)
    onExternalModalClose?.()
  }

  const resetTodoForm = () => {
    setNewTodoTitle('')
    setNewTodoDescription('')
    setNewTodoCategory('setup')
    setNewTodoPriority('medium')
    setNewTodoDueDate('')
  }

  const resetBudgetForm = () => {
    setNewBudgetCategory('booth-fee')
    setNewBudgetTitle('')
    setNewBudgetExpected('')
    setNewBudgetActual('')
    setNewBudgetDescription('')
    setNewBudgetDate('')
  }

  const handleSelectTodoPreset = (preset: string) => {
    setNewTodoTitle(preset)
    setNewTodoDescription('')
    setNewTodoPriority('medium')
    setNewTodoDueDate('')
    setShowTodoPresets(false)
    setSelectedTodoCategory(null)
    setShowTodoForm(true)
  }

  const handleSelectBudgetPreset = (preset: any) => {
    setNewBudgetCategory(preset.category as ExpenseCategory)
    setNewBudgetTitle(preset.name)
    setNewBudgetExpected(preset.expected.toString())
    setNewBudgetActual('')
    setNewBudgetDescription(preset.description)
    setNewBudgetDate('')
    setShowBudgetPresets(false)
    setSelectedBudgetCategory(null)
    setShowBudgetForm(true)
  }

  const completedTodos = todos.filter((t: Todo) => t.completed)
  const pendingTodos = todos.filter((t: Todo) => !t.completed)
  const overdueCount = pendingTodos.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length

  const totalExpected = expenses.reduce((sum, item) => sum + item.amount, 0)
  const totalActual = expenses.reduce((sum, item) => sum + (item.actualAmount !== undefined ? item.actualAmount : 0), 0)
  const variance = totalActual - totalExpected

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
        <p className="text-red-500 text-sm">Error loading planning items</p>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        {(todos.length > 0 || expenses.length > 0) && (
          <span className="text-base font-semibold text-foreground">
            {completedTodos.length}/{todos.length} tasks • {expenses.length} budget
          </span>
        )}
        <div className="flex gap-3 ml-auto">
          <button
            onClick={() => setShowFolderModal(true)}
            className="p-1 text-foreground hover:text-accent transition-colors"
            title="Add folder"
          >
            <FolderPlus className="w-6 h-6" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1 text-foreground hover:text-accent transition-colors"
                title="Options"
              >
                <SlidersHorizontal className="w-6 h-6" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-3 py-2 text-xs text-muted-foreground">Coming later</div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => console.log('Use preset list')}>
                Use preset list
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('Save preset list')}>
                Save preset list
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => console.log('Close out')}>
                Close out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {overdueCount > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-sm">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span className="text-red-700 font-medium">{overdueCount} overdue</span>
        </div>
      )}

      {expenses.length > 0 && (
        <div className="flex items-center justify-between gap-2 py-2 px-3 bg-surface rounded-xl shadow-sm">
          <div className="text-left">
            <div className="text-[10px] font-semibold text-muted-foreground/60 tracking-wide">Budget</div>
            <div className="text-lg font-bold tracking-tight">${totalExpected.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] font-semibold text-muted-foreground/60 tracking-wide">Actual</div>
            <div className="text-lg font-bold tracking-tight">${totalActual.toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-semibold text-muted-foreground/60 tracking-wide">Diff</div>
            <div className={cn("text-lg font-bold tracking-tight", variance > 0 ? 'text-red-600' : variance < 0 ? 'text-emerald-600' : '')}>
              ${Math.abs(variance).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Folders and Items in unified drag context */}
      <DndContext 
        sensors={sensors} 
        collisionDetection={customCollisionDetection}
        onDragStart={(event) => {
          setIsDragging(true)
          const activeId = String(event.active.id)
          const item = planningItems.find(p => p.id === activeId)
          setActiveItem(item || null)
        }}
        onDragEnd={(event) => {
          setIsDragging(false)
          setDragOverId(null)
          setActiveItem(null)
          if (expandTimeoutRef.current) {
            clearTimeout(expandTimeoutRef.current)
            expandTimeoutRef.current = null
          }
          handleDragEnd(event)
        }}
        onDragOver={(event) => {
          const { over } = event
          setDragOverId(over ? String(over.id) : null)
          if (over) {
            const overId = String(over.id)
            if (overId.startsWith('folder-')) {
              const folderId = overId.replace('folder-', '')
              if (collapsedFolders.has(folderId) && !expandTimeoutRef.current) {
                expandTimeoutRef.current = setTimeout(() => {
                  expandFolder(folderId)
                  expandTimeoutRef.current = null
                }, 500)
              }
            }
          } else {
            if (expandTimeoutRef.current) {
              clearTimeout(expandTimeoutRef.current)
              expandTimeoutRef.current = null
            }
          }
        }}
      >
        <div className="space-y-1">
          {/* Render folders - each folder is its own independent context */}
          {folders.map((folder) => (
            <React.Fragment key={folder.id}>
              <FolderHeader
                folder={folder}
                isCollapsed={collapsedFolders.has(folder.id)}
                onToggleCollapse={() => toggleFolderCollapse(folder.id)}
                onRename={(name) => handleRenameFolder(folder.id, name)}
                onDelete={() => handleDeleteFolder(folder.id)}
                onChangeColor={(color) => handleChangeFolderColor(folder.id, color)}
                onAddTodo={() => handleAddTodoToFolder(folder.id)}
                onAddBudget={() => handleAddBudgetToFolder(folder.id)}
                itemCount={folderItems[folder.id]?.length || 0}
              />
              {/* Folder items in their OWN independent SortableContext */}
              {!collapsedFolders.has(folder.id) && folderItems[folder.id] && folderItems[folder.id].length > 0 && (
                <SortableContext 
                  items={folderItems[folder.id].map(i => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className={cn("ml-6 space-y-1 border-l-2 border-dashed pl-2", folderColorMap[folder.color]?.border || "border-gray-400")}>
                    {folderItems[folder.id].map(item => (
                      <SortableItem
                        key={item.id}
                        item={item}
                        onToggleTodo={handleToggleTodo}
                        onEditTodo={handleEditTodo}
                        onEditExpense={handleEditExpense}
                        onDeleteTodo={handleDeleteTodo}
                        onDeleteExpense={handleDeleteExpense}
                        onUpdateExpenseActual={handleUpdateExpenseActual}
                        openMenuId={openMenuId}
                        setOpenMenuId={setOpenMenuId}
                        menuRef={menuRef}
                        isInFolder
                      />
                    ))}
                  </div>
                </SortableContext>
              )}
            </React.Fragment>
          ))}
          
          {/* Root items in their OWN independent SortableContext */}
          <SortableContext 
            items={rootItems.map(i => i.id)}
            strategy={verticalListSortingStrategy}
          >
            {rootItems.map(item => (
              <SortableItem
                key={item.id}
                item={item}
                onToggleTodo={handleToggleTodo}
                onEditTodo={handleEditTodo}
                onEditExpense={handleEditExpense}
                onDeleteTodo={handleDeleteTodo}
                onDeleteExpense={handleDeleteExpense}
                onUpdateExpenseActual={handleUpdateExpenseActual}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                menuRef={menuRef}
              />
            ))}
          </SortableContext>
          
          {/* Drop zone for root level - shows when dragging and no root items exist */}
          {isDragging && rootItems.length === 0 && (
            <EmptyRootDropZone />
          )}
        </div>

        {/* Drag Overlay - shows preview while dragging */}
        <DragOverlay dropAnimation={{ duration: 0 }}>
          {activeItem ? (
            <div className="opacity-90 shadow-xl pointer-events-none">
              <SortableItem
                item={activeItem}
                onToggleTodo={() => {}}
                onEditTodo={() => {}}
                onEditExpense={() => {}}
                onDeleteTodo={() => {}}
                onDeleteExpense={() => {}}
                onUpdateExpenseActual={() => {}}
                openMenuId={null}
                setOpenMenuId={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {items.length === 0 && !isLoading && (
        <div className="text-center py-6 text-muted-foreground">
          <p className="text-sm">No planning items yet</p>
          <div className="flex gap-2 justify-center mt-2">
            <Button variant="ghost" size="sm" onClick={() => setShowTodoPresets(true)} className="text-xs">Add tasks</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowBudgetPresets(true)} className="text-xs">Add budget</Button>
          </div>
        </div>
      )}

      <Modal isOpen={showTodoPresets} onClose={() => { setShowTodoPresets(false); setSelectedTodoCategory(null); }} title={selectedTodoCategory ? `${todoCategories.find(c => c.id === selectedTodoCategory)?.icon} ${todoCategories.find(c => c.id === selectedTodoCategory)?.label}` : 'Task Templates'} showCloseButton={true} className="sm:max-w-sm sm:rounded-xl max-w-none max-h-[85vh] m-0 sm:m-auto">
        <div className="h-full flex flex-col">
          {selectedTodoCategory && (
            <button onClick={() => setSelectedTodoCategory(null)} className="flex items-center gap-1 p-3 -mx-3 text-sm text-muted-foreground hover:text-foreground transition-colors touch-manipulation">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}
          <div className="flex-1 -mx-4 px-4">
            {!selectedTodoCategory ? (
              <div className="grid grid-cols-2 gap-2">
                {todoCategories.map(cat => (
                  <button key={cat.id} onClick={() => setSelectedTodoCategory(cat.id)} className="flex flex-col items-center gap-1.5 p-4 rounded-xl bg-surface hover:bg-surface-2 transition-colors touch-manipulation">
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-sm font-medium">{cat.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {todoPresets[selectedTodoCategory]?.map((preset, i) => (
                  <button key={i} onClick={() => handleSelectTodoPreset(preset)} className="w-full text-left p-3.5 rounded-xl bg-surface hover:bg-surface-2 text-sm transition-colors touch-manipulation">
                    {preset}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      <Modal isOpen={showBudgetPresets} onClose={() => { setShowBudgetPresets(false); setSelectedBudgetCategory(null); }} title={selectedBudgetCategory ? `${expenseCategories.find(c => c.id === selectedBudgetCategory)?.icon} ${expenseCategories.find(c => c.id === selectedBudgetCategory)?.label}` : 'Budget Presets'} showCloseButton={true} className="sm:max-w-sm sm:rounded-xl max-w-none max-h-[85vh] m-0 sm:m-auto">
        <div className="h-full flex flex-col">
          {selectedBudgetCategory && (
            <button onClick={() => setSelectedBudgetCategory(null)} className="flex items-center gap-1 p-3 -mx-3 text-sm text-muted-foreground hover:text-foreground transition-colors touch-manipulation">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}
          <div className="flex-1 -mx-4 px-4">
            {!selectedBudgetCategory ? (
              <div className="grid grid-cols-2 gap-2">
                {expenseCategories.filter(c => budgetPresets[c.id]).map(cat => (
                  <button key={cat.id} onClick={() => setSelectedBudgetCategory(cat.id)} className="flex flex-col items-center gap-1.5 p-4 rounded-xl bg-surface hover:bg-surface-2 transition-colors touch-manipulation">
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-xs font-medium text-center">{cat.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {budgetPresets[selectedBudgetCategory]?.map((preset) => (
                  <button key={preset.id} onClick={() => handleSelectBudgetPreset({ ...preset, category: selectedBudgetCategory })} className="w-full text-left p-3.5 rounded-xl bg-surface hover:bg-surface-2 transition-colors touch-manipulation">
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

      {/* Unified Add Item Modal - Bottom Sheet Style */}
      <Modal 
        isOpen={showTodoForm || showBudgetForm} 
        onClose={() => { 
          setShowTodoForm(false); 
          setShowBudgetForm(false); 
          setPendingFolderId(null);
          onExternalModalClose?.();
        }} 
        showCloseButton={false} 
        className="fixed inset-x-0 bottom-0 top-auto max-w-none m-0 rounded-t-3xl rounded-b-none max-h-[90vh] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom data-[state=closed]:duration-200 data-[state=open]:duration-300"
        backdropClassName="bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in"
      >
        <div className="flex flex-col max-h-[90vh]">
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
          </div>
          
          {/* Type Tabs */}
          <div className="flex gap-2 px-4 pb-3">
            <button
              onClick={() => { setShowBudgetForm(false); setShowTodoForm(true); }}
              className={cn(
                "flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all border-2",
                showTodoForm 
                  ? "bg-accent/10 border-accent text-accent" 
                  : "bg-white border-gray-200 text-muted-foreground"
              )}
            >
              Task
            </button>
            <button
              onClick={() => { setShowTodoForm(false); setShowBudgetForm(true); }}
              className={cn(
                "flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all border-2",
                showBudgetForm 
                  ? "bg-accent/10 border-accent text-accent" 
                  : "bg-white border-gray-200 text-muted-foreground"
              )}
            >
              Budget
            </button>
          </div>

          {/* Preset Buttons */}
          {!editingTodo && showTodoForm && (
            <div className="px-4 pb-2">
              <button 
                onClick={() => { setShowTodoForm(false); setShowTodoPresets(true); }} 
                className="w-full py-2.5 rounded-xl text-sm font-medium border-2 border-dashed border-gray-300 text-muted-foreground hover:border-accent hover:text-accent transition-colors"
              >
                Use a Preset Task
              </button>
            </div>
          )}
          
          {!editingExpense && showBudgetForm && (
            <div className="px-4 pb-2">
              <button 
                onClick={() => { setShowBudgetForm(false); setShowBudgetPresets(true); }} 
                className="w-full py-2.5 rounded-xl text-sm font-medium border-2 border-dashed border-gray-300 text-muted-foreground hover:border-accent hover:text-accent transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Use a Preset
              </button>
            </div>
          )}

          {/* Task Form */}
          {showTodoForm && (
            <div className="flex-1 overflow-y-auto px-4">
              <div className="space-y-4 pb-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Title</label>
                  <input type="text" value={newTodoTitle} onChange={e => setNewTodoTitle(e.target.value)} placeholder="Task title" className="w-full p-3 text-base border-2 rounded-xl bg-white focus:border-accent outline-none" autoFocus />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Subtitle</label>
                  <textarea value={newTodoDescription} onChange={e => setNewTodoDescription(e.target.value)} placeholder="Add details..." rows={2} className="w-full p-3 border-2 rounded-xl bg-white focus:border-accent outline-none resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Priority</label>
                    <select value={newTodoPriority} onChange={e => setNewTodoPriority(e.target.value as TodoPriority)} className="w-full p-3 border-2 rounded-xl bg-white focus:border-accent outline-none">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Due Date</label>
                    <input type="date" value={newTodoDueDate} onChange={e => setNewTodoDueDate(e.target.value)} className="w-full p-3 border-2 rounded-xl bg-white focus:border-accent outline-none" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Budget Form */}
          {showBudgetForm && (
            <div className="flex-1 overflow-y-auto px-4">
              <div className="space-y-4 pb-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Title</label>
                  <input type="text" value={newBudgetTitle} onChange={e => setNewBudgetTitle(e.target.value)} placeholder="Item name" className="w-full p-3 text-base border-2 rounded-xl bg-white focus:border-accent outline-none" autoFocus />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Subtitle</label>
                  <textarea value={newBudgetDescription} onChange={e => setNewBudgetDescription(e.target.value)} placeholder="Add details..." rows={2} className="w-full p-3 border-2 rounded-xl bg-white focus:border-accent outline-none resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Budgeted ($)</label>
                    <input type="number" value={newBudgetExpected} onChange={e => setNewBudgetExpected(e.target.value)} className="w-full p-3 border-2 rounded-xl bg-white focus:border-accent outline-none text-base" />
                  </div>
                  <div ref={categoryDropdownRef} className="relative">
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
                    <button
                      type="button"
                      onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                      className="w-full p-3 border-2 rounded-xl bg-white focus:border-accent outline-none text-base text-left flex items-center justify-between"
                    >
                      <span>{expenseCategories.find(c => c.id === newBudgetCategory)?.icon}</span>
                      <ChevronDown className={cn("w-4 h-4 transition-transform", showCategoryDropdown && "rotate-180")} />
                    </button>
                    {showCategoryDropdown && (
                      <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border-2 border-accent rounded-xl shadow-lg z-20 max-h-64 overflow-y-auto">
                        {expenseCategories.map(cat => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => { setNewBudgetCategory(cat.id as ExpenseCategory); setShowCategoryDropdown(false); }}
                            className={cn(
                              "w-full p-3 text-left hover:bg-surface transition-colors text-base flex items-center gap-2",
                              newBudgetCategory === cat.id && "bg-accent/10 text-accent font-medium"
                            )}
                          >
                            <span>{cat.icon}</span>
                            <span>{cat.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Folder Selector - only show if folders exist */}
          {folders.length > 0 && (
            <div className="px-4 pb-2 relative" ref={folderDropdownRef}>
              <button
                type="button"
                onClick={() => setShowFolderDropdown(!showFolderDropdown)}
                className="w-full p-3 border-2 border-accent rounded-xl bg-white focus:border-accent outline-none text-left flex items-center justify-between"
              >
                <span className="text-sm">{pendingFolderId ? folders.find(f => f.id === pendingFolderId)?.name : 'Add to folder?'}</span>
                <ChevronDown className={cn("w-4 h-4 transition-transform", showFolderDropdown && "rotate-180")} />
              </button>
              
              {showFolderDropdown && (
                <div className="absolute bottom-full left-4 right-4 mb-1 bg-white border-2 border-accent rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => { setPendingFolderId(null); setShowFolderDropdown(false); }}
                    className={cn(
                      "w-full p-3 text-left hover:bg-surface transition-colors text-sm",
                      !pendingFolderId && "bg-accent/10 text-accent"
                    )}
                  >
                    Add to folder?
                  </button>
                  {folders.map(folder => (
                    <button
                      key={folder.id}
                      type="button"
                      onClick={() => { setPendingFolderId(folder.id); setShowFolderDropdown(false); }}
                      className={cn(
                        "w-full p-3 text-left hover:bg-surface transition-colors text-sm",
                        pendingFolderId === folder.id && "bg-accent/10 text-accent"
                      )}
                    >
                      {folder.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="p-4 border-t">
            <Button 
              className="w-full h-12 rounded-xl font-semibold" 
              onClick={showTodoForm ? handleSaveTodo : handleSaveBudget} 
              disabled={showBudgetForm && (!newBudgetTitle.trim() || !newBudgetExpected)}
            >
              Add Item
            </Button>
          </div>
        </div>
      </Modal>

      {/* Folder Modal */}
      <Modal isOpen={showFolderModal} onClose={() => setShowFolderModal(false)} title="New Folder" showCloseButton={true} className="sm:max-w-sm sm:rounded-xl max-w-none max-h-[85vh] m-0 sm:m-auto">
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Folder Name</label>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="e.g., Setup Tasks"
              className="w-full p-3 border-2 rounded-lg bg-background focus:border-accent outline-none"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder()
              }}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setShowFolderModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim() || isCreatingFolder} className="flex-1">
              {isCreatingFolder ? 'Creating...' : 'Create Folder'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
