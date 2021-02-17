import { InputLabelProps } from '@material-ui/core';
import { PageProp } from 'components/component_interfaces';
import TextField from 'components/form/Input';

type MapSidebarProps = PageProp & {
  start: string;
  end: string;
  onChange: (event) => void;
};
/**
 * 
 * @param props 
 */
export default function CreateMapSidebar({start, end, onChange, setSidebarContent }: MapSidebarProps): void {
  const labelProps: InputLabelProps = { shrink: true };
  setSidebarContent(
    <div className='date-picker-grp'>
      <div>
        <TextField
          label='Select Start Date'
          InputLabelProps={labelProps}
          InputProps={{}}
          type='date'
          defaultValue={start}
          propName='tstart'
          changeHandler={onChange}
        />
      </div>
      <div>
        <TextField
          label='Select End Date'
          InputLabelProps={labelProps}
          type='date'
          defaultValue={end}
          propName='tend'
          changeHandler={onChange}
        />
      </div>
    </div>
  );
}

// InputProps={
//   {
//     endAdornment: (
//       <InputAdornment position='start'>
//         <Icon icon='home' />
//       </InputAdornment>
//     )
//   }
// }
