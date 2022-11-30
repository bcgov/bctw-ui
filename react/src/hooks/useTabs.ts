import { useState } from 'react';

interface IUseTabs {
  tab: { idx: number; label: string };
  tabList: string[];
  setTab: React.Dispatch<React.SetStateAction<number>>;
  // isTab: (tabVal: string | number) => boolean;
}
export default function useTabs(tabNames: string[]): IUseTabs {
  const [tab, setTab] = useState(0);
  // const isTab = (tabVal: typeof tabNames[number] | number): boolean => {
  //   if (typeof tabVal === 'number') {
  //     return tabVal === tab;
  //   } else {
  //     return tabVal === tabNames[tab];
  //   }
  // };
  return {
    tab: {
      idx: tab,
      label: tabNames[tab]
    },
    setTab,
    // isTab,
    tabList: tabNames
  };
}
