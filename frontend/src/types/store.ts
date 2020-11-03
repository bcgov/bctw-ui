interface ActionPayload {
  body: any;
  callback: (body: any, err?: Error | string) => void;
}

export {
  ActionPayload,
};
