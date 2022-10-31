import {
  Badge,
  Box,
  Button,
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
import { useState } from 'react';
import { eAlertType, MalfunctionAlert, MortalityAlert, TelemetryAlert } from 'types/alert';
import { ArrowButton } from './ArrowButton';
import { FormatAlert } from './FormatAlert';
import { SubHeader } from './SubHeader';
interface NotificationsMenuProps {
  alerts?: TelemetryAlert[];
}
export const NotificationsMenu = ({ alerts }: NotificationsMenuProps): JSX.Element => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const setAnchor = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  // const notifications: MortalityAlert[] = [new MortalityAlert(), new MortalityAlert()];
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
            <ArrowButton size={'large'} label={'See Alert History'} />
          </Box>
        </ListItem>
        <Divider />
        {alerts?.map((notif, idx) => (
          //Change the selected prop to the appropriate value
          //Maybe highlight the alerts that appeared today
          <Box key={`menu-item-${idx}`}>
            <MenuItem sx={{ py: 3 }} divider={idx < alerts?.length} selected>
              <FormatAlert format='menu' alert={notif} />
            </MenuItem>
          </Box>
        ))}
      </Menu>
    </>
  );
};
