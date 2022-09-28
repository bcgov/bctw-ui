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
  variant: 'info' | 'warning' | 'success';
  text: string | string[];
  icon?: JSX.Element;
  closeBtn?: boolean;
}
export const Banner = ({ variant, icon, text, closeBtn }: BannerProps) => {
  const style = useStyles();
  const [open, setOpen] = useState(true);
  return (
    <Collapse in={open}>
      <Alert
        severity={variant}
        icon={icon}
        className={style.root}
        action={
          closeBtn ? (
            <IconButton
              color='inherit'
              size='small'
              onClick={() => {
                setOpen(false);
              }}>
              <Icon icon={'close'} />
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
      </Alert>
    </Collapse>
  );
};
