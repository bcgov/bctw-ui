import needle, { NeedleResponse } from 'needle';
import { createOptions, createUrl, createUrl2 } from './api_helpers';
import { ActionGetPayload } from '../types/store';
import { Collar, decodeCollar, NewCollarType } from '../types/collar';

const collarModule = {
  state: () => ({
    availableCollars: [],
    assignedCollars: [],
    newCollarType: NewCollarType.Other,
  }),
  mutations: {
    writeAvailableCollars(state, collars) {
      const newIds = collars.map((c: Collar) => c.device_id);
      const filtered = state.availableCollars.filter((c: Collar) => !newIds.includes(c.device_id));
      state.availableCollars = [...filtered, ...collars];
    },
    writeAssignedCollars(state, collars) {
      const newIds = collars.map((c: Collar) => c.device_id);
      const filtered = state.assignedCollars.filter((c: Collar) => !newIds.includes(c.device_id));
      state.assignedCollars = [...filtered, ...collars];
    },
    // insert new collars to [availableCollars]
    upsertCollars(state, collars) {
      const newIds = collars.map((c: Collar) => c.device_id);
      const filtered = state.availableCollars.filter((c: Collar) => !newIds.includes(c.device_id));
      state.availableCollars = [...collars, ...filtered];
    },
    updateNewCollarType(state, ct) {
      state.newCollarType = ct;
    },
  },
  getters: {
    assignedCollars(state) {
      return state.assignedCollars;
    },
    availableCollars(state) {
      return state.availableCollars;
    },
    newCollarType(state) {
      return state.newCollarType;
    },
  },
  actions: {
    async requestCollars(context, callback) {
      await context.dispatch('getAvailableCollars', {callback});
      await context.dispatch('getAssignedCollars', {callback});
      callback();
    },
    async getAvailableCollars(context, payload: ActionGetPayload) {
      const {callback, page} = payload;
      const urlAvail = createUrl2({context, apiString: 'get-available-collars', page});
      const errMsg = `error fetching available collars:`;
      try {
        const response: NeedleResponse = await needle('get', urlAvail, createOptions({}));
        const body = response.body;
        if (response && response.statusCode === 200) {
          const collars: Collar[] = body.map((c: any) => decodeCollar(c));
          context.commit('writeAvailableCollars', collars);
        } else {
          callback(null, `${errMsg} ${body}`);
        }
      } catch (e) {
          callback(null, `${errMsg} ${e}`);
      }
    },
    async getAssignedCollars(context, payload: ActionGetPayload) {
      const {callback, page} = payload;
      const urlAssign = createUrl2({context, apiString: 'get-assigned-collars', page});
      const errMsg = `error fetching assigned collars:`;
      try {
        const response: NeedleResponse = await needle('get', urlAssign, createOptions({}));
        const body = response.body;
        if (response && response.statusCode === 200) {
          const collars: Collar[] = body.map((c: any) => decodeCollar(c));
          context.commit('writeAssignedCollars', collars);
        } else {
          callback(null, `${errMsg} ${body}`);
        }
      } catch (e) {
          callback(null, `${errMsg} ${e}`);
      }
    },
    async resetCollars({dispatch, state}) {
      state.availableCollars = [];
      state.assignedCollars = [];
      await dispatch('requestCollars', () => console.log('collars reloaded'));
    },
    async upsertCollar(context, payload) {
      const {callback, body} = payload;
      const url = createUrl(context, 'add-collar');
      const errMsg = 'unable to save collar:';
      try {
        const response: NeedleResponse = await needle('post', url, body);
        const responseBody = response.body;
        if (response && response.statusCode === 200) {
          const collars: Collar[] = responseBody.map((c: Collar) => decodeCollar(c));
          context.commit('upsertCollars', collars);
          callback(collars);
        } else {
          callback(null, `${errMsg} ${body}`);
        }
      } catch (e) {
          callback(null, `${errMsg} ${e}`);
      }
    },
  },
};

export {
  collarModule,
};
