import { Box, Link, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles(() => ({
  box: {
    backgroundColor: '#f2f2f2',
  },
  blueHeadingBar: {
    backgroundColor: '#38598a',
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
  console.log(data);
  return (
    <Box className={styles.box}>
      <Typography variant={'h5'} className={styles.blueHeadingBar} color='white' paragraph>
        {title}
      </Typography>
      <Box className={styles.boxText}>
        {data.map((item) => (
          <Typography paragraph>
            {item.textPrefix}
            <Link href={item.href} target='_blank'>
              {item.link}
            </Link>
            {item.textSuffix && item.textSuffix}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};
export default GovLinkBox;
