import { Box, Checkbox, Tooltip, Typography } from '@mui/material';
import { WarningInfo } from 'api/api_interfaces';
import { Icon } from 'components/common';

export type WarningPromptsProps = {
  prompts: WarningInfo[];
  setWarningChecked: (warningIdx: number, checked: boolean) => void;
};
/**
 * @param prompts Array of WarningInfo objects. Holds message and checked status of warnings
 * @param setWarningChecked Handler for setting the checked property of a warning
 * @returns Inner HTML of a warning banner
 */
export default function WarningPrompts(props: WarningPromptsProps): JSX.Element {
  const { prompts, setWarningChecked } = props;
  return (
    <Box display='flex' flexDirection='column'>
      {prompts.map((obj, idx) => (
        <Box gap={'10px'} alignItems={'center'} display={'inline-flex'}>
          <Checkbox onChange={(e, b) => setWarningChecked(idx, b)} />
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
