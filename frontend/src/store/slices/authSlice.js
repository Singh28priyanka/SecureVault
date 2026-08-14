import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authApi } from '../../api/endpoints'
import { tokenStore, apiError } from '../../api/client'

export const login = createAsyncThunk('auth/login', async (body, { rejectWithValue }) => {
  try {
    const { data } = await authApi.login(body)
    if (data.mfaRequired) return { mfaRequired: true }
    tokenStore.set(data)
    return { user: data.user }
  } catch (err) {
    return rejectWithValue(apiError(err, 'Login failed'))
  }
})

export const register = createAsyncThunk('auth/register', async (body, { rejectWithValue }) => {
  try {
    const { data } = await authApi.register(body)
    tokenStore.set(data)
    return { user: data.user }
  } catch (err) {
    return rejectWithValue(apiError(err, 'Registration failed'))
  }
})

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const { data } = await authApi.me()
    return data
  } catch (err) {
    return rejectWithValue(apiError(err))
  }
})

const slice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    status: 'idle', // idle | loading | authenticated | mfa | error
    error: null,
    bootstrapped: false,
  },
  reducers: {
    logout(state) {
      tokenStore.clear()
      state.user = null
      state.status = 'idle'
      state.error = null
    },
    setUser(state, action) {
      state.user = action.payload
      state.status = 'authenticated'
    },
    clearError(state) {
      state.error = null
      if (state.status === 'mfa') state.status = 'idle'
    },
  },
  extraReducers: (b) => {
    b.addCase(login.pending, (s) => {
      s.status = 'loading'
      s.error = null
    })
      .addCase(login.fulfilled, (s, a) => {
        if (a.payload.mfaRequired) {
          s.status = 'mfa'
        } else {
          s.user = a.payload.user
          s.status = 'authenticated'
        }
      })
      .addCase(login.rejected, (s, a) => {
        s.status = 'error'
        s.error = a.payload
      })
      .addCase(register.pending, (s) => {
        s.status = 'loading'
        s.error = null
      })
      .addCase(register.fulfilled, (s, a) => {
        s.user = a.payload.user
        s.status = 'authenticated'
      })
      .addCase(register.rejected, (s, a) => {
        s.status = 'error'
        s.error = a.payload
      })
      .addCase(fetchMe.fulfilled, (s, a) => {
        s.user = a.payload
        s.status = 'authenticated'
        s.bootstrapped = true
      })
      .addCase(fetchMe.rejected, (s) => {
        s.bootstrapped = true
      })
  },
})

export const { logout, setUser, clearError } = slice.actions
export default slice.reducer
