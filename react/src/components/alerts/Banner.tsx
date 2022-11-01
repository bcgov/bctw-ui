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
  text: string | string[] | JSX.Element;
  icon?: JSX.Element;
  action?: 'close' | 'collapse' | 'both';
  hiddenContent?: JSX.Element[];
}

export const Banner = ({ variant, icon, text, action, hiddenContent }: BannerProps) => {
  const style = useStyles();
  const [open, setOpen] = useState(true);
  const [expand, setExpand] = useState(false);
  const getAction = (a: string) => {
    if (a === 'both' && expand) return 'close';
    else a = 'collapse';
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
          action && hiddenContent ? (
            <IconButton
              color='inherit'
              size='small'
              onClick={() => {
                getAction(action) === 'close' ? setOpen(false) : setExpand((e) => !e);
              }}>
              <Icon icon={getAction(action)} />
            </IconButton>
          ) : null
        }>
        {Array.isArray(text) ? (
          <div>
            {text.map((t, i) => (
              <ListItem key={`list-item-${i}`} className={style.listItem}>
                {t}
              </ListItem>
            ))}
          </div>
        ) : (
          <div>{text}</div>
        )}
        <Collapse in={expand}>
          {hiddenContent?.length ? (
            <List dense>
              <div>
                {hiddenContent.map((content, idx) => (
                  <div key={`hidden-content-${idx}`}>{content}</div>
                ))}
              </div>
            </List>
          ) : null}
        </Collapse>
      </Alert>
    </Collapse>
  );
};

/**
 * Used for bulk request handling. Usually bottom page
 */
type SuccessBannerProps = Pick<BannerProps, 'text' | 'hiddenContent'>;
export const SuccessBanner = (props: SuccessBannerProps) => <Banner variant='success' action='both' {...props} />;

/**
 * Used for bulk error handling. Usually bottom page
 */
type ErrorBannerProps = Pick<BannerProps, 'text' | 'hiddenContent'>;
export const ErrorBanner = (props: ErrorBannerProps) => <Banner variant='error' action='both' {...props} />;

/**
 * Used at top of page for help / info
 */
type InfoBannerProps = Pick<BannerProps, 'text'>;
export const InfoBanner = (props: InfoBannerProps) => <Banner variant='info' {...props} />;

/**
 * Used at top of page to display notifications or alerts.
 * Displays blue when no notifications provided.
 */
type NotificationBannerProps = Pick<BannerProps, 'hiddenContent'>;
export const NotificationBanner = (props: NotificationBannerProps) => {
  const numNotifs = props?.hiddenContent?.length;
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
