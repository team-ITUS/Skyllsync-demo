
import { configureStore } from '@reduxjs/toolkit';
import featuresReducer from './featuresSlice';
import themeReducer from './themeSlice';


const store = configureStore({
  reducer: {
    features: featuresReducer,
    theme: themeReducer,
  },
});

export default store;
