import { Badge, Box, IconButton, ListItem, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { Icon } from 'components/common';
import { animalMenuMortNotif } from 'constants/formatted_string_components';
import { useState } from 'react';
import { AnimalNotification, MortalityAlert } from 'types/alert';
import { SubHeader } from './SubHeader';
export const NotificationsMenu = (): JSX.Element => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const setAnchor = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const notifications: MortalityAlert[] = [new MortalityAlert()];
  return (
    <>
      <Box mr={2}>
        <IconButton onClick={setAnchor}>
          <Badge badgeContent={1} color={'error'} overlap={'circular'}>
            <Icon icon={'bell'} size={1.5} />
          </Badge>
        </IconButton>
      </Box>
      <Menu id={`notifications-menu}`} anchorEl={anchorEl} open={open} onClose={handleClose}>
        <SubHeader text={'Alerts'} />
        {notifications.map((notif, idx) => {
          return (
            <MenuItem
              key={`menu-item-${idx}`}
              // onClick={() => {
              //   if (handleClick) {
              //     handleClick();
              //   }
              //   handleClose();
              // }}
            >
              {animalMenuMortNotif(notif)}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};
