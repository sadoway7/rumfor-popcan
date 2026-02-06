# Vendor Market Todo System Architecture

## Overview

The todo system allows vendors to create and manage task lists specific to each market they track or attend. Each user has their own isolated todo list per market. **Clean, efficient list-based design** with minimal UI.

## Architecture Diagram

```mermaid
flowchart TD
    subgraph Frontend
        VMP[VendorMarketDetailPage] -->|Renders| TasksTab[Tasks Tab]
        TasksTab -->|Lazy Loads| VTL[VendorTodoList]
        VTL -->|Uses| useTodos[useTodos Hook]
        VTL -->|Uses| useTodoPresets[useTodoPresets Hook]
        useTodos -->|Calls| api[trackingApi]
        useTodoPresets -->|Calls| presetApi[presetApi]
        api -->|HTTP GET| BE[Backend API]
    end

    subgraph Backend
        BE -->|Routes to| todoRoutes[/api/todos]
        BE -->|Routes to| presetRoutes[/api/todo-presets]
        todoRoutes -->|Calls| todoCtrl[Todos Controller]
        presetRoutes -->|Calls| presetCtrl[Presets Controller]
        todoCtrl -->|Queries| TodoM[Todo Model]
        presetCtrl -->|Queries| PresetM[TodoPreset Model]
    end

    subgraph Data Model
        Todo -->|belongsTo| User
        Todo -->|belongsTo| Market
        TodoPreset -->|belongsTo| User
        UserMarketTracking -->|links| User
        UserMarketTracking -->|links| Market
    end
```

## Clean List-Based UI Design

### Main Todo List - Simple List Layout
```
┌────────────────────────────┐
│ Tasks [+]:           [📋]:│◄ Add Task | Templates
├────────────────────────────┤
│ ○ Setup booth             1│
│ ○ Order supplies          3│
│ ✓ Print flyers            —│
│ ○ Pack equipment          5│
├────────────────────────────┤
│ [Info] [Tasks] [Budget]    │
└────────────────────────────┘
```
**Format:** `[status] [title] [due days]` - Clean single line

### Header Buttons (Separate)
| Button | Icon | Action |
|--------|------|--------|
| **Add Task** | `[+]` | Opens empty todo form |
| **Templates** | `[📋]` | Opens preset categories modal |

### Presets Modal - Category Selection
```
┌────────────────────────────┐
│ Templates             [✕] │
├────────────────────────────┤
│ 📋 Custom                  │◄ User presets first
│ ──────────────────────     │
│ 📦 Setup                   │
│ 🛒 Products                │
│ 📣 Marketing               │
│ 🚚 Logistics               │
│ 🎉 Post-event              │
└────────────────────────────┘
```

### Presets Modal - Items View
```
┌────────────────────────────┐
│ 📦 Setup              [Back]│
├────────────────────────────┤
│ Complete application       │◄ Tap to create todo
│ Review market rules        │
│ Design booth layout        │
│ Obtain permits             │
│ Set up payment             │
└────────────────────────────┘
```

### Create Task Form
```
┌────────────────────────────┐
│ New Task              [✕] │
├────────────────────────────┤
│ Title                        │
│ ────────────────────────     │
│ Priority: [▾ Medium]         │
│ Category: [▾ Setup]          │
│ Due:       [▾ Today]         │
├────────────────────────────┤
│ [Save & Add Template] [Save] │◄ Save task, also save as preset
└────────────────────────────┘
```

### Edit Task Form (Existing Task)
```
┌────────────────────────────┐
│ Edit Task             [✕] │
├────────────────────────────┤
│ Title                        │
│ ────────────────────────     │
│ Priority: [▾ Medium]         │
│ Category: [▾ Setup]          │
│ Due:       [▾ Today]         │
├────────────────────────────┤
│ [Save Template] [Save]       │◄ Just save as preset
│ [Delete]                     │
└────────────────────────────┘
```

### List Item States

| State | Icon | Meaning |
|-------|------|---------|
| Pending | ○ | Not started |
| Completed | ✓ | Done |
| Overdue | ⚠️ | Past due date |

## How It Works

### 1. Data Isolation (Per-User Per-Market)

Each todo is linked to both a **vendor** (user) and a **market**:

```javascript
const todoSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  market: { type: mongoose.Schema.Types.ObjectId, ref: 'Market', required: true },
  title: { type: String, required: true },
  // ... other fields
})
```

**Query ensures isolation:**
```javascript
// In Todo.getVendorMarketTodos
const query = {
  vendor: vendorId,    // Filter by user
  market: marketId,    // Filter by market
  isDeleted: false
}
```

### 2. Access Control

Users can access todos for markets they have a relationship with:

```javascript
const hasAccess = 
  market.promoter.toString() === req.user.id ||      // They run the market
  req.user.role === 'admin' ||                        // Admin
  await Todo.findOne({ vendor: req.user.id, market: marketId }) || // Has todos
  await UserMarketTracking.findOne({ user: req.user.id, market: marketId }) // Tracks market
```

### 3. API Endpoints

#### Todos

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/todos?marketId=...` | Get todos for market |
| POST | `/api/todos` | Create new todo |
| PATCH | `/api/todos/:id` | Update todo |
| DELETE | `/api/todos/:id` | Soft delete todo |
| POST | `/api/todos/:id/complete` | Toggle complete |

#### Todo Presets (User-Defined Templates)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/todo-presets` | Get user's presets |
| GET | `/api/todo-presets?category=...` | Get presets by category |
| POST | `/api/todo-presets` | Create new preset |
| DELETE | `/api/todo-presets/:id` | Delete preset |
| POST | `/api/todos/from-preset` | Create todo from preset |

