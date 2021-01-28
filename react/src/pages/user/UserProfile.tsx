import { useContext, useEffect, useState } from 'react';
import { UserContext } from 'contexts/UserContext';
import { User } from 'types/user';
import { CircularProgress } from '@material-ui/core';
import { Typography } from '@material-ui/core';
import TextField from 'components/form/Input';
import { createStyles, makeStyles, Theme } from '@material-ui/core';
import Table from 'components/table/Table';
import { ITableQueryProps } from 'api/api_interfaces';
import { Animal } from 'types/animal';

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
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    const update = (): void => {
      if (useUser.ready) {
        setUser(useUser.user);
      }
    };
    update();
  }, [useUser.ready]);

  const onChange = (v: Record<string, unknown>) => {
    console.log(v);
  };

  if (!user) {
    return <CircularProgress />;
  }

  const tableProps: ITableQueryProps<Animal> = {
    query: 'useCritterAccess',
    queryParam: user.idir
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
      <Typography className={classes.role} variant='h6'>
        Animals you have access to:
      </Typography>
      <Table
        headers={['animal_id', 'nickname']}
        queryProps={tableProps}
        onSelect={() => {}}
        rowIdentifier='id'
      />
    </div>
  );
}
