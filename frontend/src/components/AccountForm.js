import React, { useState, useEffect } from 'react';
import { useAccounts } from '../context/AccountContext';
import './AccountForm.css';

const AccountForm = ({ isOpen, onClose, account = null, onSuccess }) => {
  const { createAccount, updateAccount, loading } = useAccounts();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    type: 'pagar',
    due_date: '',
    status: 'pendente'
  });

  const [errors, setErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (account) {
      setFormData({
        title: account.title || '',
        description: account.description || '',
        amount: account.amount || '',
        type: account.type || 'pagar',
        due_date: account.due_date ? account.due_date.split('T')[0] : '',
        status: account.status || 'pendente'
      });
    } else {
      setFormData({
        title: '',
        description: '',
        amount: '',
        type: 'pagar',
        due_date: '',
        status: 'pendente'
      });
    }
  }, [account, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }

    if (!formData.due_date) {
      newErrors.due_date = 'Data de vencimento é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const accountData = {
      ...formData,
      amount: parseFloat(formData.amount)
    };

    let result;
    if (account) {
      result = await updateAccount(account.id, accountData);
    } else {
      result = await createAccount(accountData);
    }

    if (result.success) {
      onSuccess && onSuccess();
      onClose();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      amount: '',
      type: 'pagar',
      due_date: '',
      status: 'pendente'
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <i className={`fas ${account ? 'fa-edit' : 'fa-plus-circle'}`}></i>
            {account ? 'Editar Conta' : 'Nova Conta'}
          </h2>
          <button 
            type="button" 
            className="close-btn"
            onClick={handleClose}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="account-form">
          <div className="form-group">
            <label htmlFor="title">
              <i className="fas fa-heading"></i>
              Título *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? 'error' : ''}
              placeholder="Ex: Conta de luz, Salário cliente..."
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">
              <i className="fas fa-align-left"></i>
              Descrição
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detalhes adicionais (opcional)"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="amount">
                <i className="fas fa-dollar-sign"></i>
                Valor *
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className={errors.amount ? 'error' : ''}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              {errors.amount && <span className="error-text">{errors.amount}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="type">
                <i className="fas fa-tag"></i>
                Tipo *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="pagar">A Pagar</option>
                <option value="receber">A Receber</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="due_date">
                <i className="fas fa-calendar"></i>
                Data de Vencimento *
              </label>
              <input
                type="date"
                id="due_date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className={errors.due_date ? 'error' : ''}
              />
              {errors.due_date && <span className="error-text">{errors.due_date}</span>}
            </div>

            {account && (
              <div className="form-group">
                <label htmlFor="status">
                  <i className="fas fa-check-circle"></i>
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="pendente">Pendente</option>
                  <option value="pago">Pago</option>
                </select>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Salvando...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  {account ? 'Atualizar' : 'Criar'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountForm;