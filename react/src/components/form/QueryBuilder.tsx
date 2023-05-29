import Select from 'components/form/BasicSelect';
import AutoComplete from 'components/form/Autocomplete';
import { Button, Icon } from 'components/common';
import { Box, IconButton, Button as MUIButton } from '@mui/material';
import { useEffect, useState } from 'react';
import { columnToHeader, headerToColumn } from 'utils/common_helpers';
import makeStyles from '@mui/styles/makeStyles';
import { ISelectMultipleData } from './MultiSelect';
import { Critter, AttachedCritter } from 'types/animal';
import { AttachedCollar, Collar } from 'types/collar';

export type QueryBuilderOperator = 'Equals' | 'Not Equals';
export type QueryBuilderColumn = string;
export type QueryBuilderData = Record<string, any>; // | Animal | AttachedAnimal | Collar | AttachedCollar;

export interface IFormRowEntry {
  column: QueryBuilderColumn;
  operator: QueryBuilderOperator | '';
  value: string[];
}

type IQueryBuilderProps<T extends ISelectMultipleData> = {
  operators: QueryBuilderOperator[];
  columns: QueryBuilderColumn[];
  data: QueryBuilderData[];
  handleRowsUpdate?: (r: IFormRowEntry[]) => void;
};

const exportStyles = makeStyles(() => ({
  queryBuilderCol: {
    display: 'inline-flex',
    marginRight: '0.5rem',
    marginBottom: '1rem',
    width: '200px'
  },
  queryBuilderOp: {
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

/*
 * Query Builder, originally made for the Export page.
 * This component is intended to assist in building custom DB queries from the frontend, but does not necessarily generate any SQL itself.
 * This component appears as a list of rows of three form fields, the first two being dropdowns and the last being an AutoSelect.
 * You are intended to pass props corresponding to columns in the table you intend to query, as well as operations to use on the Value Autocomplete field.
 * Autocomplete options are filled according to keys in the data prop which correspond to your columns
 */
export default function QueryBuilder<T extends ISelectMultipleData>(props: IQueryBuilderProps<T>): JSX.Element {
  const { operators, columns, handleRowsUpdate, data } = props;
  const [rows, setRows] = useState<IFormRowEntry[]>([{ column: 'taxon', operator: 'Equals', value: [] }]);
  const styles = exportStyles();

  useEffect(() => {
    handleRowsUpdate(rows);
  }, [rows]);

  const handleRemoveRow = (idx: number): void => {
    if (rows.length < 2) {
      return;
    }
    setRows([...rows.slice(0, idx), ...rows.slice(idx + 1)]);
  };

  const getValidColumnChoices = (ownchoice?: QueryBuilderColumn): QueryBuilderColumn[] => {
    const chosen = rows.map((o) => o.column);
    const remaining = columns.filter((o) => !chosen.includes(o));
    if (ownchoice !== undefined) remaining.unshift(ownchoice);
    return remaining;
  };

  const handleAddNewRow = (): void => {
    const firstRemaining = getValidColumnChoices()[0];
    setRows([...rows, { column: firstRemaining, operator: 'Equals', value: [] }]);
  };

  const handleColumnChange = (newval: string, idx: number): void => {
    const o = rows[idx];
    o.column = headerToColumn(newval) as QueryBuilderColumn;
    o.value = [];
    setRows([...rows.slice(0, idx), o, ...rows.slice(idx + 1)]);
  };

  const handleOperatorChange = (newval: string, idx: number): void => {
    const o = rows[idx];
    o.operator = newval as QueryBuilderOperator;
    setRows([...rows.slice(0, idx), o, ...rows.slice(idx + 1)]);
  };

  const handleAutocompleteChange = (newVals, idx) => {
    const o = rows[idx];
    o.value = newVals.map((n) => n.value);
    setRows([...rows.slice(0, idx), o, ...rows.slice(idx + 1)]);
  };

  const getUniqueValueOptions = (col: QueryBuilderColumn) => {
    if (data) {
      const uniqueItemsForColumn: any[] = [];
      const uniqueItemsCollectionUnits: any[] = [];

      if (col === 'collection_units') {
        const tempDict = {};
        for (const d of data) {
          if (d.collection_units) {
            for (const c of d.collection_units) {
              const tRow = rows.find((r) => r.column === 'taxon');
              if (tRow && !tRow.value.includes(d.taxon)) {
                continue;
              }
              tempDict[c.collection_unit_id] = { ...c, taxon: d.taxon };
            }
          }
        }
        uniqueItemsCollectionUnits.push(...Object.values(tempDict));
      } else {
        uniqueItemsForColumn.push(...data.map((o) => o[col]).filter((v, i, a) => v && a.indexOf(v) === i));
      }

      return [
        ...uniqueItemsForColumn.sort().map((f, i) => {
          return {
            id: i,
            value: f,
            displayLabel: f
          };
        }),
        ...uniqueItemsCollectionUnits.sort().map((c, i) => {
          return {
            id: i + uniqueItemsForColumn.length,
            value: c.collection_unit_id,
            displayLabel: `${c.taxon} | ${c.category_name} | ${c.unit_name}`
          };
        })
      ];
    } else {
      return [{ id: 0, value: 'Loading...', displayLabel: 'Loading...' }];
    }
  };

  return (
    <>
      {rows.map((row, idx) => (
        <>
          <Select
            className={styles.queryBuilderCol}
            label={'Column'}
            defaultValue={columnToHeader(row.column)}
            triggerReset={row.column}
            values={getValidColumnChoices(row.column).map((o) => columnToHeader(o))}
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
            label={'Value'}
            data={getUniqueValueOptions(row.column)}
            defaultValue={row.value.map((o, i) => {
              return { id: i, value: o, displayLabel: o };
            })}
            changeHandler={(o) => {
              handleAutocompleteChange(o as T[], idx);
            }}
            triggerReset={row.column}
            isMultiSearch
            resetToDefaultValue
            tagLimit={2}
            sx={{ display: 'inline-flex', marginBottom: '1rem' }}
            width={400}
          />
          {rows.length > 1 && (
            <>
              <IconButton
                style={{ marginBottom: '5px' }}
                color='default'
                size='small'
                onClick={() => {
                  handleRemoveRow(idx);
                }}>
                <Icon icon='delete' />
              </IconButton>
            </>
          )}
          <div></div>
        </>
      ))}
      <Box display='flex'>
        <MUIButton
          disabled={rows.length == columns.length}
          size='large'
          startIcon={<Icon icon='plus' />}
          variant='text'
          onClick={() => handleAddNewRow()}>
          Add Parameter
        </MUIButton>
      </Box>
    </>
  );
}
