import { UserContext } from 'contexts/UserContext';
import React, { useContext, useState } from 'react';
import { User } from 'types/user';
import useDidMountEffect from './useDidMountEffect';

const useUser = (): User => {
  const useUserContext = useContext(UserContext);

  const [user, setUser] = useState<User>();

  // when the UserContext is loaded, set the session info state
  useDidMountEffect(() => {
    const { user } = useUserContext;
    if (user) {
      setUser(user);
    }
  }, [useUserContext]);

  return user;
};

export default useUser;
