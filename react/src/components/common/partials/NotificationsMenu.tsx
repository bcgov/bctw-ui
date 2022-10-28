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
import { MortalityAlert } from 'types/alert';
import { SubHeader } from './SubHeader';
export const NotificationsMenu = (): JSX.Element => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const setAnchor = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const notifications: MortalityAlert[] = [new MortalityAlert(), new MortalityAlert()];
  return (
    <>
      <Box mr={2}>
        <IconButton onClick={setAnchor}>
          <Badge badgeContent={1} color={'error'} overlap={'circular'}>
            <Icon icon={'bell'} size={1.5} />
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
            backgroundColor: lighten(theme.palette.error.main, 0.8)
          }
        }}>
        <MenuItem divider autoFocus>
          <ListItem>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <SubHeader text={'Alerts'} />
              <Link variant={'h6'} underline='none' sx={{ display: 'flex', alignItems: 'center' }}>
                See Alert History
                <Icon icon={'next'} size={0.9} />
              </Link>
            </Box>
          </ListItem>
        </MenuItem>
        {notifications.map((notif, idx) => {
          return (
            <MenuItem key={`menu-item-${idx}`} divider={idx < notifications.length} selected>
              <ListItem>
                <ListItemIcon>
                  <Icon icon={'circle'} htmlColor={theme.palette.error.main} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography>
                      {notif.species} mortality alert from Device {notif.device_id} on Animal {notif.wlh_id}.
                    </Typography>
                  }
                  secondary={<>Date {notif.valid_from}</>}
                />
              </ListItem>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};
