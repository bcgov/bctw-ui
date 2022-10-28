import { Paper } from "@mui/material";
import { BaseProps } from "@mui/material/OverridableComponent"
import { Banner } from "components/common/Banner";
import { MortalityAlert } from "types/alert"

type CritterAlertProps = {
    alerts: MortalityAlert[];
}

const AlertCard = (): JSX.Element => {
    return (
        <>
        <Banner
            variant={'info'}
            text={'Alert'}
        />
        </>
    )
}

export const CritterAlertPage = ({alerts}: CritterAlertProps): JSX.Element => {
    return (
        <>
        <h2>Alerts</h2>
        <AlertCard/>
        </>
    )
}