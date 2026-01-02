import { useState, useCallback, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Table } from '@/components/ui/Table'
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Calendar,
  AlertTriangle,
  Download,
  RefreshCw,
  Phone,
  Mail,
  UserCheck,
  TrendingUp,
  Users,
  BookOpen
} from 'lucide-react'

interface SupportTicket {
  id: string
  title: string
  description: string
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'technical' | 'billing' | 'account' | 'general'
  userId: string
  user: {
    firstName: string
    lastName: string
    email: string
  }
  createdAt: string
  updatedAt: string
  assignedTo?: string
}

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
  isActive: boolean
  views: number
  createdAt: string
  updatedAt: string
}

export function AdminSupportPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'tickets' | 'faq' | 'contacts'>('tickets')

  // Mock data for demonstration
  const supportTickets: SupportTicket[] = [
    {
      id: '1',
      title: 'Cannot login to my account',
      description: 'Getting error message when trying to log in',
      status: 'open',
      priority: 'high',
      category: 'account',
      userId: 'user1',
      user: {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah@example.com'
      },
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      title: 'Payment processing issue',
      description: 'Credit card payment failed multiple times',
      status: 'in-progress',
      priority: 'urgent',
      category: 'billing',
      userId: 'user2',
      user: {
        firstName: 'Mike',
        lastName: 'Chen',
        email: 'mike@example.com'
      },
      createdAt: '2024-01-14T14:20:00Z',
      updatedAt: '2024-01-15T09:15:00Z',
      assignedTo: 'admin1'
    },
    {
      id: '3',
      title: 'Market listing not showing',
      description: 'My market listing disappeared from search results',
      status: 'resolved',
      priority: 'medium',
      category: 'technical',
      userId: 'user3',
      user: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com'
      },
      createdAt: '2024-01-13T16:45:00Z',
      updatedAt: '2024-01-14T11:20:00Z',
      assignedTo: 'admin2'
    }
  ]

  const faqItems: FAQItem[] = [
    {
      id: '1',
      question: 'How do I apply to a market?',
      answer: 'Navigate to the market page and click the "Apply Now" button to start your application.',
      category: 'applications',
      isActive: true,
      views: 245,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and bank transfers for market fees.',
      category: 'payments',
      isActive: true,
      views: 189,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      question: 'How long does application approval take?',
      answer: 'Application approval typically takes 3-5 business days depending on the market.',
      category: 'applications',
      isActive: false,
      views: 156,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-10T00:00:00Z'
    }
  ]

  // Statistics
  const ticketStats = {
    total: supportTickets.length,
    open: supportTickets.filter(t => t.status === 'open').length,
    inProgress: supportTickets.filter(t => t.status === 'in-progress').length,
    resolved: supportTickets.filter(t => t.status === 'resolved').length,
    urgent: supportTickets.filter(t => t.priority === 'urgent').length,
  }

  const recentActivity = [
    {
      id: '1',
      action: 'ticket_created',
      message: 'New support ticket: "Login issues" from Sarah Johnson',
      timestamp: '5 minutes ago',
      type: 'info'
    },
    {
      id: '2',
      action: 'ticket_resolved',
      message: 'Support ticket resolved: "Payment problem" by Mike Chen',
      timestamp: '1 hour ago',
      type: 'success'
    },
    {
      id: '3',
      action: 'faq_updated',
      message: 'FAQ updated: "How to apply for markets"',
      timestamp: '2 hours ago',
      type: 'info'
    },
    {
      id: '4',
      action: 'ticket_assigned',
      message: 'Support ticket assigned to admin team',
      timestamp: '3 hours ago',
      type: 'info'
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="default">Open</Badge>
      case 'in-progress':
        return <Badge variant="warning">In Progress</Badge>
      case 'resolved':
        return <Badge variant="default">Resolved</Badge>
      case 'closed':
        return <Badge variant="muted">Closed</Badge>
      default:
        return <Badge variant="muted">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge variant="outline">Low</Badge>
      case 'medium':
        return <Badge variant="warning">Medium</Badge>
      case 'high':
        return <Badge variant="destructive">High</Badge>
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>
      default:
        return <Badge variant="muted">{priority}</Badge>
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning': return <XCircle className="h-4 w-4 text-red-500" />
      case 'info': return <AlertTriangle className="h-4 w-4 text-blue-500" />
      default: return <MessageSquare className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'success': return <Badge variant="default">Success</Badge>
      case 'warning': return <Badge variant="warning">Warning</Badge>
      case 'info': return <Badge variant="outline">Info</Badge>
      default: return <Badge variant="muted">Activity</Badge>
    }
  }

  const handleSearch = useCallback(() => {
    console.log(`Searching for: ${searchQuery}`)
  }, [searchQuery])

  const handleStatusFilter = useCallback((status: string) => {
    setSelectedStatus(status)
    console.log(`Filtering by status: ${status}`)
  }, [])

  const handlePriorityFilter = useCallback((priority: string) => {
    setSelectedPriority(priority)
    console.log(`Filtering by priority: ${priority}`)
  }, [])

  const handleTicketAction = useCallback((ticketId: string, action: 'resolve' | 'assign' | 'close') => {
    console.log(`Action ${action} on ticket ${ticketId}`)
  }, [])

  useEffect(() => {
    // Component mounted
  }, [])

  const renderTicketsTab = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Search support tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full"
            />
          </div>
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Select
            value={selectedStatus}
            onValueChange={handleStatusFilter}
            className="w-48"
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'open', label: 'Open' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'closed', label: 'Closed' }
            ]}
          />
          <Select
            value={selectedPriority}
            onValueChange={handlePriorityFilter}
            className="w-48"
            options={[
              { value: 'all', label: 'All Priorities' },
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'urgent', label: 'Urgent' }
            ]}
          />
        </div>
      </Card>

      {/* Support Tickets Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Support Tickets</h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Export
            </Button>
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Table
          columns={[
            {
              title: 'Ticket',
              key: 'ticket',
              render: (_: any, record: SupportTicket) => (
                <div>
                  <p className="font-medium">{record.title}</p>
                  <p className="text-sm text-muted-foreground">{record.description}</p>
                </div>
              )
            },
            {
              title: 'Status',
              key: 'status',
              render: (_: any, record: SupportTicket) => getStatusBadge(record.status)
            },
            {
              title: 'Priority',
              key: 'priority',
              render: (_: any, record: SupportTicket) => getPriorityBadge(record.priority)
            },
            {
              title: 'User',
              key: 'user',
              render: (_: any, record: SupportTicket) => (
                <div>
                  <p className="font-medium">{record.user.firstName} {record.user.lastName}</p>
                  <p className="text-sm text-muted-foreground">{record.user.email}</p>
                </div>
              )
            },
            {
              title: 'Created',
              key: 'createdAt',
              render: (_: any, record: SupportTicket) => (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                </div>
              )
            },
            {
              title: 'Actions',
              key: 'actions',
              render: (_: any, record: SupportTicket) => (
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleTicketAction(record.id, 'resolve')}
                    disabled={record.status === 'resolved'}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </div>
              )
            }
          ]}
          data={supportTickets}
          loading={false}
          emptyText="No support tickets found"
        />
      </Card>
    </div>
  )

  const renderFAQTab = () => (
    <div className="space-y-6">
      {/* FAQ Management */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">FAQ Management</h3>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add FAQ Item
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export FAQ
            </Button>
          </div>
        </div>

        <Table
          columns={[
            {
              title: 'Question',
              key: 'question',
              render: (_: any, record: FAQItem) => (
                <div>
                  <p className="font-medium">{record.question}</p>
                  <p className="text-sm text-muted-foreground">Category: {record.category}</p>
                </div>
              )
            },
            {
              title: 'Status',
              key: 'isActive',
              render: (_: any, record: FAQItem) => (
                <Badge variant={record.isActive ? "default" : "outline"}>
                  {record.isActive ? 'Active' : 'Inactive'}
                </Badge>
              )
            },
            {
              title: 'Views',
              key: 'views',
              render: (_: any, record: FAQItem) => (
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span>{record.views}</span>
                </div>
              )
            },
            {
              title: 'Updated',
              key: 'updatedAt',
              render: (_: any, record: FAQItem) => (
                <div className="flex items-center gap-1">
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(record.updatedAt).toLocaleDateString()}</span>
                </div>
              )
            },
            {
              title: 'Actions',
              key: 'actions',
              render: (_: any, record: FAQItem) => (
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    {record.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                  </Button>
                </div>
              )
            }
          ]}
          data={faqItems}
          loading={false}
          emptyText="No FAQ items found"
        />
      </Card>
    </div>
  )

  const renderContactsTab = () => (
    <div className="space-y-6">
      {/* Contact Management */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Contact Management</h3>
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Phone className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Phone Support</p>
                <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Mail className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Email Support</p>
                <p className="text-sm text-muted-foreground">support@rumfor.com</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <MessageSquare className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Live Chat</p>
                <p className="text-sm text-muted-foreground">Available 9AM-5PM EST</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Support Team Contacts</h4>
          {[
            { name: 'John Admin', role: 'Senior Support Manager', email: 'john@rumfor.com', phone: '+1 (555) 123-4568' },
            { name: 'Sarah Support', role: 'Technical Support', email: 'sarah@rumfor.com', phone: '+1 (555) 123-4569' },
            { name: 'Mike Help', role: 'Customer Success', email: 'mike@rumfor.com', phone: '+1 (555) 123-4570' }
          ].map((contact, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-full">
                  <UserCheck className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-sm text-muted-foreground">{contact.role}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm">{contact.email}</p>
                <p className="text-sm text-muted-foreground">{contact.phone}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Support Management</h1>
          <p className="text-muted-foreground">
            Manage support tickets, FAQs, and customer communications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button>
            <MessageSquare className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Tickets</p>
              <p className="text-3xl font-bold">{ticketStats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Open Tickets</p>
              <p className="text-3xl font-bold">{ticketStats.open}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">In Progress</p>
              <p className="text-3xl font-bold">{ticketStats.inProgress}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <RefreshCw className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Resolved</p>
              <p className="text-3xl font-bold">{ticketStats.resolved}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Urgent</p>
              <p className="text-3xl font-bold">{ticketStats.urgent}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <span>View Tickets</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
            <BookOpen className="h-5 w-5" />
            <span>Manage FAQ</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
            <Users className="h-5 w-5" />
            <span>Support Team</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <span>Analytics</span>
          </Button>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <Button variant="outline" size="sm">
            View All Activity
          </Button>
        </div>
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getActivityIcon(activity.type)}
                <div>
                  <p className="text-sm font-medium">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                </div>
              </div>
              <div>
                {getActivityBadge(activity.type)}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Tab Navigation */}
      <Card className="p-6">
        <div className="flex items-center gap-1 mb-6 border-b">
          <Button
            variant={activeTab === 'tickets' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('tickets')}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Support Tickets
          </Button>
          <Button
            variant={activeTab === 'faq' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('faq')}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            FAQ Management
          </Button>
          <Button
            variant={activeTab === 'contacts' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('contacts')}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <Users className="h-4 w-4 mr-2" />
            Contacts
          </Button>
        </div>

        {activeTab === 'tickets' && renderTicketsTab()}
        {activeTab === 'faq' && renderFAQTab()}
        {activeTab === 'contacts' && renderContactsTab()}
      </Card>
    </div>
  )
}