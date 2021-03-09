import { AxiosError } from 'axios';
import { useState, useEffect, useContext } from 'react';
import { UserContext } from 'contexts/UserContext';

type IDefaultLayoutProps = {
  children: React.ReactNode;
};

/**
 * wrap this component around child components that require the user to exist
 */
export default function DefaultLayout({ children }: IDefaultLayoutProps): JSX.Element {
  const userChanges = useContext(UserContext);
  const [err, setErr] = useState<AxiosError>(null);

  useEffect(() => {
    const updateComponent = (): void => {
      const { error } = userChanges;
      if (error) {
        setErr(error);
      }
    };
    updateComponent();
  }, [userChanges]);

  if (err) {
    // unauthorized
    if (err.response?.status === 401) {
      return <div>{err?.response?.data}</div>;
    }
    return <div>ERROR {err?.response?.data}</div>;
  }
  return <>{children}</>;
}
