import React, {useContext, useState, createContext } from 'react';
import { CollarHistory } from 'types/collar_history';

const AttachmentChangedContext = createContext<CollarHistory | null>(null);
const AttachmentChangedDispatch = createContext(null);

/**
 * used to dispatch/listen for device attachment changes
 * @function AttachmentChangedProvider wraps the 'Manage' component tree
 * @function useAttachmentDispatch - used in @function PerformAssignmentAction
 * @function useAttachmentChanged - used in manage components
 */
const AttachmentChangedProvider = (props: { children: React.ReactNode }): JSX.Element => {
  const { children } = props;
  const [state, dispatch] = useState<CollarHistory | null>(null);

  return (
    <AttachmentChangedContext.Provider value={state}>
      <AttachmentChangedDispatch.Provider value={dispatch}>{children}
      </AttachmentChangedDispatch.Provider>
    </AttachmentChangedContext.Provider>
  )
}

// listen to device attachments/removals with this hook
const useAttachmentChanged = (): CollarHistory => {
  const context = useContext(AttachmentChangedContext);
  return context;
};

// dispatch an attachment change with this hook
const useAttachmentDispatch = (): ((record: CollarHistory) => null) => {
  const context = useContext(AttachmentChangedDispatch);
  return context;
};

export {AttachmentChangedProvider, useAttachmentChanged, useAttachmentDispatch };

