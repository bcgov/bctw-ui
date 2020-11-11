import needle, { NeedleResponse } from 'needle';
import { createOptions, createUrl, createUrl2, handleFetchResult} from './api_helpers';
import { ActionPostPayload } from '../types/store';
import { Animal } from '../types/animal';
import { decodeCollarAssignment } from '../types/collar_assignment';

const animalModule = {
  state: () => ({
    assignedAnimals: [],
    unassignedAnimals: [],
    critterCollarHistory: [],
  }),
  mutations: {
    // from calling get animals
    writeAssignedAnimals(state, animals) {
      const newIds = animals.map((a: Animal) => a.id);
      const filtered = state.assignedAnimals.filter((a: Animal) => !newIds.includes(a.id));
      state.assignedAnimals = [...filtered, ...animals];
    },
    writeUnassignedAnimals(state, animals) {
      const newIds = animals.map((a: Animal) => a.id);
      const filtered = state.unassignedAnimals.filter((a: Animal) => !newIds.includes(a.id));
      state.unassignedAnimals = [...filtered, ...animals];
    },
    // from upsert/edit critter
    // todo: currently always writing to assigned
    updateAnimals(state, newAnimals: Animal[]) {
      newAnimals.forEach((critter: Animal) => {
        const foundIndex = state.assignedAnimals.findIndex((animal: Animal) => animal.id === critter.id);
        if (foundIndex !== -1) {
          state.assignedAnimals[foundIndex] = Object.assign({}, state.assignedAnimals[foundIndex], critter);
          // console.log(JSON.stringify(state.animals[foundIndex]));
        } else {
          console.log(`${critter.id} : ${critter.nickname}`);
          state.assignedAnimals.unshift(critter);
        }
      });
      // console.log(`num animals ${state.animals.length}`);
    },
    writeCritterCollarHistory(state, payload) {
      state.critterCollarHistory = payload;
    },
  },
  getters: {
    assignedAnimals(state) {
      return state.assignedAnimals;
    },
    unassignedAnimals(state) {
      return state.unassignedAnimals;
    },
    critterCollarHistory(state) {
      return state.critterCollarHistory;
    },
  },
  actions: {
    async getAssignedAnimals(context, payload) {
      const { callback, page } = payload;
      const url = createUrl2({context, apiString: 'get-animals', queryString: 'assigned=true', page});
      try {
        const response: NeedleResponse = await needle('get', url, createOptions({}));
        const body = response.body;
        if (response && response.statusCode === 200) {
          context.commit('writeAssignedAnimals', body);
          callback(body);
        } else {
          callback(null, `error fetching animals: ${body}`);
        }
      } catch (e) {
          callback(null, `error fetching critters ${e}`);
      }
    },
    async getUnassignedAnimals(context, payload) {
      const { callback, page } = payload;
      const url = createUrl2({context, apiString: 'get-animals', queryString: 'assigned=false', page});
      try {
        const response: NeedleResponse = await needle('get', url, createOptions({}));
        const body = response.body;
        if (response && response.statusCode === 200) {
          context.commit('writeUnassignedAnimals', body);
          callback(body);
        } else {
          callback(null, `error fetching animals: ${body}`);
        }
      } catch (e) {
          callback(null, `error fetching critters ${e}`);
      }

    },
    async getCollarAssignmentDetails(context, payload) {
      const {callback, id} = payload;
      const url = createUrl2({context, apiString: `get-assignment-history/${id}`});
      const msg = 'error fetching collar history: ';
      try {
        const response: NeedleResponse = await needle('get', url, createOptions({}));
        const body = response.body;
        if (response && response.statusCode === 200) {
          const cas = body.map((c: any) => decodeCollarAssignment(c));
          context.commit('writeCritterCollarHistory', cas);
          callback(body);
        } else {
          callback(null, `${msg}${body}`);
        }
      } catch (e) {
          callback(null, `${msg}${e}`);
      }
    },
    async upsertAnimal(context, payload: ActionPostPayload) {
      const url = createUrl(context, 'add-animal');
      try {
        const response = await needle('post', url, payload.body, createOptions({}));
        const body: Animal[] = response.body;
        if (response && response.statusCode === 200) {
          context.commit('updateAnimals', response.body[0]);
          payload.callback(body);
        } else {
          payload.callback(null, `error adding animal: ${body}`);
        }
      } catch (e) {
          payload.callback(null, `caught exception adding animal: ${e}`);
      }
    },
    async linkOrUnlinkCritterCollar(context, payload: ActionPostPayload) {
      const link = (payload.body as any).link;
      const url = createUrl(context, link ? 'link-animal-collar' : 'unlink-animal-collar');
      try {
        const response = await needle('post', url, { data: (payload.body as any).data });
        const body = response.body;
        if (response && response.statusCode === 200) {
          payload.callback(body[0]);
        } else {
          payload.callback(null, `status ${response.statusCode} returned while linking collar: ${response.body}`);
        }
      } catch (e) {
          payload.callback(null, `caught exception linking collar ${e}`);
      }
    },
  },
};

export {
  animalModule,
};
