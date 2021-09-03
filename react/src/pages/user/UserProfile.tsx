import { useContext, useEffect, useState } from 'react';
import { UserContext } from 'contexts/UserContext';
import { User, UserCritterAccess } from 'types/user';
import { Typography } from '@material-ui/core';
import DataTable from 'components/table/DataTable';
import { Animal } from 'types/animal';
import { ITableQueryProps } from 'components/table/table_interfaces';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import ManageLayout from 'pages/layouts/ManageLayout';

export default function UserProfile(): JSX.Element {
  const useUser = useContext(UserContext);
  const bctwApi = useTelemetryApi();

  const [user, setUser] = useState<User>(null);

  // set the user state when the context is updated
  useEffect(() => {
    const { user } = useUser;
    if (user) {
      setUser(user)
    }
  }, [useUser]);

  if (!user) {
    return <div>loading user information</div>;
  }

  const tableProps: ITableQueryProps<Animal> = {
    query: bctwApi.useCritterAccess,
    param: { user }
  };

  return (
    <ManageLayout>
      <div style={{margin: '20px'}}>
        <Typography variant='h5'>
          <p>
            Your Name: <strong>{user?.firstname ?? 'Local'}</strong>&nbsp;<strong>{user?.lastname ?? 'User'}</strong>
          </p>
          <p>
            Your Username: <strong>{user?.uid?? 'Local Username'}</strong>
          </p>
          <p>
            Your Email Address: <strong>{user?.email}</strong>
          </p>
          <p>
            Your Role: <strong>{user.role_type}</strong>
          </p>
        </Typography>
        {/* <div style={{margin: '25px 0'}}>
          {user.formFields.map((p) => {
            const { prop } = p;
            return (
              <TextField
                propName={p.prop}
                defaultValue={user[prop as string]}
                disabled={true}
                label={prop.toUpperCase()}
                changeHandler={(): void => {}}
              />
            );
          })}
        </div> */}
        <DataTable
          headers={UserCritterAccess.propsToDisplay}
          title='Animals you have access to:'
          queryProps={tableProps}
        />
      </div>
    </ManageLayout>
  );
}
