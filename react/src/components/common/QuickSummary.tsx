import { Box, CircularProgress, Skeleton, Theme, Typography } from '@mui/material';
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

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    marginRight: theme.spacing(4)
  },
  cards2: {
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
  }
}));
export const QuickSummary = (): JSX.Element => {
  const api = useTelemetryApi();
  const classes = useStyles();
  const useUser = useContext(UserContext);
  const { data, isSuccess } = api.useCritterAccess(
    0, // load all values
    { user: useUser.user }
  );
  const [animalPermsCount, setAnimalPermsCount] = useState({ manager: 0, observer: 0 });
  useEffect(() => {
    if (isSuccess && data?.length) {
      let manager = 0;
      let observer = 0;
      data.forEach((animal) => {
        if (animal.permission_type === eCritterPermission.manager) manager += 1;
        if (animal.permission_type === eCritterPermission.observer) observer += 1;
      });
      setAnimalPermsCount({ manager, observer });
    }
  });
  return (
    <>
      <SubHeader text={'Quick Summary'} />
      <Box className={classes.root}>
        <Box className={classes.cards2}>
          <Box className={classes.card}>
            <InfoCard
              element={<Typography variant={'h1'}>{animalPermsCount.manager}</Typography>}
              subTitle={'Managed Animals'}
            />
          </Box>
          <InfoCard
            element={<Typography variant={'h1'}>{animalPermsCount.observer}</Typography>}
            subTitle={'Observed Animals'}
          />
        </Box>
        <InfoCard size='large' element={<Icon icon={'check'} />} subTitle={'Observed Animals'} />
      </Box>
    </>
  );
};
