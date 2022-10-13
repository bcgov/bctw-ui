import Box from '@mui/material/Box';
import DataTable from 'components/table/DataTable';
import { CritterStrings as CS, ExportStrings, MapStrings } from 'constants/strings';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import ManageLayout from 'pages/layouts/ManageLayout';
import { SyntheticEvent, useEffect, useState } from 'react';
import { AttachedAnimal } from 'types/animal';
import { columnToHeader, doNothing, doNothingAsync, headerToColumn, omitNull } from 'utils/common_helpers';
import DateInput from 'components/form/Date';
import dayjs from 'dayjs';
import { eInputType, FormFieldObject, InboundObj, parseFormChangeResult } from 'types/form_types';
import Select from 'components/form/BasicSelect';
import { Button, Icon } from 'components/common';
import Checkbox from 'components/form/Checkbox';
import { Grid, IconButton, Tab, Tabs, Typography, Button as MUIButton } from '@mui/material';
import { CreateFormField } from 'components/form/create_form_components';
import { wfFields } from 'types/events/event';
import { BCTWFormat } from 'types/common_types';
import { ICodeFilter } from 'types/code';
import ExportDownloadModal from './ExportDownloadModal';
import { SpeciesProvider, useSpecies, useUISpecies, useUpdateSpecies } from 'contexts/SpeciesContext';
import AutoComplete from 'components/form/Autocomplete';
import { InfoBanner } from 'components/common/Banner';
import ContainerLayout from 'pages/layouts/ContainerLayout';
import makeStyles from '@mui/styles/makeStyles';

type ColumnOptions = 'species' | 'population_unit' | 'wlh_id' | 'animal_id' | 'device_id' | 'frequency';

export interface IFormRowEntry {
    column: ColumnOptions;
    operator: string;
    value: Array<string>;
    formField: PossibleColumnValues;
}

export interface DateRange {
    start: dayjs.Dayjs,
    end: dayjs.Dayjs
}

export const exportStyles = makeStyles(() => ({
    queryBuilderCol : {
        display: 'inline-flex',
        marginRight: '0.5rem',
        marginBottom: '1rem',
        width: '200px'
    },
    queryBuilderOp : {
        display: 'inline-flex',
        marginRight: '0.5rem',
        marginBottom: '1rem',
        width: '150px'
    },
    rightJustifyButton: {
        marginLeft: 'auto', 
        marginRight: '34px'
    }
}));

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


export enum TabNames {
    quick = 'Quick Export',
    advanced = 'Advanced Export'
}

