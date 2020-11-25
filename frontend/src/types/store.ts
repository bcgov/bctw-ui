type ActionCallback = (body: any, err?: Error | string) => void;

type UploadFileCallback = (results: any[], errors: string[]) => void;
interface ActionPayload {
  callback: ActionCallback;
}
interface ActionGetPayload extends ActionPayload {
  page: number;
}

interface ActionPostPayload extends ActionPayload {
  body: any;
}

interface ActionPostFilePayload {
  body: any;
  callback: UploadFileCallback;
}

export {
  ActionCallback,
  ActionGetPayload,
  ActionPostPayload,
  UploadFileCallback,
  ActionPostFilePayload,
};
