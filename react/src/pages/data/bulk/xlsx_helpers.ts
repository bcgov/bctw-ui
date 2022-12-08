import { WarningInfo, ParsedXLSXSheetResult } from 'api/api_interfaces';
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

const collectErrorsFromResults = (results: ParsedXLSXSheetResult): string[] => {
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

const collectWarningsFromResults = (results: ParsedXLSXSheetResult): WarningInfo[] => {
  const warnArr = [];
  results.rows.forEach((r, idx) => {
    warnArr.push(
      ...r.warnings.map((warnobj) => {
        return {
          message: `Row ${idx + 2}: ${warnobj.message}`,
          help: warnobj.help,
          prompt: warnobj.prompt,
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
