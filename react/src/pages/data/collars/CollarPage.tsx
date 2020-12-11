import { SampleComponentUsingChangesHook } from 'contexts/sample_pouch';

export default function CollarPage() {
  // const bctwApi = useTelemetryApi();
  // const { isError, isFetching, data, error } = bctwApi.usePings({timeWindow, pingExtent});
  // if (isFetching) {
  //   return <div> loading...</div>;
  // }
  // if (isError) {
  //   return <div> error: {error?.message}</div>;
  // }
  return (
    <SampleComponentUsingChangesHook />
  )
}