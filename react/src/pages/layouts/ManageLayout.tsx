import { AppRoutes } from 'AppRouter';
import SideBar from 'components/sidebar/SideBar';

type IDefaultLayoutProps = {
  children: React.ReactNode;
};

/**
  show sidebar on data management screens
**/
export default function ManageLayout({ children }: IDefaultLayoutProps): JSX.Element {
  return (
    <>
      <SideBar routes={AppRoutes} sidebarContent={null} collapseAble={false} />
      {children}
    </>
  );
}
