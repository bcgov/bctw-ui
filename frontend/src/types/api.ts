interface FetchPayload {
  body: object;
  callback: (data: any, err?: any) => void;
}

export {
  FetchPayload,
};
