import React, { useEffect } from 'react';
import { useAccounts } from '../context/AccountContext';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { dashboard, fetchDashboard, loading, error } = useAccounts();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading && !dashboard) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <i className="fas fa-exclamation-triangle"></i>
        <h3>Erro ao carregar dashboard</h3>
        <p>{error}</p>
        <button onClick={() => fetchDashboard()} className="btn btn-primary">
          Tentar novamente
        </button>
      </div>
    );
  }

  const summary = dashboard?.summary || {};
  const recentAccounts = dashboard?.recent_accounts || [];
  const overdueAccounts = dashboard?.overdue_accounts || [];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>
          <i className="fas fa-tachometer-alt"></i>
          Dashboard Financeiro
        </h1>
        <p>Visão geral das suas finanças</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card balance">
          <div className="card-icon">
            <i className="fas fa-balance-scale"></i>
          </div>
          <div className="card-content">
            <h3>Saldo Atual</h3>
            <p className={`amount ${summary.saldo >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(summary.saldo)}
            </p>
            <small>Diferença entre recebido e pago</small>
          </div>
        </div>

        <div className="summary-card income">
          <div className="card-icon">
            <i className="fas fa-arrow-up"></i>
          </div>
          <div className="card-content">
            <h3>A Receber</h3>
            <p className="amount">{formatCurrency(summary.pendente_receber)}</p>
            <small>Pendente: {formatCurrency(summary.pendente_receber)}</small>
          </div>
        </div>

        <div className="summary-card expense">
          <div className="card-icon">
            <i className="fas fa-arrow-down"></i>
          </div>
          <div className="card-content">
            <h3>A Pagar</h3>
            <p className="amount">{formatCurrency(summary.pendente_pagar)}</p>
            <small>Pendente: {formatCurrency(summary.pendente_pagar)}</small>
          </div>
        </div>

        <div className="summary-card total">
          <div className="card-icon">
            <i className="fas fa-file-invoice"></i>
          </div>
          <div className="card-content">
            <h3>Total de Contas</h3>
            <p className="amount">{summary.total_accounts || 0}</p>
            <small>Todas as contas cadastradas</small>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Overdue Accounts */}
        {overdueAccounts.length > 0 && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>
                <i className="fas fa-exclamation-triangle"></i>
                Contas Vencidas ({overdueAccounts.length})
              </h2>
              <Link to="/accounts?status=pendente" className="view-all-link">
                Ver todas
              </Link>
            </div>
            <div className="overdue-list">
              {overdueAccounts.slice(0, 5).map((account) => (
                <div key={account.id} className="overdue-item">
                  <div className="account-info">
                    <h4>{account.title}</h4>
                    <p>Vencimento: {formatDate(account.due_date)}</p>
                  </div>
                  <div className="account-amount">
                    <span className={`amount ${account.type}`}>
                      {account.type === 'pagar' ? '-' : '+'} {formatCurrency(account.amount)}
                    </span>
                    <span className={`type-badge ${account.type}`}>
                      {account.type === 'pagar' ? 'A Pagar' : 'A Receber'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Accounts */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>
              <i className="fas fa-clock"></i>
              Atividades Recentes
            </h2>
            <Link to="/accounts" className="view-all-link">
              Ver todas
            </Link>
          </div>
          
          {recentAccounts.length > 0 ? (
            <div className="recent-list">
              {recentAccounts.map((account) => (
                <div key={account.id} className="recent-item">
                  <div className="account-info">
                    <h4>{account.title}</h4>
                    <p>{account.description}</p>
                    <small>Criado em: {formatDate(account.created_at)}</small>
                  </div>
                  <div className="account-details">
                    <span className={`amount ${account.type}`}>
                      {account.type === 'pagar' ? '-' : '+'} {formatCurrency(account.amount)}
                    </span>
                    <span className={`status-badge ${account.status}`}>
                      {account.status === 'pago' ? 'Pago' : 'Pendente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <i className="fas fa-file-invoice"></i>
              <h3>Nenhuma conta encontrada</h3>
              <p>Comece criando sua primeira conta</p>
              <Link to="/accounts" className="btn btn-primary">
                <i className="fas fa-plus"></i>
                Criar primeira conta
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>
              <i className="fas fa-bolt"></i>
              Ações Rápidas
            </h2>
          </div>
          <div className="quick-actions">
            <Link to="/accounts?action=new" className="quick-action-card">
              <div className="action-icon">
                <i className="fas fa-plus-circle"></i>
              </div>
              <h3>Nova Conta</h3>
              <p>Criar uma nova conta a pagar ou receber</p>
            </Link>
            
            <Link to="/accounts?type=pagar" className="quick-action-card">
              <div className="action-icon">
                <i className="fas fa-arrow-down"></i>
              </div>
              <h3>Contas a Pagar</h3>
              <p>Ver todas as contas pendentes de pagamento</p>
            </Link>
            
            <Link to="/accounts?type=receber" className="quick-action-card">
              <div className="action-icon">
                <i className="fas fa-arrow-up"></i>
              </div>
              <h3>Contas a Receber</h3>
              <p>Ver todas as contas pendentes de recebimento</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;