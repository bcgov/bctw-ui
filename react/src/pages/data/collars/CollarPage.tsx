import { useTelemetryApi } from 'hooks/useTelemetryApi';

export default function CollarPage() {
  const bctwApi = useTelemetryApi();
  const timeWindow = [-2,-1];
  const pingExtent = new Date().toISOString().slice(0, 10);
  const { status, data, error, isFetching } = bctwApi.usePings({timeWindow, pingExtent});
  if (isFetching) {
    return <div> loading...</div>;
  }
  if (error) {
    return <div> error: {error?.message}</div>;
  }
  return (
    <div>some collars go here</div>
  )
}