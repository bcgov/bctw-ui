import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react';
//type Tab = 'success' | 'error' | 'warning' | null;

// interface TabsState {
//   animalDevice: Tab;
//   telemetry: Tab;
//   keyX: Tab;
// }

interface TabsState {
  [key: number]: 'success' | 'error' | 'warning' | null;
}

interface ITabContext {
  setTabsValidation: Dispatch<SetStateAction<TabsState>>;
  tabsValidation: TabsState;
  setTab: Dispatch<SetStateAction<number>>;
  tab: number;
}
const TabValidationContext = createContext<TabsState>(null);
const TabValidationUpdateContext = createContext<Dispatch<SetStateAction<TabsState>> | null>(null);
const TabContext = createContext<number>(null);
const TabUpdateContext = createContext<Dispatch<SetStateAction<number>>>(null);

export const useTabs = (): ITabContext => ({
  setTabsValidation: useContext(TabValidationUpdateContext),
  tabsValidation: useContext(TabValidationContext),
  setTab: useContext(TabUpdateContext),
  tab: useContext(TabContext)
});

export const TabsProvider = (props: { children: ReactNode }): JSX.Element => {
  const [tabValidationState, setTabValidationState] = useState<TabsState | null>(null);
  const [tab, setTab] = useState(0);
  return (
    <TabValidationContext.Provider value={tabValidationState}>
      <TabValidationUpdateContext.Provider value={setTabValidationState}>
        <TabContext.Provider value={tab}>
          <TabUpdateContext.Provider value={setTab}>{props.children}</TabUpdateContext.Provider>
        </TabContext.Provider>
      </TabValidationUpdateContext.Provider>
    </TabValidationContext.Provider>
  );
};
