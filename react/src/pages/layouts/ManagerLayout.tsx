import { useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { UserContext } from 'contexts/UserContext';
import ManageLayout from 'pages/layouts/ManageLayout';

type IDefaultLayoutProps = {
  children: React.ReactNode;
};

/**
 * wrap this component around child components that requires the user to be considered an critter manager
 * of an animal or collar
 * ex. @file GrantCritterAccessPage.tsx
 */
export default function ManagerLayout({ children }: IDefaultLayoutProps): JSX.Element {
  const history = useHistory();
  const userChanges = useContext(UserContext);

  useEffect(() => {
    const updateComponent = (): void => {
      const { user } = userChanges;
      if (user && !user?.is_manager) {
        history.push('/home');
      }
    };
    updateComponent();
  }, [userChanges]);
  return (
    <ManageLayout>
      <div>{children}</div>
    </ManageLayout>
  )
}
