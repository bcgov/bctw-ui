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
  },
  // modalFooter: {
  //   display: 'flex',
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   margin: '15px 0 0 0'
  // },
  editSaveButton: {
    float: 'right'
  }
});

export {
  useDataStyles
}