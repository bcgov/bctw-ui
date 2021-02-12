import { useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import useStyles from 'pages/layouts/layout_styles';
import { UserContext } from 'contexts/UserContext';
import { eUserRole } from 'types/user';

type IDefaultLayoutProps = {
  children: React.ReactNode;
};

/**
 * wrap this component around child components that require administrative rights to access 
 */
export default function AuthLayout({ children }: IDefaultLayoutProps): JSX.Element {
  const classes = useStyles();
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
    <div>
      <div className={classes.wrapper}>{children}</div>
    </div>
  )
}
