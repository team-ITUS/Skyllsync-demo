import { createSlice } from '@reduxjs/toolkit';

const featuresSlice = createSlice({
  name: 'features',
  initialState: {
    data: null,
  },
  reducers: {
    setFeatures: (state, action) => {
      state.data = action.payload;
    },
  },
});

export const { setFeatures } = featuresSlice.actions;
export default featuresSlice.reducer;
