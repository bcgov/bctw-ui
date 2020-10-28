import needle from 'needle';
import {createOptions, createUrl} from './api_helpers';

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
  actions: {
    async requestCodes (context, payload) {
      const header = payload.codeHeader;
      if (!header) return;
      if (context.state.codes[header] && context.state.codes[header].length) return; 
      const url = createUrl(context, 'get-code', `&codeHeader=${payload.codeHeader}`);
      try {
        const response = await needle('get', url, createOptions({}));
        const body = response.body;
        context.commit('writeCodes',{ codeHeader: payload.codeHeader, body });
      } catch (err) {
        console.log(`err fetching ${header} codes: ${err}`);
      }
    },
    async upsertCodeHeader(context, payload) {
      const url = createUrl(context, 'add-animal')
      const options = createOptions({});
      needle.post(url, payload.animal, options, (err, resp) => {
        if (err) {
          return console.error('unable to upsert animal',err)
        };
        const body = resp.body['add_animal'];
        context.commit('updateAnimals', payload.animal);
      });
      payload.callback();
    }
  }
}

export {
  codeModule
}