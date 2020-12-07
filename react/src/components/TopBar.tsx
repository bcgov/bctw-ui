import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  appBar: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
  },
  title: {
    textAlign: 'center',
  },
  toolbar: theme.mixins.toolbar,
}));

type TopBarProps = {
  title: string;
}

const TopBar = ({title}: TopBarProps) => {
  const classes = useStyles();
  return (
    <AppBar position="fixed" className={classes.appBar}>
      <Toolbar className={classes.toolbar}>
        <Typography className={classes.title} noWrap>{title}</Typography>
      </Toolbar>
    </AppBar>
  )
}
export default TopBar;