import DataTable from 'components/table/DataTable';
import { ITableQueryProps, ITableSortProp } from 'components/table/table_interfaces';

export type IHistoryPageProps<T> = ITableQueryProps<T> & {
  propsToDisplay: string[];
};

export default function HistoryPage<T>(props: IHistoryPageProps<T>): JSX.Element {
  const { query, param, propsToDisplay } = props;

  const defaultSort: ITableSortProp<T> = { property: 'valid_to' as keyof T, order: 'desc' }
  const tblProps = {
    query,
    param,
    defaultSort
  }

  if (props.query === '') {
    return <div>no history to display.</div>;
  }

  return (
    <DataTable headers={propsToDisplay} queryProps={tblProps}/>
  );
}
