import ApiService from '../../common/apiService';

export default {
  namespaced: true,
  state: {
    genders: null,
    pageNumber: 1,
    headerSortParams: {
      currentSort: 'dob',
      currentSortAsc: true
    },
    selectedRecords: []
  },
  getters: {
    genders: state => state.genders,
  },
  mutations: {
    setGenders: (state, genders) => {
      state.genders = genders;
    },
    setPageNumber: (state, pageNumber) => {
      state.pageNumber = pageNumber;
    },
    setSelectedRecords: (state, selectedRecords) => {
      state.selectedRecords = selectedRecords || [];
    },
    updateSortParams: (state, sortHeader) => {
      if (sortHeader === state.headerSortParams.currentSort) {
        state.headerSortParams.currentSortAsc = !state.headerSortParams.currentSortAsc;
        state.pageNumber = 1;
      } else {
        state.headerSortParams.currentSort = sortHeader;
      }
    }
  },
  actions: {
    async getCodes({commit}) {
      const response = await ApiService.getCodes();
      commit('setGenders', response.data.genderCodes);
    }
  }
};
