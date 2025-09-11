import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'core-js'
import "./index.css";
import axios from 'axios'

import App from './App'
import store from './store'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>,
)

// On app bootstrap, propagate stored username to headers for backend authorization
try {
  const storedUser = localStorage.getItem('userName') || ''
  if (storedUser) {
    axios.defaults.headers.common['x-profile-name'] = storedUser
  }
} catch {}
