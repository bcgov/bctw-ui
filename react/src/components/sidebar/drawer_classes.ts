import makeStyles from '@mui/styles/makeStyles';

const drawerWidth = '24rem'; // 448px
const useStyles = makeStyles((theme) => ({
  drawer: {
    position: 'relative',
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    borderRight: '1px solid #999999'
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    }),
    '& .drawer-toggle-button': {
      marginRight: '-0.5rem'
    }
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    width: '3.5rem',
    padding: '0 important',
    '& .drawer-toggle-button': {
      marginRight: '-1.25rem'
    },
    '& .side-panel-content': {
      overflow: 'hidden'
    }
  }
}));

export default useStyles;
