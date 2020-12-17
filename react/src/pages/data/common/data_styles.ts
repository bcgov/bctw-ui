import { makeStyles } from "@material-ui/core";

const useDataStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  editButtonRow: {
    '& > button': {
      marginRight: '20px'
    }
  }
});

export {
  useDataStyles
}