import { Box, Link, Theme, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles((theme: Theme) => ({
  box: {
    backgroundColor: '#f2f2f2',
    marginBottom: theme.spacing(2),
  },
  blueHeadingBar: {
    backgroundColor: theme.palette.primary.main,
    padding: '8px 15px 10px 10px'
  },
  boxText: {
    padding: '0px 15px 10px 10px'
  }
}));
interface LinkData {
  link?: string;
  href?: string;
  textPrefix: string;
  textSuffix?: string;
}
interface LinkBoxProps {
  title: string;
  data: LinkData[];
}
const GovLinkBox = ({ title, data }: LinkBoxProps): JSX.Element => {
  const styles = useStyles();
  return (
    <Box className={styles.box}>
      <Typography variant={'h5'} className={styles.blueHeadingBar} color='white' paragraph>
        {title}
      </Typography>
      <Box className={styles.boxText}>
        {data.map((item, index) => (
          <div key={index}>
            <Typography paragraph>
              {item.textPrefix}
              <Link href={item.href} target='_blank'>
                {item.link}
              </Link>
              {item.textSuffix && item.textSuffix}
            </Typography>
          </div>
        ))}
      </Box>
    </Box>
  );
};
export default GovLinkBox;
