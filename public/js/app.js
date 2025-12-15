// Global state
let products = [];
let movements = [];
let currentEditingProductId = null;

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount) + ' FCFA';
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showNotification(message, type = 'success') {
    // Simple alert for now - could be enhanced with a toast notification library
    alert(message);
}

// Modal Functions
function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Tab Navigation
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
        
        // Load tab-specific data
        switch(tabName) {
            case 'dashboard':
                loadDashboard();
                break;
            case 'products':
                loadProducts();
                break;
            case 'stock':
                loadMovements();
                break;
            case 'reports':
                // Reports loaded on demand
                break;
        }
    });
});

// Dashboard Functions
async function loadDashboard() {
    try {
        const stats = await reportsAPI.getDashboard();
        
        if (stats.success) {
            const data = stats.data;
            document.getElementById('total-products').textContent = data.total_products;
            document.getElementById('stock-value').textContent = formatCurrency(data.stock_value);
            document.getElementById('total-revenue').textContent = formatCurrency(data.total_revenue);
            document.getElementById('total-profit').textContent = formatCurrency(data.total_profit);
            document.getElementById('low-stock').textContent = data.low_stock_items;
        }
        
        // Load charts
        loadSalesChart();
        loadProfitChart();
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function loadSalesChart() {
    try {
        const response = await reportsAPI.getSalesByPeriod('month');
        
        if (response.success && response.data.sales.length > 0) {
            const sales = response.data.sales;
            const dates = {};
            
            sales.forEach(sale => {
                const date = new Date(sale.sale_date).toLocaleDateString('fr-FR');
                if (!dates[date]) {
                    dates[date] = 0;
                }
                dates[date] += parseFloat(sale.total_revenue);
            });
            
            const ctx = document.getElementById('salesChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: Object.keys(dates),
                    datasets: [{
                        label: 'Chiffre d\'Affaires (FCFA)',
                        data: Object.values(dates),
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: true
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error loading sales chart:', error);
    }
}

async function loadProfitChart() {
    try {
        const response = await reportsAPI.getProfitByProduct();
        
        if (response.success && response.data.length > 0) {
            const products = response.data.slice(0, 10); // Top 10
            
            const ctx = document.getElementById('profitChart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: products.map(p => p.name),
                    datasets: [{
                        label: 'Bénéfices (FCFA)',
                        data: products.map(p => p.total_profit_earned),
                        backgroundColor: '#10b981'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error loading profit chart:', error);
    }
}

// Products Functions
async function loadProducts() {
    try {
        const response = await productsAPI.getAll();
        
        if (response.success) {
            products = response.data;
            renderProducts(products);
            loadCategories();
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Erreur lors du chargement des produits', 'error');
    }
}

function renderProducts(productsToRender) {
    const tbody = document.getElementById('products-table-body');
    
    if (productsToRender.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <div class="empty-state-icon">📦</div>
                    <p>Aucun produit trouvé</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = productsToRender.map(product => {
        const margin = product.selling_price - product.purchase_price;
        const stockClass = product.quantity < 10 ? 'badge-low' : '';
        
        return `
            <tr>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td><span class="badge ${stockClass}">${product.quantity}</span></td>
                <td>${formatCurrency(product.purchase_price)}</td>
                <td>${formatCurrency(product.selling_price)}</td>
                <td>${product.supplier || '-'}</td>
                <td>${formatCurrency(margin)}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn btn-sm btn-primary" onclick="editProduct(${product.id})">
                            ✏️
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

async function loadCategories() {
    try {
        const response = await productsAPI.getCategories();
        
        if (response.success) {
            const filterSelect = document.getElementById('filter-category');
            const datalist = document.getElementById('categories-list');
            
            filterSelect.innerHTML = '<option value="">Toutes les catégories</option>' +
                response.data.map(cat => `<option value="${cat}">${cat}</option>`).join('');
            
            datalist.innerHTML = response.data.map(cat => `<option value="${cat}">`).join('');
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function showProductModal(productId = null) {
    currentEditingProductId = productId;
    
    if (productId) {
        // Edit mode
        const product = products.find(p => p.id === productId);
        if (product) {
            document.getElementById('product-modal-title').textContent = 'Modifier Produit';
            document.getElementById('product-id').value = product.id;
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-category').value = product.category;
            document.getElementById('product-quantity').value = product.quantity;
            document.getElementById('product-purchase-price').value = product.purchase_price;
            document.getElementById('product-selling-price').value = product.selling_price;
            document.getElementById('product-supplier').value = product.supplier || '';
        }
    } else {
        // Create mode
        document.getElementById('product-modal-title').textContent = 'Nouveau Produit';
        document.getElementById('product-form').reset();
        document.getElementById('product-id').value = '';
    }
    
    showModal('product-modal');
}

function editProduct(productId) {
    showProductModal(productId);
}

async function deleteProduct(productId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
        return;
    }
    
    try {
        const response = await productsAPI.delete(productId);
        
        if (response.success) {
            showNotification('Produit supprimé avec succès');
            loadProducts();
        }
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Stock Movement Functions
async function loadMovements() {
    try {
        const response = await stockAPI.getAllMovements();
        
        if (response.success) {
            movements = response.data;
            renderMovements(movements);
        }
    } catch (error) {
        console.error('Error loading movements:', error);
        showNotification('Erreur lors du chargement des mouvements', 'error');
    }
}

function renderMovements(movementsToRender) {
    const tbody = document.getElementById('movements-table-body');
    
    if (movementsToRender.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <p>Aucun mouvement enregistré</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = movementsToRender.map(movement => `
        <tr>
            <td>${formatDate(movement.created_at)}</td>
            <td>
                <span class="badge badge-${movement.movement_type}">
                    ${movement.movement_type === 'entry' ? '📥 Entrée' : '📤 Sortie'}
                </span>
            </td>
            <td>${movement.product_name}</td>
            <td>${movement.product_category}</td>
            <td>${movement.quantity}</td>
            <td>${formatCurrency(movement.unit_price)}</td>
            <td>${formatCurrency(movement.total_amount)}</td>
            <td>${movement.note || '-'}</td>
        </tr>
    `).join('');
}

async function showStockModal(type) {
    document.getElementById('stock-movement-type').value = type;
    document.getElementById('stock-modal-title').textContent = 
        type === 'entry' ? 'Entrée de Stock' : 'Sortie de Stock (Vente)';
    document.getElementById('stock-form').reset();
    
    // Load products for selection
    try {
        const response = await productsAPI.getAll();
        if (response.success) {
            const select = document.getElementById('stock-product-id');
            select.innerHTML = '<option value="">Sélectionnez un produit...</option>' +
                response.data.map(p => `
                    <option value="${p.id}" data-price="${p.selling_price}">
                        ${p.name} (Stock: ${p.quantity})
                    </option>
                `).join('');
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
    
    showModal('stock-modal');
}

// Report Functions
async function generateReport() {
    const reportType = document.getElementById('report-type').value;
    const year = document.getElementById('report-year').value;
    const month = document.getElementById('report-month').value;
    
    const resultsDiv = document.getElementById('report-results');
    resultsDiv.innerHTML = '<div class="loading">Chargement du rapport</div>';
    
    try {
        let response;
        
        if (reportType === 'monthly') {
            response = await reportsAPI.getMonthlyReport(year, month);
        } else {
            response = await reportsAPI.getAnnualReport(year);
        }
        
        if (response.success) {
            renderReport(response.data, reportType);
        }
    } catch (error) {
        resultsDiv.innerHTML = `
            <div class="empty-state">
                <p>Erreur lors de la génération du rapport</p>
            </div>
        `;
    }
}

function renderReport(data, type) {
    const resultsDiv = document.getElementById('report-results');
    
    let html = `
        <div class="report-summary">
            <h3>${type === 'monthly' ? 'Rapport Mensuel' : 'Rapport Annuel'} - ${data.period || data.year}</h3>
            <div class="summary-grid">
                <div class="summary-item">
                    <h4>${formatCurrency(data.summary.total_revenue)}</h4>
                    <p>Chiffre d'Affaires</p>
                </div>
                <div class="summary-item">
                    <h4>${formatCurrency(data.summary.total_profit)}</h4>
                    <p>Bénéfices</p>
                </div>
            </div>
        </div>
    `;
    
    if (type === 'annual' && data.monthly_sales) {
        html += `
            <h4>Ventes Mensuelles</h4>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Mois</th>
                        <th>Nombre de Ventes</th>
                        <th>Chiffre d'Affaires</th>
                        <th>Bénéfices</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.monthly_sales.map(m => `
                        <tr>
                            <td>Mois ${m.month}</td>
                            <td>${m.total_sales}</td>
                            <td>${formatCurrency(m.total_revenue)}</td>
                            <td>${formatCurrency(m.total_profit)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
    
    resultsDiv.innerHTML = html;
}

// Form Handlers
document.getElementById('product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const productData = {
        name: document.getElementById('product-name').value,
        category: document.getElementById('product-category').value,
        quantity: parseInt(document.getElementById('product-quantity').value),
        purchase_price: parseFloat(document.getElementById('product-purchase-price').value),
        selling_price: parseFloat(document.getElementById('product-selling-price').value),
        supplier: document.getElementById('product-supplier').value
    };
    
    try {
        let response;
        const productId = document.getElementById('product-id').value;
        
        if (productId) {
            response = await productsAPI.update(productId, productData);
        } else {
            response = await productsAPI.create(productData);
        }
        
        if (response.success) {
            showNotification(response.message);
            closeModal('product-modal');
            loadProducts();
        }
    } catch (error) {
        showNotification(error.message, 'error');
    }
});

document.getElementById('stock-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const movementType = document.getElementById('stock-movement-type').value;
    const movementData = {
        product_id: parseInt(document.getElementById('stock-product-id').value),
        quantity: parseInt(document.getElementById('stock-quantity').value),
        unit_price: parseFloat(document.getElementById('stock-unit-price').value),
        note: document.getElementById('stock-note').value
    };
    
    try {
        let response;
        
        if (movementType === 'entry') {
            response = await stockAPI.recordEntry(movementData);
        } else {
            response = await stockAPI.recordExit(movementData);
        }
        
        if (response.success) {
            showNotification(response.message);
            closeModal('stock-modal');
            loadMovements();
            loadDashboard(); // Refresh dashboard stats
        }
    } catch (error) {
        showNotification(error.message, 'error');
    }
});

// Search and Filter
document.getElementById('search-product').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.category.toLowerCase().includes(searchTerm)
    );
    renderProducts(filtered);
});

document.getElementById('filter-category').addEventListener('change', (e) => {
    const category = e.target.value;
    const filtered = category ? products.filter(p => p.category === category) : products;
    renderProducts(filtered);
});

// Report type change handler
document.getElementById('report-type').addEventListener('change', (e) => {
    const monthSelector = document.getElementById('month-selector');
    monthSelector.style.display = e.target.value === 'monthly' ? 'block' : 'none';
});

// Auto-fill selling price in stock exit modal
document.getElementById('stock-product-id').addEventListener('change', (e) => {
    const selected = e.target.selectedOptions[0];
    if (selected && selected.dataset.price) {
        document.getElementById('stock-unit-price').value = selected.dataset.price;
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
    
    // Set current year
    const currentYear = new Date().getFullYear();
    document.getElementById('report-year').value = currentYear;
    
    // Set current month
    const currentMonth = new Date().getMonth() + 1;
    document.getElementById('report-month').value = currentMonth;
});
