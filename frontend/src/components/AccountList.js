import React, { useState } from 'react';
import { useAccounts } from '../context/AccountContext';
import './AccountList.css';

const AccountList = ({ accounts, onEdit, onRefresh }) => {
  const { markAsPaid, deleteAccount, loading } = useAccounts();
  const [loadingActions, setLoadingActions] = useState({});

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status) => {
    return (
      <span className={`status-badge ${status}`}>
        <i className={`fas ${status === 'pago' ? 'fa-check-circle' : 'fa-clock'}`}></i>
        {status === 'pago' ? 'Pago' : 'Pendente'}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    return (
      <span className={`type-badge ${type}`}>
        <i className={`fas ${type === 'pagar' ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
        {type === 'pagar' ? 'A Pagar' : 'A Receber'}
      </span>
    );
  };

  const isOverdue = (dueDate, status) => {
    if (status === 'pago') return false;
    return new Date(dueDate) < new Date();
  };

  const handleMarkAsPaid = async (account) => {
    if (account.status === 'pago') return;

    setLoadingActions(prev => ({ ...prev, [`paid_${account.id}`]: true }));
    const result = await markAsPaid(account);
    setLoadingActions(prev => ({ ...prev, [`paid_${account.id}`]: false }));

    if (result.success && onRefresh) {
      onRefresh();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta conta?')) {
      return;
    }

    setLoadingActions(prev => ({ ...prev, [`delete_${id}`]: true }));
    const result = await deleteAccount(id);
    setLoadingActions(prev => ({ ...prev, [`delete_${id}`]: false }));

    if (result.success && onRefresh) {
      onRefresh();
    }
  };

  if (loading && accounts.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Carregando contas...</p>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="empty-state">
        <i className="fas fa-file-invoice fa-3x"></i>
        <h3>Nenhuma conta encontrada</h3>
        <p>Comece criando sua primeira conta financeira</p>
      </div>
    );
  }

  return (
    <div className="account-list">
      <div className="table-container">
        <table className="accounts-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Tipo</th>
              <th>Valor</th>
              <th>Vencimento</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr 
                key={account.id}
                className={`
                  ${isOverdue(account.due_date, account.status) ? 'overdue' : ''}
                  ${account.status === 'pago' ? 'paid' : ''}
                `}
              >
                <td>
                  <div className="account-title">
                    <strong>{account.title}</strong>
                    {account.description && (
                      <small>{account.description}</small>
                    )}
                    {isOverdue(account.due_date, account.status) && (
                      <span className="overdue-label">
                        <i className="fas fa-exclamation-triangle"></i>
                        Vencida
                      </span>
                    )}
                  </div>
                </td>
                <td>{getTypeBadge(account.type)}</td>
                <td>
                  <span className={`amount ${account.type}`}>
                    {account.type === 'pagar' ? '-' : '+'} {formatCurrency(account.amount)}
                  </span>
                </td>
                <td>{formatDate(account.due_date)}</td>
                <td>{getStatusBadge(account.status)}</td>
                <td>
                  <div className="action-buttons">
                    {account.status === 'pendente' && (
                      <button
                        onClick={() => handleMarkAsPaid(account)}
                        className="btn btn-success btn-sm"
                        title="Marcar como pago"
                        disabled={loadingActions[`paid_${account.id}`]}
                      >
                        {loadingActions[`paid_${account.id}`] ? (
                          <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                          <i className="fas fa-check"></i>
                        )}
                      </button>
                    )}
                    
                    <button
                      onClick={() => onEdit(account)}
                      className="btn btn-primary btn-sm"
                      title="Editar"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="btn btn-danger btn-sm"
                      title="Excluir"
                      disabled={loadingActions[`delete_${account.id}`]}
                    >
                      {loadingActions[`delete_${account.id}`] ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-trash"></i>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountList;