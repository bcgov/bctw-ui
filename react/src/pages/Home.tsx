import Typography from '@material-ui/core/Typography';

const Home = (): JSX.Element => {
  return (
    <div className='container'>
      <Typography align='center' variant='h5' gutterBottom={true}>
        British Columbia Telemetry Warehouse
      </Typography>
      <Typography paragraph>
        Welcome to the public face of the BC Telemetry Warehouse. This page can be seen by the public.
        Generic data products will be shown on this page.
      </Typography>
    </div>
  )
}
export default Home;
