import { Box, Stack, Theme, Typography } from '@mui/material';
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
        BC Telemetry Warehousesss
      </Typography>
      <Typography paragraph className={styles.callout} children={data ?? welcome} />

      <Stack direction='column' justifyContent='flex-start' alignItems='flex-end' spacing={2}>
        <Box sx={{ maxWidth: 400 }}>
          <GovLinkBox title={resources.title} data={resources.data} />
          <GovLinkBox title={support.title} data={support.data} />
        </Box>
      </Stack>
    </div>
  );
};
export default Home;
