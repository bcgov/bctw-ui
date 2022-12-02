import { Badge, Box, Tab, Tabs, Typography, useTheme } from '@mui/material';
import { Icon } from 'components/common';
import { TabsProvider, useTabs } from 'contexts/TabsContext';
import React, { useEffect } from 'react';
import { useState } from 'react';
import { BR } from 'themes/appTheme';

// export const isTab = <T,>(tab: T, currentTab: T): boolean => tab === currentTab;

interface PageTabsProps {
  tabLabels: string[];
  //handleTab: (tabIdx: number) => void;
  //tab: number;
  children?: JSX.Element[] | JSX.Element;
  keepMounted?: boolean;
}
// Wrapper to add validation provider for page tabs
// Validation provider adds another level of state to children components
// Prevents having to add prop for validation to all potential children components
// Used to add indicator logic for tab icon state
export const PageTabs = (props: PageTabsProps): JSX.Element => (
  <TabsProvider>
    <PT {...props} />
  </TabsProvider>
);

/**
 * @param tabList Array of tab names
 * @param tab Current selected tab index
 * @param handleTab Sets the tab index
 * @param children Html elements to render
 */
const PT = ({ tabLabels, children, keepMounted }: PageTabsProps): JSX.Element => {
  const theme = useTheme();
  const { tabsValidation, setTabsValidation, tab, setTab } = useTabs();
  //const [tab, setTab] = useState(0);

  const firstTab = tab === 0;
  const tabIsSelected = (t: number): boolean => tab === t;
  const passTheseProps = { title: tabLabels[tab] };
  useEffect(() => {
    tabLabels.forEach((label, idx) =>
      setTabsValidation((validation) => ({
        ...validation,
        [idx]: null
      }))
    );
  }, [tabLabels]);
  return (
    //ml: -1 / mt: -1 is to prevent clipping issues with the boxShadow
    <Box width='100%' sx={{ ml: -1, mt: -1 }}>
      <Tabs
        value={tab}
        sx={{
          '& .MuiTabs-indicator': {
            display: 'none'
          }
        }}>
        {tabLabels.map((t, i) => {
          const tabStatus = tabsValidation && tabsValidation[i];
          return (
            <Tab
              key={`tab-${i}`}
              label={
                <Badge
                  variant='dot'
                  // color={tabStatus}
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: theme.palette[tabStatus]?.main
                    }
                  }}>
                  <Typography fontWeight='bold' pr={1}>
                    {t}
                  </Typography>
                  {/* <Icon icon='circle' size={0.8} htmlColor={getColor(validation)} /> */}
                </Badge>
              }
              onClick={() => setTab(i)}
              sx={{
                //Using inline styling to simplify issues with boxShadow not available in makeStyles.
                boxShadow: tabIsSelected(i) ? 1 : 0,
                backgroundColor: tabIsSelected(i) && theme.palette.background.paper,
                //BR is same value paper override uses for borderRadius in appTheme
                borderRadius: `8px 8px 0px 0px`,
                ml: 1,
                mt: 1
              }}
            />
          );
        })}
      </Tabs>
      <Box
        p={2}
        sx={{
          boxShadow: 1,
          ml: 1,
          width: '100%',
          backgroundColor: theme.palette.background.paper,
          borderRadius: firstTab ? `0px 8px 8px 8px` : `8px 8px 8px 8px`
        }}>
        {React.Children.map(children, (child, idx) =>
          React.cloneElement(child, { ...passTheseProps, show: children[tab] === child, tabIndex: idx })
        )}
        {/* {keepMounted ? childrenArray.map(childs, child => React) : React.cloneElement(children[tab], passTheseProps)} */}
      </Box>
    </Box>
  );
};
