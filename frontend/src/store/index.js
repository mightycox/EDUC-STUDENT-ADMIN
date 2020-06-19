import Vue from 'vue';
import Vuex from 'vuex';
import auth from './modules/auth';
import request from './modules/request';
import app from './modules/app';
import notifications from './modules/notifications';
import penReg from './modules/penReg';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    auth: auth,
    app,
    penRequest: request,
    studentRequest: request,
    notifications,
    penReg: penReg,
  }
});

// store.registerModule('studentRequest', createRequestStore());
// store.registerModule('penRequest', createRequestStore());

export default store;
