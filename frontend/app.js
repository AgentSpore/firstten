// Global state
let currentView = 'dashboard';
let searchTimeout;
let leads = [];

// API base URL
const API_BASE = '/api';

// DOM elements
const searchInput = document.getElementById('search-input');
const dashboardBtn = document.getElementById('dashboard-btn');
const leadsBtn = document.getElementById('leads-btn');
const analyticsBtn = document.getElementById('analytics-btn');
const dashboardView = document.getElementById('dashboard-view');
const leadsView = document.getElementById('leads-view');
const analyticsView = document.getElementById('analytics-view');
const leadsList = document.getElementById('leads-list');
const emptyState = document.getElementById('empty-state');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadDashboardData();
    showView('dashboard');
});

// Event listeners
function setupEventListeners() {
    // Navigation
    dashboardBtn.addEventListener('click', () => showView('dashboard'));
    leadsBtn.addEventListener('click', () => showView('leads'));
    analyticsBtn.addEventListener('click', () => showView('analytics'));

    // Search with debounce
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            handleSearch(e.target.value);
        }, 200);
    });
}

// View management
function showView(view) {
    // Hide all views
    dashboardView.classList.add('hidden');
    leadsView.classList.add('hidden');
    analyticsView.classList.add('hidden');
    emptyState.classList.add('hidden');

    // Update navigation
    [dashboardBtn, leadsBtn, analyticsBtn].forEach(btn => {
        btn.classList.remove('text-primary-700', 'bg-primary-50');
        btn.classList.add('text-gray-700');
    });

    // Show selected view
    switch(view) {
        case 'dashboard':
            dashboardView.classList.remove('hidden');
            dashboardBtn.classList.add('text-primary-700', 'bg-primary-50');
            dashboardBtn.classList.remove('text-gray-700');
            loadDashboardData();
            break;
        case 'leads':
            leadsView.classList.remove('hidden');
            leadsBtn.classList.add('text-primary-700', 'bg-primary-50');
            leadsBtn.classList.remove('text-gray-700');
            loadLeads();
            break;
        case 'analytics':
            analyticsView.classList.remove('hidden');
            analyticsBtn.classList.add('text-primary-700', 'bg-primary-50');
            analyticsBtn.classList.remove('text-gray-700');
            break;
    }
    currentView = view;
}

// API helper functions
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// Dashboard functions
async function loadDashboardData() {
    try {
        const analytics = await apiRequest('/lead/analytics/');
        updateDashboardStats(analytics);
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
        // Show dummy data for demo
        updateDashboardStats({ total_leads: 0, new_leads_today: 0, conversion_rate: 0.0 });
    }
}

function updateDashboardStats(analytics) {
    document.getElementById('total-leads').textContent = analytics.total_leads || 0;
    document.getElementById('new-leads').textContent = analytics.new_leads_today || 0;
    document.getElementById('conversion-rate').textContent = `${(analytics.conversion_rate * 100).toFixed(1)}%`;
}

// Leads functions
async function loadLeads(searchTerm = '') {
    try {
        showLoadingState();
        
        const endpoint = searchTerm ? `/lead/?search=${encodeURIComponent(searchTerm)}` : '/lead/';
        const data = await apiRequest(endpoint);
        
        leads = data.leads || [];
        renderLeads();
        
        if (leads.length === 0) {
            showEmptyState();
        }
    } catch (error) {
        console.error('Failed to load leads:', error);
        showErrorState();
    }
}

function showLoadingState() {
    leadsList.innerHTML = `
        <div class="p-6">
            <div class="space-y-4">
                <div class="loading-skeleton h-16 w-full rounded"></div>
                <div class="loading-skeleton h-16 w-full rounded"></div>
                <div class="loading-skeleton h-16 w-full rounded"></div>
            </div>
        </div>
    `;
}

function showErrorState() {
    leadsList.innerHTML = `
        <div class="p-6 text-center">
            <svg class="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Failed to load leads</h3>
            <p class="mt-1 text-sm text-gray-500">Please try again later.</p>
        </div>
    `;
}

function showEmptyState() {
    emptyState.classList.remove('hidden');
}

function renderLeads() {
    if (leads.length === 0) {
        leadsList.innerHTML = `
            <div class="p-6 text-center text-gray-500">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">No leads found</h3>
                <p class="mt-1 text-sm text-gray-500">Get started by adding your first lead.</p>
            </div>
        `;
        return;
    }

    leadsList.innerHTML = leads.map(lead => `
        <div class="p-6 hover:bg-gray-50 transition-colors duration-150">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <div class="flex-shrink-0">
                        <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <svg class="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                        </div>
                    </div>
                    <div>
                        <h3 class="text-sm font-medium text-gray-900">${lead.name || 'Unnamed Lead'}</h3>
                        <p class="text-sm text-gray-500">${lead.company || 'No company'}</p>
                        <p class="text-sm text-gray-400">${lead.email || 'No email'}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(lead.status)}">
                        ${getStatusIcon(lead.status)}
                        ${lead.status || 'New'}
                    </span>
                    <button class="text-gray-400 hover:text-gray-600 transition-colors duration-150">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function getStatusClass(status) {
    switch (status?.toLowerCase()) {
        case 'new':
            return 'bg-blue-100 text-blue-800';
        case 'contacted':
            return 'bg-yellow-100 text-yellow-800';
        case 'qualified':
            return 'bg-green-100 text-green-800';
        case 'converted':
            return 'bg-purple-100 text-purple-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

function getStatusIcon(status) {
    switch (status?.toLowerCase()) {
        case 'new':
            return '<svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"></path></svg>';
        case 'contacted':
            return '<svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>';
        case 'qualified':
            return '<svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>';
        case 'converted':
            return '<svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>';
        default:
            return '<svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path></svg>';
    }
}

// Search handling
function handleSearch(searchTerm) {
    if (currentView === 'leads') {
        loadLeads(searchTerm);
    }
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}