import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react';
type Tab = boolean | null;

// interface TabsState {
//   animalDevice: Tab;
//   telemetry: Tab;
//   keyX: Tab;
// }

interface TabsState {
  [key: string]: Tab;
}

interface ImportTabContext {
  setTabsValidation: Dispatch<SetStateAction<TabsState>>;
  tabsValidation: TabsState;
}
const ImportTabContext = createContext<TabsState>(null);
const ImportTabUpdateContext = createContext<Dispatch<SetStateAction<TabsState>> | null>(null);

export const useImportTabsValidationState = (): ImportTabContext => ({
  setTabsValidation: useContext(ImportTabUpdateContext),
  tabsValidation: useContext(ImportTabContext)
});

export const ImportTabsValidationProvider = (props: { children: ReactNode }): JSX.Element => {
  const [tabState, setTabState] = useState<TabsState | null>(null);

  return (
    <ImportTabContext.Provider value={tabState}>
      <ImportTabUpdateContext.Provider value={setTabState}>{props.children}</ImportTabUpdateContext.Provider>
    </ImportTabContext.Provider>
  );
};
