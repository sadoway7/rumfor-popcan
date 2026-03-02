import { AdminMarketTable } from '@/components/AdminMarketTable'
import { Button } from '@/components/ui/Button'
import { Plus, Download } from 'lucide-react'

export function AdminMarketsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-1" />
          <span className="text-xs">Create</span>
        </Button>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-1" />
          <span className="text-xs">Export</span>
        </Button>
      </div>

      <AdminMarketTable />
    </div>
  )
}
