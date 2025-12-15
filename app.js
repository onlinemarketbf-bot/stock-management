// Stock Management Application
class StockManager {
    constructor() {
        this.items = [];
        this.editingId = null;
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('itemForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Cancel button
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.resetForm();
        });

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });
    }

    handleSubmit() {
        const item = {
            id: this.editingId || Date.now().toString(),
            name: document.getElementById('itemName').value,
            category: document.getElementById('itemCategory').value,
            size: document.getElementById('itemSize').value,
            color: document.getElementById('itemColor').value,
            quantity: parseInt(document.getElementById('itemQuantity').value),
            price: parseFloat(document.getElementById('itemPrice').value)
        };

        if (this.editingId) {
            // Update existing item
            const index = this.items.findIndex(i => i.id === this.editingId);
            this.items[index] = item;
            this.showNotification('Article modifié avec succès!', 'success');
        } else {
            // Add new item
            this.items.push(item);
            this.showNotification('Article ajouté avec succès!', 'success');
        }

        this.saveToStorage();
        this.render();
        this.resetForm();
    }

    editItem(id) {
        const item = this.items.find(i => i.id === id);
        if (!item) return;

        this.editingId = id;
        document.getElementById('itemName').value = item.name;
        document.getElementById('itemCategory').value = item.category;
        document.getElementById('itemSize').value = item.size;
        document.getElementById('itemColor').value = item.color || '';
        document.getElementById('itemQuantity').value = item.quantity;
        document.getElementById('itemPrice').value = item.price;
        document.getElementById('submitBtnText').textContent = 'Modifier';

        // Scroll to form
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    }

    deleteItem(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet article?')) {
            this.items = this.items.filter(i => i.id !== id);
            this.saveToStorage();
            this.render();
            this.showNotification('Article supprimé avec succès!', 'success');
        }
    }

    resetForm() {
        document.getElementById('itemForm').reset();
        this.editingId = null;
        document.getElementById('submitBtnText').textContent = 'Ajouter';
    }

    handleSearch(query) {
        const tbody = document.getElementById('stockTableBody');
        const rows = tbody.getElementsByTagName('tr');

        for (let row of rows) {
            if (row.classList.contains('empty-state')) continue;
            
            const text = row.textContent.toLowerCase();
            if (text.includes(query.toLowerCase())) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    }

    render() {
        this.renderStats();
        this.renderTable();
    }

    renderStats() {
        const totalItems = this.items.length;
        const totalStock = this.items.reduce((sum, item) => sum + item.quantity, 0);
        const totalValue = this.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

        document.getElementById('totalItems').textContent = totalItems;
        document.getElementById('totalStock').textContent = totalStock;
        document.getElementById('totalValue').textContent = this.formatCurrency(totalValue);
    }

    renderTable() {
        const tbody = document.getElementById('stockTableBody');
        
        if (this.items.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-state">
                    <td colspan="8">Aucun article en stock. Ajoutez votre premier article!</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.items.map(item => {
            const rowClass = item.quantity === 0 ? 'out-of-stock' : item.quantity < 5 ? 'low-stock' : '';
            const total = item.quantity * item.price;

            return `
                <tr class="${rowClass}">
                    <td>${this.escapeHtml(item.name)}</td>
                    <td>${this.escapeHtml(item.category)}</td>
                    <td>${this.escapeHtml(item.size)}</td>
                    <td>${this.escapeHtml(item.color || '-')}</td>
                    <td>${item.quantity}</td>
                    <td>${this.formatCurrency(item.price)}</td>
                    <td>${this.formatCurrency(total)}</td>
                    <td class="actions">
                        <button class="btn btn-edit" onclick="stockManager.editItem('${item.id}')">
                            ✏️ Modifier
                        </button>
                        <button class="btn btn-delete" onclick="stockManager.deleteItem('${item.id}')">
                            🗑️ Supprimer
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('fr-FR').format(value) + ' FCFA';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveToStorage() {
        localStorage.setItem('stockItems', JSON.stringify(this.items));
    }

    loadFromStorage() {
        const stored = localStorage.getItem('stockItems');
        if (stored) {
            try {
                this.items = JSON.parse(stored);
            } catch (e) {
                console.error('Error loading from storage:', e);
                this.items = [];
            }
        }
    }

    showNotification(message, type) {
        // Simple notification - can be enhanced with a proper notification system
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'success' ? '#28a745' : '#dc3545'};
            color: white;
            border-radius: 5px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the application
const stockManager = new StockManager();
