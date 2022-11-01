import { Box } from '@mui/material';
import { TelemetryAlert, eAlertType } from 'types/alert';
import makeStyles from '@mui/styles/makeStyles';
import { SubHeader } from 'components/common/partials/SubHeader';
import { FormatAlert } from 'components/alerts/FormatAlert';
import AlertCard from './AlertCard';

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
    marginTop: theme.spacing(4)
  }
}));

/**
 * Displays a list of alerts, with most recent first, grouped by date.
 * @param alerts Array of TelemetryAlerts, which in most cases are going to either be MortalityAlerts or MalfunctionAlerts
 * @returns
 */
export const ViewAllAlerts = ({ alerts }: ViewAllAlertsProps): JSX.Element => {
  const styles = useStyles();

  alerts.sort((a, b) => (a.valid_from.isAfter(b.valid_from) ? -1 : 1));
  const grouped: AlertGroups = {};
  alerts.forEach((a) => {
    if (a.valid_from) {
      const category = a.valid_from.format('DD-MM-YYYY');
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(a);
    }
  });

  return (
    <>
      <Box className={styles.topHeader}>
        <SubHeader text={'Alerts'} />
      </Box>
      {Object.values(grouped).map((o) => {
        return (
          <>
            {
              <Box className={styles.header} textAlign='center'>
                <SubHeader text={o[0].valid_from.format('MMMM DD, YYYY')} />
              </Box>
            }
            {o.map((a) => {
              return (
                <Box className={styles.mortalityCard}>
                  <AlertCard
                    variant={a.alert_type === eAlertType.mortality ? 'error' : 'warning'}
                    content={<FormatAlert alert={a} format={'page'} />}
                  />
                </Box>
              );
            })}
          </>
        );
      })}
    </>
  );
};
export default ViewAllAlerts;
