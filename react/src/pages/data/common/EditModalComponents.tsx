import { Box, ButtonProps, Grid } from '@material-ui/core';
import { formatTableCell } from 'components/table/table_helpers';
import { ReactNode } from 'react';

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
            const { value } = formatTableCell<T>(obj, p)
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

/**
 * creates a section of a form 
 * todo: pass disabled status to all children through this component?
 */
const FormSection = (key: string, header: string, children: ReactNode[], btn?: ReactNode, disabled = false): JSX.Element => (
  <Box component='fieldset' p={2}  style={{opacity: disabled ? 0.3 : 1}}>
    {header ? (
      <Box component='legend' className={'legend'} mb={1} mt={1}>
        {header}
        {btn}
      </Box>
    ) : null}
    <Box className='fieldset-form'>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          {children.map((c, idx) => (
            <span key={`${key}-${idx}`}>{c}</span>
          ))}
        </Grid>
      </Grid>
    </Box>
  </Box>
);

const a11yProps = (index: number): Record<string, string> => {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  };
};

const editEventBtnProps: ButtonProps = { style: { marginLeft: '20px' }, color: 'default', className: 'button' };

export { EditHeader, EditTabPanel, FormSection, a11yProps, editEventBtnProps };
