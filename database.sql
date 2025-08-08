-- Database setup for Contas a Pagar e Receber
-- Sistema de gestão financeira

CREATE DATABASE IF NOT EXISTS accounts_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE accounts_system;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de contas (a pagar e receber)
CREATE TABLE IF NOT EXISTS accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    type ENUM('pagar', 'receber') NOT NULL,
    status ENUM('pendente', 'pago') DEFAULT 'pendente',
    due_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date),
    INDEX idx_created_at (created_at)
);

-- Inserir usuário de teste (opcional - remover em produção)
-- Senha: 123456
INSERT IGNORE INTO users (username, email, password) VALUES 
('admin', 'admin@example.com', '$2a$10$8K1p/a8ZzxQOCpzZH9Ot9e.2Q8l7X3Yy8ZxQpB3Ot9e.2Q8l7X3Yy');

-- Inserir contas de exemplo (opcional - remover em produção)
INSERT IGNORE INTO accounts (user_id, title, description, amount, type, due_date, status) VALUES 
(1, 'Conta de Luz', 'Energia elétrica - Janeiro', 150.50, 'pagar', '2024-01-15', 'pendente'),
(1, 'Salário Cliente A', 'Pagamento do projeto X', 2500.00, 'receber', '2024-01-20', 'pendente'),
(1, 'Internet', 'Provedor de internet', 89.90, 'pagar', '2024-01-10', 'pago'),
(1, 'Freelance', 'Desenvolvimento de site', 1200.00, 'receber', '2024-01-05', 'pago'),
(1, 'Aluguel', 'Aluguel do escritório', 800.00, 'pagar', '2024-02-01', 'pendente');

-- Verificar se as tabelas foram criadas
SHOW TABLES;