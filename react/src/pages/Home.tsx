import { Box, Grid, Link, Theme, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import GovLinkBox from 'components/common/GovLinkBox';

const useStyles = makeStyles((theme: Theme) => ({
  callout: {
    padding: '25px',
    borderLeft: '10px solid #38598a',
    margin: '16px 0',
    backgroundColor: '#f2f2f2'
  }
}));

const Home = (): JSX.Element => {
  const styles = useStyles();
  const cards = {
    support: {
      title: 'Need Support?',
      data: [
        {
          textPrefix: 'For support, please contact ',
          link: 'bctw@gov.bc.ca',
          href: 'mailto:bctw@gov.bc.ca'
        }
      ]
    },
    resources: {
      title: 'Other Resources',
      data: [
        {
          textPrefix: 'Search for ',
          link: 'wildlife data and information',
          href: 'https://www.gov.bc.ca/wildlife-species-information'
        },
        {
          textPrefix: 'Use the ',
          textSuffix:
            ' to access publicly available telemetry data layers derived from the BC Telemetry Warehouse and Wildlife Species Inventory (SPI) database for desktop GIS analyses.',
          link: 'DataBC Data Catalogue',
          href: 'https://catalogue.data.gov.bc.ca/dataset?q=wsi&download_audience=Public&sort=score+desc%2C+record_publish_date+desc'
        }
      ]
    }
  };
  const { support, resources } = cards;
  return (
    <div className='container'>
      <Typography variant='h3' style={{ fontWeight: 'bold' }}>
        BC Telemetry Warehouse
      </Typography>
      <Typography paragraph className={styles.callout}>
        Welcome to the BC Telemetry Warehouse (BCTW). The BCTW is an application and database to manage and store the
        Province of British Columbia’s wildlife telemetry observations to support informed management decisions and
        improve conservation efforts.
      </Typography>
      <Grid container spacing={2} flexDirection='column'>
        <Grid item xl={2} lg={2} xs={12} md={12}>
          <GovLinkBox title={support.title} data={support.data} />
        </Grid>
        <Grid item xl={2} lg={2} xs={12} md={12}>
          <GovLinkBox title={resources.title} data={resources.data} />
        </Grid>
      </Grid>
    </div>
  );
};
export default Home;
