type ActionCallback = (body: any, err?: Error | string) => void;
interface ActionPayload {
  callback: ActionCallback;
}
interface ActionGetPayload extends ActionPayload {
  page: number;
}

interface ActionPostPayload extends ActionPayload {
  body: any;
}

export {
  ActionCallback,
  ActionGetPayload,
  ActionPostPayload,
};
