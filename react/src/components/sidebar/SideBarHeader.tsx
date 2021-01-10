import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

import headerImage from 'images/bcgov-header-vert-MD.png';

const headerStyles = makeStyles(() => ({
  header: {
    background: '#036',
    textAlign: 'left',
    color: 'white',
    backgroundImage: `url(${headerImage})`,
    backgroundRepeat: 'no-repeat',
    height: '4.1rem'
  },
  headerText: {
    marginTop: 0,
    color: 'white !important',
    marginLeft: '4rem'
  }
}))

const SideBarHeader = (): JSX.Element => {
  const classes = headerStyles();
  return (
    <div className={classes.header}>
      <div className={classes.headerText}>
        <Typography variant='h6'>BCTW</Typography>
        <Typography paragraph>Caribou Recovery Program</Typography>
      </div>
    </div>
  )
}

export default SideBarHeader;