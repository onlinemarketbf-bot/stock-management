// API Base URL
const API_BASE = window.location.origin;

// State
let currentView = 'dashboard';
let products = [];
let categories = [];
let movements = [];
let editingProductId = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initModals();
    loadDashboard();
});

// Navigation
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = item.dataset.view;
            switchView(view);
        });
    });
}

function switchView(view) {
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.view === view) {
            item.classList.add('active');
        }
    });

    // Update active view
    document.querySelectorAll('.view').forEach(v => {
        v.classList.remove('active');
    });
    document.getElementById(`${view}-view`).classList.add('active');

    // Update page title
    const titles = {
        dashboard: 'Tableau de bord',
        products: 'Gestion des produits',
        categories: 'Gestion des catégories',
        movements: 'Mouvements de stock',
        alerts: 'Alertes de stock'
    };
    document.getElementById('page-title').textContent = titles[view];

    currentView = view;

    // Load data for the view
    switch(view) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'products':
            loadProducts();
            break;
        case 'categories':
            loadCategories();
            break;
        case 'movements':
            loadMovements();
            break;
        case 'alerts':
            loadAlerts();
            break;
    }
}

// Dashboard
async function loadDashboard() {
    try {
        // Load stats
        const statsResponse = await fetch(`${API_BASE}/api/dashboard/stats`);
        const stats = await statsResponse.json();
        
        document.getElementById('stat-total-products').textContent = stats.totalProducts;
        document.getElementById('stat-total-stock').textContent = stats.totalStock;
        document.getElementById('stat-low-stock').textContent = stats.lowStockProducts;
        document.getElementById('stat-total-value').textContent = formatCurrency(stats.totalValue);

        // Load recent movements
        const movementsResponse = await fetch(`${API_BASE}/api/movements`);
        const movements = await movementsResponse.json();
        
        const tbody = document.getElementById('recent-movements-body');
        if (movements.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Aucun mouvement récent</td></tr>';
        } else {
            tbody.innerHTML = movements.slice(0, 10).map(m => `
                <tr>
                    <td>${formatDate(m.created_at)}</td>
                    <td>${m.product_name} (${m.reference})</td>
                    <td><span class="badge ${m.type === 'IN' ? 'badge-success' : 'badge-danger'}">${m.type === 'IN' ? 'Entrée' : 'Sortie'}</span></td>
                    <td>${m.quantity}</td>
                    <td>${m.reason || '-'}</td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showError('Erreur lors du chargement du tableau de bord');
    }
}

// Products
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE}/api/products`);
        products = await response.json();
        
        const tbody = document.getElementById('products-body');
        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">Aucun produit. Cliquez sur "Ajouter un produit" pour commencer.</td></tr>';
        } else {
            tbody.innerHTML = products.map(p => `
                <tr>
                    <td>${p.reference}</td>
                    <td>${p.name}</td>
                    <td>${p.category_name || '-'}</td>
                    <td>${formatCurrency(p.price)}</td>
                    <td class="${p.quantity <= p.min_stock ? 'status-low' : 'status-ok'}">${p.quantity}</td>
                    <td>${p.min_stock}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="editProduct(${p.id})">✏️</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteProduct(${p.id})">🗑️</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Erreur lors du chargement des produits');
    }
}

async function saveProduct(formData) {
    try {
        const url = editingProductId 
            ? `${API_BASE}/api/products/${editingProductId}`
            : `${API_BASE}/api/products`;
        
        const method = editingProductId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Failed to save product');
        
        closeModal('product-modal');
        loadProducts();
        showSuccess(editingProductId ? 'Produit modifié avec succès' : 'Produit ajouté avec succès');
    } catch (error) {
        console.error('Error saving product:', error);
        showError('Erreur lors de l\'enregistrement du produit');
    }
}

async function editProduct(id) {
    try {
        const response = await fetch(`${API_BASE}/api/products/${id}`);
        const product = await response.json();
        
        editingProductId = id;
        document.getElementById('product-modal-title').textContent = 'Modifier le produit';
        document.getElementById('product-id').value = id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-reference').value = product.reference;
        document.getElementById('product-category').value = product.category_id || '';
        document.getElementById('product-description').value = product.description || '';
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-quantity').value = product.quantity;
        document.getElementById('product-min-stock').value = product.min_stock;
        document.getElementById('product-image').value = product.image_url || '';
        
        openModal('product-modal');
    } catch (error) {
        console.error('Error loading product:', error);
        showError('Erreur lors du chargement du produit');
    }
}

async function deleteProduct(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/api/products/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete product');
        
        loadProducts();
        showSuccess('Produit supprimé avec succès');
    } catch (error) {
        console.error('Error deleting product:', error);
        showError('Erreur lors de la suppression du produit');
    }
}

// Categories
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE}/api/categories`);
        categories = await response.json();
        
        const tbody = document.getElementById('categories-body');
        if (categories.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center">Aucune catégorie. Cliquez sur "Ajouter une catégorie" pour commencer.</td></tr>';
        } else {
            tbody.innerHTML = categories.map(c => `
                <tr>
                    <td>${c.name}</td>
                    <td>${c.description || '-'}</td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="deleteCategory(${c.id})">🗑️</button>
                    </td>
                </tr>
            `).join('');
        }
        
        // Update product form category dropdown
        updateCategoryDropdown();
    } catch (error) {
        console.error('Error loading categories:', error);
        showError('Erreur lors du chargement des catégories');
    }
}

function updateCategoryDropdown() {
    const select = document.getElementById('product-category');
    select.innerHTML = '<option value="">Sélectionner...</option>' + 
        categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

async function saveCategory(formData) {
    try {
        const response = await fetch(`${API_BASE}/api/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Failed to save category');
        
        closeModal('category-modal');
        loadCategories();
        showSuccess('Catégorie ajoutée avec succès');
    } catch (error) {
        console.error('Error saving category:', error);
        showError('Erreur lors de l\'enregistrement de la catégorie');
    }
}

async function deleteCategory(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/api/categories/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete category');
        
        loadCategories();
        showSuccess('Catégorie supprimée avec succès');
    } catch (error) {
        console.error('Error deleting category:', error);
        showError('Erreur lors de la suppression de la catégorie');
    }
}

// Movements
async function loadMovements() {
    try {
        const response = await fetch(`${API_BASE}/api/movements`);
        movements = await response.json();
        
        const tbody = document.getElementById('movements-body');
        if (movements.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">Aucun mouvement enregistré</td></tr>';
        } else {
            tbody.innerHTML = movements.map(m => `
                <tr>
                    <td>${formatDate(m.created_at)}</td>
                    <td>${m.reference}</td>
                    <td>${m.product_name}</td>
                    <td><span class="badge ${m.type === 'IN' ? 'badge-success' : 'badge-danger'}">${m.type === 'IN' ? 'Entrée' : 'Sortie'}</span></td>
                    <td>${m.quantity}</td>
                    <td>${m.reason || '-'}</td>
                    <td>${m.user || '-'}</td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading movements:', error);
        showError('Erreur lors du chargement des mouvements');
    }
}

async function saveMovement(formData) {
    try {
        const response = await fetch(`${API_BASE}/api/movements`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Failed to save movement');
        
        closeModal('movement-modal');
        loadMovements();
        showSuccess('Mouvement enregistré avec succès');
    } catch (error) {
        console.error('Error saving movement:', error);
        showError('Erreur lors de l\'enregistrement du mouvement');
    }
}

// Alerts
async function loadAlerts() {
    try {
        const response = await fetch(`${API_BASE}/api/alerts/low-stock`);
        const alerts = await response.json();
        
        const tbody = document.getElementById('alerts-body');
        if (alerts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">✅ Tous les produits ont un stock suffisant</td></tr>';
        } else {
            tbody.innerHTML = alerts.map(p => `
                <tr>
                    <td>${p.reference}</td>
                    <td>${p.name}</td>
                    <td>${p.category_name || '-'}</td>
                    <td class="status-low">${p.quantity}</td>
                    <td>${p.min_stock}</td>
                    <td>
                        <button class="btn btn-sm btn-success" onclick="quickRestock(${p.id}, '${p.name}')">📦 Réapprovisionner</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading alerts:', error);
        showError('Erreur lors du chargement des alertes');
    }
}

function quickRestock(productId, productName) {
    document.getElementById('movement-product').value = productId;
    document.getElementById('movement-type').value = 'IN';
    document.getElementById('movement-reason').value = `Réapprovisionnement de ${productName}`;
    openModal('movement-modal');
}

// Modal Management
function initModals() {
    // Product modal
    document.getElementById('add-product-btn').addEventListener('click', () => {
        editingProductId = null;
        document.getElementById('product-modal-title').textContent = 'Ajouter un produit';
        document.getElementById('product-form').reset();
        loadCategories(); // Ensure categories are loaded
        openModal('product-modal');
    });

    document.getElementById('product-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = {
            name: document.getElementById('product-name').value,
            reference: document.getElementById('product-reference').value,
            category_id: document.getElementById('product-category').value || null,
            description: document.getElementById('product-description').value,
            price: parseFloat(document.getElementById('product-price').value),
            quantity: parseInt(document.getElementById('product-quantity').value),
            min_stock: parseInt(document.getElementById('product-min-stock').value),
            image_url: document.getElementById('product-image').value
        };
        saveProduct(formData);
    });

    document.getElementById('cancel-product-btn').addEventListener('click', () => {
        closeModal('product-modal');
    });

    // Category modal
    document.getElementById('add-category-btn').addEventListener('click', () => {
        document.getElementById('category-form').reset();
        openModal('category-modal');
    });

    document.getElementById('category-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = {
            name: document.getElementById('category-name').value,
            description: document.getElementById('category-description').value
        };
        saveCategory(formData);
    });

    document.getElementById('cancel-category-btn').addEventListener('click', () => {
        closeModal('category-modal');
    });

    // Movement modal
    document.getElementById('add-movement-btn').addEventListener('click', async () => {
        document.getElementById('movement-form').reset();
        await loadProductsForMovement();
        openModal('movement-modal');
    });

    document.getElementById('movement-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = {
            product_id: parseInt(document.getElementById('movement-product').value),
            type: document.getElementById('movement-type').value,
            quantity: parseInt(document.getElementById('movement-quantity').value),
            reason: document.getElementById('movement-reason').value,
            user: document.getElementById('movement-user').value
        };
        saveMovement(formData);
    });

    document.getElementById('cancel-movement-btn').addEventListener('click', () => {
        closeModal('movement-modal');
    });

    // Close modals on X click
    document.querySelectorAll('.modal .close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            closeModal(modal.id);
        });
    });

    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
}

async function loadProductsForMovement() {
    try {
        const response = await fetch(`${API_BASE}/api/products`);
        const products = await response.json();
        
        const select = document.getElementById('movement-product');
        select.innerHTML = '<option value="">Sélectionner un produit...</option>' + 
            products.map(p => `<option value="${p.id}">${p.name} (${p.reference}) - Stock: ${p.quantity}</option>`).join('');
    } catch (error) {
        console.error('Error loading products for movement:', error);
    }
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount) + ' FCFA';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

function showSuccess(message) {
    alert('✅ ' + message);
}

function showError(message) {
    alert('❌ ' + message);
}
