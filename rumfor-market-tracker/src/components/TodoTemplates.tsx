import React, { useState } from 'react'
import { Plus, Check, Loader2 } from 'lucide-react'
import { useTodoTemplates } from '@/features/tracking/hooks/useTodos'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { cn } from '@/utils/cn'

interface TodoTemplatesProps {
  selectedCategory?: string
  onSelectTemplate: (template: string) => void
  className?: string
}

const templateCategories = {
  setup: {
    label: 'Setup & Planning',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: '🏗️'
  },
  products: {
    label: 'Products & Inventory',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: '📦'
  },
  marketing: {
    label: 'Marketing & Promotion',
    color: 'bg-pink-100 text-pink-700 border-pink-200',
    icon: '📢'
  },
  logistics: {
    label: 'Logistics & Setup',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: '🚛'
  },
  'post-event': {
    label: 'Post-Event',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    icon: '📋'
  }
}

export const TodoTemplates: React.FC<TodoTemplatesProps> = ({
  selectedCategory,
  onSelectTemplate,
  className
}) => {
  const { templates, isLoading } = useTodoTemplates(selectedCategory)
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set())
  const [isAddingTemplate, setIsAddingTemplate] = useState<string | null>(null)

  const handleAddTemplate = async (template: string) => {
    setIsAddingTemplate(template)
    try {
      await onSelectTemplate(template)
      setSelectedTemplates(prev => {
        const newSet = new Set(prev)
        newSet.delete(template)
        return newSet
      })
    } catch (error) {
      console.error('Failed to add template:', error)
    } finally {
      setIsAddingTemplate(null)
    }
  }

  const groupTemplatesByCategory = (templates: string[]) => {
    const categorizedTemplates: Record<string, string[]> = {
      setup: [],
      products: [],
      marketing: [],
      logistics: [],
      'post-event': []
    }

    templates.forEach(template => {
      const lowerTemplate = template.toLowerCase()
      if (lowerTemplate.includes('application') || lowerTemplate.includes('setup') || lowerTemplate.includes('planning') || lowerTemplate.includes('permit') || lowerTemplate.includes('layout')) {
        categorizedTemplates.setup.push(template)
      } else if (lowerTemplate.includes('product') || lowerTemplate.includes('inventory') || lowerTemplate.includes('sample') || lowerTemplate.includes('display') || lowerTemplate.includes('price')) {
        categorizedTemplates.products.push(template)
      } else if (lowerTemplate.includes('marketing') || lowerTemplate.includes('social media') || lowerTemplate.includes('flyer') || lowerTemplate.includes('promotion') || lowerTemplate.includes('media')) {
        categorizedTemplates.marketing.push(template)
      } else if (lowerTemplate.includes('transport') || lowerTemplate.includes('equipment') || lowerTemplate.includes('pack') || lowerTemplate.includes('setup') || lowerTemplate.includes('breakdown') || lowerTemplate.includes('accommodation')) {
        categorizedTemplates.logistics.push(template)
      } else if (lowerTemplate.includes('clean') || lowerTemplate.includes('follow') || lowerTemplate.includes('review') || lowerTemplate.includes('customer') || lowerTemplate.includes('payment')) {
        categorizedTemplates['post-event'].push(template)
      } else {
        // Default to setup for uncategorized templates
        categorizedTemplates.setup.push(template)
      }
    })

    return categorizedTemplates
  }

  const templatesByCategory = React.useMemo(() => {
    return groupTemplatesByCategory(templates)
  }, [templates])

  if (isLoading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Loading templates...</span>
        </div>
      </Card>
    )
  }

  if (templates.length === 0) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="text-center text-gray-500 py-8">
          <Check className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No templates available</h3>
          <p className="text-sm">
            {selectedCategory 
              ? `No templates found for ${templateCategories[selectedCategory as keyof typeof templateCategories]?.label || selectedCategory}`
              : 'No templates available at the moment'
            }
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Task Templates</h3>
          <p className="text-sm text-gray-600 mt-1">
            {selectedCategory 
              ? `Templates for ${templateCategories[selectedCategory as keyof typeof templateCategories]?.label || selectedCategory}`
              : 'Choose from pre-built task templates'
            }
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {templates.length} template{templates.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {selectedCategory ? (
        // Show templates for selected category only
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">
              {templateCategories[selectedCategory as keyof typeof templateCategories]?.icon || '📋'}
            </span>
            <h4 className="font-medium text-gray-900">
              {templateCategories[selectedCategory as keyof typeof templateCategories]?.label || selectedCategory}
            </h4>
          </div>
          <div className="space-y-2">
            {templatesByCategory[selectedCategory]?.map((template) => (
              <div
                key={template}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-all",
                  selectedTemplates.has(template)
                    ? "border-blue-200 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                <span className="text-sm text-gray-700 flex-1">{template}</span>
                <div className="flex items-center gap-2">
                  {selectedTemplates.has(template) && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddTemplate(template)}
                    disabled={isAddingTemplate === template}
                    className="ml-2"
                  >
                    {isAddingTemplate === template ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Plus className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        // Show all templates grouped by category
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(templatesByCategory).map(([category, categoryTemplates]) => {
            if (categoryTemplates.length === 0) return null
            
            const categoryConfig = templateCategories[category as keyof typeof templateCategories]
            
            return (
              <Card key={category} className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">{categoryConfig.icon}</span>
                  <h4 className="font-medium text-gray-900">{categoryConfig.label}</h4>
                  <Badge variant="outline" className={cn("text-xs", categoryConfig.color)}>
                    {categoryTemplates.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {categoryTemplates.map((template) => (
                    <div
                      key={template}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-all",
                        selectedTemplates.has(template)
                          ? "border-blue-200 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      )}
                    >
                      <span className="text-sm text-gray-700 flex-1">{template}</span>
                      <div className="flex items-center gap-2">
                        {selectedTemplates.has(template) && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddTemplate(template)}
                          disabled={isAddingTemplate === template}
                          className="ml-2"
                        >
                          {isAddingTemplate === template ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Plus className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Bulk Actions */}
      {selectedTemplates.size > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                {selectedTemplates.size} template{selectedTemplates.size !== 1 ? 's' : ''} selected
              </span>
            </div>
            <Button
              size="sm"
              onClick={() => {
                selectedTemplates.forEach(template => {
                  handleAddTemplate(template)
                })
              }}
              disabled={Array.from(selectedTemplates).some(template => isAddingTemplate === template)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add All Selected
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}