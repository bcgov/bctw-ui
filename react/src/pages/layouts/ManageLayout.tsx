import { AppRoutes } from 'AppRouter';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import { makeStyles, ThemeProvider } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import SideBar from 'components/sidebar/SideBar';

const useStyles = makeStyles((theme: Theme) => ({
  manageLayoutSidebar: {
    flexBasis: '10rem'
  },
  manageLayoutContent: {
    flex: '1 1 auto',
    background: '#f7f8fa',
    '& h1': {
      marginTop: 0,
      marginBottom: 0,
    }
  }
}));

type IDefaultLayoutProps = {
  children: React.ReactNode;
};

/**
  shows sidebar on data management screens
**/
export default function ManageLayout({ children }: IDefaultLayoutProps): JSX.Element {
  const classes = useStyles();

  return (
    <>
      <SideBar routes={AppRoutes} collapseAble={false} />
      <Box py={3} px={4} className={classes.manageLayoutContent}>
        {children}
      </Box>
    </>
  );
}
