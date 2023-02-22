import { Box, Grid, Paper, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { formatTag } from "components/table/table_helpers";
import dayjs from "dayjs";
import { columnToHeader } from "utils/common_helpers";
import { formatDay } from "utils/time";
import { SubHeader } from "./partials/SubHeader";

interface DetailedStatusCardProps<T> {
    displayObject: T;
    displayKeysInGrid: Array<keyof T>;
    displayKeysInBox: Array<keyof T>;
}

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: '16px'
  },
  gridElement: {
    marginTop: '6px'
  },
  boxElement: {
    marginTop: '6px',
    overflow: 'auto',
    maxHeight: '100px'
  }
}) );

const DetailedStatusCard = <T extends Record<string, any>,>({displayObject, displayKeysInGrid, displayKeysInBox}: DetailedStatusCardProps<T>): JSX.Element => {
  const style = useStyles();

  const formatData = (obj: T, key: keyof T): JSX.Element => {
    let retElement: JSX.Element = <></>;
    if(['species', 'device_status'].includes(key as string)) {
      retElement = formatTag(key as string, String(obj[key]));
    }
    else if(key === 'frequency') {
      if('frequency_unit' in obj) {
        retElement = <Typography>{obj['frequency'] + obj['frequency_unit']}</Typography>
      }
      else {
        retElement = <Typography>{obj['frequency'] + 'KHz'}</Typography>
      }
    }
    else if(['last_fetch_date','attachment_start','attachment_end','capture_date','mortality_date'].includes(key as string)) {
      retElement = <Typography>{dayjs(obj[key]).isValid() ? dayjs(obj[key]).format(formatDay) : 'None'}</Typography>
    }
    else {
      retElement = (
        <Typography>
      { obj[key] === undefined || obj[key] === null || String(obj[key]) === 'Invalid Date' ? 'None' : String(obj[key])}
        </Typography> );
    }

    return <Box className={style.gridElement}>{retElement}</Box>
  }

  return (
    <Paper className={style.paper}>
      <Grid container spacing={2}>
        {displayKeysInGrid.map(m => {
            return (<>
            <Grid item xs={6}>
              <SubHeader size='small' text={columnToHeader(m as string) }/>
              {
                formatData(displayObject, m)
              }
            </Grid>
            </>);
        })}
        {displayKeysInBox.map(m => {
          return (<>
          <Grid item xs={12}>
            <SubHeader size='small' text={columnToHeader(m as string) }/>
            <Box className={style.boxElement}>
              <Typography>{displayObject[m] && String(displayObject[m]).length ? displayObject[m] : 'None'}</Typography>
            </Box>
          </Grid>
          </>)
        })}
      </Grid>


    </Paper>
  )
}

export {DetailedStatusCard}