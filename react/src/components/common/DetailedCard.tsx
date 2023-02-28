import { Box, Grid, Paper, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { formatTag } from 'components/table/table_helpers';
import dayjs from 'dayjs';
import { columnToHeader } from 'utils/common_helpers';
import { formatDay } from 'utils/time';
import { SubHeader } from './partials/SubHeader';

interface DetailedStatusHeaderOverride {
  [key: string]: string;
}

interface DetailedStatusCardProps<T> {
  displayObject: T;
  displayKeysInGrid: Array<keyof T>;
  displayKeysInBox: Array<keyof T>;
  headerOverride: DetailedStatusHeaderOverride;
}

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(4)
  },
  gridElement: {
    marginTop: theme.spacing(1)
  },
  boxElement: {
    marginTop: theme.spacing(1),
    overflow: 'auto',
    maxHeight: '100px'
  },
  valueSize: {
    variant: 'h5'
  }
}));

const DetailedStatusCard = <T extends Record<string, any>>({
  displayObject,
  displayKeysInGrid,
  displayKeysInBox,
  headerOverride
}: DetailedStatusCardProps<T>): JSX.Element => {
  const style = useStyles();

  const formatHeader = (key: keyof T): string => {
    if (key in headerOverride) {
      return headerOverride[key as string];
    }
    return columnToHeader(key as string);
  };

  const formatData = (obj: T, key: keyof T): JSX.Element => {
    if (['species', 'device_status', 'animal_status'].includes(key as string)) {
      return <Box className={style.gridElement}>{formatTag(key as string, String(obj[key]))}</Box>;
    }

    let retElement = '';
    if (key === 'frequency') {
      if ('frequency_unit' in obj) {
        retElement = obj['frequency'] + obj['frequency_unit'];
      } else {
        retElement = obj['frequency'] + 'KHz';
      }
    } else if (
      ['last_fetch_date', 'attachment_start', 'attachment_end', 'capture_date', 'mortality_date'].includes(
        key as string
      )
    ) {
      retElement = dayjs(obj[key]).isValid() ? dayjs(obj[key]).format(formatDay) : 'None';
    } else {
      retElement =
        obj[key] === undefined || obj[key] === null || String(obj[key]) === 'Invalid Date' ? 'None' : String(obj[key]);
    }

    return (
      <Box className={style.gridElement}>
        <Typography className={style.valueSize}>{retElement}</Typography>
      </Box>
    );
  };

  return (
    <Paper className={style.paper}>
      <Grid container spacing={2}>
        {displayKeysInGrid.map((m) => {
          return (
            <>
              <Grid item xs={6}>
                <SubHeader size='extra-small' text={formatHeader(m)} />
                {formatData(displayObject, m)}
              </Grid>
            </>
          );
        })}
        {displayKeysInBox.map((m) => {
          return (
            <>
              <Grid item xs={12}>
                <SubHeader size='extra-small' text={formatHeader(m)} />
                <Box className={style.boxElement}>
                  <Typography className={style.valueSize}>
                    {displayObject[m] && String(displayObject[m]).length ? displayObject[m] : 'None'}
                  </Typography>
                </Box>
              </Grid>
            </>
          );
        })}
      </Grid>
    </Paper>
  );
};

export { DetailedStatusCard };
