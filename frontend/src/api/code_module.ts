import needle, { NeedleResponse } from 'needle';
import { createOptions, createUrl, createUrl2, handleFetchResult} from './api_helpers';
import { ICodeHeader } from '../types/code';
import { ActionGetPayload, ActionPostPayload } from '../types/store';

const codeModule = {
  state: () => ({
    codes: {
      // must define known code headers here to make it reactive
      region: [], species: [], population_unit: [], animal_status: [],
    },
    headers: [] as ICodeHeader[],
  }),
  mutations: {
    writeCodes(state, payload) {
      state.codes[payload.codeHeader] = [ ...payload.body[0]];
    },
    writeHeaders(state, body) {
      state.headers = body;
    },
  },
  getters: {
    getHeader: (state) => (headerId): string => {
      const header = state.headers.find((h: ICodeHeader) => h.type === headerId);
      return header?.title ?? headerId;
    },
    headers(state) {
      return state.headers;
    },
    codes(state) {
      return state.codes;
    },
  },
  actions: {
    async requestCodes(context, payload: ActionPostPayload) {
      const header = payload.body;
      if (!header) {
        return;
      }
      //  if already loaded dont need to again
      // fixme: on insert of new codes?
      if (context.state.codes[header] && context.state.codes[header].length) {
        return;
      }
      const url = createUrl2({context, apiString: 'get-code', queryString: `codeHeader=${header}`});
      try {
        const response = await needle('get', url, createOptions({}));
        if (response && response.statusCode === 200) {
          context.commit('writeCodes', { codeHeader: header, body: response.body });
          console.log(`loaded ${response.body[0].length} ${header} codes`);
        }
      } catch (err) {
        console.log(`err fetching ${header} codes: ${err}`);
      }
    },
    async requestHeaders(context, payload: ActionGetPayload) {
      const url = createUrl(context, 'get-code-headers');
      try {
        const response: NeedleResponse = await needle('get', url, createOptions({}));
        if (response && response.statusCode === 200) {
          const body: ICodeHeader[] = response.body;
          context.commit('writeHeaders', body);
          payload.callback(body);
        }
        } catch (err) {
          payload.callback({}, err);
        }
      },
    async upsertCodeHeader(context, payload: ActionPostPayload) {
      const url = createUrl(context, 'add-code-header');
      try {
        const response = await needle('post', url, payload.body);
        if (response && response.statusCode === 200) {
          payload.callback(response.body[0]);
        } else {
          payload.callback({}, response.body);
        }
      } catch (err) {
        payload.callback(null, err);
      }
    },
    async uploadCsv(context, payload) {
      const url = createUrl(context, 'import');
      // fixme: some kind of issue with needle/multer.
      // figure out how to send this with needle so that multer can properly grab the file?
      try {
        const response: Response = await fetch(url, {method: 'POST', body: payload.body});
        handleFetchResult(response, payload.callback);
      } catch (e) {
        payload.callback(null, e);
      }
    },
  },
};

export {
  codeModule,
};
