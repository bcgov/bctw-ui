import { useContext, useEffect, useState } from 'react';
import { UserContext, useUserContextDispatch } from 'contexts/UserContext';
import { User } from 'types/user';
import { CircularProgress } from '@material-ui/core';
import { Typography } from '@material-ui/core';
import TextField from 'components/form/Input';
import { createStyles, makeStyles, Theme } from '@material-ui/core';
import Table from 'components/table/Table';
import { Animal } from 'types/animal';
import { ITableQueryProps } from 'components/table/table_interfaces';
import { MenuItem, FormControl, Select, InputLabel } from '@material-ui/core';

const useDataStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    },
    role: {
      marginBottom: '20px'
    },
    fields: {
      display: 'flex',
      flexDirection: 'column',
      '& > input': {
        padding: '5px 5px'
      }
    }
  })
);

export default function UserProfile(): JSX.Element {
  const classes = useDataStyles();
  const useUser = useContext(UserContext);

  // the actual user object from context
  const [user, setUser] = useState<User>(null);

  // select dropdown options
  const [testUserOptions, setTestUserOptions] = useState<string[]>([null, 'Biologist1', 'Biologist2', 'Admin', 'jrpopkin']);

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
    <div className={classes.container}>
      <Typography className={classes.role} variant='h6'>
        Your Role Type: <strong>{user.role_type}</strong>
      </Typography>
      <div className={classes.fields}>
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
      <Typography className={classes.role} variant='h6'>Swap User</Typography>
      <Typography className={classes.role} variant='body2'>Use the select menu below to pretend to be a user with a different IDIR</Typography>
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
