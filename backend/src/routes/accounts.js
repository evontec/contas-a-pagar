const express = require('express');
const mysql = require('mysql2/promise');
const auth = require('../middleware/auth');

const router = express.Router();

// Create database connection
const createConnection = async (dbConfig) => {
  return await mysql.createConnection(dbConfig);
};

// Get dashboard data
router.get('/dashboard', auth, async (req, res) => {
  try {
    const connection = await createConnection(req.dbConfig);

    // Get summary statistics
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_accounts,
        SUM(CASE WHEN type = 'pagar' THEN amount ELSE 0 END) as total_pagar,
        SUM(CASE WHEN type = 'receber' THEN amount ELSE 0 END) as total_receber,
        SUM(CASE WHEN type = 'pagar' AND status = 'pendente' THEN amount ELSE 0 END) as pendente_pagar,
        SUM(CASE WHEN type = 'receber' AND status = 'pendente' THEN amount ELSE 0 END) as pendente_receber,
        SUM(CASE WHEN type = 'pagar' AND status = 'pago' THEN amount ELSE 0 END) as pago_pagar,
        SUM(CASE WHEN type = 'receber' AND status = 'pago' THEN amount ELSE 0 END) as pago_receber
      FROM accounts 
      WHERE user_id = ?
    `, [req.user.id]);

    // Get recent accounts
    const [recent] = await connection.execute(`
      SELECT * FROM accounts 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 5
    `, [req.user.id]);

    // Get overdue accounts
    const [overdue] = await connection.execute(`
      SELECT * FROM accounts 
      WHERE user_id = ? AND status = 'pendente' AND due_date < CURDATE()
      ORDER BY due_date ASC
    `, [req.user.id]);

    await connection.end();

    const summary = stats[0];

    res.json({
      summary: {
        total_accounts: parseInt(summary.total_accounts) || 0,
        total_pagar: parseFloat(summary.total_pagar) || 0,
        total_receber: parseFloat(summary.total_receber) || 0,
        pendente_pagar: parseFloat(summary.pendente_pagar) || 0,
        pendente_receber: parseFloat(summary.pendente_receber) || 0,
        pago_pagar: parseFloat(summary.pago_pagar) || 0,
        pago_receber: parseFloat(summary.pago_receber) || 0,
        saldo: (parseFloat(summary.pago_receber) || 0) - (parseFloat(summary.pago_pagar) || 0)
      },
      recent_accounts: recent,
      overdue_accounts: overdue
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all accounts with filters
router.get('/', auth, async (req, res) => {
  try {
    const { type, status, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM accounts WHERE user_id = ?';
    let params = [req.user.id];

    // Add filters
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Add ordering and pagination
    query += ' ORDER BY due_date ASC, created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const connection = await createConnection(req.dbConfig);

    // Get accounts
    const [accounts] = await connection.execute(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM accounts WHERE user_id = ?';
    let countParams = [req.user.id];

    if (type) {
      countQuery += ' AND type = ?';
      countParams.push(type);
    }

    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    if (search) {
      countQuery += ' AND (title LIKE ? OR description LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const [countResult] = await connection.execute(countQuery, countParams);
    const total = countResult[0].total;

    await connection.end();

    res.json({
      accounts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new account
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, amount, type, due_date } = req.body;

    // Validation
    if (!title || !amount || !type || !due_date) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (!['pagar', 'receber'].includes(type)) {
      return res.status(400).json({ message: 'Type must be either "pagar" or "receber"' });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    const connection = await createConnection(req.dbConfig);

    const [result] = await connection.execute(`
      INSERT INTO accounts (user_id, title, description, amount, type, due_date, status) 
      VALUES (?, ?, ?, ?, ?, ?, 'pendente')
    `, [req.user.id, title, description || '', amount, type, due_date]);

    // Get the created account
    const [newAccount] = await connection.execute(
      'SELECT * FROM accounts WHERE id = ?',
      [result.insertId]
    );

    await connection.end();

    res.status(201).json({
      message: 'Account created successfully',
      account: newAccount[0]
    });

  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update account
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, amount, type, due_date, status } = req.body;

    // Validation
    if (!title || !amount || !type || !due_date) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (!['pagar', 'receber'].includes(type)) {
      return res.status(400).json({ message: 'Type must be either "pagar" or "receber"' });
    }

    if (!['pendente', 'pago'].includes(status)) {
      return res.status(400).json({ message: 'Status must be either "pendente" or "pago"' });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    const connection = await createConnection(req.dbConfig);

    // Check if account exists and belongs to user
    const [existing] = await connection.execute(
      'SELECT * FROM accounts WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existing.length === 0) {
      await connection.end();
      return res.status(404).json({ message: 'Account not found' });
    }

    // Update account
    await connection.execute(`
      UPDATE accounts 
      SET title = ?, description = ?, amount = ?, type = ?, due_date = ?, status = ?, updated_at = NOW()
      WHERE id = ? AND user_id = ?
    `, [title, description || '', amount, type, due_date, status, id, req.user.id]);

    // Get updated account
    const [updated] = await connection.execute(
      'SELECT * FROM accounts WHERE id = ?',
      [id]
    );

    await connection.end();

    res.json({
      message: 'Account updated successfully',
      account: updated[0]
    });

  } catch (error) {
    console.error('Update account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete account
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const connection = await createConnection(req.dbConfig);

    // Check if account exists and belongs to user
    const [existing] = await connection.execute(
      'SELECT * FROM accounts WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existing.length === 0) {
      await connection.end();
      return res.status(404).json({ message: 'Account not found' });
    }

    // Delete account
    await connection.execute(
      'DELETE FROM accounts WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    await connection.end();

    res.json({ message: 'Account deleted successfully' });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;