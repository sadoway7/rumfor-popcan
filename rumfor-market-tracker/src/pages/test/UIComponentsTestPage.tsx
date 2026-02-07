import React, { useState } from 'react'
import { 
  Button, 
  Input, 
  Textarea, 
  Select,
  Checkbox, 
  Radio,
  Badge,
  Card, CardHeader, CardTitle, CardDescription, CardContent,
  Spinner,
  Progress,
  Shimmer, Skeleton, PageLoader, LoadingButton, CircleLoader, DotLoader, BarLoader, WaveLoader, PulseLoader, RingLoader,
  Tabs,
  Avatar,
  Alert,
  EmptyState,
  Modal, ModalHeader, ModalFooter, ModalContent
} from '@/components/ui'

export function UIComponentsTestPage() {
  const [activeTab, setActiveTab] = useState('buttons')
  const [modalOpen, setModalOpen] = useState(false)

  const tabs = [
    { key: 'buttons', label: 'Buttons', content: <ButtonsTab /> },
    { key: 'inputs', label: 'Inputs', content: <InputsTab /> },
    { key: 'cards', label: 'Cards', content: <CardsTab openModal={() => setModalOpen(true)} /> },
    { key: 'feedback', label: 'Feedback', content: <FeedbackTab /> },
    { key: 'data', label: 'Data Display', content: <DataTab /> },
    { key: 'loaders', label: 'Loaders', content: <LoadersTab /> },
  ]

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold mb-8">UI Components Test Page</h1>

      <Tabs 
        items={tabs} 
        defaultActiveKey="buttons" 
        onChange={(key) => setActiveTab(key)}
        className="mb-8" 
      />

      <div className="max-w-6xl mx-auto">
        {tabs.find(t => t.key === activeTab)?.content}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Modal Title" description="Optional description">
        <p className="py-4">This is a modal dialog with some content inside.</p>
        <ModalFooter>
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={() => setModalOpen(false)}>Confirm</Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}

function ButtonsTab() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold mb-4">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Button Sizes</h2>
        <div className="flex items-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Loading Button</h2>
        <div className="flex items-center gap-4">
          <LoadingButton loading>Loading</LoadingButton>
          <LoadingButton loading variant="secondary">Loading</LoadingButton>
          <LoadingButton loading variant="destructive">Loading</LoadingButton>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Icon Buttons</h2>
        <div className="flex items-center gap-4">
          <Button>
            <Spinner size="sm" className="mr-2" />
            With Icon
          </Button>
          <Button variant="outline">Edit</Button>
        </div>
      </section>
    </div>
  )
}

function InputsTab() {
  const [selectValue, setSelectValue] = useState('')
  const [checkboxChecked, setCheckboxChecked] = useState(false)
  const [radioValue, setRadioValue] = useState('option1')

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold mb-4">Text Input</h2>
        <div className="max-w-md space-y-4">
          <Input placeholder="Enter text..." label="Label" />
          <Input placeholder="With helper text..." label="Label" helperText="This is helper text" />
          <Input placeholder="Error state..." label="Label" error="This field is required" />
          <Input placeholder="Disabled..." label="Label" disabled />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Textarea</h2>
        <div className="max-w-md space-y-4">
          <Textarea placeholder="Enter long text..." label="Message" />
          <Textarea placeholder="With counter..." label="Bio" maxLength={100} />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Select</h2>
        <div className="max-w-md">
          <Select 
            label="Choose an option"
            value={selectValue}
            onChange={(e) => setSelectValue(e.target.value)}
            options={[
              { value: 'option1', label: 'Option 1' },
              { value: 'option2', label: 'Option 2' },
              { value: 'option3', label: 'Option 3' },
            ]}
          />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Checkbox</h2>
        <div className="space-y-2">
          <Checkbox 
            onValueChange={setCheckboxChecked}
            label="I agree to terms"
          />
          <Checkbox 
            checked={true}
            onValueChange={() => {}}
            label="Disabled checked"
            disabled
          />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Radio Group</h2>
        <Radio 
          label="Choose an option"
          name="radio-group"
          options={[
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' },
          ]}
          onValueChange={setRadioValue}
        />
      </section>
    </div>
  )
}

function CardsTab({ openModal }: { openModal: () => void }) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold mb-4">Basic Card</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card description goes here</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Card content area with some details.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Another Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Different content here.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Clickable Card</h2>
        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={openModal}>
          <CardHeader>
            <CardTitle>Click Me</CardTitle>
            <CardDescription>This card opens a modal</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Click anywhere on this card.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function FeedbackTab() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold mb-4">Alerts</h2>
        <div className="space-y-4 max-w-2xl">
          <Alert variant="default">This is a default alert.</Alert>
          <Alert variant="destructive">This is a destructive alert.</Alert>
          <Alert variant="success">This is a success alert.</Alert>
          <Alert variant="warning">This is a warning alert.</Alert>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Empty State</h2>
        <div className="max-w-md">
          <EmptyState 
            title="No items found"
            description="Get started by creating your first item."
          />
        </div>
      </section>
    </div>
  )
}

