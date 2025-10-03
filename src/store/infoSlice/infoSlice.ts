import { createSlice } from "@reduxjs/toolkit";

interface InfoState {
  regions: IRegion[];
  districts: IDistrict[];
  warehouses: IWarehouse[];
  counterparties: ICounterparty[];
  typesOfGoods: ITypeOfGoods[];
  currentCreatedCounterParty?: ICounterparty;
  responsible_person: IReponsiblePerson[];
  currentUserInfo: CurrentUserInfo | null;
}

const initialState: InfoState = {
  regions: [],
  districts: [],
  warehouses: [],
  counterparties: [],
  typesOfGoods: [],
  currentCreatedCounterParty: undefined,
  responsible_person: [],
  currentUserInfo: null,
};

const infoSlice = createSlice({
  name: "infoSlice",
  initialState,
  reducers: {
    setRegions(state, action) {
      state.regions = action.payload;
    },

    setDistricts(state, action) {
      state.districts = action.payload;
    },

    setWarehouses(state, action) {
      state.warehouses = action.payload;
    },

    setCounterParties(state, action) {
      state.counterparties = action.payload;
    },

    setTypesOfGoods(state, action) {
      state.typesOfGoods = action.payload;
    },

    setCurrentCreatedCounterParty(state, action) {
      state.currentCreatedCounterParty = action.payload;
    },

    setResponsiblePersons(state, action) {
      state.responsible_person = action.payload;
    },

    setCurrentUserInfo(state, action) {
      state.currentUserInfo = action.payload;
    },
  },
});

export const {
  setRegions,
  setDistricts,
  setWarehouses,
  setCounterParties,
  setTypesOfGoods,
  setCurrentCreatedCounterParty,
  setResponsiblePersons,
  setCurrentUserInfo,
} = infoSlice.actions;
export default infoSlice.reducer;
