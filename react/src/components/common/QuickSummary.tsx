import { Box, Button, CircularProgress, Link, Skeleton, Theme, Typography, useTheme } from '@mui/material';
import { InfoCard } from './InfoCard';
import { SubHeader } from './partials/SubHeader';
import makeStyles from '@mui/styles/makeStyles';
import { useContext, useEffect, useState } from 'react';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { User } from 'types/user';
import { UserContext } from 'contexts/UserContext';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { eCritterPermission } from 'types/permission';
import { Icon } from 'components/common';
import { LatestDataRetrieval } from 'constants/strings';
import { getToday } from 'utils/time';

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    marginRight: theme.spacing(4)
  },
  cards: {
    display: 'flex',
    flexDirection: 'row'
  },
  root: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  card3: {
    float: 'right'
  },
  details: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'end'
  },
  detailsLink: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'end'
  }
}));
export const QuickSummary = (): JSX.Element => {
  const api = useTelemetryApi();
  const classes = useStyles();
  const theme = useTheme();
  const useUser = useContext(UserContext);
  const { data, isSuccess } = api.useCritterAccess(
    0, // load all values
    { user: useUser.user }
  );
  const [animalPermsCount, setAnimalPermsCount] = useState({ manager: 0, observer: 0, editor: 0 });
  useEffect(() => {
    if (isSuccess && data?.length) {
      console.log(data);
      let manager = 0;
      let observer = 0;
      let editor = 0;
      data.forEach((animal) => {
        if (animal.permission_type === eCritterPermission.manager) manager += 1;
        if (animal.permission_type === eCritterPermission.observer) observer += 1;
        if (animal.permission_type === eCritterPermission.editor) editor += 1;
      });
      setAnimalPermsCount({ manager, observer, editor });
    }
  }, [data]);
  return (
    <>
      <Box className={classes.root}>
        <Box>
          <Box className={classes.details}>
            <SubHeader text={'Latest Data Retrieval'} />
            <Link pb={0} mb={0} href='#' onClick={() => console.log('clicked')} underline='none'>
              <Box className={classes.detailsLink}>
                <span>See Details</span>
                <Icon icon={'next'} size={0.8} />
              </Box>
            </Link>
          </Box>
          <InfoCard
            size='large'
            element={<Icon icon={'check'} htmlColor={theme.palette.success.main} size={4} />}
            body={LatestDataRetrieval.success}
            noRightMargin
          />
        </Box>
        <Box className={classes.cards}>
          <Box>
            <SubHeader text={'Quick Summary'} />
            <InfoCard
              element={<Typography variant={'h1'}>{animalPermsCount.manager}</Typography>}
              size='small'
              subTitle={'Managed Animals'}
            />
          </Box>
          <Box>
            <SubHeader text={null} />
            <InfoCard
              element={<Typography variant={'h1'}>{animalPermsCount.observer}</Typography>}
              size='small'
              subTitle={'Observed Animals'}
            />
          </Box>
          <Box>
            <SubHeader text={null} />
            <InfoCard
              element={<Typography variant={'h1'}>{animalPermsCount.editor}</Typography>}
              size='small'
              subTitle={'Editable Animals'}
              noRightMargin
            />
          </Box>
        </Box>
      </Box>
    </>
  );
};