function DataTab() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold mb-4">Badges</h2>
        <div className="flex flex-wrap gap-4">
          <Badge>Default</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="muted">Muted</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Avatars</h2>
        <div className="flex items-center gap-4">
          <Avatar src="https://github.com/shadcn.png" alt="User" />
          <Avatar fallback="JD" />
          <Avatar fallback="AB" />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Progress</h2>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="text-sm mb-1 block">Progress (25%)</label>
            <Progress value={25} />
          </div>
          <div>
            <label className="text-sm mb-1 block">Progress (50%)</label>
            <Progress value={50} />
          </div>
          <div>
            <label className="text-sm mb-1 block">Progress (75%)</label>
            <Progress value={75} />
          </div>
        </div>
      </section>
    </div>
  )
}

function LoadersTab() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold mb-6">Modern Spinners</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex flex-col items-center gap-3 p-6 bg-surface rounded-lg border">
            <Spinner size="sm" color="accent" />
            <span className="text-sm text-muted-foreground">sm</span>
          </div>
          <div className="flex flex-col items-center gap-3 p-6 bg-surface rounded-lg border">
            <Spinner size="md" color="accent" />
            <span className="text-sm text-muted-foreground">md</span>
          </div>
          <div className="flex flex-col items-center gap-3 p-6 bg-surface rounded-lg border">
            <Spinner size="lg" color="accent" />
            <span className="text-sm text-muted-foreground">lg</span>
          </div>
          <div className="flex flex-col items-center gap-3 p-6 bg-surface rounded-lg border">
            <Spinner size="xl" color="accent" />
            <span className="text-sm text-muted-foreground">xl</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-6">Spinner Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="flex flex-col items-center gap-3 p-4 bg-surface rounded-lg border">
            <Spinner size="lg" color="accent" />
            <span className="text-sm text-muted-foreground">accent</span>
          </div>
          <div className="flex flex-col items-center gap-3 p-4 bg-surface rounded-lg border">
            <Spinner size="lg" color="default" />
            <span className="text-sm text-muted-foreground">default</span>
          </div>
          <div className="flex flex-col items-center gap-3 p-4 bg-surface rounded-lg border">
            <Spinner size="lg" color="success" />
            <span className="text-sm text-muted-foreground">success</span>
          </div>
          <div className="flex flex-col items-center gap-3 p-4 bg-surface rounded-lg border">
            <Spinner size="lg" color="warning" />
            <span className="text-sm text-muted-foreground">warning</span>
          </div>
          <div className="flex flex-col items-center gap-3 p-4 bg-surface rounded-lg border">
            <Spinner size="lg" color="destructive" />
            <span className="text-sm text-muted-foreground">error</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-6">Fancy Loaders</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex flex-col items-center gap-3 p-6 bg-surface rounded-lg border">
            <CircleLoader size="lg" color="accent" />
            <span className="text-sm text-muted-foreground">Circle</span>
          </div>
          <div className="flex flex-col items-center gap-3 p-6 bg-surface rounded-lg border">
            <DotLoader size="md" color="accent" />
            <span className="text-sm text-muted-foreground">Dots</span>
          </div>
          <div className="flex flex-col items-center gap-3 p-6 bg-surface rounded-lg border">
            <WaveLoader size="md" color="accent" />
            <span className="text-sm text-muted-foreground">Wave</span>
          </div>
          <div className="flex flex-col items-center gap-3 p-6 bg-surface rounded-lg border">
            <RingLoader size="lg" color="accent" />
            <span className="text-sm text-muted-foreground">Ring</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-6">Pulse & Bar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col items-center gap-3 p-6 bg-surface rounded-lg border">
            <PulseLoader size="lg" color="accent" />
            <span className="text-sm text-muted-foreground">Pulse</span>
          </div>
          <div className="flex flex-col items-center gap-3 p-6 bg-surface rounded-lg border">
            <div className="w-full max-w-xs">
              <BarLoader width={200} color="accent" />
            </div>
            <span className="text-sm text-muted-foreground">Bar</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-6">Skeleton Loading</h2>
        <div className="space-y-4 p-6 bg-surface rounded-lg border">
          <div className="space-y-3 max-w-md">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-6">Full Page Loader</h2>
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted/30 p-4 border-b">
            <p className="text-sm text-muted-foreground">Preview</p>
          </div>
          <div className="p-8">
            <PageLoader size="lg" message="Loading your content..." />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-6">Loading Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <LoadingButton loading variant="primary">Saving...</LoadingButton>
          <LoadingButton loading variant="secondary">Processing</LoadingButton>
          <LoadingButton loading variant="outline">Uploading</LoadingButton>
          <LoadingButton loading variant="ghost">Loading</LoadingButton>
        </div>
      </section>
    </div>
  )
}

export default UIComponentsTestPage
