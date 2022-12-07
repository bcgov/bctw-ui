import { Box, Card, CardContent, Paper, TablePagination, Theme, Typography, useTheme } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import makeStyles from '@mui/styles/makeStyles';
import { createFormData } from 'api/api_helpers';
import { IBulkUploadResults } from 'api/api_interfaces';
import { AxiosError } from 'axios';
import { InfoBanner } from 'components/alerts/Banner';
import Icon from 'components/common/Icon';
import { DottedBorderBox } from 'components/common/partials/DottedBorderBox';
import Tooltip from 'components/common/Tooltip';
import FileInput from 'components/form/FileInput';
import { BannerStrings } from 'constants/strings';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useEffect, useState } from 'react';
import { VectronicKeyX } from 'types/collar';

const useStyles = makeStyles((theme: Theme) => ({
  table: {
    [`& .${tableCellClasses.root}`]: {
      borderBottom: 'none'
    }
  },
  batchUploadBox: {
    border: '3px dashed grey',
    minWidth: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardWidth: {
    width: '24rem'
  }
}));

interface KeyXCardProps {
  pageRows?: number;
  device_ids?: number[];
  handleAllKeyXUploaded?: (status: boolean) => void;
}

interface DeviceKeyXObj {
  [device_id: number]: VectronicKeyX;
}

/**
 * @param deviceids List of deviceids to query the api_vectronics_collar_data,
 * If none provided defaults to all the keyX files for users assigned collars
 * @param pageRows Optional param for number of rows for pagination
 * @Returns Paginated list of keyX files and controls to upload inline or batch
 */
export const KeyXUploader = ({ device_ids, pageRows = 10, handleAllKeyXUploaded }: KeyXCardProps): JSX.Element => {
  const api = useTelemetryApi();
  const theme = useTheme();
  const styles = useStyles();
  const { data, isSuccess, isLoading } = api.useGetCollarKeyX(device_ids);

  const [deviceAndKeyXObj, setDeviceAndKeyXObj] = useState<DeviceKeyXObj>({});
  const [page, setPage] = useState(0);

  const ROWS_PER_PAGE = 10;
  const HEADERS = ['Devices', 'KeyX Files'];

  const onSuccessKeyX = (response: IBulkUploadResults<VectronicKeyX>): void => {
    //Currently not doing anything with errors on upload
    const { errors, results } = response;
    //Set the successfull results to the object
    results.forEach((keyX) => {
      if (keyX.idcollar in deviceAndKeyXObj) {
        setDeviceAndKeyXObj((k) => ({ ...k, [keyX.idcollar]: keyX }));
      }
    });
  };

  const onErrorKeyX = (e: AxiosError): void => {
    console.log(e.message);
  };

  const {
    mutateAsync: mutateKeyX
    // reset,
    // isLoading: isPostingKeyX
  } = api.useUploadXML({
    onSuccess: onSuccessKeyX,
    onError: onErrorKeyX
  });

  //Parse data to object for efficiency
  useEffect(() => {
    if (!data?.length) return;
    const tmp: DeviceKeyXObj = {};
    data.forEach((row) => {
      tmp[row.device_id] = row.keyx;
    });
    setDeviceAndKeyXObj(tmp);
  }, [isSuccess]);

  useEffect(() => {
    let hasAllKeyXFiles = true;
    Object.keys(deviceAndKeyXObj).forEach((key) => {
      if (!deviceAndKeyXObj[key]) {
        hasAllKeyXFiles = false;
      }
    });
    handleAllKeyXUploaded?.(hasAllKeyXFiles);
  }, [deviceAndKeyXObj]);

  const handleUploadedKeyX = (name: string, files: FileList): void => {
    const form = createFormData('xml', files);
    mutateKeyX(form);
  };

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, page: number): void => {
    setPage(page);
  };

  const UploadKeyXBtn = ({ text }: { text: string }): JSX.Element => (
    <FileInput
      accept='.keyx'
      buttonText={text}
      buttonVariant='text'
      fileName={''}
      multiple={true}
      onFileChosen={handleUploadedKeyX}
    />
  );
  return (
    <Paper className={styles.cardWidth} variant='outlined'>
      <CardContent>
        <InfoBanner text={BannerStrings.vectronicKeyxInfo} />
        <DottedBorderBox>
          <UploadKeyXBtn text={'Upload Multiple KeyX Files'} />
        </DottedBorderBox>
      </CardContent>
      <TableContainer>
        <Table size='small' className={styles.table}>
          <TableHead>
            <TableRow>
              {HEADERS.map((h) => (
                <TableCell key={`headers-${h}`} align='center'>
                  <Typography fontWeight='bold'>{h}</Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(deviceAndKeyXObj).map((dID, idx, arr) => {
              //Sets the values range for the pagination
              if (idx < pageRows * (page + 1) && idx >= pageRows * page)
                return (
                  <TableRow key={`keyx-${idx}`}>
                    <TableCell align='center'>{dID}</TableCell>
                    <TableCell align='center'>
                      {deviceAndKeyXObj[dID] ? (
                        <Tooltip title={`Device ${dID} has KeyX file`}>
                          <Icon icon={'check'} htmlColor={theme.palette.success.main} />
                        </Tooltip>
                      ) : (
                        <UploadKeyXBtn text={'Upload KeyX'} />
                      )}
                    </TableCell>
                  </TableRow>
                );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component='div'
        count={Object.keys(deviceAndKeyXObj).length}
        page={page}
        rowsPerPageOptions={[]}
        onPageChange={handleChangePage}
        rowsPerPage={ROWS_PER_PAGE}
      />
    </Paper>
  );
};
