import { Box, Grid } from '@material-ui/core';
import React from 'react';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: unknown;
}

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
  title: string;
  headers: (keyof T)[];
  obj: T;
  format: (k: keyof T) => string;
};
const EditHeader = <T,>({ title, headers, obj, format }: EditHeaderProps<T>): JSX.Element => {
  return (
    <Box display='flex' justifyContent='space-between' alignItems='top' pt={3}>
      <Box>
        <Box component='h1' mt={0} mb={1}>
          {title}
        </Box>
        <dl className='headergroup-dl'>
          {headers.map((p) => {
            return (
              <>
                <dd>{format(p)}:</dd>
                <dt>{obj[p]}</dt>
              </>
            );
          })}
        </dl>
      </Box>
      <Box></Box>
    </Box>
  );
};

const FormPart = (header: string, children: React.ReactNode[], btn?: React.ReactNode): JSX.Element => (
  <Box component='fieldset' p={2}>
    {header ? (
      <Box component='legend' className={'legend'}>
        {header}
        {btn}
      </Box>
    ) : null}
    <Box className='fieldset-form'>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          {children.map((c) => c)}
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

export { EditHeader, EditTabPanel, FormPart, a11yProps };
