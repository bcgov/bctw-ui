import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { Icon } from 'components/common';
import { useRef, useState } from 'react';

interface IMenuItem {
  label: string;
  icon?: JSX.Element;
  handleClick?: () => void;
}
interface IActionsMenu {
  menuItems: IMenuItem[];
  id?: number;
  disabled?: boolean;
}
export const ActionsMenu = ({ menuItems, id, disabled }: IActionsMenu): JSX.Element => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const setAnchor = (event: React.MouseEvent<HTMLButtonElement>) => {
    //This line is important. Wont work without.
    setAnchorEl(event.currentTarget);
    event.stopPropagation();
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <IconButton id={`action-button-${id}`} onClick={setAnchor} disabled={disabled}>
        <Icon icon={'dots'} />
      </IconButton>
      <Menu id={`action-menu-${id}`} anchorEl={anchorEl} open={open} onClose={handleClose}>
        {menuItems.map((item, idx) => {
          const { label, icon, handleClick } = item;
          return (
            <MenuItem
              key={`menu-item-${idx}`}
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
