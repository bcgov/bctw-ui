import { ITableQueryProps } from 'api/api_interfaces';
import Table from 'components/table/Table';

type IHistoryPageProps<T> = {
  historyQuery: 'useCollarHistory' | 'useCritterHistory' | ''; // query used to retrieve table data
  itemId: string; // display this critter's change history
  propsToDisplay: string[]; // properties to display in history table
};

export default function HistoryPage<T>(props: IHistoryPageProps<T>): JSX.Element {
  const { historyQuery, itemId, propsToDisplay } = props;

  const handleSelect = (row) => {
    // do nothing
  };

  const tableProps: ITableQueryProps<T> = {
    query: historyQuery,
    queryParam: itemId,
    onNewData: (): void => {
      /* do nothing */
    }
  };

  if (historyQuery === '') {
    return <div>no history to display.</div>
  }
  return (
    <>
      <Table
        headers={propsToDisplay}
        queryProps={tableProps}
        onSelect={handleSelect}
        rowIdentifier='transaction_id'
      />
    </>
  );
}
