# UI Component Library & Design System
## Akashic Intelligence Campaign Console

### 1. Design System Foundation

#### 1.1 Design Principles
- **Clarity**: Clear information hierarchy and intuitive navigation
- **Efficiency**: Streamlined workflows for campaign professionals
- **Intelligence**: AI insights seamlessly integrated into the interface
- **Trust**: Professional appearance that builds confidence
- **Accessibility**: WCAG 2.1 AA compliant throughout

#### 1.2 Brand Colors
```css
/* Primary Brand Colors */
--ai-primary: #2563eb;          /* Akashic Blue */
--ai-primary-dark: #1d4ed8;     /* Darker Blue */
--ai-primary-light: #3b82f6;    /* Lighter Blue */

/* Secondary Colors */
--ai-secondary: #7c3aed;        /* Purple */
--ai-accent: #06b6d4;           /* Cyan */
--ai-success: #10b981;          /* Green */
--ai-warning: #f59e0b;          /* Amber */
--ai-error: #ef4444;            /* Red */

/* Neutral Colors */
--ai-gray-50: #f9fafb;
--ai-gray-100: #f3f4f6;
--ai-gray-200: #e5e7eb;
--ai-gray-300: #d1d5db;
--ai-gray-400: #9ca3af;
--ai-gray-500: #6b7280;
--ai-gray-600: #4b5563;
--ai-gray-700: #374151;
--ai-gray-800: #1f2937;
--ai-gray-900: #111827;

/* Special Purpose */
--ai-intelligence: #8b5cf6;     /* AI/Intelligence features */
--ai-version-control: #06b6d4;  /* Version control features */
--ai-analytics: #10b981;        /* Analytics and metrics */
```

#### 1.3 Typography
```css
/* Font Families */
--ai-font-sans: 'Inter', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
--ai-font-mono: 'JetBrains Mono', 'Courier New', monospace;

/* Font Sizes */
--ai-text-xs: 0.75rem;    /* 12px */
--ai-text-sm: 0.875rem;   /* 14px */
--ai-text-base: 1rem;     /* 16px */
--ai-text-lg: 1.125rem;   /* 18px */
--ai-text-xl: 1.25rem;    /* 20px */
--ai-text-2xl: 1.5rem;    /* 24px */
--ai-text-3xl: 1.875rem;  /* 30px */
--ai-text-4xl: 2.25rem;   /* 36px */

/* Font Weights */
--ai-font-light: 300;
--ai-font-normal: 400;
--ai-font-medium: 500;
--ai-font-semibold: 600;
--ai-font-bold: 700;

/* Line Heights */
--ai-leading-tight: 1.25;
--ai-leading-normal: 1.5;
--ai-leading-relaxed: 1.625;
```

#### 1.4 Spacing System
```css
/* Spacing Scale (based on 4px grid) */
--ai-space-1: 0.25rem;   /* 4px */
--ai-space-2: 0.5rem;    /* 8px */
--ai-space-3: 0.75rem;   /* 12px */
--ai-space-4: 1rem;      /* 16px */
--ai-space-5: 1.25rem;   /* 20px */
--ai-space-6: 1.5rem;    /* 24px */
--ai-space-8: 2rem;      /* 32px */
--ai-space-10: 2.5rem;   /* 40px */
--ai-space-12: 3rem;     /* 48px */
--ai-space-16: 4rem;     /* 64px */
```

#### 1.5 Border Radius
```css
--ai-radius-sm: 0.125rem;   /* 2px */
--ai-radius: 0.25rem;       /* 4px */
--ai-radius-md: 0.375rem;   /* 6px */
--ai-radius-lg: 0.5rem;     /* 8px */
--ai-radius-xl: 0.75rem;    /* 12px */
--ai-radius-2xl: 1rem;      /* 16px */
--ai-radius-full: 9999px;   /* Full circle */
```

### 2. Layout Components

#### 2.1 Page Layout
```typescript
interface PageLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

// Usage: Main layout with navigation, content area, and optional sidebar
<PageLayout 
  header={<CampaignHeader />}
  sidebar={<NavigationSidebar />}
  breadcrumbs={[{label: 'Campaigns', href: '/campaigns'}, {label: 'Message Hub'}]}
  actions={<CreateMessageButton />}
>
  {children}
</PageLayout>
```

#### 2.2 Dashboard Grid
```typescript
interface DashboardGridProps {
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

// Usage: Responsive grid for dashboard widgets
<DashboardGrid columns={3} gap="md">
  <CampaignHealthWidget />
  <RecentMessagesWidget />
  <UpcomingEventsWidget />
</DashboardGrid>
```

