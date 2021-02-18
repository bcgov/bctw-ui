import Table from 'components/table/Table';
import { ITableQueryProps, ITableSortProp } from 'components/table/table_interfaces';

export type IHistoryPageProps<T> = ITableQueryProps<T> & {
  propsToDisplay: string[];
};

export default function HistoryPage<T>(props: IHistoryPageProps<T>): JSX.Element {
  const { query, param, propsToDisplay } = props;
  const handleSelect = (): void => {
    // do nothing
  };

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
    // fixme: need history table row identifier
    <Table headers={propsToDisplay} queryProps={tblProps} onSelect={handleSelect} /*rowIdentifier='transaction_id' *//>
  );
}
