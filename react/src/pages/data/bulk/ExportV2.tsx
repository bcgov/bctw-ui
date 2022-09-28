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
import { columnToHeader, doNothing, doNothingAsync, headerToColumn } from 'utils/common_helpers';
import { SpeciesProvider } from 'contexts/SpeciesContext';
import DateInput from 'components/form/Date';
import dayjs from 'dayjs';
import { InboundObj, parseFormChangeResult } from 'types/form_types';
import Select from 'components/form/BasicSelect';
import { Button } from 'components/common';
import { Grid, Tab, Tabs, Typography } from '@mui/material';
import { CreateFormField } from 'components/form/create_form_components';
import { wfFields } from 'types/events/event';
import { BCTWFormat } from 'types/common_types';
import SelectCode from 'components/form/SelectCode';
import { formatDay } from 'utils/time';

type ColumnOptions = 'species' | 'population_unit' | 'wlh_id' | 'animal_id' | 'device_id' | 'frequency';

export interface IFormRowEntry {
    column: ColumnOptions;
    operator: string;
    value: string | number;
}

class PossibleColumnValues implements BCTWFormat<PossibleColumnValues> {
    species: string;
    population_unit: string;
    wlh_id: string;
    animal_id: string;
    device_id: number;
    frequency: number;

    get displayProps(): (keyof PossibleColumnValues)[] {
        return ['species', 'population_unit', 'wlh_id', 'animal_id', 'device_id', 'frequency'];    
    }

    formatHeaderAsProp(k: string): string {
        return headerToColumn(k);
    }

    formatPropAsHeader(k: keyof PossibleColumnValues): string {
        switch (k) {
            case "species":
                return "Species"
            case "population_unit":
                return "Population Unit"
            case "wlh_id":
                return "WLH ID"
            default:
                return columnToHeader(k);
        }
    }
}

enum TabNames {
    quick = 'Quick Export',
    advanced = 'Advanced Export'
}

export default function ExportPageV2 (): JSX.Element {
    const api = useTelemetryApi();
    
    const operators: string[] = ['=','<>'];
    const [start, setStart] = useState(dayjs().subtract(3, 'month'));
    const [end, setEnd] = useState(dayjs());
    const [rows, setRows] = useState<IFormRowEntry[]>([{column: 'animal_id', operator: '', value: ''}]);
    const [tab, setTab] = useState<TabNames>(TabNames.quick);
    const formFields: PossibleColumnValues = new PossibleColumnValues();

    const onSuccess = (data): void => {
        console.log(data);
    }

    const onError = (err): void => {
        console.log(err);
    }

    const {mutateAsync, reset, isLoading } = api.useExportAll({onSuccess, onError});

    const isTab = (tabName: TabNames): boolean => tabName === tab;

    const handleChangeDate = (v: InboundObj): void => {
        const [key, value] = parseFormChangeResult(v);
        key === 'tstart' ? setStart(dayjs(String(value))) : setEnd(dayjs(String(value)));
    };

    const handleAddNewRow = (): void => {
        setRows([...rows, {column: 'animal_id', operator: '', value: ''}]);
    }

    /*
    const handleColumnChange = (newval: string, objkey: keyof IFormRowEntry, idx: number) : void => {
        const o = rows[idx];
        o[objkey] = objkey === 'column' ? newval as ColumnOptions : newval;
        setRows([...rows.slice(0, idx), o , ...rows.slice(idx+1)]);
    }*/

    const columnTranslation = (column: string): string => {
        switch(column) {
            case "population_unit":
                return "code_name";
            default:
                return column;
        }
    }

    const handleAdvancedExportClick = (): void => {
        const body = {keys: [], operators: [], term: [], range: {}};
        for(const row of rows) {
            body.keys.push(columnTranslation(row.column));
            body.operators.push(row.operator);
            body.term.push(row.value.toString().toLowerCase());
        }
        body.range = {
            start: start.format(formatDay),
            end: end.format(formatDay)
        }
        console.log("Sending this body: " + body);
        mutateAsync(body);
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
        
        const o = rows[idx];
        o.value = newval[o.column] as string;
        console.log("Handling value change: " + newval[o.column] as string);
        setRows([...rows.slice(0, idx), o , ...rows.slice(idx+1)]);
    }

    const handleChangeTab = (event: SyntheticEvent<Element>, newVal: TabNames): void => {
        setTab(newVal);
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
            queryProps={{ query: api.useAssignedCritters }}
            isMultiSelect
            /*onSelect={handleSelect}
            deleted={deleted}
            updated={updated}*/
            />
        </Box>
        <Button >Export Selected Data</Button>
        </>
        )
    }
    {isTab(TabNames.advanced) && (
    <>
    <h2>Advanced Export</h2>
    <h4>Export all critters where...</h4>
        <Box width={600}>
        
        {rows.map((row, idx) => (
            <>
            <Select className='query-builder-column' label={'Column'} defaultValue={row.column} values={formFields.displayProps.map(o => formFields.formatPropAsHeader(o))} handleChange={(str) => handleColumnChange(str, idx)}></Select>
            <Select className='query-builder' label={'Operator'} defaultValue={row.operator} values={operators} handleChange={(str) => handleOperatorChange(str, idx)}></Select>
            {CreateFormField(formFields, wfFields.get(rows[idx].column), (v) => {handleValueChange(v, idx)})}
            </>
        ))}
            <Box className='form-buttons'>
                <Button className='form-buttons' onClick={() => handleAddNewRow()}>Add Additional Parameter</Button>
                <Button className='form-buttons' onClick={() => handleAdvancedExportClick() }>Export From Query</Button>
            </Box>
        </Box>
        </>
    )}
    
        
    </ManageLayout>
    )
}