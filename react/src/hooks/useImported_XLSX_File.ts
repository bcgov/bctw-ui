import { createFormData } from 'api/api_helpers';
import { ParsedXLSXSheetResult } from 'api/api_interfaces';
import { AxiosError } from 'axios';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { useTabs } from 'contexts/TabsContext';
import { useEffect, useState } from 'react';
import { useTelemetryApi } from './useTelemetryApi';
import { Critter } from 'types/animal';
const SIZE_LIMIT = 31457280;
interface SanitizeAndFinalize {
  isValidated: boolean;
  reset: () => void;
  sanitizedFile: ParsedXLSXSheetResult[];
  isLoading: boolean;
  setFile: (fieldName: string, files: FileList) => void;
  defaultCritterValue: (list: {critter_id: string, wlh_id: string}[], wlhId: string) => string;
}

export default function useImported_XLSX_File(): SanitizeAndFinalize {
  const api = useTelemetryApi();
  const showNotif = useResponseDispatch();
  const { setTabStatus, tab } = useTabs();

  const [isValidated, setValidation] = useState(false);
  const [sanitizedFile, setSanitizedFile] = useState<ParsedXLSXSheetResult[]>(null);

  const defaultCritterValue = (possible_critter_values: {critter_id: string, wlh_id: string}[], wlhIdForThisRow: string): string => {
    let defaultVal: string;
    if(possible_critter_values.length == 0) {
      defaultVal = 'New Critter';
    }
    else if (possible_critter_values.length == 1 && possible_critter_values[0].wlh_id === wlhIdForThisRow) {
      defaultVal = possible_critter_values[0].critter_id;
    }
    else {
      defaultVal = '';
    }
    return defaultVal;
  }

  const successXLSX = (d: ParsedXLSXSheetResult[]) => {
    if (d.length) {
      d.forEach(a => a.rows.forEach(r => r.row.selected_critter_id = defaultCritterValue(r.row.possible_critters, (r.row as Critter).wlh_id)));
      setSanitizedFile(d);
      showNotif({ severity: 'success', message: 'File uploaded and sanitized' });
      // setTabsValidation(validation => ({...validation}))
    } else {
      showNotif({ severity: 'error', message: 'The data sanitization process failed.' });
    }
  };

  const errorXLSX = (error: AxiosError, variables: FormData, context: unknown): void => {
    showNotif({ severity: 'error', message: `${JSON.stringify(error.response.data)}` });
  };

  const { mutateAsync, isLoading } = api.useUploadXLSX({
    onSuccess: successXLSX,
    onError: errorXLSX
  });

  const save = async (form: FormData): Promise<ParsedXLSXSheetResult[]> => {
    try {
      return await mutateAsync(form);
    } catch (err) {
      const e = err as AxiosError;
      const responseData = e.response.data;
      showNotif({ severity: 'error', message: responseData?.error ? responseData.error : JSON.stringify(responseData) });
      return null;
    }
  };

  const setFile = (fieldName: string, files: FileList): void => {
    if (files[0].size > SIZE_LIMIT) {
      showNotif({ severity: 'error', message: 'This file exceeds the 30MB limit.' });
      return;
    }
    save(createFormData(fieldName, files));
  };

  useEffect(() => {
    if (!sanitizedFile || !sanitizedFile?.length) {
      setValidation(false);
      return;
    }
    if (sanitizedFile?.every((sheet) => sheet.rows.every((o) => o.success))) {
      setValidation(true);
      setTabStatus(tab, 'success');
      //console.log(sanitizedFile);
      // setTabsValidation((validation) => ({ ...validation }));
    } else {
      setValidation(false);
      setTabStatus(tab, 'error');
    }
  }, [sanitizedFile]);

  const reset = (): void => {
    setSanitizedFile(null);
    setValidation(false);
    setTabStatus(tab, null);
  };

  return { isValidated, reset, sanitizedFile, setFile, isLoading, defaultCritterValue };
}
