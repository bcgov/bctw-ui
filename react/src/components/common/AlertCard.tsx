import { Grid, Paper } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { Icon } from "components/common";

type AlertCardVariants = 'error' | 'warning';

type AlertCardProps = {
    content: JSX.Element;
    variant: AlertCardVariants;
}

const useStyles = makeStyles((theme) => ({
    error: {
        padding: '16px',
        borderLeft: '16px solid red'
    },
    warning: {
        padding: '16px',
        borderLeft: '16px solid orange'
    }
  }));

/**
 * Reusable alert card component, use it for notifications and the like.
 * @param content What you want to be displayed in the main body of the card.
 * @param variant Determins theming and icon of the card
 * @returns 
 */
export const AlertCard = ({content, variant}: AlertCardProps): JSX.Element => {
    const styles = useStyles();

    const htmlColorMap = {
        'error' : 'red',
        'warning' : 'orange'
    }

    return (
        <Paper className={styles[variant]}>
           <Grid container columnGap={2}>
                <Grid item>
                    <Icon 
                        size={1} 
                        htmlColor={htmlColorMap[variant]} 
                        icon={variant} 
                    />
                </Grid>
                <Grid item flexGrow={1}>
                    {content}
                </Grid>
            </Grid>
        </Paper>    
    )
}

export default AlertCard;