import { List as MUIList, ListItem } from '@mui/material';

type ListProps = {
  values: string[] | JSX.Element[];
  disableGutters?: boolean;
};

/**
 * renders a simple list component
 * @param values that are rendered as the list items
 * can be either plain strings or components
*/
const List = ({ values, disableGutters }: ListProps): JSX.Element => {
  const MakeListItem = (v: string | JSX.Element, i: number): JSX.Element => (
    <ListItem disableGutters={disableGutters} dense key={`li-${i}`}>
      {v}
    </ListItem>
  );
  return (
    <MUIList>
      {typeof values[0] === 'string'
        ? (values as string[]).map((v, i) => MakeListItem(v, i))
        : (values as JSX.Element[]).map((v, i) => MakeListItem(v, i))}
    </MUIList>
  );
};
export default List;
