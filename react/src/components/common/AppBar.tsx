import { AppBar as MuiAppBar, Toolbar, Typography, makeStyles } from '@material-ui/core';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  appBar: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    marginBottom: '30px'
  },
  title: {
    textAlign: 'center',
  },
  toolbar: theme.mixins.toolbar,
}));

type AppBarProps = {
  title: string;
}

export default function AppBar ({title}: AppBarProps) {
  const classes = useStyles();
  return (
    <MuiAppBar position="fixed" className={classes.appBar}>
      <Toolbar className={classes.toolbar}>
        <Typography className={classes.title} noWrap>{title}</Typography>
      </Toolbar>
    </MuiAppBar>
  )
}