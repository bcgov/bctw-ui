import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react';

type Status = 'success' | 'error' | 'warning' | null;
interface TabsState {
  [key: number]: Status;
}

interface ITabContext {
  setTabsValidation: Dispatch<SetStateAction<TabsState>>;
  setTabStatus: (tab: number, status: Status) => void;
  tabsValidation: TabsState;
  setTab: Dispatch<SetStateAction<number>>;
  tab: number;
}
const TabValidationContext = createContext<TabsState>(null);
const TabValidationUpdateContext = createContext<Dispatch<SetStateAction<TabsState>> | null>(null);
const TabStatusUpdateContext = createContext<(tab: number, status: Status) => void>(null);
const TabContext = createContext<number>(null);
const TabUpdateContext = createContext<Dispatch<SetStateAction<number>>>(null);

export const useTabs = (): ITabContext => ({
  //Access to full control of the validation/status object
  setTabsValidation: useContext(TabValidationUpdateContext),
  //Setter for an individual tab status
  setTabStatus: useContext(TabStatusUpdateContext),
  //Status of the validation object
  tabsValidation: useContext(TabValidationContext),
  //Set tab index
  setTab: useContext(TabUpdateContext),
  //Current tab index
  tab: useContext(TabContext)
});

export const TabsProvider = (props: { children: ReactNode }): JSX.Element => {
  const [tabValidationState, setTabValidationState] = useState<TabsState | null>(null);
  const [tab, setTab] = useState(0);
  const setTabStatus = (tab: number, status: Status): void => {
    setTabValidationState((t) => ({ ...t, [tab]: status }));
  };
  return (
    <TabValidationContext.Provider value={tabValidationState}>
      <TabStatusUpdateContext.Provider value={setTabStatus}>
        <TabValidationUpdateContext.Provider value={setTabValidationState}>
          <TabContext.Provider value={tab}>
            <TabUpdateContext.Provider value={setTab}>{props.children}</TabUpdateContext.Provider>
          </TabContext.Provider>
        </TabValidationUpdateContext.Provider>
      </TabStatusUpdateContext.Provider>
    </TabValidationContext.Provider>
  );
};
