const { pool } = require('../database/config');

// Get all products
async function getAllProducts(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM products ORDER BY created_at DESC'
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des produits' });
  }
}

// Get product by ID
async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }
    
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération du produit' });
  }
}

// Create new product
async function createProduct(req, res) {
  try {
    const { name, category, quantity, purchase_price, selling_price, supplier } = req.body;
    
    // Validation
    if (!name || !category || quantity === undefined || !purchase_price || !selling_price) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tous les champs obligatoires doivent être renseignés' 
      });
    }
    
    const [result] = await pool.query(
      'INSERT INTO products (name, category, quantity, purchase_price, selling_price, supplier) VALUES (?, ?, ?, ?, ?, ?)',
      [name, category, quantity, purchase_price, selling_price, supplier || null]
    );
    
    res.status(201).json({ 
      success: true, 
      message: 'Produit créé avec succès', 
      data: { id: result.insertId } 
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la création du produit' });
  }
}

// Update product
async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { name, category, quantity, purchase_price, selling_price, supplier } = req.body;
    
    const [result] = await pool.query(
      'UPDATE products SET name = ?, category = ?, quantity = ?, purchase_price = ?, selling_price = ?, supplier = ? WHERE id = ?',
      [name, category, quantity, purchase_price, selling_price, supplier, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }
    
    res.json({ success: true, message: 'Produit mis à jour avec succès' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du produit' });
  }
}

// Delete product
async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }
    
    res.json({ success: true, message: 'Produit supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression du produit' });
  }
}

// Get products by category
async function getProductsByCategory(req, res) {
  try {
    const { category } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM products WHERE category = ? ORDER BY name',
      [category]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des produits' });
  }
}

// Get all categories
async function getCategories(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT DISTINCT category FROM products ORDER BY category'
    );
    res.json({ success: true, data: rows.map(row => row.category) });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des catégories' });
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getCategories
};
