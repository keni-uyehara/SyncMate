# SyncMate Dashboard System

A comprehensive dashboard system for managing compliance operations, strategic insights, and data team operations.

## Features

### Dashboards

1. **Compliance Operations Dashboard** - Team lead portal for managing compliance reports and team performance
2. **Strategic Insights Dashboard** - Business intelligence and synergy opportunities analysis
3. **Data Team Operational Dashboard** - Compliance issue tracking and data governance management

### Reusable Components

The system includes several reusable UI components for consistent design across dashboards:

#### `KPICard`
A standardized KPI (Key Performance Indicator) card component with:
- Title and value display
- Icon with customizable color
- Optional change indicator with trend direction
- Optional progress bar
- Optional description text

```tsx
<KPICard
  title="Active Issues"
  value="23"
  icon={AlertTriangle}
  iconColor="text-red-500"
  change={{ value: "+3 from last week", isPositive: false }}
/>
```

#### `DashboardHeader`
A consistent header component for all dashboards with:
- Title and subtitle
- Configurable action buttons
- Consistent styling

```tsx
<DashboardHeader
  title="Operational Analytics Dashboard"
  subtitle="SyncMate - Data Team Operations & Compliance Management"
  actions={[
    {
      label: "Export Report",
      icon: Download,
      variant: "outline"
    }
  ]}
/>
```

#### `StatusBadge`
A flexible status badge component with multiple variants:
- `severity` - For issue severity levels (High, Medium, Low)
- `status` - For workflow status (In Progress, Pending Review, Resolved)
- `priority` - For priority levels (High, Medium, Low)

```tsx
<StatusBadge status="High" variant="severity" />
<StatusBadge status="In Progress" variant="status" />
```

#### `SearchFilterBar`
A combined search and filter component with:
- Search input with icon
- Dropdown filter with customizable options
- Consistent styling and behavior

```tsx
<SearchFilterBar
  searchPlaceholder="Search Issues..."
  filterOptions={[
    { value: "high", label: "High Severity" },
    { value: "medium", label: "Medium Severity" }
  ]}
  filterLabel="Issues"
/>
```

## Data Team Operational Dashboard

The new Data Team Operational Dashboard provides comprehensive compliance issue management with:

### Key Features
- **Issue Tracking** - Monitor and manage compliance issues with detailed status tracking
- **Resolution Workflows** - Track workflow progress and performance metrics
- **Root Cause Analysis** - Identify underlying causes of compliance issues
- **Audit Trail** - Complete history of changes and actions
- **AI Insights** - Machine learning analysis and predictive analytics
- **Data Glossary** - Standardized definitions and governance framework

### KPIs
- Active Issues (23, +3 from last week)
- Resolution Rate (87%, +5% improvement)
- Average Resolution Time (2.3 days, -0.5d improvement)
- Compliance Score (94%)

### Navigation Tabs
1. **Issue Tracking** - Main compliance issues table with search and filtering
2. **Resolution Workflows** - Workflow status and performance metrics
3. **Root Cause Analysis** - Analysis tools and visualizations
4. **Audit Trail** - Complete change history
5. **AI Insights** - AI-generated recommendations and predictions
6. **Data Glossary** - Data governance and definitions

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up Firebase configuration in `.env`:
```
VITE_APIKEY=your-api-key-here
VITE_AUTHDOMAIN=your-project-id.firebaseapp.com
VITE_PROJECTID=your-project-id
VITE_STORAGEBUCKET=your-project-id.appspot.com
VITE_MESSAGESENDERID=your-sender-id
VITE_APPID=your-app-id
```

3. Start the development server:
```bash
npm run dev
```

4. Navigate to the dashboard selector and choose your workspace:
   - Compliance Operations
   - Strategic Insights
   - Data Team Operations

## Component Architecture

The system follows a modular component architecture:

```
src/
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── kpi-card.tsx
│   │   ├── dashboard-header.tsx
│   │   ├── status-badge.tsx
│   │   ├── search-filter-bar.tsx
│   │   └── ...               # Other UI components
│   ├── dashboards/           # Dashboard implementations
│   │   ├── insights-dashboard.tsx
│   │   ├── data-team-operational-dashboard.tsx
│   │   └── ...
│   └── navigation/           # Navigation components
│       ├── dashboard-selector.tsx
│       └── dashboard-navigation.tsx
```

## Design System

The dashboard system uses:
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Shadcn/ui** components as the base UI library
- Consistent color schemes and spacing
- Responsive design for all screen sizes

## Contributing

When adding new dashboards or components:

1. Use the existing reusable components when possible
2. Follow the established naming conventions
3. Maintain consistent styling with the design system
4. Add proper TypeScript types for all props
5. Include proper documentation and examples
