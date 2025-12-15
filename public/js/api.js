// API Base URL
const API_URL = '/api';

// Generic API call function
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Une erreur s\'est produite');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Products API
const productsAPI = {
    getAll: () => apiCall('/products'),
    getById: (id) => apiCall(`/products/${id}`),
    getByCategory: (category) => apiCall(`/products/category/${category}`),
    getCategories: () => apiCall('/products/categories'),
    create: (product) => apiCall('/products', {
        method: 'POST',
        body: JSON.stringify(product)
    }),
    update: (id, product) => apiCall(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(product)
    }),
    delete: (id) => apiCall(`/products/${id}`, {
        method: 'DELETE'
    })
};

// Stock API
const stockAPI = {
    recordEntry: (entry) => apiCall('/stock/entry', {
        method: 'POST',
        body: JSON.stringify(entry)
    }),
    recordExit: (exit) => apiCall('/stock/exit', {
        method: 'POST',
        body: JSON.stringify(exit)
    }),
    getAllMovements: () => apiCall('/stock/movements'),
    getMovementsByProduct: (productId) => apiCall(`/stock/movements/${productId}`)
};

// Reports API
const reportsAPI = {
    getDashboard: () => apiCall('/reports/dashboard'),
    getSalesByPeriod: (period) => apiCall(`/reports/sales/${period}`),
    getMonthlyReport: (year, month) => apiCall(`/reports/monthly/${year}/${month}`),
    getAnnualReport: (year) => apiCall(`/reports/annual/${year}`),
    getProfitByProduct: () => apiCall('/reports/profit-by-product')
};
