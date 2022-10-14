import Box from '@mui/material/Box';
import DataTable from 'components/table/DataTable';
import { CritterStrings as CS, ExportStrings, MapStrings } from 'constants/strings';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import ManageLayout from 'pages/layouts/ManageLayout';
import { SyntheticEvent, useEffect, useState } from 'react';
import { AttachedAnimal } from 'types/animal';
import { headerToColumn } from 'utils/common_helpers';
import DateInput from 'components/form/Date';
import dayjs from 'dayjs';
import { InboundObj, parseFormChangeResult } from 'types/form_types';
import { Button  } from 'components/common';
import Checkbox from 'components/form/Checkbox';
import { Grid, Tab, Tabs } from '@mui/material';
import ExportDownloadModal from './ExportDownloadModal';
import { InfoBanner } from 'components/common/Banner';
import ContainerLayout from 'pages/layouts/ContainerLayout';
import QueryBuilder, { IFormRowEntry } from 'components/form/QueryBuilder';

export interface DateRange {
    start: dayjs.Dayjs,
    end: dayjs.Dayjs
}

export enum TabNames {
    quick = 'Quick Export',
    advanced = 'Advanced Export'
}

export default function ExportPageV2 (): JSX.Element {
    const api = useTelemetryApi();
    const operators: string[] = ['Equals','Not Equals'];
    const columns: string[] = ['species', 'population_unit', 'wlh_id', 'animal_id', 'device_id', 'frequency'];
    const [start, setStart] = useState(dayjs().subtract(3, 'month'));
    const [end, setEnd] = useState(dayjs());
    const [rows, setRows] = useState<IFormRowEntry[]>([{column: 'species', operator: '', value: []}]);
    const [tab, setTab] = useState<TabNames>(TabNames.quick);
    const [formsFilled, setFormsFilled] = useState(false);
    const [collarIDs, setCollarIDs] = useState([]);
    const [critterIDs, setCritterIDs] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedLifetime, setSelectedLifetime] = useState(false);


    const {data: crittersData, isSuccess: critterSuccess} = api.useAssignedCritters(0);

    useEffect(() => {
        areFieldsFilled();
    }, [rows]);

    const isTab = (tabName: TabNames): boolean => tabName === tab;

    const handleChangeDate = (v: InboundObj): void => {
        const [key, value] = parseFormChangeResult(v);
        key === 'tstart' ? setStart(dayjs(String(value))) : setEnd(dayjs(String(value)));
    };

    const handleAddNewRow = (str): void => {
        setRows([...rows, {column: str, operator: '', value: []}]);
    }

    const handleRemoveRow = (idx: number): void => {
        if(rows.length < 2) {
            return;
        }
        setRows([...rows.slice(0, idx), ...rows.slice(idx+1)]);
    }

    const areFieldsFilled = (): void => {
        if(rows.some(o => o.operator == '' || o.value.length < 1)) {
            setFormsFilled(false);
            return;
        }
        setFormsFilled(true);
        return;
    }


    const handleDataTableSelect = (selected: AttachedAnimal[]): void => {
        const ids = selected.map(v => v.collar_id);
        const critters = selected.map(v => v.critter_id);
        setCollarIDs(ids); //<-- To remove, we probably do not want to do these queries by collar id anymore.
        setCritterIDs(critters);
    }

    const handleColumnChange = (newval: string, idx: number): void => {
        const o = rows[idx];
        //console.log(crittersData.length);
        //console.log(crittersData.map(o => o[formFields.formatHeaderAsProp(newval)]).filter((v, i, a) => a.indexOf(v) === i));
        o.column = headerToColumn(newval);
        o.value = [];
        setRows([...rows.slice(0, idx), o , ...rows.slice(idx+1)]);
    }

    const handleOperatorChange = (newval: string, idx: number): void => {
        const o = rows[idx];
        o.operator = newval;
        setRows([...rows.slice(0, idx), o , ...rows.slice(idx+1)]);
    }

    /*
    * Below, a new PossibleColumnValues is made everytime we change a Value field.
    * This probably isn't really ideal, since it sort of duplicates data, but CreateFormField needs an object of this type to properly
    * handle the defaultValue for the form and have that information persist between re-renders. 
    * A partial refactor to better reflect this is on 710-refactored-row-data, but I shelved it since the fact that PossibleColumnValues is readonly 
    * makes it hard to avoid just spawning more of them.
    * 
    * UPDATE 10/13/2022 - This part may not be needed, but it will depend on what is decided about the next bits of functionality for this page,
    * so I'm leaving it in for now.
    */
    /*
    const handleValueChange = (newval: Record<string, unknown>, idx: number): void => {
        if(newval === undefined) {
            return;
        }
        const o = rows[idx];
        const strval = newval[o.column] as string;
        //o.value = strval;
        //console.log(`Handling ${o.column} change: ` + newval[o.column] as string);
        if(['population_unit', 'species'].includes(o.column) === false) {
            o.value = strval.replace(/\s+/g, '').split(',');
            const ff = new PossibleColumnValues;
            const key = o.column as keyof typeof PossibleColumnValues;
            ff[key] = strval as string;
            o.formField = ff;
        }
        setRows([...rows.slice(0, idx), o , ...rows.slice(idx+1)]);
    }
    
    const handleDropdownChange = (newval: ICodeFilter[], idx: number): void => {
        const o = rows[idx];
        o.value = newval.map(n => n.description.toString());
        const ff = new PossibleColumnValues;
        const key = o.column as keyof typeof PossibleColumnValues;
        ff[key]= o.value;
        o.formField = ff;
        setRows([...rows.slice(0, idx), o , ...rows.slice(idx+1)]);
    }
    */
    const handleAutocompleteChange = (newVals, idx) => {
        const o = rows[idx];
        o.value = newVals.map(n => n.value);
        setRows([...rows.slice(0, idx), o , ...rows.slice(idx+1)]);
    }

    const handleChangeTab = (event: SyntheticEvent<Element>, newVal: TabNames): void => {
        setTab(newVal);
    }

    //{CreateFormField(formFields, wfFields.get(rows[idx].column), () => {})}
    //<SelectCode codeHeader='species' defaultValue='' changeHandler={() => {}} required={false} propName={'species'}></SelectCode>
    //{CreateFormField(rows[idx].formField, getFormFieldObjForColumn(rows[idx].column), (v) => {handleValueChange(v, idx)}, {handleChangeMultiple: (v) => handleDropdownChange(v, idx), required: false, multiple: true, style: {minWidth: '300px'}})}
    return(
    <ManageLayout>
    <h1>Export My Animal Telemetry</h1>
    <Box marginTop={'15px'}>
        <InfoBanner text={ExportStrings.infoBannerMesgs} />
    </Box>
    <ContainerLayout>
    <Tabs value={tab} className='tabs' onChange={handleChangeTab}>
        <Tab label={"Quick Export"} value={TabNames.quick}/>
        <Tab label={"Advanced Export"} value={TabNames.advanced} />
    </Tabs>
    <h2>Specify Date Range</h2>
        <Grid marginBottom={'2rem'} container spacing={2}>
            <Grid item sm={2}>
                <DateInput
                fullWidth
                propName='tstart'
                disabled={selectedLifetime}
                label={MapStrings.startDateLabel}
                defaultValue={dayjs(start)}
                changeHandler={handleChangeDate}
                //maxDate={dayjs(end)}
                />
            </Grid>
            <Grid item sm={2}>
                <DateInput
                fullWidth
                disabled={selectedLifetime}
                propName='tend'
                label={MapStrings.endDateLabel}
                defaultValue={dayjs(end)}
                changeHandler={handleChangeDate}
                //maxDate={dayjs(end)}
                />
            </Grid>
            <Grid item sm={2}>
                <Checkbox
                propName={"animalLifetime"}
                label={"All Telemetry"}
                initialValue={selectedLifetime}
                changeHandler={() => setSelectedLifetime((o) => !o)}
                />
            </Grid>
        </Grid>
    {isTab(TabNames.quick) && (
        <>
        <h2>Select Animals</h2>
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
        <Button     
            className='form-buttons' 
            disabled={!collarIDs.length}
            onClick={() => {setShowModal(true)}}>
                Export
        </Button>
        </>
        )
    }
    {isTab(TabNames.advanced) && (
    <>
    <h2>Build Query</h2>
        <Box width={800}>
            <QueryBuilder
                rows={rows}
                operators={operators}
                columns={columns}
                data={crittersData}
                handleColumnChange={handleColumnChange}
                handleOperatorChange={handleOperatorChange}
                handleValueChange={handleAutocompleteChange}
                handleRemoveRow={handleRemoveRow}
                handleAddRow={handleAddNewRow}
                handleExport={() => setShowModal(true)}
                disabled={!formsFilled}
            />
        </Box>
        </>
    )}
    <ExportDownloadModal 
        exportType={tab} 
        open={showModal} 
        handleClose={() => {setShowModal(false)} } 
        rowEntries={rows} 
        critterIDs={critterIDs}
        collarIDs={collarIDs}
        range={{
            start: selectedLifetime ? dayjs('1970-01-01') : start,
            end: selectedLifetime ? dayjs() : end
        }}>
    </ExportDownloadModal>
    </ContainerLayout>
    </ManageLayout>
    )
}