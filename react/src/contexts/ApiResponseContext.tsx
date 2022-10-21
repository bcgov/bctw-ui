import { INotificationMessage } from 'components/component_interfaces';
import { useContext, createContext, useState, useEffect } from 'react';

export const ApiResponseContext = createContext<INotificationMessage>(null);
export const ApiResponseDispatch = createContext(null);

/**
 * fixme: change the name of this, since it's actually a context 
 * that any child can use to show a notification
*/

const ResponseProvider = (props: { children: React.ReactNode }): JSX.Element => {
  const { children } = props;
  const [state, dispatch] = useState<INotificationMessage>(null);

  const clearNotif = (): void => {
      dispatch(null);
      state?.callback?.();
  }
  const notifDisplayTime = 3000;
  // automatically clear the notification after timer elapsed
  // or if the message is blank
  useEffect(() => {
    const timeout = (): void => {
      if(!state){
        return;
      }
      if (state?.message) {
        setTimeout(clearNotif, notifDisplayTime);
        return;
      } else {
        clearNotif();
        return;
      }

    };
    timeout();
  }, [state]);

  return (
    <ApiResponseContext.Provider value={state as INotificationMessage}>
      <ApiResponseDispatch.Provider value={dispatch}>{children}</ApiResponseDispatch.Provider>
    </ApiResponseContext.Provider>
  );
};

/**
 * a component can "listen" to updates to the response context using this hook
 */
const useResponseState = (): INotificationMessage => {
  const context = useContext(ApiResponseContext);
  if (context === undefined) {
    throw new Error('useResponseState must be used within a responseProvider');
  }
  return context;
};

/**
 * dispatch a notification to the response context
 */
const useResponseDispatch = (): ((notif: INotificationMessage | null) => null) => {
  const context = useContext(ApiResponseDispatch);
  if (context === null) {
    throw new Error('useResponseDispatch must be used within a responseProvider');
  }
  return context;
};

export { ResponseProvider, useResponseState, useResponseDispatch };
