import Box from '@mui/material/Box';
import DataTable from 'components/table/DataTable';
import { CritterStrings, CritterStrings as CS, MapStrings } from 'constants/strings';
import { RowSelectedProvider } from 'contexts/TableRowSelectContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import EditCritter from 'pages/data/animals/EditCritter';
import ExportViewer from 'pages/data/bulk/ExportImportViewer';
import AddEditViewer from 'pages/data/common/AddEditViewer';
import ManageLayout from 'pages/layouts/ManageLayout';
import { SyntheticEvent, useEffect, useState } from 'react';
import { Animal, AttachedAnimal } from 'types/animal';
import { QueryStatus } from 'react-query';
import { columnToHeader, doNothing, doNothingAsync, headerToColumn, omitNull } from 'utils/common_helpers';
import { SpeciesProvider } from 'contexts/SpeciesContext';
import DateInput from 'components/form/Date';
import dayjs from 'dayjs';
import { eInputType, FormFieldObject, InboundObj, parseFormChangeResult } from 'types/form_types';
import Select from 'components/form/BasicSelect';
import { Button } from 'components/common';
import { CircularProgress, Grid, Tab, Tabs, Typography } from '@mui/material';
import { CreateFormField } from 'components/form/create_form_components';
import { wfFields } from 'types/events/event';
import { BCTWFormat } from 'types/common_types';
import SelectCode from 'components/form/SelectCode';
import { formatDay } from 'utils/time';
import { ICodeFilter } from 'types/code';
import download from 'downloadjs';
import tokml from 'tokml';
import { LoadingButton } from '@mui/lab';
import makeStyles from '@mui/styles/makeStyles';

type ColumnOptions = 'species' | 'population_unit' | 'wlh_id' | 'animal_id' | 'device_id' | 'frequency';

export interface IFormRowEntry {
    column: ColumnOptions;
    operator: string;
    value: Array<string>;
    formField: PossibleColumnValues;
}

class PossibleColumnValues implements BCTWFormat<PossibleColumnValues> {
    species: string[];
    population_unit: string[];
    wlh_id: string;
    animal_id: string;
    device_id: string;
    frequency: string;

    get displayProps(): (keyof PossibleColumnValues)[] {
        return ['species', 'population_unit', 'wlh_id', 'animal_id', 'device_id', 'frequency'];    
    }

    formatHeaderAsProp(k: string): string {
        return headerToColumn(k);
    }

    formatPropAsHeader(k: keyof PossibleColumnValues): string {
        switch (k) {
            default:
                return columnToHeader(k);
        }
    }
}

enum TabNames {
    quick = 'Quick Export',
    advanced = 'Advanced Export'
}


const useStyle = makeStyles((theme) => ({
    MuiCircularProgress: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      height: '20px !important',
      width: '20px !important',
      marginLeft: '-17px',
      marginTop: '-10px'
    }
  }));



