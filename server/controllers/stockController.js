const { pool } = require('../database/config');

// Record stock entry
async function recordEntry(req, res) {
  const connection = await pool.getConnection();
  
  try {
    const { product_id, quantity, unit_price, note } = req.body;
    
    // Validation
    if (!product_id || !quantity || !unit_price) {
      return res.status(400).json({ 
        success: false, 
        message: 'product_id, quantity et unit_price sont requis' 
      });
    }
    
    await connection.beginTransaction();
    
    // Check if product exists
    const [products] = await connection.query(
      'SELECT * FROM products WHERE id = ?',
      [product_id]
    );
    
    if (products.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }
    
    const total_amount = quantity * unit_price;
    
    // Record movement
    await connection.query(
      'INSERT INTO stock_movements (product_id, movement_type, quantity, unit_price, total_amount, note) VALUES (?, ?, ?, ?, ?, ?)',
      [product_id, 'entry', quantity, unit_price, total_amount, note || null]
    );
    
    // Update product quantity
    await connection.query(
      'UPDATE products SET quantity = quantity + ? WHERE id = ?',
      [quantity, product_id]
    );
    
    await connection.commit();
    
    res.status(201).json({ 
      success: true, 
      message: 'Entrée de stock enregistrée avec succès' 
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error recording entry:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'enregistrement de l\'entrée' });
  } finally {
    connection.release();
  }
}

// Record stock exit (sale)
async function recordExit(req, res) {
  const connection = await pool.getConnection();
  
  try {
    const { product_id, quantity, unit_price, note } = req.body;
    
    // Validation
    if (!product_id || !quantity || !unit_price) {
      return res.status(400).json({ 
        success: false, 
        message: 'product_id, quantity et unit_price sont requis' 
      });
    }
    
    await connection.beginTransaction();
    
    // Check if product exists and has enough stock
    const [products] = await connection.query(
      'SELECT * FROM products WHERE id = ?',
      [product_id]
    );
    
    if (products.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }
    
    const product = products[0];
    
    if (product.quantity < quantity) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false, 
        message: `Stock insuffisant. Disponible: ${product.quantity}` 
      });
    }
    
    const total_amount = quantity * unit_price;
    const total_revenue = total_amount;
    const total_profit = (unit_price - product.purchase_price) * quantity;
    
    // Record movement
    await connection.query(
      'INSERT INTO stock_movements (product_id, movement_type, quantity, unit_price, total_amount, note) VALUES (?, ?, ?, ?, ?, ?)',
      [product_id, 'exit', quantity, unit_price, total_amount, note || null]
    );
    
    // Record sale
    await connection.query(
      'INSERT INTO sales (product_id, quantity, unit_price, total_revenue, total_profit) VALUES (?, ?, ?, ?, ?)',
      [product_id, quantity, unit_price, total_revenue, total_profit]
    );
    
    // Update product quantity
    await connection.query(
      'UPDATE products SET quantity = quantity - ? WHERE id = ?',
      [quantity, product_id]
    );
    
    await connection.commit();
    
    res.status(201).json({ 
      success: true, 
      message: 'Sortie de stock enregistrée avec succès',
      data: {
        revenue: total_revenue,
        profit: total_profit
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error recording exit:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'enregistrement de la sortie' });
  } finally {
    connection.release();
  }
}

// Get all stock movements
async function getAllMovements(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        sm.*,
        p.name as product_name,
        p.category as product_category
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      ORDER BY sm.created_at DESC
    `);
    
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching movements:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des mouvements' });
  }
}

// Get movements by product
async function getMovementsByProduct(req, res) {
  try {
    const { product_id } = req.params;
    
    const [rows] = await pool.query(`
      SELECT * FROM stock_movements 
      WHERE product_id = ? 
      ORDER BY created_at DESC
    `, [product_id]);
    
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching movements:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des mouvements' });
  }
}

module.exports = {
  recordEntry,
  recordExit,
  getAllMovements,
  getMovementsByProduct
};
