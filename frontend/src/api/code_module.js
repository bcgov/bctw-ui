import needle from 'needle';
import { createOptions, createUrl, handleFetchResult} from './api_helpers';

const codeModule = {
  state: () => ({
    codes: {
      region: [] // must define known code headers here to make it reactive
    },
  }),
  mutations: {
    writeCodes (state, payload) {
      state.codes[payload.codeHeader] = [ ...payload.body[0]];
    },
  },
  getters: {
  },
  // payload: {body: any, callback: () => void}
  actions: {
    async requestCodes (context, payload) {
      const header = payload.body;
      if (!header) return;
      //  if already loaded dont need to again
      // fixme: on insert of new codes?
      if (context.state.codes[header] && context.state.codes[header].length) {
        return; 
      } 
      const url = createUrl(context, 'get-code', `&codeHeader=${header}`);
      try {
        const response = await needle('get', url, createOptions({}));
        if (response && response.statusCode === 200) {
          context.commit('writeCodes',{ codeHeader: header, body: response.body });
        }
      } catch (err) {
        console.log(`err fetching ${header} codes: ${err}`);
      }
    },
    async upsertCodeHeader(context, payload) {
      const url = createUrl(context, 'add-code-header')
      try {
        const response = await needle('post', url, payload.body); 
        if (response && response.statusCode === 200) {
          payload.callback(response.body[0]);
        } else payload.callback({}, response.body);
      } catch (err) {
        payload.callback(null, err);
      } 
    },
    async uploadCsv(context, payload) {
      const url = createUrl(context, 'import');
      // fixme: some kind of issue with needle/multer.
      // figure out how to send this with needle so that multer can properly grab the file?
      try {
        const response = await fetch(url, {method: 'POST', body: payload.body})
        handleFetchResult(response, payload.callback);
      } catch (e) {
        payload.callback(null, e)
      }
    },
  }
}

export {
  codeModule
}