#### 2.3 Split Panel
```typescript
interface SplitPanelProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  defaultSplit?: number; // 0-100 percentage
  minSize?: number;
  resizable?: boolean;
}

// Usage: Message editor with preview
<SplitPanel 
  leftPanel={<MessageEditor />}
  rightPanel={<MessagePreview />}
  defaultSplit={60}
  resizable={true}
/>
```

### 3. Navigation Components

#### 3.1 Navigation Sidebar
```typescript
interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType;
  badge?: string | number;
  children?: NavigationItem[];
}

interface NavigationSidebarProps {
  items: NavigationItem[];
  currentPath: string;
  collapsed?: boolean;
  onToggle?: () => void;
}

// Usage: Main navigation
<NavigationSidebar 
  items={navigationItems}
  currentPath="/campaigns/123/messages"
  collapsed={isSidebarCollapsed}
  onToggle={toggleSidebar}
/>
```

#### 3.2 Breadcrumbs
```typescript
interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
}

// Usage: Page navigation context
<Breadcrumbs 
  items={[
    {label: 'Campaigns', href: '/campaigns'},
    {label: 'Jane Doe for Congress', href: '/campaigns/123'},
    {label: 'Messages', current: true}
  ]}
/>
```

#### 3.3 Tab Navigation
```typescript
interface TabItem {
  id: string;
  label: string;
  icon?: React.ComponentType;
  badge?: string | number;
  disabled?: boolean;
}

interface TabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
}

// Usage: Section navigation
<TabNavigation 
  tabs={messageTabs}
  activeTab="drafts"
  onChange={setActiveTab}
  variant="underline"
/>
```

### 4. Data Display Components

#### 4.1 Data Table
```typescript
interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  pagination?: PaginationProps;
  selection?: {
    selectedRows: Set<string>;
    onSelectionChange: (selectedRows: Set<string>) => void;
  };
  actions?: TableAction<T>[];
}

// Usage: Message list table
<DataTable 
  data={messages}
  columns={messageColumns}
  loading={isLoading}
  pagination={paginationConfig}
  actions={messageActions}
/>
```

#### 4.2 Stats Card
```typescript
interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon?: React.ComponentType;
  color?: 'primary' | 'success' | 'warning' | 'error';
  loading?: boolean;
}

// Usage: Campaign metrics
<StatsCard 
  title="Messages Sent"
  value={1247}
  change={{value: 12, type: 'increase', period: 'vs last week'}}
  icon={MessageIcon}
  color="primary"
/>
```

#### 4.3 Chart Container
```typescript
interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  loading?: boolean;
  error?: string;
  height?: number;
}

// Usage: Analytics charts
<ChartContainer 
  title="Message Performance"
  subtitle="Engagement over time"
  actions={<ChartControls />}
  height={300}
>
  <LineChart data={performanceData} />
</ChartContainer>
```

### 5. Form Components

#### 5.1 Input Field
```typescript
interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  icon?: React.ComponentType;
  actions?: React.ReactNode;
}

// Usage: Form input
<InputField 
  label="Campaign Name"
  value={campaignName}
  onChange={setCampaignName}
  placeholder="Enter campaign name"
  required={true}
  error={validationErrors.name}
/>
```

#### 5.2 Select Field
```typescript
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  multiple?: boolean;
}

// Usage: Dropdown selection
<SelectField 
  label="State"
  value={selectedState}
  onChange={setSelectedState}
  options={stateOptions}
  placeholder="Select state"
  searchable={true}
/>
```

#### 5.3 Version Control Selector
```typescript
interface VersionControlSelectorProps {
  profiles: VersionProfile[];
  activeProfile: string;
  onChange: (profileId: string) => void;
  showCustom?: boolean;
  onCreateCustom?: () => void;
}

// Usage: Message version control
<VersionControlSelector 
  profiles={versionProfiles}
  activeProfile={currentProfile}
  onChange={setCurrentProfile}
  showCustom={true}
  onCreateCustom={openCustomProfileModal}
/>
```

### 6. AI-Enhanced Components

#### 6.1 AI Message Generator
```typescript
interface AIMessageGeneratorProps {
  campaignId: string;
  platform: 'email' | 'social' | 'press' | 'speech';
  onGenerated: (message: GeneratedMessage) => void;
  initialPrompt?: string;
  versionProfile?: string;
}

// Usage: AI-powered message creation
<AIMessageGenerator 
  campaignId={campaignId}
  platform="email"
  onGenerated={handleGeneratedMessage}
  versionProfile={selectedProfile}
/>
```

