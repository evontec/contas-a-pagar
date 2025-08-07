import React, { useState, useEffect } from 'react';
import { useAccounts } from '../context/AccountContext';
import { useSearchParams } from 'react-router-dom';
import AccountForm from '../components/AccountForm';
import AccountList from '../components/AccountList';
import './Accounts.css';

const Accounts = () => {
  const { accounts, pagination, fetchAccounts, loading, error } = useAccounts();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    status: searchParams.get('status') || '',
    search: searchParams.get('search') || '',
    page: parseInt(searchParams.get('page')) || 1
  });

  // Check if should open form from URL
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setShowForm(true);
      // Remove the action param from URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('action');
      setSearchParams(newParams);
    }
  }, [searchParams, setSearchParams]);

  // Fetch accounts when filters change
  useEffect(() => {
    fetchAccounts(filters);
  }, [filters]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== '') {
        params.set(key, filters[key]);
      }
    });
    
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
  };

  const handleNewAccount = () => {
    setEditingAccount(null);
    setShowForm(true);
  };

  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingAccount(null);
  };

  const handleFormSuccess = () => {
    fetchAccounts(filters); // Refresh list
  };

  const handleRefresh = () => {
    fetchAccounts(filters);
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      status: '',
      search: '',
      page: 1
    });
  };

  const getTotalPages = () => {
    return pagination?.pages || 1;
  };

  const getPaginationRange = () => {
    const currentPage = filters.page;
    const totalPages = getTotalPages();
    const range = [];
    
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    
    return range;
  };

  return (
    <div className="accounts-page">
      <div className="page-header">
        <div className="header-content">
          <h1>
            <i className="fas fa-file-invoice"></i>
            Gerenciar Contas
          </h1>
          <p>Controle suas contas a pagar e receber</p>
        </div>
        <button 
          onClick={handleNewAccount}
          className="btn btn-primary"
        >
          <i className="fas fa-plus"></i>
          Nova Conta
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-container">
          <div className="filter-group">
            <label>
              <i className="fas fa-search"></i>
              Buscar
            </label>
            <input
              type="text"
              placeholder="Buscar por título ou descrição..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>
              <i className="fas fa-tag"></i>
              Tipo
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="">Todos</option>
              <option value="pagar">A Pagar</option>
              <option value="receber">A Receber</option>
            </select>
          </div>

          <div className="filter-group">
            <label>
              <i className="fas fa-check-circle"></i>
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
            </select>
          </div>

          <div className="filter-actions">
            <button 
              onClick={clearFilters}
              className="btn btn-secondary btn-sm"
              title="Limpar filtros"
            >
              <i className="fas fa-eraser"></i>
              Limpar
            </button>
            <button 
              onClick={handleRefresh}
              className="btn btn-secondary btn-sm"
              title="Atualizar"
              disabled={loading}
            >
              <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
              Atualizar
            </button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          {error}
          <button onClick={handleRefresh} className="btn btn-sm btn-primary">
            Tentar novamente
          </button>
        </div>
      )}

      {/* Results summary */}
      {pagination && (
        <div className="results-summary">
          <p>
            Mostrando {accounts.length} de {pagination.total} contas
            {filters.search && ` para "${filters.search}"`}
            {filters.type && ` | Tipo: ${filters.type === 'pagar' ? 'A Pagar' : 'A Receber'}`}
            {filters.status && ` | Status: ${filters.status === 'pago' ? 'Pago' : 'Pendente'}`}
          </p>
        </div>
      )}

      {/* Account List */}
      <div className="accounts-content">
        <AccountList
          accounts={accounts}
          onEdit={handleEditAccount}
          onRefresh={handleRefresh}
        />
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(filters.page - 1)}
            disabled={filters.page <= 1}
            className="btn btn-secondary btn-sm"
          >
            <i className="fas fa-chevron-left"></i>
            Anterior
          </button>

          <div className="page-numbers">
            {filters.page > 3 && (
              <>
                <button
                  onClick={() => handlePageChange(1)}
                  className="btn btn-secondary btn-sm"
                >
                  1
                </button>
                {filters.page > 4 && <span className="ellipsis">...</span>}
              </>
            )}

            {getPaginationRange().map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`btn btn-sm ${page === filters.page ? 'btn-primary' : 'btn-secondary'}`}
              >
                {page}
              </button>
            ))}

            {filters.page < getTotalPages() - 2 && (
              <>
                {filters.page < getTotalPages() - 3 && <span className="ellipsis">...</span>}
                <button
                  onClick={() => handlePageChange(getTotalPages())}
                  className="btn btn-secondary btn-sm"
                >
                  {getTotalPages()}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => handlePageChange(filters.page + 1)}
            disabled={filters.page >= getTotalPages()}
            className="btn btn-secondary btn-sm"
          >
            Próxima
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      {/* Account Form Modal */}
      <AccountForm
        isOpen={showForm}
        onClose={handleFormClose}
        account={editingAccount}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};

export default Accounts;