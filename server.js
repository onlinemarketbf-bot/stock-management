const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database('./stock.db', (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Database connected');
    initDatabase();
  }
});

// Initialize database tables
function initDatabase() {
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    reference TEXT UNIQUE NOT NULL,
    category_id INTEGER,
    description TEXT,
    price REAL NOT NULL,
    quantity INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS stock_movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    reason TEXT,
    user TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
  )`);

  console.log('Database tables initialized');
}

// API Routes

// Categories
app.get('/api/categories', (req, res) => {
  db.all('SELECT * FROM categories ORDER BY name', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/categories', (req, res) => {
  const { name, description } = req.body;
  db.run('INSERT INTO categories (name, description) VALUES (?, ?)',
    [name, description],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, name, description });
    }
  );
});

app.delete('/api/categories/:id', (req, res) => {
  db.run('DELETE FROM categories WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ deleted: this.changes });
  });
});

// Products
app.get('/api/products', (req, res) => {
  const query = `
    SELECT p.*, c.name as category_name 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    ORDER BY p.name
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/products/:id', (req, res) => {
  const query = `
    SELECT p.*, c.name as category_name 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    WHERE p.id = ?
  `;
  db.get(query, [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

app.post('/api/products', (req, res) => {
  const { name, reference, category_id, description, price, quantity, min_stock, image_url } = req.body;
  const query = `INSERT INTO products (name, reference, category_id, description, price, quantity, min_stock, image_url) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  
  db.run(query, [name, reference, category_id, description, price, quantity || 0, min_stock || 0, image_url],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, ...req.body });
    }
  );
});

app.put('/api/products/:id', (req, res) => {
  const { name, reference, category_id, description, price, quantity, min_stock, image_url } = req.body;
  const query = `UPDATE products 
                 SET name = ?, reference = ?, category_id = ?, description = ?, 
                     price = ?, quantity = ?, min_stock = ?, image_url = ?, 
                     updated_at = CURRENT_TIMESTAMP 
                 WHERE id = ?`;
  
  db.run(query, [name, reference, category_id, description, price, quantity, min_stock, image_url, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ updated: this.changes });
    }
  );
});

app.delete('/api/products/:id', (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ deleted: this.changes });
  });
});

// Stock Movements
app.get('/api/movements', (req, res) => {
  const query = `
    SELECT sm.*, p.name as product_name, p.reference 
    FROM stock_movements sm 
    JOIN products p ON sm.product_id = p.id 
    ORDER BY sm.created_at DESC 
    LIMIT 100
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/movements/:productId', (req, res) => {
  const query = `
    SELECT sm.*, p.name as product_name, p.reference 
    FROM stock_movements sm 
    JOIN products p ON sm.product_id = p.id 
    WHERE sm.product_id = ?
    ORDER BY sm.created_at DESC
  `;
  db.all(query, [req.params.productId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/movements', (req, res) => {
  const { product_id, type, quantity, reason, user } = req.body;
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // Insert movement
    db.run(
      'INSERT INTO stock_movements (product_id, type, quantity, reason, user) VALUES (?, ?, ?, ?, ?)',
      [product_id, type, quantity, reason, user],
      function(err) {
        if (err) {
          db.run('ROLLBACK');
          res.status(500).json({ error: err.message });
          return;
        }
        
        const movementId = this.lastID;
        
        // Update product quantity
        const quantityChange = type === 'IN' ? quantity : -quantity;
        db.run(
          'UPDATE products SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [quantityChange, product_id],
          function(err) {
            if (err) {
              db.run('ROLLBACK');
              res.status(500).json({ error: err.message });
              return;
            }
            
            db.run('COMMIT');
            res.json({ id: movementId, ...req.body });
          }
        );
      }
    );
  });
});

// Dashboard Stats
app.get('/api/dashboard/stats', (req, res) => {
  const stats = {};
  
  db.get('SELECT COUNT(*) as total FROM products', [], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    stats.totalProducts = row.total;
    
    db.get('SELECT SUM(quantity) as total FROM products', [], (err, row) => {
      stats.totalStock = row.total || 0;
      
      db.get('SELECT COUNT(*) as total FROM products WHERE quantity <= min_stock', [], (err, row) => {
        stats.lowStockProducts = row.total;
        
        db.get('SELECT SUM(price * quantity) as total FROM products', [], (err, row) => {
          stats.totalValue = row.total || 0;
          res.json(stats);
        });
      });
    });
  });
});

// Low stock alerts
app.get('/api/alerts/low-stock', (req, res) => {
  const query = `
    SELECT p.*, c.name as category_name 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    WHERE p.quantity <= p.min_stock
    ORDER BY p.quantity ASC
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed');
    process.exit(0);
  });
});
