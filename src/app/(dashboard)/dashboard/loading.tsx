import { MysticalPageLoader } from '@/components/ui/MysticalLoading'

export default function DashboardLoading() {
  return <MysticalPageLoader isLoading={true} text="Loading dashboard..." />
}