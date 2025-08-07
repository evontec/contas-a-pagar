import React, { createContext, useContext, useReducer } from 'react';
import { accountsAPI } from '../services/api';

const AccountContext = createContext();

// Account reducer
const accountReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'FETCH_DASHBOARD_SUCCESS':
      return {
        ...state,
        loading: false,
        dashboard: action.payload,
        error: null,
      };
    case 'FETCH_ACCOUNTS_SUCCESS':
      return {
        ...state,
        loading: false,
        accounts: action.payload.accounts,
        pagination: action.payload.pagination,
        error: null,
      };
    case 'CREATE_ACCOUNT_SUCCESS':
      return {
        ...state,
        loading: false,
        accounts: [action.payload, ...state.accounts],
        error: null,
      };
    case 'UPDATE_ACCOUNT_SUCCESS':
      return {
        ...state,
        loading: false,
        accounts: state.accounts.map(account =>
          account.id === action.payload.id ? action.payload : account
        ),
        error: null,
      };
    case 'DELETE_ACCOUNT_SUCCESS':
      return {
        ...state,
        loading: false,
        accounts: state.accounts.filter(account => account.id !== action.payload),
        error: null,
      };
    case 'FETCH_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  accounts: [],
  dashboard: null,
  pagination: null,
  loading: false,
  error: null,
};

export const AccountProvider = ({ children }) => {
  const [state, dispatch] = useReducer(accountReducer, initialState);

  // Fetch dashboard data
  const fetchDashboard = async () => {
    try {
      dispatch({ type: 'FETCH_START' });
      const response = await accountsAPI.getDashboard();
      dispatch({
        type: 'FETCH_DASHBOARD_SUCCESS',
        payload: response.data,
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao carregar dashboard';
      dispatch({
        type: 'FETCH_ERROR',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Fetch accounts with filters
  const fetchAccounts = async (filters = {}) => {
    try {
      dispatch({ type: 'FETCH_START' });
      const response = await accountsAPI.getAccounts(filters);
      dispatch({
        type: 'FETCH_ACCOUNTS_SUCCESS',
        payload: response.data,
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao carregar contas';
      dispatch({
        type: 'FETCH_ERROR',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Create new account
  const createAccount = async (accountData) => {
    try {
      dispatch({ type: 'FETCH_START' });
      const response = await accountsAPI.createAccount(accountData);
      dispatch({
        type: 'CREATE_ACCOUNT_SUCCESS',
        payload: response.data.account,
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao criar conta';
      dispatch({
        type: 'FETCH_ERROR',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Update account
  const updateAccount = async (id, accountData) => {
    try {
      dispatch({ type: 'FETCH_START' });
      const response = await accountsAPI.updateAccount(id, accountData);
      dispatch({
        type: 'UPDATE_ACCOUNT_SUCCESS',
        payload: response.data.account,
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao atualizar conta';
      dispatch({
        type: 'FETCH_ERROR',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Delete account
  const deleteAccount = async (id) => {
    try {
      dispatch({ type: 'FETCH_START' });
      await accountsAPI.deleteAccount(id);
      dispatch({
        type: 'DELETE_ACCOUNT_SUCCESS',
        payload: id,
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao deletar conta';
      dispatch({
        type: 'FETCH_ERROR',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Mark account as paid
  const markAsPaid = async (account) => {
    return await updateAccount(account.id, {
      ...account,
      status: 'pago',
    });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    fetchDashboard,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    markAsPaid,
    clearError,
  };

  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  );
};

export const useAccounts = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccounts must be used within an AccountProvider');
  }
  return context;
};

export default AccountContext;