# Navigation Structure

## App Flow

```
┌─────────────────────────────────────────────┐
│          UNAUTHENTICATED FLOW               │
├─────────────────────────────────────────────┤
│  Welcome Screen                             │
│    ├─ Login Screen                          │
│    │   └─ → MainTabs (on success)           │
│    ├─ Register Screen                       │
│    │   └─ → MainTabs (on success)           │
│    └─ Forgot Password Screen                │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│          AUTHENTICATED FLOW                 │
├─────────────────────────────────────────────┤
│  MainTabs (Bottom Tab Navigator)            │
│    ├─ 📊 Dashboard Tab                      │
│    │   ├─ Analytics Overview                │
│    │   ├─ Quick Stats                       │
│    │   ├─ Performance Chart                 │
│    │   ├─ Quick Actions                     │
│    │   └─ Recent Activity                   │
│    │                                         │
│    ├─ 👥 Agents Tab (HomeScreen)            │
│    │   ├─ AI Employees List                 │
│    │   ├─ Search & Filter                   │
│    │   ├─ Grid/List View Toggle             │
│    │   └─ FAB → Create Agent                │
│    │                                         │
│    ├─ ✏️ Create Tab (ContentGenerator)      │
│    │   ├─ Content Generation                │
│    │   ├─ Templates                         │
│    │   └─ AI Writing Tools                  │
│    │                                         │
│    └─ 👤 Profile Tab                        │
│        ├─ User Info & Stats                 │
│        ├─ Subscription Management           │
│        ├─ Settings Menu                     │
│        └─ Logout                            │
│                                              │
├─────────────────────────────────────────────┤
│          MODAL & DETAIL SCREENS              │
├─────────────────────────────────────────────┤
│  Create Agent (Modal)                        │
│    └─ Form to create new AI employee        │
│                                              │
│  Agent Workspace                             │
│    ├─ Agent Details                          │
│    ├─ Tasks & Goals                          │
│    ├─ Chat Interface                         │
│    └─ Performance Metrics                    │
│                                              │
│  Settings                                    │
│    ├─ Theme Toggle                           │
│    ├─ Notifications                          │
│    └─ App Preferences                        │
└──────────────────────────────────────────────┘
```

## Tab Icons & Functions

### 📊 Dashboard
- **Icon**: Grid (grid/grid-outline)
- **Purpose**: Analytics overview and quick insights
- **Features**: 
  - Stats cards with trends
  - Performance charts
  - Quick action buttons
  - Activity timeline
  - FAB for creating agents

### 👥 Agents
- **Icon**: People (people/people-outline)
- **Purpose**: Manage AI employees
- **Features**:
  - Searchable list
  - Grid/List view toggle
  - Agent cards with status
  - Pull to refresh
  - FAB for creating agents

### ✏️ Create
- **Icon**: Create (create/create-outline)
- **Purpose**: Content generation tools
- **Features**:
  - AI content generator
  - Multiple templates
  - Copy to clipboard
  - Content history

### 👤 Profile
- **Icon**: Person (person/person-outline)
- **Purpose**: User account management
- **Features**:
  - Profile overview
  - Subscription info
  - Settings access
  - Menu navigation
  - Logout option

## Navigation Gestures

- **Swipe**: Switch between tabs
- **Tap**: Navigate to screens
- **Pull Down**: Refresh content
- **FAB**: Quick create actions
- **Back**: Return to previous screen

## Screen Transitions

- **Tab Switch**: Fade transition
- **Modal**: Slide up from bottom
- **Stack Push**: Slide from right
- **Stack Pop**: Slide to right