#### 6.2 Intelligence Panel
```typescript
interface IntelligencePanelProps {
  type: 'message' | 'campaign' | 'voter';
  entityId: string;
  insights: AIInsight[];
  loading?: boolean;
  onRefresh?: () => void;
}

// Usage: AI insights sidebar
<IntelligencePanel 
  type="message"
  entityId={messageId}
  insights={messageInsights}
  loading={isAnalyzing}
  onRefresh={refreshInsights}
/>
```

#### 6.3 Risk Assessment Badge
```typescript
interface RiskAssessmentProps {
  score: number; // 0-1
  factors?: string[];
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

// Usage: Message risk indicator
<RiskAssessment 
  score={0.15}
  factors={['Political sensitivity', 'Fact-check needed']}
  size="md"
  showDetails={true}
/>
```

### 7. Interactive Components

#### 7.1 Modal Dialog
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  actions?: React.ReactNode;
  preventClose?: boolean;
}

// Usage: Content modals
<Modal 
  isOpen={isModalOpen}
  onClose={closeModal}
  title="Create New Message"
  size="lg"
  actions={<ModalActions />}
>
  <MessageForm />
</Modal>
```

#### 7.2 Confirmation Dialog
```typescript
interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

// Usage: Destructive actions
<ConfirmationDialog 
  isOpen={showDeleteConfirm}
  onClose={() => setShowDeleteConfirm(false)}
  onConfirm={handleDelete}
  title="Delete Message"
  message="This action cannot be undone."
  variant="danger"
/>
```

#### 7.3 Toast Notifications
```typescript
interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  actions?: ToastAction[];
}

// Usage: System feedback
<Toast 
  type="success"
  title="Message Published"
  message="Your message has been successfully published to all channels."
  duration={5000}
/>
```

### 8. Campaign-Specific Components

#### 8.1 Campaign Health Score
```typescript
interface CampaignHealthScoreProps {
  score: number; // 0-100
  breakdown: HealthBreakdown;
  trend: 'up' | 'down' | 'stable';
  size?: 'sm' | 'md' | 'lg';
  showBreakdown?: boolean;
}

// Usage: Dashboard health indicator
<CampaignHealthScore 
  score={87}
  breakdown={healthBreakdown}
  trend="up"
  size="lg"
  showBreakdown={true}
/>
```

#### 8.2 Message Status Timeline
```typescript
interface MessageStatusTimelineProps {
  messageId: string;
  stages: TimelineStage[];
  currentStage: string;
  onStageClick?: (stageId: string) => void;
}

// Usage: Message approval workflow
<MessageStatusTimeline 
  messageId={messageId}
  stages={approvalStages}
  currentStage="review"
  onStageClick={navigateToStage}
/>
```

#### 8.3 Voter Segment Visualizer
```typescript
interface VoterSegmentVisualizerProps {
  segments: VoterSegment[];
  selectedSegments: string[];
  onSelectionChange: (segments: string[]) => void;
  visualization: 'pie' | 'bar' | 'map';
}

// Usage: Voter targeting interface
<VoterSegmentVisualizer 
  segments={voterSegments}
  selectedSegments={targetSegments}
  onSelectionChange={setTargetSegments}
  visualization="pie"
/>
```

### 9. Real-time Collaboration Components

#### 9.1 Presence Indicator
```typescript
interface PresenceIndicatorProps {
  users: OnlineUser[];
  maxVisible?: number;
  size?: 'sm' | 'md' | 'lg';
  showNames?: boolean;
}

// Usage: Show online team members
<PresenceIndicator 
  users={onlineUsers}
  maxVisible={5}
  size="md"
  showNames={true}
/>
```

#### 9.2 Collaborative Editor
```typescript
interface CollaborativeEditorProps {
  content: string;
  onChange: (content: string) => void;
  collaborators: Collaborator[];
  readOnly?: boolean;
  features?: EditorFeature[];
}

// Usage: Real-time message editing
<CollaborativeEditor 
  content={messageContent}
  onChange={setMessageContent}
  collaborators={activeCollaborators}
  features={['formatting', 'mentions', 'ai-assist']}
/>
```

#### 9.3 Activity Feed
```typescript
interface ActivityFeedProps {
  activities: Activity[];
  loading?: boolean;
  onLoadMore?: () => void;
  filter?: ActivityFilter;
  onFilterChange?: (filter: ActivityFilter) => void;
}

// Usage: Campaign activity stream
<ActivityFeed 
  activities={recentActivities}
  loading={isLoadingActivities}
  onLoadMore={loadMoreActivities}
  filter={activityFilter}
  onFilterChange={setActivityFilter}
