import { lighten, Paper, Typography } from "@mui/material";
import { BaseProps } from "@mui/material/OverridableComponent"
import { Banner } from "components/common/Banner";
import { TelemetryAlert, MortalityAlert, eAlertType } from "types/alert"
import makeStyles from '@mui/styles/makeStyles';
import dayjs from "dayjs";
type CritterAlertProps = {
    alerts: TelemetryAlert[];
}

const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
      width: '100%',
      marginBottom: theme.spacing(2)
    },
    listItem: {
      display: 'list-item',
      padding: 2
    },
    info: {
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    spacing: {
      marginTop: theme.spacing(2)
    },
    amogus: {
        color: lighten(theme.palette.error.light, 0.9)
    }
  }));

const AlertCard = (tAlert: TelemetryAlert): JSX.Element => {
    const styles = useStyles();
    const alertFormat = (tAlert: TelemetryAlert): JSX.Element => {

        return (
            <>
            <Typography> {tAlert.formatAlert}</Typography>
            {tAlert instanceof MortalityAlert && (
                <>
                <Typography className={styles.spacing}>{`Device ID ${tAlert.device_id} has detected a potential mortality. `}</Typography>
                <Typography className={styles.spacing}>{`Species: ${tAlert.species} Animal ID: ${tAlert.animal_id} Wildlife Health ID: ${tAlert.wlh_id}`}</Typography>
                </>
            )}
           
            </>
        )
    }

    return (
        <>
        <Banner
            variant={'error'}
            text={alertFormat(tAlert)}
        />
        </>    
    )
}

export const CritterAlertPage = ({alerts}: CritterAlertProps): JSX.Element => {

    const alert = new MortalityAlert;
    alert.alert_type = eAlertType.mortality;
    alert.wlh_id = '13-1444';
    alert.species = 'Caribou';
    alert.animal_id = '444233';
    alert.device_id = 1234;
    alert.valid_from = dayjs();

    const arr = [alert, alert, alert];

    return (
        <>
        <h2>Alerts</h2>
        { arr.map(a => (AlertCard(a) )) }
        </>
    )
}