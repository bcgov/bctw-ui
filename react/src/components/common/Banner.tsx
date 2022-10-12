import { Alert, Collapse, IconButton, List, ListItem, Stack, Theme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { Icon } from 'components/common';
import { BannerStrings } from 'constants/strings';
import { useState } from 'react';
const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    width: '100%',
    marginBottom: theme.spacing(2)
  },
  listItem: {
    display: 'list-item',
    padding: 2
  },
  info: {
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  spacing: {
    paddingTop: theme.spacing(2)
  }
}));
interface BannerProps {
  variant: 'info' | 'warning' | 'success' | 'error';
  text: string | string[];
  icon?: JSX.Element;
  action?: 'close' | 'collapse';
  hiddenContent?: JSX.Element[];
}

export const Banner = ({ variant, icon, text, action, hiddenContent }: BannerProps) => {
  const style = useStyles();
  const [open, setOpen] = useState(true);
  const [expand, setExpand] = useState(false);
  const getAction = (a: string) => {
    if (a === 'collapse' && !expand) return 'down';
    if (a === 'collapse' && expand) return 'up';
    return a;
  };
  return (
    <Collapse in={open} className={style.root}>
      <Alert
        severity={variant}
        icon={icon}
        className={style[variant]}
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
        <Collapse in={expand}>
          {hiddenContent?.length ? (
            <List dense>
              {hiddenContent.map((content) => (
                <div>{content}</div>
              ))}
            </List>
          ) : null}
        </Collapse>
      </Alert>
    </Collapse>
  );
};

type SuccessBannerProps = Pick<BannerProps, 'text' | 'hiddenContent'>;
export const SuccessBanner = (props: SuccessBannerProps) => <Banner variant='success' action='collapse' {...props} />;

type ErrorBannerProps = Pick<BannerProps, 'text' | 'hiddenContent'>;
export const ErrorBanner = (props: SuccessBannerProps) => <Banner variant='error' action='collapse' {...props} />;

type InfoBannerProps = Pick<BannerProps, 'text'>;
export const InfoBanner = (props: InfoBannerProps) => <Banner variant='info' {...props} />;

type NotificationBannerProps = Pick<BannerProps, 'hiddenContent'>;
export const NotificationBanner = (props: NotificationBannerProps) => {
  const numNotifs = props.hiddenContent.length;
  return numNotifs ? (
    <Banner
      variant='error'
      text={BannerStrings.getNotifications(numNotifs)}
      icon={<Icon icon={'bell'} />}
      action='collapse'
      {...props}
    />
  ) : (
    <Banner
      variant='info'
      text={BannerStrings.getNotifications(numNotifs)}
      icon={<Icon icon={'zzz'} />}
      action='close'
    />
  );
};