export default function ExportPageV2 (): JSX.Element {
    const api = useTelemetryApi();
    const styles = exportStyles();
    const operators: string[] = ['Equals','Not Equals'];
    const [start, setStart] = useState(dayjs().subtract(3, 'month'));
    const [end, setEnd] = useState(dayjs());
    const [rows, setRows] = useState<IFormRowEntry[]>([{column: 'species', operator: '', value: [], formField: new PossibleColumnValues}]);
    const [tab, setTab] = useState<TabNames>(TabNames.quick);
    const [formsFilled, setFormsFilled] = useState(false);
    const [collarIDs, setCollarIDs] = useState([]);
    const [critterIDs, setCritterIDs] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedLifetime, setSelectedLifetime] = useState(false);
    const formFields: PossibleColumnValues = new PossibleColumnValues();

    const {data: crittersData, isSuccess: critterSuccess} = api.useAssignedCritters(0);

    useEffect(() => {
        areFieldsFilled();
    }, [rows]);

    useEffect(() => {
        console.log(JSON.stringify(rows));
    }, [rows]);

    const isTab = (tabName: TabNames): boolean => tabName === tab;

    const handleChangeDate = (v: InboundObj): void => {
        const [key, value] = parseFormChangeResult(v);
        key === 'tstart' ? setStart(dayjs(String(value))) : setEnd(dayjs(String(value)));
    };

    const handleAddNewRow = (): void => {
        const firstRemaining = getValidColumnChoices()[0];
        setRows([...rows, {column: firstRemaining as ColumnOptions, operator: '', value: [], formField: new PossibleColumnValues}]);
    }

    const handleRemoveRow = (idx: number): void => {
        if(rows.length < 2) {
            return;
        }
        setRows([...rows.slice(0, idx), ...rows.slice(idx+1)]);
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
        o.column = formFields.formatHeaderAsProp(newval) as ColumnOptions;
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

    //Helper function to determine what column choices to display in the dropdown, avoids duplicate rows.
    const getValidColumnChoices = (ownchoice?: ColumnOptions): string[] => {
        const chosen = rows.map(o => o.column);
        const remaining = formFields.displayProps.filter(o => !chosen.includes(o as ColumnOptions));
        if(ownchoice !== undefined)
            remaining.unshift(ownchoice);
        return remaining;
    }

    //Here we force the fields that would normally be number fields to be text fields instead.
    //Need to do this since they won't be able to input commas for the list otherwise.
    /*const getFormFieldObjForColumn = (col: ColumnOptions): FormFieldObject<any> => {
        const ff = wfFields.get(col);
        if(col === 'device_id' || col == 'frequency') {
            ff.type = eInputType.text;
        }
        return ff;
    }*/
    //<Typography marginTop={'7px'} marginLeft={'7px'} display={'inline-block'} maxWidth={'100px'} variant={'h6'}>AND</Typography>

    const getUniqueValueOptions = (col) => {
        if(crittersData) {
            const uniqueItemsForColumn = crittersData.map(o => o[col]).filter((v, i, a) => v && a.indexOf(v) === i);
            uniqueItemsForColumn.sort();
            return uniqueItemsForColumn.map((f, i) => {
                return {
                    id: i,
                    value: f,
                    displayLabel: f
                }
            })
        }
        else {
            return [{id: 0, value: "Loading...", displayLabel: "Loading..."}];
    }
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
        
        {rows.map((row, idx) => (
            <>
            <Select 
                className={styles.queryBuilderCol}
                label={'Column'} 
                defaultValue={formFields.formatPropAsHeader(row.column)}
                triggerReset={row.column}
                values={getValidColumnChoices(row.column).map(o => formFields.formatPropAsHeader(o as ColumnOptions))} 
                handleChange={(str) => handleColumnChange(str, idx)}
            />
            <Select 
                className={styles.queryBuilderOp} 
                label={'Operator'} 
                defaultValue={row.operator} 
                triggerReset={row.operator}
                values={operators} 
                handleChange={(str) => handleOperatorChange(str, idx)}
            />
            <AutoComplete 
                label={"Value"}
                data={getUniqueValueOptions(row.column)}
                defaultValue={ row.value.map((o, i) => { return {id: i, value: o, displayLabel: o} }) }
                changeHandler={(o) => {handleAutocompleteChange(o, idx)}}
                triggerReset={row.column}
                isMultiSearch
                resetToDefaultValue
                tagLimit={2}
                sx={{display: 'inline-flex', marginBottom: '1rem'}}
                width={400}
            />
            {rows.length > 1 && (
                <>
                <IconButton
                    style={{marginBottom:'5px'}}
                    color='default'
                    size='small'
                    onClick={() => {handleRemoveRow(idx)}}
                >
                    <Icon icon='delete' />
                </IconButton>
                </>
            )}
            <div></div>
            </>
        ))}
            <Box display='flex'>
                <MUIButton 
                    className='form-buttons' 
                    disabled={rows.length == formFields.displayProps.length}
                    size='large'
                    startIcon={<Icon icon='plus'/>}
                    variant='text'
                    onClick={() => handleAddNewRow()}
                >Add Parameter
                </MUIButton>
                <Button
                    className={styles.rightJustifyButton}
                    disabled={!formsFilled} 
                    onClick={() => {setShowModal(true)}}>
                    Export
                </Button>
            </Box>
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