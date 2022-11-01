import { Box, Grid, Typography } from "@mui/material";
import { TelemetryAlert, MortalityAlert, eAlertType } from "types/alert"
import makeStyles from '@mui/styles/makeStyles';
import { SubHeader } from "components/common/partials/SubHeader";
import AlertCard from "components/common/AlertCard";
type CritterAlertProps = {
    alerts: TelemetryAlert[];
}

const useStyles = makeStyles((theme) => ({
    spacing: {
      marginTop: theme.spacing(1)
    },
    mortalityCard: {
        marginBottom: theme.spacing(2),
    },
    header: {
        marginTop: theme.spacing(4),
        marginBottom: theme.spacing(2)
    }
  }));


export const CritterAlertPage = ({alerts}: CritterAlertProps): JSX.Element => {
    alerts.sort((a, b) => (a.valid_from.isAfter(b.valid_from) ? -1 : 1));
    const grouped: unknown = {};
    alerts.forEach((a) => {
        if(a.valid_from) {
            const category = a.valid_from.format("DD-MM-YYYY");
            if(!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(a);
        }

        
    });

    const getCustomBodyText = (tAlert: TelemetryAlert): string => {
        if(tAlert instanceof MortalityAlert) {
            switch(tAlert.alert_type) {
                case eAlertType.mortality:
                    return `Device ID ${tAlert.device_id} has detected a potential mortality.`
                case eAlertType.malfunction:
                    return `Device ID ${tAlert.device_id} is self-reporting a device malfunction.`
                case eAlertType.battery:
                    return `The battery for the device with Device ID ${tAlert.device_id} is running low.`
                default:
                    return "Unsupported Telemetry Type";
            }
        }
        return "";
    }

    const getTitleText = (tAlert: TelemetryAlert) => {
        if(tAlert instanceof MortalityAlert) {
            switch(tAlert.alert_type) {
                case eAlertType.mortality:
                    return (<>Potential <b><u>Mortality</u></b> Alert</>);
                case eAlertType.malfunction:
                    return (<>Potential Malfunction Alert</>);
                case eAlertType.battery:
                    return (<>Low Battery Alert</>)
                default:
                    return (<></>);
            }
        }
        else {
            return (<>Unknown Telemetry Alert</>)
        }
    }

    const alertFormat = (tAlert: TelemetryAlert): JSX.Element => {

        return (
            <>
            <Box display={'flex'} justifyContent={'space-between'}>
                <Typography>{getTitleText(tAlert)}</Typography>
                <Typography textAlign={'right'}> {`${tAlert.valid_from.format("hh:mm a")}`}</Typography>
            </Box> 
            {tAlert instanceof MortalityAlert && (
                <>

                    <Typography className={styles.spacing}>{getCustomBodyText(tAlert)}</Typography>
                    <Grid container columnGap={2}>
                        <Grid item>
                            <Typography className={styles.spacing}>
                            {`Species: ${tAlert.species}`}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Typography className={styles.spacing}>
                            {`Animal ID: ${tAlert.animal_id.length ? tAlert.animal_id : 'None'}`}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Typography className={styles.spacing}>
                            {`Wildlife Health ID: ${tAlert.wlh_id.length ? tAlert.wlh_id : 'None'}`}
                            </Typography>
                        </Grid>
                    </Grid>
                
                </>
            )}
            </>
        )
    }

    const styles = useStyles();
    return (
        <>
        <h2>Alerts</h2>
        { Object.values(grouped).map(o => 
            {
                return <>
                {<Box className={styles.header} textAlign="center">
                    <SubHeader text={o[0].valid_from.format("MMMM DD, YYYY")} />
                </Box>}
                { o.map((a, idx) => { return (<Box className={styles.mortalityCard}><AlertCard variant={a.alert_type === eAlertType.mortality ? 'error' : 'warning'} content={alertFormat(a)} /></Box>) } ) }
                
                </>
            }
        )}

        </>
    )
}