import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../BaseURL';

export const fetchTheme = createAsyncThunk(
  'theme/fetchTheme',
  async (themeId) => {
    const res = await axios.get(`${BASE_URL}/theme/getTheme/${themeId}`);
    return res.data;
  }
);

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTheme.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTheme.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchTheme.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default themeSlice.reducer;
