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

interface ITabContext {
  setTabsValidation: Dispatch<SetStateAction<TabsState>>;
  tabsValidation: TabsState;
}
const TabContext = createContext<TabsState>(null);
const TabUpdateContext = createContext<Dispatch<SetStateAction<TabsState>> | null>(null);

export const useTabsValidation = (): ITabContext => ({
  setTabsValidation: useContext(TabUpdateContext),
  tabsValidation: useContext(TabContext)
});

export const TabsValidationProvider = (props: { children: ReactNode }): JSX.Element => {
  const [tabState, setTabState] = useState<TabsState | null>(null);

  return (
    <TabContext.Provider value={tabState}>
      <TabUpdateContext.Provider value={setTabState}>{props.children}</TabUpdateContext.Provider>
    </TabContext.Provider>
  );
};
