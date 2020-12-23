import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  wrapper: {
    padding: '20px 15px',
    // background: 'linear-gradient(to bottom, #ffc5c5, #ff4949)'
  },
},
);

type IDefaultLayoutProps = {
  children: React.ReactNode;
}

export default function DefaultLayout({ children }: IDefaultLayoutProps) {
  const classes = useStyles();
  return (
    <div className={classes.wrapper}>
      {children}
    </div>
  )
}