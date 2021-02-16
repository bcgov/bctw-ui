import { useContext, useEffect, useState } from 'react';
import { UserContext, useUserContextDispatch } from 'contexts/UserContext';
import { User } from 'types/user';
import { CircularProgress } from '@material-ui/core';
import { Typography } from '@material-ui/core';
import TextField from 'components/form/Input';
import { Animal } from 'types/animal';
import { ITableQueryProps } from 'components/table/table_interfaces';
import { MenuItem, FormControl, Select, InputLabel } from '@material-ui/core';

export default function UserProfile(): JSX.Element {
  const useUser = useContext(UserContext);

  // the actual user object from context
  const [user, setUser] = useState<User>(null);

  // select dropdown options
  const [testUserOptions, setTestUserOptions] = useState<string[]>([null, 'Biologist1', 'Biologist2']);

  // sets UserContext when select changes
  const [testUser, setTestUser] = useState<string>(testUserOptions[1]);
  const userDispatch = useUserContextDispatch();

  // const queryStr = 'useCritterAccess';
  // const [tblProps, setTblProps] = useState<ITableQueryProps<any>>({query: queryStr, queryParam: testUser})

  useEffect(() => {
    const update = (): void => {
      if (useUser.ready) {
        setUser(useUser.user);
        // update the test users list and set to current idir
        const me = useUser.user.idir;
        if (testUserOptions[0] === null) {
          setTestUserOptions( o => [me, ...o.slice(1)])
        }
        setTestUser(useUser.testUser ?? me);
      }
    };
    update();
  }, [useUser.ready]);

  const onChange = (v: Record<string, unknown>) => {
    // console.log(v);
  };

  const onSelectTestUser = (e) => {
    const v = e.target.value;
    setTestUser(v);
    // set the user context's testUser property
    const updatedUser = { ...useUser, ...{testUser: v}};
    userDispatch(updatedUser);
    // setTblProps({query: queryStr, queryParam: v});
  }

  if (!user) {
    return <CircularProgress />;
  }

  const tableProps: ITableQueryProps<Animal> = {
    query: 'useCritterAccess',
    queryParam: testUser
  };

  return (
    <div>
      <Typography variant='h6'>
        Your Role Type: <strong>{user.role_type}</strong>
      </Typography>
      <div>
        <TextField
          propName='idir'
          defaultValue={user.idir}
          disabled={true}
          label='User IDIR'
          changeHandler={onChange}
        />
        <TextField
          propName='email'
          type='email'
          defaultValue={user.email}
          disabled={true}
          label='Email Address'
          changeHandler={onChange}
        />
      </div>
      {/* fixme: hide this for demo as it isn't refetching properly */}
      {/* <Table
        headers={['animal_id', 'wlh_id', 'nickname', 'device_id', 'collar_make', 'permission_type']}
        title='Animals you have access to:'
        isMultiSelect={true}
        // queryProps={tblProps}
        queryProps={tableProps}
        onSelect={() => {}}
        rowIdentifier='id'
      /> */}
      <Typography variant='h6'>Swap User</Typography>
      <Typography variant='body2'>Use the select menu below to pretend to be a user with a different IDIR</Typography>
      <FormControl>
        <InputLabel>Test User Account</InputLabel>
        <Select value={testUser} onChange={onSelectTestUser}>
          {
            testUserOptions.map((s, i) => {
              return <MenuItem key={i} value={s}>{s}</MenuItem>
            })
          }
        </Select>
      </FormControl>
    </div>
  );
}
