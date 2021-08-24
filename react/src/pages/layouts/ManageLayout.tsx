import { AppRoutes } from 'AppRouter';
import { makeStyles } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import SideBar from 'components/sidebar/SideBar';

const useStyles = makeStyles(() => ({
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
