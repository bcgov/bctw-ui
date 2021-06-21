import React, {useContext, useState, createContext } from 'react';

const RowSelectedContext = createContext<string>(null);
const RowSelectedDispatch = createContext(null);

/**
 * on views with multiple tables that dont have multiselect enabled, only want one one row 
 * selected on the whole page. (ex. main critter/collar pages)
 * 
 * The table dispatches the unique row ID when selected, which is sets the context state.
 * The table is also listening to context changes, and checks if the row ID is one if its own. 
 * If the row ID selected is not one of its own, it unselects the row. The component with 
 * multiple tables must wrap the RowSelectedProvider
 */
const RowSelectedProvider = (props: { children: React.ReactNode }): JSX.Element => {
  const { children } = props;
  const [state, dispatch] = useState<string>(null);

  return (
    <RowSelectedContext.Provider value={state}>
      <RowSelectedDispatch.Provider value={dispatch}>{children}
      </RowSelectedDispatch.Provider>
    </RowSelectedContext.Provider>
  )
}

// listen to row changes with this hook
const useTableRowSelectedState = (): string => {
  const context = useContext(RowSelectedContext);
  return context;
};

// dispatch a row change with this hook
const useTableRowSelectedDispatch = (): ((rowID: string) => null) => {
  const context = useContext(RowSelectedDispatch);
  return context;
};

export {RowSelectedProvider, useTableRowSelectedState, useTableRowSelectedDispatch };

