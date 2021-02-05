import React from 'react';
import useStyles from 'pages/layouts/layout_styles';

type IDefaultLayoutProps = {
  children: React.ReactNode;
}

export default function DefaultLayout({ children }: IDefaultLayoutProps): JSX.Element {
  const classes = useStyles();
  return (
    <div className={classes.wrapper}>
      {children}
    </div>
  )
}