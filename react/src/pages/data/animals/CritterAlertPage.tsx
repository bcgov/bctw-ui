import { Box, Grid, lighten, Button as MUIButton, Typography, Paper } from "@mui/material";
import { BaseProps } from "@mui/material/OverridableComponent"
import { Banner } from "components/common/Banner";
import { TelemetryAlert, MortalityAlert, eAlertType } from "types/alert"
import makeStyles from '@mui/styles/makeStyles';
import dayjs from "dayjs";
import { SubHeader } from "components/common/partials/SubHeader";
import { Icon } from "components/common";
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
      marginTop: theme.spacing(1)
    },
    betweenCards: {
        marginBottom: theme.spacing(2),
        padding: '16px'
    },
    header: {
        marginTop: theme.spacing(4),
        marginBottom: theme.spacing(2)
    },
    amogus: {
        color: lighten(theme.palette.error.light, 0.9)
    }
  }));

const AlertCard = (tAlert: TelemetryAlert, key: string): JSX.Element => {
    const styles = useStyles();
    const alertFormat = (tAlert: TelemetryAlert): JSX.Element => {

        return (
            <>
            {/*<Grid container>
                <Grid item>*/}
            <Grid container columnGap={2}>
            <Grid item>
            <Icon size={1.2} htmlColor="red" icon={'error'} />
            </Grid>
            <Grid item flexGrow={1}>
            <Box display='flex' justifyContent={'space-between'}>
                <Typography> {`${tAlert.formatAlert} Alert`}</Typography>
                <Typography textAlign={'right'}> {`${tAlert.valid_from.format("hh:mm a")}`}</Typography>
            </Box> 
            {tAlert instanceof MortalityAlert && (
                <>

                    <Typography className={styles.spacing}>{`Device ID ${tAlert.device_id} has detected a potential mortality. `}</Typography>
                    <Grid container columnGap={2}>
                        <Grid item>
                            <Typography className={styles.spacing}>
                            {`Species: ${tAlert.species}`}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Typography className={styles.spacing}>
                            {`Animal ID: ${tAlert.animal_id}`}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Typography className={styles.spacing}>
                            {`Wildlife Health ID: ${tAlert.wlh_id}`}
                            </Typography>
                        </Grid>
                    </Grid>
                
                </>
            )}
                {/*</Grid>
                <Grid item >
                    <Typography textAlign={'right'}> {`${tAlert.valid_from}`}</Typography>
                </Grid>
            </Grid>*/}
            </Grid>
            </Grid>
            </>
        )
    }

    return (
        <Paper className={styles.betweenCards}>
            {alertFormat(tAlert)}
        </Paper>    
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

    const alert2 = new MortalityAlert;
    alert2.alert_type = eAlertType.mortality;
    alert2.wlh_id = '13-1412';
    alert2.species = 'Caribou';
    alert2.animal_id = '12346';
    alert2.device_id = 1234;
    alert2.valid_from = dayjs().subtract(2, 'month');

    const alert3 = new MortalityAlert;
    alert3.alert_type = eAlertType.mortality;
    alert3.wlh_id = '11-1212';
    alert3.species = 'Caribou';
    alert3.animal_id = '18346';
    alert3.device_id = 9999;
    alert3.valid_from = dayjs().subtract(9, 'weeks');

    const arr = [alert, alert, alert, alert2, alert2, alert2, alert3];
    arr.sort((a, b) => (a.valid_from.isAfter(b.valid_from) ? -1 : 1));
    const grouped: unknown = {};
    arr.forEach((a) => {
        if(a.valid_from) {
            const category = a.valid_from.format("DD-MM-YYYY");
            if(!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(a);
        }

        
    });

    console.log({grouped});
    const styles = useStyles();
    return (
        <>
        <h2>Alerts</h2>
        <MUIButton startIcon={<Icon icon={'backspace'}/>} variant={'text'}>Back</MUIButton>
        { Object.values(grouped).map(o => 
            {
                return <>
                {<Box className={styles.header} textAlign="center">
                    <SubHeader text={o[0].valid_from.format("MMMM DD, YYYY")} />
                </Box>}
                { o.map((a, idx) => { return AlertCard(a, idx) } ) }
                
                </>
            }
        )}

        </>
    )
}