### 4. Frontend Components

```
src/components/
├── VendorTodoList.tsx    # Main list (clean lines)
├── TodoItem.tsx          # Single line item
├── TodoForm.tsx          # Create/edit modal
├── PresetsModal.tsx      # Category → items popup
└── PresetItem.tsx        # Single preset line

src/features/tracking/
├── trackingApi.ts        # HTTP client for todos
├── presetApi.ts          # HTTP client for presets
└── hooks/
    ├── useTodos.ts       # React Query hooks
    └── useTodoPresets.ts # React Query hooks
```

### 5. Todo Properties

| Field | Type | Description |
|-------|------|-------------|
| `vendor` | ObjectId | User who owns this todo |
| `market` | ObjectId | Market this todo is for |
| `title` | String | Task title |
| `description` | String | Optional details |
| `category` | Enum | setup, products, marketing, logistics, post-event |
| `priority` | Enum | urgent, high, medium, low |
| `status` | Enum | pending, in-progress, completed, cancelled |
| `dueDate` | Date | Optional deadline |

### 6. TodoPreset Properties (New)

| Field | Type | Description |
|-------|------|-------------|
| `user` | ObjectId | User who owns this preset |
| `title` | String | Template title |
| `description` | String | Optional description |
| `category` | Enum | setup, products, marketing, logistics, post-event |
| `priority` | Enum | urgent, high, medium, low |
| `usageCount` | Number | How many times used |

### 7. Preset Categories

| Category | Icon | Examples |
|----------|------|----------|
| **custom** | 📋 | User's saved presets |
| **setup** | 📦 | Application, permits, booth setup |
| **products** | 🛒 | Inventory, pricing, display |
| **marketing** | 📣 | Social media, flyers, promotion |
| **logistics** | 🚚 | Transportation, equipment, packing |
| **post-event** | 🎉 | Cleanup, follow-up, sales review |

### 8. System Presets (Built-in)

**setup:**
- Complete vendor application
- Review market rules and regulations
- Design booth layout
- Obtain necessary permits and licenses
- Set up payment processing system

**products:**
- Prepare product inventory
- Price all products
- Organize display materials
- Prepare product samples
- Update product descriptions

**marketing:**
- Create marketing materials
- Post on social media
- Design promotional flyers
- Contact local media
- Update business website

**logistics:**
- Arrange transportation
- Prepare equipment and tools
- Pack display materials
- Plan booth setup/breakdown
- Confirm accommodation if needed

**post-event:**
- Clean up booth area
- Process payments
- Follow up with customers
- Review sales performance
- Plan for next market

## Known Issues & Fixes Needed

### Issue 1: API Response Format Mismatch

**Location**: `trackingApi.ts:48` vs `todosController.js:54-62`

**Problem**: The backend returns `{ todos, pagination }` but frontend expects `PaginatedResponse<Todo>`.

**Fix needed**: Update frontend to handle `{ todos, pagination }` response.

### Issue 2: Access Control Missing Tracked Market Check

**Location**: `todosController.js:27-33`

**Problem**: Access check only looks at promoter/admin/existing todos.

**Fix needed**: Add `UserMarketTracking` check.

## Implementation Plan

### Phase 1: Bug Fixes
- [ ] Fix API response handling in trackingApi.ts
- [ ] Fix access control in todosController.js to check UserMarketTracking

### Phase 2: User Presets Feature
- [ ] Create TodoPreset model in backend
- [ ] Implement Preset CRUD API endpoints
- [ ] Add presetApi.ts to frontend
- [ ] Add useTodoPresets.ts hook
- [ ] Create PresetsModal.tsx (category → items flow)
- [ ] Create PresetItem.tsx (clean single line)

### Phase 3: Todo Form Updates
- [ ] Update TodoForm.tsx for create mode: `[Save & Add Template] [Save]`
- [ ] Update TodoForm.tsx for edit mode: `[Save Template] [Save] [Delete]`
- [ ] Connect "Save & Add Template" to create preset after saving todo
- [ ] Connect "Save Template" to save current form as preset

### Phase 4: Clean List UI
- [ ] VendorTodoList - simple list lines with [+]: and [📋]: buttons
- [ ] TodoItem - single line with status icon
- [ ] Swipe-to-complete on list items
- [ ] FAB for quick add

### Phase 5: Testing
- [ ] Test create, toggle, edit, delete operations
- [ ] Test preset creation and usage
- [ ] Mobile usability testing

## Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Backend Model (Todo) | ✅ Done | Todo.js with full schema |
| Backend Controller (Todos) | ✅ Done | Full CRUD + operations |
| Backend Routes (Todos) | ✅ Done | /api/todos endpoints |
| Frontend Types (Todo) | ✅ Done | Todo type defined |
| Frontend API (Todos) | ⚠️ Issue | Response format mismatch |
| Frontend Hook (useTodos) | ✅ Done | useTodos hook implemented |
| Frontend Components (Todo) | ⚠️ Need Clean List | Refactor to simple list |
| Access Control | ⚠️ Issue | Missing TrackedMarket check |
| Backend Model (TodoPreset) | ⬜ Pending | New - needs creation |
| Backend Controller (Presets) | ⬜ Pending | New - needs creation |
| Backend Routes (Presets) | ⬜ Pending | New - needs creation |
| Frontend API (Presets) | ⬜ Pending | New - needs creation |
| Frontend Hook (useTodoPresets) | ⬜ Pending | New - needs creation |
| Frontend Components (Presets) | ⬜ Pending | New - needs creation |
