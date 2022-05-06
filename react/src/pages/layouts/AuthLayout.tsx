import { useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { UserContext } from 'contexts/UserContext';
import { eUserRole } from 'types/user';
import ManageLayout from 'pages/layouts/ManageLayout';

type IDefaultLayoutProps = {
  children: React.ReactNode;
  required_user_role?: eUserRole
};

/**
 * wrap this component around child components that require administrative rights to access 
 * defaults the required role type to @type {administrator}
 */
export default function AuthLayout({ children, required_user_role = eUserRole.administrator }: IDefaultLayoutProps): JSX.Element {
  const history = useHistory();
  const userChanges = useContext(UserContext);
  const {data_administrator, administrator} = eUserRole;
  
  useEffect(() => {
    const updateComponent = (): void => {
      const { user } = userChanges;
      if (!user) {
        return;
      }
      const { role_type } = user;
      const isAdmins = (role_type === administrator || role_type === data_administrator)
      if (required_user_role === administrator && role_type !== administrator) {
        history.push('/home');
      } 
      // admins can always access content,
      // even if the required_user_role is not specifically admin
      else if (![required_user_role, administrator].includes(role_type)) {
        history.push('/home');
      }
      //Data admins have access to all admin pages except user management related pages
      else if (required_user_role === data_administrator && !isAdmins) {
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
