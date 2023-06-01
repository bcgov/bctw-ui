import { Box, capitalize, Typography } from '@mui/material';
import { TelemetryAlert, eAlertType, MortalityAlert, MalfunctionAlert } from 'types/alert';
import makeStyles from '@mui/styles/makeStyles';
import { SubHeader } from 'components/common/partials/SubHeader';
import { FormatAlert, getTitle } from 'components/alerts/FormatAlert';
import AlertCard from './AlertCard';
import { useEffect, useState } from 'react';
import Select from 'components/form/BasicSelect';
import { formatT } from 'utils/time';

type ViewAllAlertsProps = {
  alerts: TelemetryAlert[];
};

interface AlertGroups {
  [group: string]: TelemetryAlert[];
}

const useStyles = makeStyles((theme) => ({
  mortalityCard: {
    marginBottom: theme.spacing(2)
  },
  header: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2)
  },
  topHeader: {
    marginTop: theme.spacing(4),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  h: {
    padding: 0,
    margin: 0
  }
}));

/**
 * Displays a list of alerts, with most recent first, grouped by date.
 * @param alerts Array of TelemetryAlerts, which in most cases are going to either be MortalityAlerts or MalfunctionAlerts
 * @returns
 */
const ViewAllAlerts = ({ alerts }: ViewAllAlertsProps): JSX.Element => {
  const styles = useStyles();
  const SelectOptions = ['Date', 'Device', 'Type'];
  const [sortBy, setSortBy] = useState(SelectOptions[0]);
  const [alertGroup, setAlertGroup] = useState<AlertGroups>({});
  useEffect(() => {
    const sort = (): void => {
      const group: AlertGroups = {};
      alerts.sort((a, b) => (a.valid_from.isAfter(b.valid_from) ? -1 : 1));
      alerts.forEach((a) => {
        if (a instanceof MortalityAlert || a instanceof MalfunctionAlert) {
          let category: string;
          if (sortBy === 'Date') {
            if (!a.valid_from) return;
            category = a.valid_from.format('MMMM DD, YYYY');
          }
          if (sortBy === 'Device') {
            category = `Device ID: ${a.device_id}`;
          }
          if (sortBy === 'Type') {
            category = getTitle(a);
          }
          if (!group[category]) {
            group[category] = [];
          }
          group[category].push(a);
        }
      });
      setAlertGroup(group);
    };
    sort();
  }, [sortBy]);
  return (
    <>
      <Box className={styles.topHeader}>
        <h1 className={styles.h}>Alerts</h1>
        <Select
          label='Sort by'
          defaultValue={SelectOptions[0]}
          values={SelectOptions}
          handleChange={(v: string): void => setSortBy(v)}
        />
      </Box>
      {Object.keys(alertGroup).map((a, i) => {
        return (
          <Box key={`alert-group-${i}`}>
            <Box className={styles.header} textAlign='center'>
              <SubHeader text={capitalize(a)} />
            </Box>
            {alertGroup[a].map((item, j) => (
              <Box className={styles.mortalityCard} key={`alert-content-${j}`}>
                <AlertCard
                  variant={item.alert_type === eAlertType.mortality ? 'error' : 'warning'}
                  content={
                    <>
                      <FormatAlert alert={item} format={'page'} />
                      {sortBy !== 'Date' && (
                        <Typography sx={{ fontWeight: 'light' }}>Alert Date: {formatT(item.valid_from)}</Typography>
                      )}
                    </>
                  }
                />
              </Box>
            ))}
          </Box>
        );
      })}
    </>
  );
};
export default ViewAllAlerts;
