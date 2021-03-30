import { useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { UserContext } from 'contexts/UserContext';
import { eUserRole } from 'types/user';
import ManageLayout from 'pages/layouts/ManageLayout';

type IDefaultLayoutProps = {
  children: React.ReactNode;
};

/**
 * wrap this component around child components that require administrative rights to access 
 */
export default function AuthLayout({ children }: IDefaultLayoutProps): JSX.Element {
  const history = useHistory();
  const userChanges = useContext(UserContext);

  useEffect(() => {
    const updateComponent = (): void => {
      const { ready, user } = userChanges;
      if (ready && user.role_type !== eUserRole.administrator) {
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
