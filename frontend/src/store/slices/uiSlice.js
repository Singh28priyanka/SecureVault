import { createSlice } from '@reduxjs/toolkit'

let nextId = 1

/** Global UI state: transient toast notifications. */
const slice = createSlice({
  name: 'ui',
  initialState: { toasts: [] },
  reducers: {
    pushToast: {
      reducer(state, action) {
        state.toasts.push(action.payload)
      },
      prepare(message, type = 'info') {
        return { payload: { id: nextId++, message, type } }
      },
    },
    dismissToast(state, action) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload)
    },
  },
})

export const { pushToast, dismissToast } = slice.actions
export default slice.reducer
