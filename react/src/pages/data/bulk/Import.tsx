import { Box, Button, Paper, Tab, Tabs, Typography } from '@mui/material';
import { createFormData, createUrl } from 'api/api_helpers';
import { Icon, Modal } from 'components/common';
import { SyntheticEvent, useEffect, useState } from 'react';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { Animal } from 'types/animal';
import { Collar } from 'types/collar';
import { CellErrorDescriptor, IBulkUploadResults, ParsedXLSXSheetResult } from 'api/api_interfaces';
import AuthLayout from 'pages/layouts/AuthLayout';
import { eUserRole } from 'types/user';
import { SuccessBanner, Banner, InfoBanner } from 'components/alerts/Banner';
import { SubHeader } from 'components/common/partials/SubHeader';
import HighlightTable from 'components/table/HighlightTable';
import makeStyles from '@mui/styles/makeStyles';
import Checkbox from 'components/form/Checkbox';
import { AxiosError } from 'axios';
import FileInputValidation from 'components/form/FileInputValidation';
import { ImportStrings as constants } from 'constants/strings';
import { computeXLSXCol, collectErrorsFromResults, getAllUniqueKeys } from './xlsx_helpers';
import { PageTabs } from 'components/common/partials/PageTabs';
import useTabs from 'hooks/useTabs';
import { AnimalAndDeviceImportTab } from './ImportTabs';
import { TelemetryImportTab } from './ImportTabs';
import { KeyXImportTab } from './ImportTabs';

const SIZE_LIMIT = 31457280;

const useStyles = makeStyles((theme) => ({
  spacing: {
    marginTop: theme.spacing(2)
  },
  spacingTopBottom: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  paper: {
    marginTop: theme.spacing(2),
    padding: '16px',
    backgroundColor: 'text.secondary',
    display: 'flex',
    justifyContent: 'center'
  }
}));

interface RowColPair {
  row?: number;
  col?: string;
}

type ImportTab = 'Animal and Device' | 'Telemetry' | 'Vectronic KeyX';
enum TabNames {
  metadata,
  telemetry
}

/**
 * @param message whats displayed as body of import modal
 * @param handleToast handler from parent, called when mutation is complete
 */
export default function Import(): JSX.Element {

  return (
    <AuthLayout required_user_role={eUserRole.data_administrator}>
      <div className='container'>
        <h1>Data Import</h1>
        <Box mt={2}>
          <PageTabs tabLabels={['Animal and Device', 'Telemetry', 'Vectronic KeyX']}>
            <AnimalAndDeviceImportTab />
            <TelemetryImportTab />
            <KeyXImportTab />
          </PageTabs>
        </Box>
      </div>
    </AuthLayout>
  )
}
