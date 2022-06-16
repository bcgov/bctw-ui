import MetabaseDashboard from 'components/common/MetabaseDashboard';
import { DashboardItem } from 'types/metabase';

export default function SummaryPage(): JSX.Element {
  const dashboards: DashboardItem[] = [
    { name: 'All Species', id: 3, icon: 'animals' },
    { name: 'Caribou', id: 7, icon: 'animals' },
    { name: 'Wolves', id: 9, icon: 'animals' },
    { name: 'Moose', id: 8, icon: 'animals' },
    { name: 'Bears', id: null, icon: 'animals' }
  ]
  return <MetabaseDashboard dashboardItems={dashboards}/>
}
