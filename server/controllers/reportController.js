const { pool } = require('../database/config');

// Get dashboard statistics
async function getDashboardStats(req, res) {
  try {
    // Total products
    const [productCount] = await pool.query(
      'SELECT COUNT(*) as total FROM products'
    );
    
    // Total stock value (based on purchase price)
    const [stockValue] = await pool.query(
      'SELECT SUM(quantity * purchase_price) as total FROM products'
    );
    
    // Total revenue (all time)
    const [revenue] = await pool.query(
      'SELECT SUM(total_revenue) as total FROM sales'
    );
    
    // Total profit (all time)
    const [profit] = await pool.query(
      'SELECT SUM(total_profit) as total FROM sales'
    );
    
    // Low stock products (quantity < 10)
    const [lowStock] = await pool.query(
      'SELECT COUNT(*) as total FROM products WHERE quantity < 10'
    );
    
    res.json({
      success: true,
      data: {
        total_products: productCount[0].total,
        stock_value: stockValue[0].total || 0,
        total_revenue: revenue[0].total || 0,
        total_profit: profit[0].total || 0,
        low_stock_items: lowStock[0].total
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des statistiques' });
  }
}

// Get sales by period
async function getSalesByPeriod(req, res) {
  try {
    const { period } = req.params; // 'today', 'week', 'month', 'year'
    
    let dateFilter = '';
    switch (period) {
      case 'today':
        dateFilter = 'DATE(sale_date) = CURDATE()';
        break;
      case 'week':
        dateFilter = 'YEARWEEK(sale_date) = YEARWEEK(NOW())';
        break;
      case 'month':
        dateFilter = 'YEAR(sale_date) = YEAR(NOW()) AND MONTH(sale_date) = MONTH(NOW())';
        break;
      case 'year':
        dateFilter = 'YEAR(sale_date) = YEAR(NOW())';
        break;
      default:
        dateFilter = '1=1'; // All time
    }
    
    const [sales] = await pool.query(`
      SELECT 
        s.*,
        p.name as product_name,
        p.category as product_category
      FROM sales s
      JOIN products p ON s.product_id = p.id
      WHERE ${dateFilter}
      ORDER BY s.sale_date DESC
    `);
    
    // Calculate totals
    const total_revenue = sales.reduce((sum, sale) => sum + parseFloat(sale.total_revenue), 0);
    const total_profit = sales.reduce((sum, sale) => sum + parseFloat(sale.total_profit), 0);
    const total_sales = sales.length;
    
    res.json({
      success: true,
      data: {
        sales,
        summary: {
          total_sales,
          total_revenue,
          total_profit
        }
      }
    });
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des ventes' });
  }
}

// Get monthly report
async function getMonthlyReport(req, res) {
  try {
    const { year, month } = req.params;
    
    const [sales] = await pool.query(`
      SELECT 
        s.*,
        p.name as product_name,
        p.category as product_category
      FROM sales s
      JOIN products p ON s.product_id = p.id
      WHERE YEAR(s.sale_date) = ? AND MONTH(s.sale_date) = ?
      ORDER BY s.sale_date DESC
    `, [year, month]);
    
    // Group by product
    const productSales = {};
    sales.forEach(sale => {
      if (!productSales[sale.product_id]) {
        productSales[sale.product_id] = {
          product_name: sale.product_name,
          category: sale.product_category,
          total_quantity: 0,
          total_revenue: 0,
          total_profit: 0
        };
      }
      productSales[sale.product_id].total_quantity += sale.quantity;
      productSales[sale.product_id].total_revenue += parseFloat(sale.total_revenue);
      productSales[sale.product_id].total_profit += parseFloat(sale.total_profit);
    });
    
    const total_revenue = sales.reduce((sum, sale) => sum + parseFloat(sale.total_revenue), 0);
    const total_profit = sales.reduce((sum, sale) => sum + parseFloat(sale.total_profit), 0);
    
    res.json({
      success: true,
      data: {
        period: `${year}-${month}`,
        sales,
        product_summary: Object.values(productSales),
        summary: {
          total_sales: sales.length,
          total_revenue,
          total_profit
        }
      }
    });
  } catch (error) {
    console.error('Error fetching monthly report:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la génération du rapport mensuel' });
  }
}

// Get annual report
async function getAnnualReport(req, res) {
  try {
    const { year } = req.params;
    
    const [monthlySales] = await pool.query(`
      SELECT 
        MONTH(sale_date) as month,
        COUNT(*) as total_sales,
        SUM(total_revenue) as total_revenue,
        SUM(total_profit) as total_profit
      FROM sales
      WHERE YEAR(sale_date) = ?
      GROUP BY MONTH(sale_date)
      ORDER BY MONTH(sale_date)
    `, [year]);
    
    const [categorySales] = await pool.query(`
      SELECT 
        p.category,
        COUNT(s.id) as total_sales,
        SUM(s.total_revenue) as total_revenue,
        SUM(s.total_profit) as total_profit
      FROM sales s
      JOIN products p ON s.product_id = p.id
      WHERE YEAR(s.sale_date) = ?
      GROUP BY p.category
    `, [year]);
    
    const total_revenue = monthlySales.reduce((sum, m) => sum + parseFloat(m.total_revenue || 0), 0);
    const total_profit = monthlySales.reduce((sum, m) => sum + parseFloat(m.total_profit || 0), 0);
    
    res.json({
      success: true,
      data: {
        year,
        monthly_sales: monthlySales,
        category_sales: categorySales,
        summary: {
          total_revenue,
          total_profit
        }
      }
    });
  } catch (error) {
    console.error('Error fetching annual report:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la génération du rapport annuel' });
  }
}

// Get profit by product
async function getProfitByProduct(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.category,
        p.quantity,
        p.purchase_price,
        p.selling_price,
        (p.selling_price - p.purchase_price) as unit_profit,
        COALESCE(SUM(s.total_profit), 0) as total_profit_earned,
        COALESCE(SUM(s.quantity), 0) as total_sold
      FROM products p
      LEFT JOIN sales s ON p.id = s.product_id
      GROUP BY p.id
      ORDER BY total_profit_earned DESC
    `);
    
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching profit by product:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des bénéfices' });
  }
}

module.exports = {
  getDashboardStats,
  getSalesByPeriod,
  getMonthlyReport,
  getAnnualReport,
  getProfitByProduct
};
