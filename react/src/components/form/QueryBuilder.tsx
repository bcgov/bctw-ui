import Select from 'components/form/BasicSelect';
import AutoComplete from 'components/form/Autocomplete';
import { Button, Icon } from 'components/common';
import { Box, IconButton, Button as MUIButton } from '@mui/material';
import { useState } from 'react';
import { columnToHeader, headerToColumn } from 'utils/common_helpers';
import makeStyles from '@mui/styles/makeStyles';

export interface IFormRowEntry {
    column: string;
    operator: string;
    value: Array<string>;
}

type IQueryBuilderProps = {
    rows: IFormRowEntry[];
    operators: string[];
    columns: string[];
    data: any[];
    handleColumnChange: (str: string, idx: number) => void;
    handleOperatorChange: (str: string, idx: number) => void;
    handleValueChange: (str: string[], idx: number) => void;
    handleRemoveRow: (idx: number) => void;
    handleAddRow: () => void;
    handleExport: () => void;
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

export default function QueryBuilder (props: IQueryBuilderProps) : JSX.Element {
    const { rows, operators, columns, handleColumnChange, handleOperatorChange, handleValueChange, handleAddRow, handleRemoveRow, handleExport, data} = props;
    const [formsFilled, setFormsFilled] = useState(false);
    const styles = exportStyles();

    const getValidColumnChoices = (ownchoice?: string): string[] => {
        const chosen = rows.map(o => o.column);
        const remaining = columns.filter(o => !chosen.includes(o));
        if(ownchoice !== undefined)
            remaining.unshift(ownchoice);
        return remaining;
    }

    const onAddNewRow = (): void => {
        const firstRemaining = getValidColumnChoices()[0];
        handleAddRow();
    }

    const getUniqueValueOptions = (col) => {
        if(data) {
            const uniqueItemsForColumn = data.map(o => o[col]).filter((v, i, a) => v && a.indexOf(v) === i);
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

    return (
        <>
        {rows.map((row, idx) => (
            <>
            <Select 
                className={styles.queryBuilderCol}
                label={'Column'} 
                defaultValue={columnToHeader(row.column)}
                triggerReset={row.column}
                values={getValidColumnChoices(row.column).map(o => columnToHeader(o))} 
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
                changeHandler={(o) => {handleValueChange(o, idx)}}
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
                    disabled={rows.length == columns}
                    size='large'
                    startIcon={<Icon icon='plus'/>}
                    variant='text'
                    onClick={() => handleAddRow()}
                >Add Parameter
                </MUIButton>
                <Button
                    className={styles.rightJustifyButton}
                    disabled={!formsFilled} 
                    onClick={() => {handleExport()}}>
                    Export
                </Button>
            </Box>
        </>
    )
}