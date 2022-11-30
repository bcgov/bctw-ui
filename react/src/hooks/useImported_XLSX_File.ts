import { createFormData } from 'api/api_helpers';
import { ParsedXLSXSheetResult } from 'api/api_interfaces';
import { AxiosError } from 'axios';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { useEffect, useState } from 'react';
import { useTelemetryApi } from './useTelemetryApi';
const SIZE_LIMIT = 31457280;
interface SanitizeAndFinalize {
  isFileValidated: boolean;
  setSanitizedFile: React.Dispatch<React.SetStateAction<ParsedXLSXSheetResult[]>>;
  sanitizedFile: ParsedXLSXSheetResult[];
  isFileLoading: boolean;
  setFile: (fieldName: string, files: FileList) => void;
}

export default function useImported_XLSX_File(): SanitizeAndFinalize {
  const api = useTelemetryApi();

  const [isFileValidated, setValidation] = useState(false);
  const showNotif = useResponseDispatch();
  const [sanitizedFile, setSanitizedFile] = useState<ParsedXLSXSheetResult[]>(null);

  const successXLSX = (d: ParsedXLSXSheetResult[]) => {
    if (d.length) {
      console.log(d);
      setSanitizedFile(d);
      showNotif({ severity: 'success', message: 'File uploaded and sanitized' });
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
    isLoading: isFileLoading,
    isSuccess,
    isError,
    error,
    data,
    reset
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
    } else {
      setValidation(false);
    }
  }, [sanitizedFile]);
  return { isFileValidated, setSanitizedFile, sanitizedFile, setFile, isFileLoading };
}