export default function ExportPageV2 (): JSX.Element {
    const api = useTelemetryApi();
    
    const operators: string[] = ['Equals','Not Equals'];
    const [start, setStart] = useState(dayjs().subtract(3, 'month'));
    const [end, setEnd] = useState(dayjs());
    const [rows, setRows] = useState<IFormRowEntry[]>([{column: 'species', operator: '', value: [], formField: new PossibleColumnValues}]);
    const [tab, setTab] = useState<TabNames>(TabNames.quick);
    const [formsFilled, setFormsFilled] = useState(false);
    const [collarIDs, setCollarIDs] = useState([]);
    const styles = useStyle();
    const formFields: PossibleColumnValues = new PossibleColumnValues();


    //Duplicate from MapExport.tsx, so should probably be yanked out and imported from elsewhere-----------
    const formatResultAsCSV = (data: unknown[]): string => {
        const headers = Object.keys(data[0]).join();
        const values = data.map(d => Object.values(d).join()).join('\n')
        const ret = `${headers}\n${values}`;
        return ret;
    }
    const formatResultAsKML = (data: Record<string, unknown>[][]): string => {
        const flattened: Record<string,unknown>[] = data.flatMap(d => omitNull(d));
        const asGeoJSON = flattened.map((d, i) => {
          const withoutGeom = Object.assign({}, d);
          // remove objects from the geojson feature.
          delete withoutGeom.geom;
          return { 
            type: 'Feature',
            id: i,
            geometry: d.geom,
            properties: withoutGeom 
          }
        })
        const ret = tokml({type: 'FeatureCollection', features: asGeoJSON})
        return ret;
      }
    //-----------------------------------------------------------------------------------------------------

    const onSuccessExportAll = (data): void => {
        if(data && data.length) {
            const result = formatResultAsCSV(data);
            const filename = 'telemetry_export_advanced.csv';
            download(result, filename); 
        }
    }

    const onErrorExportAll = (err): void => {
        console.log(err);
    }

    const onSuccessExport = (data): void => {
        if(data && data.length) {
            const result = formatResultAsKML(data);
            const filename = 'telemetry_export_simple.kml';
            download(result, filename, 'application/xml'); 
        }
    }

    const onErrorExport = (err): void => {
        console.log(err);
    }

    useEffect(() => {
        areFieldsFilled();
    }, [rows]);

    const {mutateAsync: mutateExportAll, reset: resetExportAll, isLoading: loadingExportAll } = api.useExportAll({onSuccess: onSuccessExportAll, onError: onErrorExportAll});
    const {mutateAsync: mutateExport, reset: resetExport, isLoading: loadingExport} = api.useExport({onSuccess: onSuccessExport, onError: onErrorExport});

    const isTab = (tabName: TabNames): boolean => tabName === tab;

    const handleChangeDate = (v: InboundObj): void => {
        const [key, value] = parseFormChangeResult(v);
        key === 'tstart' ? setStart(dayjs(String(value))) : setEnd(dayjs(String(value)));
    };

    const handleAddNewRow = (): void => {
        setRows([...rows, {column: 'species', operator: '', value: [], formField: new PossibleColumnValues}]);
    }

    const handleRemoveRow = (): void => {
        if(rows.length < 2) {
            return;
        }
        setRows(rows.slice(0, -1));
    }

    /*
    const handleColumnChange = (newval: string, objkey: keyof IFormRowEntry, idx: number) : void => {
        const o = rows[idx];
        o[objkey] = objkey === 'column' ? newval as ColumnOptions : newval;
        setRows([...rows.slice(0, idx), o , ...rows.slice(idx+1)]);
    }*/

    const areFieldsFilled = (): void => {
        if(rows.some(o => o.operator == '' || o.value.length < 1)) {
            setFormsFilled(false);
            return;
        }
        setFormsFilled(true);
        return;
    }

    const operatorTranslation = (operatorWord: string): string => {
        switch(operatorWord) {
            case "Equals":
                return "=";
            case "Not Equals":
                return "<>";
            default:
                return "";
        }
    }

    const handleAdvancedExportClick = (): void => {
        const body = {queries: [], range: {}};
        for(const row of rows) {
            body.queries.push({
                key: row.column,
                operator: operatorTranslation(row.operator),
                term: row.value.map(o => o.toString().toLowerCase())
            });
        }
        body.range = {
            start: start.format(formatDay),
            end: end.format(formatDay)
        }
        console.log("Sending this body: " + body);
        mutateExportAll(body);
    }

    const handleSimpleExportClick = (): void => {
        const body = {
            collar_ids: collarIDs,
            type: 'movement',
            range: {
                start: start.format(formatDay),
                end: end.format(formatDay)
            }
        }
        console.log("Sending this body: " + body);
        mutateExport(body);
    }

    const handleDataTableSelect = (selected: AttachedAnimal[]): void => {
        const ids = selected.map(v => v.collar_id);
        setCollarIDs(ids);
    }

    const handleColumnChange = (newval: string, idx: number): void => {
        const o = rows[idx];
        o.column = formFields.formatHeaderAsProp(newval) as ColumnOptions;
        setRows([...rows.slice(0, idx), o , ...rows.slice(idx+1)]);
    }

    const handleOperatorChange = (newval: string, idx: number): void => {
        const o = rows[idx];
        o.operator = newval;
        setRows([...rows.slice(0, idx), o , ...rows.slice(idx+1)]);
    }

    const handleValueChange = (newval: Record<string, unknown>, idx: number): void => {
        if(newval === undefined) {
            return;
        }
        const o = rows[idx];
        const strval = newval[o.column] as string;
        //o.value = strval;
        console.log(`Handling ${o.column} change: ` + newval[o.column] as string);
        if(['population_unit', 'species'].includes(o.column) === false) {
            //console.log(strval.replace(/\s+/g, '').split(','));
            o.value = strval.replace(/\s+/g, '').split(',');
            const ff = new PossibleColumnValues;
            const key: keyof typeof PossibleColumnValues = o.column as keyof typeof PossibleColumnValues;
            ff[key] = strval as string;
            o.formField = ff;
            //formFields[o.column] = strval;
            console.log("Setting formFields " + JSON.stringify(formFields));
        }
        setRows([...rows.slice(0, idx), o , ...rows.slice(idx+1)]);
    }

    const handleDropdownChange = (newval: ICodeFilter[], idx: number): void => {
        const o = rows[idx];
        o.value = newval.map(n => n.description.toString());
        const ff = new PossibleColumnValues;
        const key: keyof typeof PossibleColumnValues = o.column as keyof typeof PossibleColumnValues;
        ff[key]= o.value;
        o.formField = ff;
        console.log(newval);
        console.log(o.value);
        setRows([...rows.slice(0, idx), o , ...rows.slice(idx+1)]);
    }

    const handleChangeTab = (event: SyntheticEvent<Element>, newVal: TabNames): void => {
        setTab(newVal);
    }

    const getFormFieldObjForColumn = (col: ColumnOptions): FormFieldObject<any> => {
        const ff = wfFields.get(col);
        if(col === 'device_id' || col == 'frequency') {
            ff.type = eInputType.text;
        }
        return ff;
    }
    //{CreateFormField(formFields, wfFields.get(rows[idx].column), () => {})}
    //<SelectCode codeHeader='species' defaultValue='' changeHandler={() => {}} required={false} propName={'species'}></SelectCode>
    return( 
    <ManageLayout> 
    <h1>Export Animal Telemetry</h1>
    <Tabs value={tab} sx={{borderBottom: 1, borderColor: 'divider'}} onChange={handleChangeTab}>
        <Tab label={"Quick Export"} value={TabNames.quick} />
        <Tab label={"Advanced Export"} value={TabNames.advanced} />
    </Tabs>
    <h2>Specify Date Range</h2>
        <Grid container spacing ={2}>
            <Grid item sm={2}>
                <DateInput
                fullWidth
                propName='tstart'
                label={MapStrings.startDateLabel}
                defaultValue={dayjs(start)}
                changeHandler={handleChangeDate}
                //maxDate={dayjs(end)}
                />
            </Grid>
            <Grid item sm={2}>
                <DateInput
                fullWidth
                propName='tend'
                label={MapStrings.endDateLabel}
                defaultValue={dayjs(end)}
                changeHandler={handleChangeDate}
                //maxDate={dayjs(end)}
                />
            </Grid>
        </Grid>
    {isTab(TabNames.quick) && (
        <>
        <h2>Simple Export</h2>
        <Box mb={4}>
            <DataTable
            headers={AttachedAnimal.attachedCritterDisplayProps}
            title={CS.assignedTableTitle}
            onSelectMultiple={ handleDataTableSelect }
            queryProps={{ query: api.useAssignedCritters }}
            isMultiSelect
            /*onSelect={handleSelect}
            deleted={deleted}
            updated={updated}*/
            />
        </Box>
        <LoadingButton
            style={{padding: '8px 22px', lineHeight: '26.25px'}} 
            className='form-buttons' 
            variant='contained'
            loading={loadingExport}
            disabled={!collarIDs.length}
            loadingIndicator={<CircularProgress className={styles.MuiCircularProgress} color='inherit' size={16} />}
            onClick={() => {handleSimpleExportClick()}}>
                Export Selected Data
        </LoadingButton>
        </>
        )
    }
    {isTab(TabNames.advanced) && (
    <>
    <h2>Advanced Export</h2>
    <h4>Export all critters where...</h4>
        <Box width={800}>
        
        {rows.map((row, idx) => (
            <>
            <Select className='query-builder-column' label={'Column'} defaultValue={formFields.formatPropAsHeader(row.column)} values={formFields.displayProps.map(o => formFields.formatPropAsHeader(o))} handleChange={(str) => handleColumnChange(str, idx)}></Select>
            <Select className='query-builder' label={'Operator'} defaultValue={row.operator} values={operators} handleChange={(str) => handleOperatorChange(str, idx)}></Select>
            {CreateFormField(rows[idx].formField, getFormFieldObjForColumn(rows[idx].column), (v) => {handleValueChange(v, idx)}, {handleChangeMultiple: (v) => handleDropdownChange(v, idx), multiple: true, style: {minWidth: '300px'}})}
            {idx < rows.length - 1 && (<Typography marginTop={'7px'} display={'inline-block'} maxWidth={'100px'} variant={'h6'}>AND</Typography>)}
            </>
        ))}
            <Box className='form-buttons'>
                <Button className='form-buttons' onClick={() => handleAddNewRow()}>Add Additional Parameter</Button>
                <Button className='form-buttons' onClick={() => handleRemoveRow()}>Remove a Parameter</Button>
                <LoadingButton 
                    style={{padding: '8px 22px', lineHeight: '26.25px'}} 
                    className='form-buttons' 
                    variant='contained' 
                    loading={loadingExportAll} 
                    disabled={!formsFilled} 
                    onClick={() => handleAdvancedExportClick() }
                    loadingIndicator={<CircularProgress className={styles.MuiCircularProgress} color='inherit' size={16} />}>
                    Export From Query
                </LoadingButton>
            </Box>
        </Box>
        </>
    )}
    
        
    </ManageLayout>
    )
}