import { createFormData } from 'api/api_helpers';
import { ParsedXLSXSheetResult } from 'api/api_interfaces';
import { AxiosError } from 'axios';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { useTabs } from 'contexts/TabsContext';
import { useEffect, useState } from 'react';
import { useTelemetryApi } from './useTelemetryApi';
const SIZE_LIMIT = 31457280;
interface SanitizeAndFinalize {
  isValidated: boolean;
  reset: () => void;
  sanitizedFile: ParsedXLSXSheetResult[];
  isLoading: boolean;
  setFile: (fieldName: string, files: FileList) => void;
}

export default function useImported_XLSX_File(): SanitizeAndFinalize {
  const api = useTelemetryApi();
  const showNotif = useResponseDispatch();
  const { setTabStatus, tab } = useTabs();

  const [isValidated, setValidation] = useState(false);
  const [sanitizedFile, setSanitizedFile] = useState<ParsedXLSXSheetResult[]>(null);

  const successXLSX = (d: ParsedXLSXSheetResult[]) => {
    if (d.length) {
      console.log(d);
      setSanitizedFile(d);
      showNotif({ severity: 'success', message: 'File uploaded and sanitized' });
      // setTabsValidation(validation => ({...validation}))
    } else {
      showNotif({ severity: 'error', message: 'The data sanitization process failed.' });
    }
  };

  const errorXLSX = (): void => {
    showNotif({ severity: 'error', message: 'bulk upload failed' });
  };

  const {
    mutateAsync,
    isIdle,
    isLoading,
    isSuccess,
    isError,
    error,
    data,
    reset: mutateReset
  } = api.useUploadXLSX({
    onSuccess: successXLSX,
    onError: errorXLSX
  });

  const save = async (form: FormData): Promise<ParsedXLSXSheetResult[]> => {
    try {
      return await mutateAsync(form);
    } catch (err) {
      const e = err as AxiosError;
      showNotif({ severity: 'error', message: e.message });
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

  return { isValidated, reset, sanitizedFile, setFile, isLoading };
}
