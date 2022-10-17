import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { Icon } from 'components/common';
import { useState } from 'react';

interface IMenuItem {
  label: string;
  icon?: JSX.Element;
  handleClick?: () => void;
}
interface IActionsMenu {
  menuItems: IMenuItem[];
  id?: number;
}
export const ActionsMenu = ({ menuItems, id }: IActionsMenu): JSX.Element => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [open, setOpen] = useState(false);
  // const open = Boolean(anchorEl);
  const setAnchor = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };
  const handleClose = () => {
    setAnchorEl(null);
    setOpen(false);
  };
  return (
    <>
      <IconButton id={`action-button-${id}`} onClick={setAnchor}>
        <Icon icon={'dots'} />
      </IconButton>
      <Menu id={`action-menu-${id}`} anchorEl={anchorEl} open={open} onClose={handleClose}>
        {menuItems.map((item) => {
          const { label, icon, handleClick } = item;
          return (
            <MenuItem
              onClick={() => {
                if (handleClick) {
                  handleClick();
                }
                handleClose();
              }}>
              {icon && <ListItemIcon>{icon}</ListItemIcon>}
              <ListItemText>{label}</ListItemText>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};
