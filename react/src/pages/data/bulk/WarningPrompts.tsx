import { Box, Checkbox, Tooltip, Typography } from '@mui/material';
import { WarningInfo } from 'api/api_interfaces';
import { Icon } from 'components/common';
import { useState } from 'react';

export type WarningPromptsProps = {
  prompts: WarningInfo[];
  onAllChecked: () => void;
  onNotAllChecked: () => void;
  handledWarning: (rowIndex: number, checked: boolean) => void;
};

export default function WarningPrompts(props: WarningPromptsProps): JSX.Element {
  const { prompts, onAllChecked, onNotAllChecked, handledWarning } = props;
  const [checks, setChecks] = useState(new Array(prompts.length).fill(false));

  const handleCheck = (checked: boolean, idx: number, warningTableRowIndex: number) => {
    const temp = checks.slice();
    temp[idx] = checked;
    console.log(warningTableRowIndex);
    handledWarning(warningTableRowIndex, checked); // Probably wrong index
    setChecks(temp);
    if (temp.every((o) => o == true)) {
      onAllChecked();
    } else {
      onNotAllChecked();
    }
  };

  return (
    <Box display='flex' flexDirection='column'>
      {prompts.map((obj, idx) => (
        <Box gap={'10px'} alignItems={'center'} display={'inline-flex'}>
          <Checkbox onChange={(e, b) => handleCheck(b, idx, obj.row)} />
          <p>{obj.message}</p>
          <Tooltip arrow placement='top' title={obj.help}>
            <div>
              <Icon icon='help' />
            </div>
          </Tooltip>
        </Box>
      ))}
    </Box>
  );
}
