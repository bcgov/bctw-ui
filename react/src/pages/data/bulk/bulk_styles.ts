import { makeStyles, Theme, createStyles } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    err: {
      color: 'red'
    },
    errRow: {
      fontWeight: 600,
      fontStyle: 'italic',
      padding: '0px 10px',
    },
    footer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      margin: '15px 0 0 0'
    },
    header: {
      margin: '10px 0',
    },
    exportChipRowParent: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
    },
    chip: {
      margin: '2px 3px'
    }
  })
);

export default useStyles;