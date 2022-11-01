import {
  Badge,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  lighten,
  Link,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
  useTheme
} from '@mui/material';
import { Icon } from 'components/common';
import FullScreenDialog from 'components/modal/DialogFullScreen';
import { CritterAlertPage } from 'pages/data/animals/CritterAlertPage';
import { useState } from 'react';
import { MortalityAlert } from 'types/alert';
import { ArrowButton } from './ArrowButton';
import { SubHeader } from './SubHeader';
interface NotificationsMenuProps {
  alerts?: MortalityAlert[];
}
export const NotificationsMenu = ({ alerts }: NotificationsMenuProps): JSX.Element => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showingAlerts, setShowingAlerts] = useState(false);
  const open = Boolean(anchorEl);
  const setAnchor = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const notifications: MortalityAlert[] = [new MortalityAlert(), new MortalityAlert()];
  const alertsCount = alerts?.length;
  return (
    <>
      <Box mr={2}>
        <IconButton onClick={setAnchor}>
          <Badge badgeContent={alertsCount} color={'error'} overlap={'circular'}>
            <Icon icon={'bell'} />
          </Badge>
        </IconButton>
      </Box>
      <Menu
        id={`notifications-menu}`}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        sx={{
          '&& .Mui-selected': {
            backgroundColor: lighten(theme.palette.error.light, 0.9)
          }
        }}>
        <ListItem>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <SubHeader text={'Alerts'} />
            <ArrowButton size={'large'} label={'See Alert History'} onClick={() => setShowingAlerts(true)}/>
          </Box>
        </ListItem>
        <Divider />
        {alerts?.map((notif, idx) => {
          return (
            //Change the selected prop to the appropriate value
            //Maybe highlight the alerts that appeared today
            <Box>
              <MenuItem sx={{ py: 3 }} key={`menu-item-${idx}`} divider={idx < notifications.length} selected>
                <ListItemIcon>
                  <Icon icon={'circle'} htmlColor={theme.palette.error.main} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography>
                      {`${notif.species} Mortality alert from Device ${notif.device_id} on Animal ${notif.wlh_id}`}
                    </Typography>
                  }
                  secondary={`${notif.valid_from}`}
                />
              </MenuItem>
            </Box>
          );
        })}
      </Menu>
      <FullScreenDialog open={showingAlerts} handleClose={() => setShowingAlerts(false)}>
        <Container maxWidth='xl'>
          {<CritterAlertPage alerts={alerts}/>}
        </Container>
      </FullScreenDialog>
    </>
  );
};
