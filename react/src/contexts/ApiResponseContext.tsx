import { INotificationMessage } from 'components/component_interfaces';
import { useContext, createContext, useState} from 'react';

export const ApiResponseContext = createContext<INotificationMessage>(null);
export const ApiResponseDispatch = createContext(null);

type ResponseProviderProps = {children: React.ReactNode}

const ResponseProvider = ({children}: ResponseProviderProps): JSX.Element => {
  const [state, dispatch] = useState<INotificationMessage>(null);
  return (
    <ApiResponseContext.Provider value={(state as INotificationMessage)}>
      <ApiResponseDispatch.Provider value={dispatch}>
        {children}
      </ApiResponseDispatch.Provider>
    </ApiResponseContext.Provider>
  )
}

const useResponseState = (): INotificationMessage => {
  const context = useContext(ApiResponseContext);
  if (context === undefined) {
    throw new Error('useResponseState must be used within a responseProvider')
  }
  return context;
}

const useResponseDispatch = () => {
  const context = useContext(ApiResponseDispatch);
  if (context === undefined) {
    throw new Error('useResponseDispatch must be used within a responseProvider')
  }
  return context;
}

export { ResponseProvider, useResponseState, useResponseDispatch}