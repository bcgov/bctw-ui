import {Grid, Theme, Typography} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import GovLinkBox from 'components/common/GovLinkBox';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { HomePageStrings } from 'constants/strings';

const useStyles = makeStyles((theme: Theme) => ({
  callout: {
    padding: '25px',
    borderLeft: `10px solid ${theme.palette.primary.main}`,
    margin: '16px 0',
    backgroundColor: '#f2f2f2'
  }
}));

const Home = (): JSX.Element => {
  const styles = useStyles();
  const api = useTelemetryApi();
  const { data } = api.useCodeDesc('HOME_HDR');
  const { welcome, support, resources } = HomePageStrings;
  return (
    <div className='container'>
      <Typography variant='h2' style={{ fontWeight: 'bold' }}>
        BC Telemetry Warehouse
      </Typography>
      {/* TODO: Add 'HOME_HDR' to code table */}
      <Typography paragraph className={styles.callout} children={data ?? welcome} />
      <Grid container spacing={2} flexDirection='column' wrap='nowrap' alignItems='flex-end'>
        <Grid item xl={2} lg={3} xs={12} md={4}>
          <GovLinkBox title={resources.title} data={resources.data} />
        </Grid>
        <Grid item xl={2} lg={3} xs={12} md={4}>
          <GovLinkBox title={support.title} data={support.data} />
        </Grid>
      </Grid>
    </div>
  );
};
export default Home;
