import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { Icon } from 'components/common';
import React, { useState } from 'react';

interface IMenuItem {
  label: string;
  icon?: JSX.Element;
  handleClick?: () => void;
  disableMenuItem?: boolean;
}
interface IActionsMenu {
  menuItems: IMenuItem[];
  disabled?: boolean;
  onOpen?: () => void;
}
/**
 * @param menuItems IMenuItem[]
 * @param disabled disables the menu from being opened
 * * Note: event.stopPropagation() needs to be added. Prevents multiple events from firing at the same time.
 * * i.e: row selected + menu opened events, only allow one at a time.
 *
 */
export const ActionsMenu = ({ menuItems, disabled, onOpen }: IActionsMenu): JSX.Element => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const setAnchor = (event: React.MouseEvent<HTMLButtonElement>) => {
    //This line is important. Wont work without.
    onOpen?.();
    setAnchorEl(event.currentTarget);
    //onOpen?.();
    event.stopPropagation();
  };
  const handleClose = (event: React.MouseEvent<HTMLLIElement>) => {
    setAnchorEl(null);
    event.stopPropagation();
  };
  return (
    <>
      <IconButton onClick={setAnchor} disabled={disabled}>
        <Icon icon={'dots'} />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {menuItems.map((item, idx) => {
          const { label, icon, handleClick, disableMenuItem } = item;
          return (
            <MenuItem
              key={`menu-item-${idx}`}
              disabled={disableMenuItem}
              onClick={(event) => {
                if (handleClick) {
                  handleClick();
                }
                handleClose(event);
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
