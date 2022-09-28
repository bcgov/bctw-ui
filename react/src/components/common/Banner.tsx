import { Alert, Collapse, IconButton, List, ListItem, Stack, Theme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { Icon } from 'components/common';
import { useState } from 'react';
const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    width: '100%',
    marginBottom: theme.spacing(2)
  },
  listItem: {
    display: 'list-item',
    padding: 2
  }
}));
interface BannerProps {
  variant: 'info' | 'warning' | 'success' | 'error';
  text: string | string[];
  icon?: JSX.Element;
  action?: 'close' | 'collapse';
}
export const Banner = ({ variant, icon, text, action }: BannerProps) => {
  const style = useStyles();
  const [open, setOpen] = useState(true);
  const [expand, setExpand] = useState(false);
  const getAction = (a: string) => {
    if (a === 'collapse' && !expand) return 'down';
    if (a === 'collapse' && expand) return 'up';
    return a;
  };
  return (
    <Collapse in={open}>
      <Alert
        severity={variant}
        icon={icon}
        className={style.root}
        action={
          action ? (
            <IconButton
              color='inherit'
              size='small'
              onClick={() => {
                action === 'close' ? setOpen(false) : setExpand((e) => !e);
              }}>
              <Icon icon={getAction(action)} />
            </IconButton>
          ) : null
        }>
        {Array.isArray(text) ? (
          <div>
            {text.map((t) => (
              <ListItem className={style.listItem}>{t}</ListItem>
            ))}
          </div>
        ) : (
          <div>{text}</div>
        )}
        <Collapse in={expand}>blah blah blah</Collapse>
      </Alert>
    </Collapse>
  );
};

export const InfoBanner = (text: keyof BannerProps) => {};
