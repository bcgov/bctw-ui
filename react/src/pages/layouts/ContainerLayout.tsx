import { Box } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';

export const containerLayoutStyles = makeStyles(() => ({
    containerDiv: {
        background: 'white',
        padding: '20px'
    }
}));

type IDefaultLayoutProps = {
    children: React.ReactNode;
};

export default function ContainerLayout({children}: IDefaultLayoutProps): JSX.Element {
    const classes = containerLayoutStyles();
    return (
        <Box>
        <div className={classes.containerDiv}>
            {children}
        </div>
        </Box>
    )
}