/>
```

### 10. Mobile-Responsive Patterns

#### 10.1 Responsive Breakpoints
```css
/* Mobile First Approach */
@media (min-width: 640px)  { /* sm */ }
@media (min-width: 768px)  { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

#### 10.2 Mobile Navigation
```typescript
interface MobileNavigationProps {
  isOpen: boolean;
  onToggle: () => void;
  items: NavigationItem[];
  currentPath: string;
}

// Usage: Mobile slide-out menu
<MobileNavigation 
  isOpen={isMobileMenuOpen}
  onToggle={toggleMobileMenu}
  items={navigationItems}
  currentPath={currentPath}
/>
```

#### 10.3 Touch-Optimized Components
```typescript
interface TouchOptimizedButtonProps extends ButtonProps {
  touchTarget?: 'small' | 'medium' | 'large'; // 44px minimum
  hapticFeedback?: boolean;
}

// Usage: Mobile-friendly buttons
<TouchOptimizedButton 
  touchTarget="large"
  hapticFeedback={true}
  variant="primary"
>
  Send Message
</TouchOptimizedButton>
```

### 11. Animation & Transitions

#### 11.1 Standard Transitions
```css
/* Standard timing functions */
--ai-ease-out: cubic-bezier(0, 0, 0.2, 1);
--ai-ease-in: cubic-bezier(0.4, 0, 1, 1);
--ai-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

/* Duration scale */
--ai-duration-75: 75ms;
--ai-duration-100: 100ms;
--ai-duration-150: 150ms;
--ai-duration-200: 200ms;
--ai-duration-300: 300ms;
--ai-duration-500: 500ms;
```

#### 11.2 Component States
```typescript
interface AnimatedComponentProps {
  loading?: boolean;
  entering?: boolean;
  exiting?: boolean;
  disabled?: boolean;
}

// Usage: Smooth state transitions
<AnimatedCard 
  loading={isLoading}
  entering={isVisible}
  className="transition-all duration-200 ease-out"
>
  {content}
</AnimatedCard>
```

### 12. Accessibility Features

#### 12.1 Focus Management
```typescript
interface FocusableProps {
  autoFocus?: boolean;
  tabIndex?: number;
  'aria-label'?: string;
  'aria-describedby'?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

// Usage: Keyboard navigation
<FocusableCard 
  autoFocus={isFirstCard}
  aria-label="Campaign health summary"
  aria-describedby="health-description"
>
  {cardContent}
</FocusableCard>
```

#### 12.2 Screen Reader Support
```typescript
interface ScreenReaderProps {
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-atomic'?: boolean;
  'aria-relevant'?: string;
  'sr-only'?: boolean;
}

// Usage: Dynamic content announcements
<ScreenReaderAnnouncement 
  aria-live="polite"
  aria-atomic={true}
>
  {statusMessage}
</ScreenReaderAnnouncement>
```

### 13. Component Usage Guidelines

#### 13.1 Component Composition
- **Single Responsibility**: Each component should have one clear purpose
- **Composition over Inheritance**: Use composition patterns for flexibility
- **Prop Drilling**: Avoid deep prop drilling; use context for shared state
- **Performance**: Implement React.memo for expensive components

#### 13.2 Naming Conventions
- **Components**: PascalCase (e.g., `MessageEditor`)
- **Props**: camelCase (e.g., `isLoading`)
- **CSS Classes**: kebab-case with ai- prefix (e.g., `ai-button-primary`)
- **IDs**: kebab-case (e.g., `message-editor`)

#### 13.3 Testing Patterns
```typescript
// Component testing example
describe('MessageEditor', () => {
  it('should render with initial content', () => {
    render(
      <MessageEditor 
        content="Initial content"
        onChange={mockOnChange}
      />
    );
    expect(screen.getByDisplayValue('Initial content')).toBeInTheDocument();
  });
});
```

### 14. Implementation Notes

#### 14.1 Technology Stack
- **React 18+**: With concurrent features
- **TypeScript**: For type safety
- **Tailwind CSS**: For utility-first styling
- **Framer Motion**: For animations
- **Radix UI**: For accessible primitives
- **React Hook Form**: For form management

#### 14.2 Performance Considerations
- **Code Splitting**: Lazy load non-critical components
- **Bundle Size**: Monitor and optimize component bundles
- **Rendering**: Use React.memo and useMemo appropriately
- **Images**: Implement proper image optimization

#### 14.3 Maintenance
- **Documentation**: Keep component docs updated
- **Deprecation**: Provide migration paths for breaking changes
- **Versioning**: Follow semantic versioning for the design system
- **Testing**: Maintain comprehensive test coverage