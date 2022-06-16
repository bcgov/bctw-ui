import { Box, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import IframeResizer from 'iframe-resizer-react';
import useMetabaseDashboard from 'hooks/useMetabaseDashboard';
import { useEffect, useRef, useState } from 'react';
import { DashboardItem } from 'types/metabase';
import { Icon } from 'components/common';
import { manageLayoutStyles } from 'pages/layouts/ManageLayout';
interface DashboardProps {
  dashboardItems: DashboardItem[];
}
export default function MetabaseDashboard({ dashboardItems }: DashboardProps): JSX.Element {
  const [dashboardKey, setDashboardKey] = useState<number>(dashboardItems[0].id);
  const { url } = useMetabaseDashboard(dashboardKey);
  const classes = manageLayoutStyles();
  /* This retriggers a refresh when the window is resized. Prevents issue with page doubling in size. */
  //window.onresize = function(){ location.reload(); }
  return (
    <>
      <Box className={'sidebar'} id='manage_sidebar' py={2} px={2}>
        <List component='nav'>
          {dashboardItems.map((item) => (
            <ListItem
              className='side-bar-item'
              button
              disabled={item.id === null}
              onClick={() => setDashboardKey(item.id)}
              id={item.name}>
              <ListItemIcon>
                <Icon icon={item.icon} />
              </ListItemIcon>
              <ListItemText className={'list-item-txt'} primary={item.name} />
            </ListItem>
          ))}
        </List>
      </Box>
      <Box py={3} px={4} className={classes.manageLayoutContent}>
        {/* <iframe src={url} scrolling='no' id='iframe' allow='fullscreen' frameBorder={0} style={{minWidth: '100%', minHeight:'100%'}}></iframe> */}
        <IframeResizer
          src={url}
          allowTransparency={true}
          frameBorder={0}
          style={{ minWidth: '100%'}}
        />
      </Box>
    </>
  );
}
