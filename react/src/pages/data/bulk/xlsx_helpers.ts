import { WarningInfo, ParsedXLSXSheetResult, CheckedWarningInfo } from 'api/api_interfaces';
import { Animal } from 'types/animal';
import { Collar } from 'types/collar';
import { columnToHeader } from 'utils/common_helpers';

const computeXLSXCol = (idx: number): string => {
  let str = '';
  const a = Math.trunc(idx / 26);
  if (a > 0) {
    str = str.concat(String.fromCharCode(65 + a - 1));
  }
  str = str.concat(String.fromCharCode(65 + (idx - a * 26)));

  return str;
};

const collectErrorsFromResultsOld = (results: ParsedXLSXSheetResult): string[] => {
  const errArr = [];
  results.rows.forEach((r, idx) => {
    errArr.push(
      ...Object.keys(r.errors).map((e) => {
        const headerIdx = results.headers.indexOf(e);
        return e === 'identifier' || e === 'missing_data'
          ? `Row ${idx + 2}: ${r.errors[e].desc}`
          : `At cell ${computeXLSXCol(headerIdx)}${idx + 2} in column "${columnToHeader(e)}": ${r.errors[e].desc}`;
      })
    );
  });
  return errArr;
};

interface FormattedErrorEntry {
    desc: string;
    cells: string[];
    type: 'cell' | 'row';
}

type FormattedErrorDict = {
    [key in (keyof Animal | keyof Collar)]?: FormattedErrorEntry;
}

const collectErrorsFromResults = (results: ParsedXLSXSheetResult): string[] => {
    const dict: FormattedErrorDict = {};
    results.rows.forEach((r, idx) => {
        Object.keys(r.errors).forEach(errKey => {
            const headerIdx = results.headers.indexOf(errKey);
            if(!dict[errKey]) {
                dict[errKey] = {desc: r.errors[errKey].desc, cells: []};
                dict[errKey].type = errKey === 'identifier' || errKey === 'missing_data' ? 'row' : 'cell';
            }

            if(dict[errKey].type == 'cell')
                dict[errKey].cells.push(`${computeXLSXCol(headerIdx)}${idx + 2}`);
            else
                dict[errKey].cells.push(`${idx + 2}`);
        });
    });
    
    const retStr = [];
    for(const _key of Object.keys(dict)) {
        const entries = dict[_key].cells.length > 3 ? `${dict[_key].cells.slice(0,4).join(', ')} and ${dict[_key].cells.length - 3} others` : dict[_key].cells.join(', ');
        if(dict[_key].type == 'cell') {
            retStr.push(`At cell ${entries} in column "${columnToHeader(_key)}": ${dict[_key].desc}`)
        }
        else {
            retStr.push(`Row ${entries}: ${dict[_key].desc}`)
        }
    }
    return retStr;
}

const collectWarningsFromResults = (results: ParsedXLSXSheetResult): WarningInfo[] => {
  const warnArr = [];
  results.rows.forEach((r, idx) => {
    warnArr.push(
      ...r.warnings.map((warnobj) => {
        return {
          message: `Row ${idx + 2}: ${warnobj.message}`,
          help: warnobj.help,
          checked: false,
          row: idx //Not + 2 indexed. Used in UI table
        };
      })
    );
  });
  return warnArr;
};

const getAllUniqueKeys = (result: ParsedXLSXSheetResult) => {
  const keySet = new Set(result.rows.map((o) => Object.keys(o.row)).flat());
  return result.headers.filter((o) => keySet.has(o)); //Note that Set.has() is O(1), so I think this is fine.
};

export { computeXLSXCol, collectErrorsFromResults, collectWarningsFromResults, getAllUniqueKeys };
