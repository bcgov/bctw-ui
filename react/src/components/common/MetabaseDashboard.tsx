import { Box, CircularProgress, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import IframeResizer from 'iframe-resizer-react';
import useMetabaseDashboard from 'hooks/useMetabaseDashboard';
import { useState } from 'react';
import { Icon } from 'components/common';
import { manageLayoutStyles } from 'pages/layouts/ManageLayout';
export type DashboardItem = {
  name: string;
  id: number | null;
  icon: string;
  component?: JSX.Element;
}
interface DashboardProps {
  dashboardItems: DashboardItem[];
  lineBreaks?: number[]; //Index's for dividers in sidebar
}
export default function MetabaseDashboard({ dashboardItems, lineBreaks }: DashboardProps): JSX.Element {
  const [dashboardKey, setDashboardKey] = useState<number>(dashboardItems[0].id);
  const [isLoading, setIsLoading] = useState(true);
  const { url } = useMetabaseDashboard(dashboardKey);
  const classes = manageLayoutStyles();

  return (
    <>
      <Box className={'sidebar'} id='manage_sidebar' py={2} px={2}>
        <List component='nav'>
          {dashboardItems.map((item, index) => (
            <div>
              <ListItem
                className='side-bar-item'
                button
                disabled={item.id === null}
                onClick={():void => setDashboardKey(item.id)}
                id={item.name}>
                <ListItemIcon>
                  <Icon icon={item.icon} />
                </ListItemIcon>
                <ListItemText className={'list-item-txt'} primary={item.name} />
              </ListItem>
              {lineBreaks && lineBreaks.includes(index) &&  <Divider />}
            </div>
          ))}
        </List>
      </Box>
      <Box py={3} px={4} className={classes.manageLayoutContent}>
        <IframeResizer  src={url} frameBorder={0} style={{ minWidth: '100%'}} onInit={():void => setIsLoading(false)}/>
        {isLoading && <CircularProgress/>}
      </Box>
    </>
  );
}
