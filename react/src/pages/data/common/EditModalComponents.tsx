import { Box, ButtonProps, Grid } from '@mui/material';
import { formatTableCell } from 'components/table/table_helpers';
import { cloneElement, Children, Key, ReactElement, ReactNode } from 'react';

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: unknown;
}

/** used in the Edit modal to toggle the display of the edit form and history page components */
const EditTabPanel = (props: TabPanelProps): JSX.Element => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

type EditHeaderProps<T> = {
  title: ReactNode;
  headers: (keyof T)[];
  obj: T;
  format: (k: keyof T) => string;
  btn?: ReactNode;
};

/**
 * edit modals can generate the header component using this function
 */
const EditHeader = <T,>({ title, headers, obj, format, btn }: EditHeaderProps<T>): JSX.Element => {
  return (
    <Box display='flex' justifyContent='space-between' alignItems='top' pt={3}>
      <Box>
        <Box component='h1' mt={0} mb={1}>
          {title}
        </Box>
        <dl className='headergroup-dl'>
          {headers.map((p, idx: number) => {
            const { value } = formatTableCell<T>(obj, p);
            return (
              <Box key={`header-${idx}`} display='inline' mr={2}>
                <dd>{format(p)}:</dd>
                <dt>{value}</dt>
              </Box>
            );
          })}
        </dl>
      </Box>
      <Box>{btn}</Box>
    </Box>
  );
};

type FormSectionProps = {
  id: Key;
  header: string;
  btn?: ReactNode;
  disabled?: boolean;
  hide?: boolean;
  children: ReactNode;
};
/** creates a section of a form with a grid layout
 * @param children must not contain non valid elements (ex. fragments or nulls)
 * top level children must have key props
 */
const FormSection = ({ id, header, btn, disabled, children, hide }: FormSectionProps): JSX.Element => {
  if (hide) return null;
  return (
    <Box component='fieldset' p={2}>
      {header ? (
        <Box component='legend' className={'legend'} mb={1} mt={1}>
          {header}
          {btn}
        </Box>
      ) : null}
      <Box className='fieldset-form'>
        {/* fixme: why doesn't colGap/columnspacing work? */}
        <Grid container spacing={1}>
          <Grid item xs={12}>
            {Children.map(children, (child: ReactElement, idx: number) => {
              const isDisabled = child?.props?.disabled ?? disabled;
              // fixme: adding colgap via child component margin-botom instead
              return cloneElement(child, {
                key: `${id}-${idx}`,
                disabled: isDisabled,
                style: { ...child.props.style, marginBottom: '10px' }
              });
            })}
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

const a11yProps = (index: number): Record<string, string> => {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  };
};

const editEventBtnProps: ButtonProps = {
  style: { marginLeft: '20px' },
  color: 'inherit',
  className: 'button',
  size: 'small'
};

export { EditHeader, EditTabPanel, a11yProps, editEventBtnProps, FormSection };
