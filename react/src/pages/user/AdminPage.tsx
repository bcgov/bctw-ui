import { CircularProgress } from '@material-ui/core';
// import Table from 'components/table/Table';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { User } from 'types/user';

// const useDataStyles = makeStyles((theme: Theme) => createStyles({}));

// fixme: broken table only in this view?
export default function AdminPage(): JSX.Element {
  // const classes = useDataStyles();
  const bctwApi = useTelemetryApi();
  // const tableProps: ITableQueryProps<Animal> = {
  //   query: 'user',
  // };

  const { isError, data, error, isFetching, isLoading } = (bctwApi as any).useUsers();
  if (isError) {
    return <div>error : {error.message}</div>;
  }
  if (isLoading || isFetching) {
    return <CircularProgress />;
  }

  return (
    <>
      <div>admin page</div>
      <div>
        {data.map((p: User) => {
          return (<p key={p.id}> id: {p.id} idir: {p.idir} email: {p.email} role: {p.role_type} </p>);
        })}
      </div>
    </>
  );
}
