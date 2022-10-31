import DataTable from 'components/table/DataTable';
import { ITableQueryProps } from 'components/table/table_interfaces';
import { UserContext } from 'contexts/UserContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useContext, useEffect, useState } from 'react';
import { UserCritterAccess } from 'types/animal_access';
import { User } from 'types/user';

export const UserAnimalAccess = () => {
  const useUser = useContext(UserContext);
  const api = useTelemetryApi();
  const [user, setUser] = useState<User>({} as User);
  const tableProps: ITableQueryProps<UserCritterAccess> = {
    query: api.useCritterAccess,
    param: { user }
  };
  useEffect(() => {
    const { user } = useUser;
    if (user) {
      setUser(user);
    }
  }, [useUser]);

  if (!user) {
    return <div>Loading user information...</div>;
  }
  return (
    <DataTable headers={UserCritterAccess.propsToDisplay} title='Animals you have access to:' queryProps={tableProps} />
  );
};
