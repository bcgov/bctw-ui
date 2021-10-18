import Typography from '@mui/material/Typography';

const Home = (): JSX.Element => {
  return (
    <div className='container'>
      <Typography align='center' variant='h5' gutterBottom={true}>
        British Columbia Telemetry Warehouse
      </Typography>
      <Typography paragraph>
        Welcome to the BC Telemetry Warehouse (BCTW). The BCTW is an application and database to manage and store the Province of British Columbia’s wildlife telemetry observations to support informed management decisions and improving conservation efforts.
      </Typography>
      <Typography paragraph>
      Search for <a href='https://www.gov.bc.ca/wildlife-species-information' target='_blank'>wildlife data and information</a>
      </Typography>
      <Typography paragraph>
        Use the <a href='https://catalogue.data.gov.bc.ca/dataset?q=wsi&download_audience=Public&sort=score+desc%2C+record_publish_date+desc' target='_blank'>DataBC Data Catalogue</a> to access publicly available telemetry data layers derived from the BC Telemetry Warehouse and Wildlife Species Inventory (SPI) database for desktop GIS analyses.
      </Typography>
      <Typography paragraph>
        For support, please contact <a href='mailto:bctw@gov.bc.ca'>bctw@gov.bc.ca.</a>
      </Typography>
    </div>
  )
}
export default Home;
