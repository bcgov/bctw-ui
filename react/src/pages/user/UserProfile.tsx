import { useContext, useEffect, useState } from 'react';
import { UserContext, useUserContextDispatch } from 'contexts/UserContext';
import { PermissionTableHeaders, User, userFormFields } from 'types/user';
import { CircularProgress } from '@material-ui/core';
import { Typography } from '@material-ui/core';
import DataTable from 'components/table/DataTable';
import TextField from 'components/form/TextInput';
import { Animal } from 'types/animal';
import { ITableQueryProps } from 'components/table/table_interfaces';
// import { MenuItem, Select, InputLabel } from '@material-ui/core';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useQueryClient } from 'react-query';
import ManageLayout from 'pages/layouts/ManageLayout';

export default function UserProfile(): JSX.Element {
  const useUser = useContext(UserContext);
  const bctwApi = useTelemetryApi();
  const queryClient = useQueryClient();

  // the actual user object from context
  const [user, setUser] = useState<User>(null);

  // select dropdown options
  // const [testUserOptions, setTestUserOptions] = useState<string[]>([null, 'Biologist1', 'Biologist2']);

  // sets UserContext when select changes
  // note: disabled test user
  // const [testUser, setTestUser] = useState<string>(testUserOptions[1]);
  const userDispatch = useUserContextDispatch();

  // const queryStr = 'useCritterAccess';
  // const [tblProps, setTblProps] = useState<ITableQueryProps<any>>({query: queryStr, queryParam: testUser})

  useEffect(() => {
    const update = (): void => {
      if (useUser.ready) {
        setUser(useUser.user);
        // update the test users list and set to current idir
        // const me = useUser.user.idir;
        // if (testUserOptions[0] === null) {
        //   setTestUserOptions((o) => [me, ...o.slice(1)]);
        // }
        // setTestUser(useUser.testUser ?? me);
      }
    };
    update();
  }, [useUser.ready]);

  const onChange = (v: Record<string, unknown>): void => {
    // console.log(v);
  };

  const onSelectTestUser = (e): void => {
    const v = e.target.value;
    // setTestUser(v);
    queryClient.invalidateQueries('critterAccess');
    // set the user context's testUser property
    const updatedUser = { ...useUser, ...{ testUser: v } };
    userDispatch(updatedUser);
  };

  if (!user) {
    return <CircularProgress />;
  }

  const tableProps: ITableQueryProps<Animal> = {
    query: bctwApi.useCritterAccess,
    param: { user }
  };

  return (
    <ManageLayout>
      <div className='user-profile'>
        <Typography variant='h5'>
          Your Role: <strong>{user.role_type}</strong>
        </Typography>
        <div className='user-input-grp'>
          {userFormFields.map((p) => {
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
          {/* <TextField propName='idir' defaultValue={user.idir} disabled={true} label='IDIR' changeHandler={onChange} />
          <TextField
            propName='email'
            type='email'
            defaultValue={user.email}
            disabled={true}
            label='EMAIL'
            changeHandler={onChange}
          /> */}
        </div>
        <DataTable
          headers={PermissionTableHeaders}
          title='Animals you have access to:'
          queryProps={tableProps}
        />
      </div>
    </ManageLayout>
  );
}
