# Sistema de Gestão Financeira - Contas a Pagar e Receber

Um sistema completo de gestão financeira desenvolvido com Node.js (Express) no backend e React.js no frontend, permitindo o controle eficiente de contas a pagar e receber.

## 🚀 Funcionalidades

### 📊 Dashboard Financeiro
- Visão geral das finanças com cards de resumo
- Saldo atual (diferença entre recebido e pago)
- Total de contas a pagar e receber pendentes
- Lista de contas vencidas com alertas
- Atividades recentes
- Ações rápidas para navegação

### 💰 Gestão de Contas
- **CRUD Completo**: Criar, visualizar, editar e excluir contas
- **Tipos de Conta**: A pagar e a receber
- **Status**: Pendente e Pago
- **Filtros Avançados**: Por tipo, status e busca textual
- **Paginação**: Navegação eficiente para grandes volumes
- **Ações Rápidas**: Marcar como pago, editar, excluir
- **Alertas de Vencimento**: Identificação visual de contas vencidas

### 🔐 Autenticação e Segurança
- Sistema de registro e login com JWT
- Proteção de rotas e endpoints
- Criptografia de senhas com bcrypt
- Middleware de autenticação
- Sessões persistentes

### 📱 Interface Responsiva
- Design mobile-first
- Interface moderna e intuitiva
- Componentes reutilizáveis
- Feedback visual para ações
- Modais para formulários

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MySQL** - Banco de dados relacional
- **JWT** - Autenticação por tokens
- **bcryptjs** - Criptografia de senhas
- **CORS** - Configuração de CORS
- **dotenv** - Gerenciamento de variáveis de ambiente

### Frontend
- **React.js** - Biblioteca para interface
- **React Router** - Roteamento
- **Context API** - Gerenciamento de estado
- **Axios** - Cliente HTTP
- **CSS3** - Estilização customizada
- **Font Awesome** - Ícones

### Banco de Dados
- **MySQL** - Sistema de gerenciamento de banco de dados
- **Pool de Conexões** - Otimização de performance
- **Relacionamentos** - Estrutura normalizada

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- MySQL (versão 5.7 ou superior)
- npm ou yarn

## 🔧 Instalação e Configuração

### 1. Clone o repositório
```bash
git clone https://github.com/evontec/contas-a-pagar.git
cd contas-a-pagar
```

### 2. Configuração do Banco de Dados
```bash
# Execute o script SQL para criar o banco e tabelas
mysql -u root -p < database.sql
```

### 3. Configuração do Backend
```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Edite o arquivo .env com suas configurações:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=sua_senha
# DB_NAME=accounts_system
# JWT_SECRET=sua_chave_secreta_jwt
# PORT=5000
```

### 4. Configuração do Frontend
```bash
cd ../frontend

# Instalar dependências
npm install
```

## 🚀 Executando a Aplicação

### Backend (Terminal 1)
```bash
cd backend

# Desenvolvimento
npm run dev

# Produção
npm start
```

### Frontend (Terminal 2)
```bash
cd frontend

# Desenvolvimento
npm start

# Build para produção
npm run build
```

A aplicação estará disponível em:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## 📁 Estrutura do Projeto

```
contas-a-pagar/
├── backend/
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   └── accounts.js
│   │   └── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── AccountForm.js
│   │   │   ├── AccountList.js
│   │   │   ├── Navbar.js
│   │   │   └── ProtectedRoute.js
│   │   ├── context/
│   │   │   ├── AuthContext.js
│   │   │   └── AccountContext.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   └── Accounts.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── database.sql
└── README.md
```

## 🔌 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login de usuário

### Contas (Protegidas)
- `GET /api/accounts` - Listar contas com filtros
- `POST /api/accounts` - Criar nova conta
- `PUT /api/accounts/:id` - Atualizar conta
- `DELETE /api/accounts/:id` - Deletar conta
- `GET /api/accounts/dashboard` - Dados do dashboard

### Parâmetros de Filtro
- `type` - Filtrar por tipo (pagar/receber)
- `status` - Filtrar por status (pendente/pago)
- `search` - Busca textual em título e descrição
- `page` - Número da página
- `limit` - Itens por página

## 💾 Esquema do Banco de Dados

### Tabela `users`
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tabela `accounts`
```sql
CREATE TABLE accounts (
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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🔐 Conta de Demonstração

Para testar a aplicação, use as credenciais:
- **E-mail**: admin@example.com
- **Senha**: 123456

## 🚀 Deploy

### Backend
1. Configure as variáveis de ambiente para produção
2. Use PM2 ou similar para gerenciamento de processos
3. Configure proxy reverso (Nginx/Apache)

### Frontend
1. Execute `npm run build`
2. Sirva os arquivos estáticos
3. Configure redirecionamento para SPA

### Banco de Dados
1. Configure MySQL em produção
2. Execute migrations/seeders
3. Configure backups regulares

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença [MIT](LICENSE).

## 👨‍💻 Autor

Desenvolvido por [evontec](https://github.com/evontec)

## 📞 Suporte

Para suporte, abra uma [issue](https://github.com/evontec/contas-a-pagar/issues) no GitHub.

---

⭐ Se este projeto foi útil para você, considere dar uma estrela no repositório!
