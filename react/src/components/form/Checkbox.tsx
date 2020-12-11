import React, { useState } from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import { FormControlLabel } from '@material-ui/core';

// todo: add props
export default function Checkboxes(props) {
  const [checked, setChecked] = useState(props.initialValue);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(`checkbox checked ${event.target.checked}`)
    setChecked(event.target.checked);
  };

  return (
    <>
      <FormControlLabel
        control={
          <Checkbox
            checked={checked}
            onChange={handleChange}
            // name="checkedB"
            color="primary"
            {...props}
            // inputProps={{ 'aria-label': 'uncontrolled-checkbox' }}
          />
        }
        label={props.label}
      />
    </>
  );
}