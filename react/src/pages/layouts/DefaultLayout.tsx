import React from 'react';
import useStyles from 'pages/layouts/layout_styles';
import { SnackbarWrapper } from 'components/common';

type IDefaultLayoutProps = {
  children: React.ReactNode;
};

export default function DefaultLayout({ children }: IDefaultLayoutProps): JSX.Element {
  const classes = useStyles();
  return (
    <SnackbarWrapper>
      <div className={classes.wrapper}>{children}</div>
    </SnackbarWrapper>
  );
}
