import React, { useState } from 'react'
import { SidePanel } from '@/components/ui/SidePanel'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select, SelectOption } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { UserPlus, Mail, Send } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

interface BulkInvitePanelProps {
  isOpen: boolean
  onClose: () => void
}

export const BulkInvitePanel: React.FC<BulkInvitePanelProps> = ({ isOpen, onClose }) => {
  const [emails, setEmails] = useState('')
  const [role, setRole] = useState('vendor')
  const [customMessage, setCustomMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const { addToast } = useToast()

  const handleSendInvites = async () => {
    if (!emails.trim()) {
      addToast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter at least one email address'
      })
      return
    }

    setIsSending(true)
    try {
      // Split emails by comma or newline
      const emailList = emails.split(/[,\n]/).map(e => e.trim()).filter(e => e)
      
      // TODO: Implement actual API call to send invitations
      console.log('Sending invites to:', emailList, 'with role:', role)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      addToast({
        variant: 'success',
        title: 'Invitations Sent',
        description: `${emailList.length} invitations have been sent successfully.`
      })
      
      // Reset form
      setEmails('')
      setCustomMessage('')
      onClose()
    } catch (error) {
      addToast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send invitations. Please try again.'
      })
    } finally {
      setIsSending(false)
    }
  }

  const roleOptions: SelectOption[] = [
    { value: 'vendor', label: 'Vendor' },
    { value: 'promoter', label: 'Promoter' },
    { value: 'admin', label: 'Admin' }
  ]

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Invite Users"
      description="Send invitation emails to multiple users at once"
      width="lg"
    >
      <div className="space-y-6">
        <Card className="p-4">
          <h4 className="font-medium mb-2">Email Addresses</h4>
          <Textarea
            placeholder="Enter email addresses separated by commas or new lines"
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            rows={5}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-2">
            You can enter multiple email addresses separated by commas or new lines
          </p>
        </Card>

        <Card className="p-4">
          <h4 className="font-medium mb-2">Default Role</h4>
          <Select
            value={role}
            onValueChange={setRole}
            options={roleOptions}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-2">
            This role will be assigned to all invited users
          </p>
        </Card>

        <Card className="p-4">
          <h4 className="font-medium mb-2">Custom Message (Optional)</h4>
          <Textarea
            placeholder="Add a custom message to include in the invitation email"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            rows={3}
            className="w-full"
          />
        </Card>

        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleSendInvites}
            disabled={isSending || !emails.trim()}
            className="flex-1"
          >
            <Send className="h-4 w-4 mr-2" />
            {isSending ? 'Sending...' : 'Send Invitations'}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </SidePanel>
  )
}