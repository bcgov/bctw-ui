import { Box, Button, CircularProgress, Link, Skeleton, Theme, Typography, useTheme } from '@mui/material';
import { InfoCard } from './InfoCard';
import { SubHeader } from './partials/SubHeader';
import makeStyles from '@mui/styles/makeStyles';
import { useContext, useEffect, useState } from 'react';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { UserContext } from 'contexts/UserContext';
import { Icon } from 'components/common';
import { CritterStrings, LatestDataRetrieval, QuickSummaryStrings } from 'constants/strings';
import dayjs, { Dayjs } from 'dayjs';

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
  },
  btn: {
    backgroundColor: 'transparent',
    padding: 0
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
  const counts = {
    manager: 0,
    observer: 0,
    editor: 0
  };
  const [animalPermsCount, setAnimalPermsCount] = useState(counts);
  const [retrievalSuccess, setRetrievalSuccess] = useState(true);
  useEffect(() => {
    if (isSuccess && data?.length) {
      data.forEach((animal) => {
        counts[animal.permission_type] += 1;
        if (animal.date_recorded) {
          if (!dayjs(animal.date_recorded).isSame(dayjs())) {
            setRetrievalSuccess(false);
          }
        }
      });
      setAnimalPermsCount(counts);
    }
  }, [data]);
  return (
    <>
      <Box className={classes.root}>
        <Box>
          <Box className={classes.details}>
            <SubHeader text={LatestDataRetrieval.title} />
            <Button className={classes.btn} endIcon={<Icon icon={'next'} size={0.8} />}>
              See Details
            </Button>
          </Box>
          <InfoCard
            size='large'
            element={
              <Icon
                icon={'circle'}
                htmlColor={retrievalSuccess ? theme.palette.success.main : theme.palette.warning.main}
                size={4}
              />
            }
            body={retrievalSuccess ? LatestDataRetrieval.success : LatestDataRetrieval.failure}
            noRightMargin
          />
        </Box>
        <Box className={classes.cards}>
          <Box>
            <SubHeader text={QuickSummaryStrings.title} />
            <InfoCard
              element={<Typography variant={'h1'}>{animalPermsCount.manager}</Typography>}
              size='small'
              subTitle={QuickSummaryStrings.manage}
            />
          </Box>
          <Box>
            <SubHeader text={null} />
            <InfoCard
              element={<Typography variant={'h1'}>{animalPermsCount.observer}</Typography>}
              size='small'
              subTitle={QuickSummaryStrings.editable}
            />
          </Box>
          <Box>
            <SubHeader text={null} />
            <InfoCard
              element={<Typography variant={'h1'}>{animalPermsCount.editor}</Typography>}
              size='small'
              subTitle={QuickSummaryStrings.observed}
              noRightMargin
            />
          </Box>
        </Box>
      </Box>
    </>
  );
};
