import { UserContext } from 'contexts/UserContext';
import { useContext } from 'react';
import { User } from 'types/user';

const useUser = (): User => {
  const useUserContext = useContext(UserContext);
  const { user } = useUserContext;
  return user;
};

export default useUser;
