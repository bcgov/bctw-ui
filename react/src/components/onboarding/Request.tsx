import React from 'react';
import {
  FormControl,
  TextField,
  Select,
  NativeSelect,
  MenuItem,
  InputLabel
} from "@material-ui/core";


const RequestUser = (): JSX.Element => {

  const styleMeVictor = {
    maxWidth: '40rem'
  };

  const [accessChosen, setAccessChosen] = React.useState('')

  const accessChosenMe = (e) => {
    setAccessChosen(e.target.value);
  }

  return (
    <div className='container' style={styleMeVictor}>
      <h2>Request Access</h2>
      <div>You will need to provide some additional details before accessing this application. Complete the request details form below to obtain access.</div>
      <h3>Request Details</h3>
      <div>Complete the following information</div>
      <TextField label='Project Name'></TextField>
      <TextField label='Role in Project'></TextField>
      <TextField label='Project Manager'></TextField>
      <TextField label='Target Species'></TextField>
      <TextField label='Region'></TextField>
      <TextField label='Population Unit Name'></TextField>

      <FormControl>
        <InputLabel>Target Level of Access</InputLabel>
        <NativeSelect
          onChange={accessChosenMe}
          value={accessChosen}
        >
          <option value={''}></option>
          <option value={'administer'}>Administer</option>
          <option value={'manager'}>Manager</option>
          <option value={'editor'}>Editor</option>
          <option value={'observer'}>Observer</option>
        </NativeSelect>
      </FormControl>


    </div>
  )
}
export default RequestUser;
