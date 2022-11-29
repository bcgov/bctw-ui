import { Box } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { Banner } from 'components/alerts/Banner';
import { PageTabs } from 'components/common/partials/PageTabs';
import { SubHeader } from 'components/common/partials/SubHeader';
import { ImportStrings as constants } from 'constants/strings';
import useTabs from 'hooks/useTabs';
import AuthLayout from 'pages/layouts/AuthLayout';
import { eUserRole } from 'types/user';
import { KeyXUploader } from './KeyXUploader';

const useStyles = makeStyles((theme) => ({
  spacing: {
    marginTop: theme.spacing(2)
  },
  spacingTopBottom: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  paper: {
    marginTop: theme.spacing(2),
    padding: '16px',
    backgroundColor: 'text.secondary',
    display: 'flex',
    justifyContent: 'center'
  }
}));

export const ImportContainer = (): JSX.Element => {
  const styles = useStyles();
  const TabComponents = [
    {
      label: 'Animal and Device',
      component: <h1>Animal and Device</h1>
    },
    {
      label: 'Telemetry',
      component: <h1>Animal and Device</h1>
    },
    {
      label: 'Vectronic KeyX',
      component: <KeyXUploader />
    }
  ];
  const { tab, setTab, tabList } = useTabs(TabComponents.map((t) => t.label));
  return (
    <AuthLayout required_user_role={eUserRole.data_administrator}>
      <div className='container'>
        <h1>Data Import</h1>
        <Box mt={2}>
          <PageTabs tab={tab.idx} tabList={tabList} handleTab={setTab}>
            <Box className={styles.spacing} p={2}>
              <Box display='flex'>
                <SubHeader text={tab.label} />
                {/* {!isTab('Vectronic KeyX') && (
                  <Button
                  href={createUrl({ api: 'get-template', query: 'file_key=import_template' })}
                  style={{ marginLeft: 'auto' }}
                  variant='outlined'>
                  {constants.downloadButton}
                  </Button>
                )} */}
              </Box>
              <Box className={styles.spacing}>
                <Banner variant='info' text={constants[tab.label]} />
              </Box>
              {TabComponents[tab.idx].component}
            </Box>
          </PageTabs>
        </Box>
      </div>
    </AuthLayout>
  );
};
