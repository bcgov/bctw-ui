import { AppRoutes } from 'AppRouter';
import SideBar from 'components/sidebar/SideBar';

type IDefaultLayoutProps = {
  children: React.ReactNode;
};

/**
  shows sidebar on data management screens
**/
export default function ManageLayout({ children }: IDefaultLayoutProps): JSX.Element {
  return (
    <>
      <SideBar routes={AppRoutes} collapseAble={false} />
      <div className={'content-main'}>{children}</div>
    </>
  );
}
