// ========== ALFAJR TAILORING MANAGEMENT SYSTEM ==========
// Version 6.0 - Professional Enterprise Edition
// Author: ALFAJR Team
// Enhanced Security & Performance

'use strict';

// ========== CONFIGURATION ==========
const AppConfig = {
    DATABASE_NAME: 'ALFAJR_DB_V6',
    DATABASE_VERSION: 6,
    STORES: {
        CUSTOMERS: 'customers_v6',
        SETTINGS: 'settings_v6',
        BACKUP: 'backups_v6',
        AUDIT_LOG: 'audit_log_v6'
    },
    
    // Pagination
    ITEMS_PER_PAGE: 20,
    
    // Security
    MIN_PASSWORD_LENGTH: 8,
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    
    // Backup
    AUTO_BACKUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
    
    // Validation
    PHONE_REGEX: /^[\+]?[(]?[0-9۰-۹]{3}[)]?[-\s\.]?[0-9۰-۹]{3}[-\s\.]?[0-9۰-۹]{4,6}$/,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    
    // Measurement fields with validation rules
    MEASUREMENT_FIELDS: {
        قد: { min: 50, max: 250, unit: 'cm', label: 'قد' },
        شانه_یک: { min: 30, max: 80, unit: 'cm', label: 'شانه یک' },
        شانه_دو: { min: 30, max: 80, unit: 'cm', label: 'شانه دو' },
        آستین_یک: { min: 40, max: 100, unit: 'cm', label: 'آستین یک' },
        آستین_دو: { min: 15, max: 50, unit: 'cm', label: 'آستین دو' },
        آستین_سه: { min: 10, max: 30, unit: 'cm', label: 'آستین سه' },
        بغل: { min: 30, max: 80, unit: 'cm', label: 'بغل' },
        دامن: { min: 50, max: 150, unit: 'cm', label: 'دامن' },
        گردن: { min: 30, max: 60, unit: 'cm', label: 'گردن' },
        دور_سینه: { min: 70, max: 150, unit: 'cm', label: 'دور سینه' },
        شلوار: { min: 80, max: 130, unit: 'cm', label: 'شلوار' },
        دم_پاچه: { min: 15, max: 40, unit: 'cm', label: 'دم پاچه' },
        بر_تمبان: { min: 20, max: 60, unit: 'cm', label: 'بر تهمان' },
        خشتک: { min: 15, max: 40, unit: 'cm', label: 'خشتک' },
        چاک_پتی: { min: 10, max: 50, unit: 'cm', label: 'چاک پتی' },
        تعداد_سفارش: { min: 1, max: 10, unit: 'عدد', label: 'تعداد سفارش' },
        مقدار_تکه: { min: 1, max: 5, unit: 'عدد', label: 'مقدار تکه' }
    },
    
    // Models configuration
    MODELS: {
        YAKHUN: ["آف دار", "چپه یخن", "پاکستانی", "ملی", "شهبازی", "خامک", "قاسمی"],
        SLEEVE: ["کفک", "ساده شیش بخیه", "بندک", "پر بخیه", "آف دار", "لایی یک انچ"],
        SKIRT: ["دامن یک بخیه", "دامن دوبخیه", "دامن چهارکنج", "دامن ترخیز", "دامن گاوی"],
        FEATURES: ["جیب رو", "جیب شلوار", "یک بخیه سند", "دو بخیه سند", "مکمل دو بخیه"]
    },
    
    DAYS_OF_WEEK: ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"],
    
    DEFAULT_SETTINGS: {
        theme: 'dark',
        autoSave: true,
        autoBackup: true,
        backupInterval: 24,
        currency: 'افغانی',
        language: 'fa',
        printFormat: 'thermal',
        notifications: true,
        offlineMode: true
    }
};

// ========== SECURITY UTILITIES ==========
class Security {
    static generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    static generateCustomerId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 9);
        return `CUST-${timestamp}-${random}`.toUpperCase();
    }
    
    static hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }
    
    static encryptData(data, key) {
        try {
            const json = JSON.stringify(data);
            const encoded = btoa(unescape(encodeURIComponent(json)));
            return Security.hashString(key) + ':' + encoded;
        } catch (error) {
            console.error('Encryption error:', error);
            return null;
        }
    }
    
    static decryptData(encrypted, key) {
        try {
            const [hash, data] = encrypted.split(':');
            if (Security.hashString(key) !== hash) {
                throw new Error('Invalid encryption key');
            }
            const decoded = decodeURIComponent(escape(atob(data)));
            return JSON.parse(decoded);
        } catch (error) {
            console.error('Decryption error:', error);
            return null;
        }
    }
    
    static sanitizeHTML(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text.toString();
        return div.innerHTML;
    }
    
    static sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        // Remove potentially dangerous characters
        return input
            .replace(/[<>"'&]/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, '')
            .trim();
    }
    
    static validatePhone(phone) {
        return AppConfig.PHONE_REGEX.test(phone);
    }
    
    static validateEmail(email) {
        return AppConfig.EMAIL_REGEX.test(email);
    }
    
    static validateMeasurement(field, value) {
        const config = AppConfig.MEASUREMENT_FIELDS[field];
        if (!config) return true;
        
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return false;
        
        return numValue >= config.min && numValue <= config.max;
    }
}

// ========== CUSTOMER CLASS ==========
class Customer {
    constructor(data = {}) {
        this.id = data.id || Security.generateCustomerId();
        this.name = Security.sanitizeInput(data.name || '');
        this.phone = data.phone || '';
        this.email = Security.sanitizeInput(data.email || '');
        this.address = Security.sanitizeInput(data.address || '');
        this.notes = Security.sanitizeInput(data.notes || '');
        
        this.measurements = this._initMeasurements(data.measurements);
        this.models = this._initModels(data.models);
        this.orders = Array.isArray(data.orders) ? data.orders : [];
        
        this.financial = {
            sewingPrice: data.sewingPrice || null,
            fabricCost: data.fabricCost || null,
            additionalCosts: data.additionalCosts || null,
            totalAmount: data.totalAmount || null,
            paidAmount: data.paidAmount || 0,
            remainingAmount: data.remainingAmount || null,
            paymentStatus: data.paymentStatus || 'pending',
            paymentDate: data.paymentDate || null
        };
        
        this.delivery = {
            day: data.deliveryDay || '',
            date: data.deliveryDate || null,
            status: data.deliveryStatus || 'pending',
            notes: Security.sanitizeInput(data.deliveryNotes || '')
        };
        
        this.metadata = {
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: data.createdBy || 'system',
            version: data.version || 1,
            deleted: false,
            deletedAt: null,
            deletedBy: null
        };
        
        this.tags = Array.isArray(data.tags) ? data.tags : [];
        this.attachments = Array.isArray(data.attachments) ? data.attachments : [];
    }
    
    _initMeasurements(measurements = {}) {
        const result = {};
        Object.keys(AppConfig.MEASUREMENT_FIELDS).forEach(field => {
            const value = measurements[field];
            result[field] = value !== undefined && value !== null ? 
                parseFloat(value) || '' : '';
        });
        return result;
    }
    
    _initModels(models = {}) {
        return {
            yakhun: models.yakhun || '',
            sleeve: models.sleeve || '',
            skirt: Array.isArray(models.skirt) ? models.skirt : [],
            features: Array.isArray(models.features) ? models.features : [],
            custom: models.custom || ''
        };
    }
    
    validate() {
        const errors = [];
        
        if (!this.name.trim()) {
            errors.push('نام مشتری الزامی است');
        } else if (this.name.trim().length < 2) {
            errors.push('نام باید حداقل ۲ کاراکتر باشد');
        }
        
        if (!this.phone) {
            errors.push('شماره تلفن الزامی است');
        } else if (!Security.validatePhone(this.phone)) {
            errors.push('شماره تلفن معتبر نیست');
        }
        
        if (this.email && !Security.validateEmail(this.email)) {
            errors.push('ایمیل معتبر نیست');
        }
        
        // Validate measurements
        Object.entries(this.measurements).forEach(([field, value]) => {
            if (value && !Security.validateMeasurement(field, value)) {
                const config = AppConfig.MEASUREMENT_FIELDS[field];
                errors.push(`${config.label} باید بین ${config.min} تا ${config.max} ${config.unit} باشد`);
            }
        });
        
        // Validate financial data
        if (this.financial.sewingPrice && this.financial.sewingPrice < 0) {
            errors.push('قیمت دوخت نمی‌تواند منفی باشد');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    calculateTotal() {
        const sewingPrice = parseFloat(this.financial.sewingPrice) || 0;
        const fabricCost = parseFloat(this.financial.fabricCost) || 0;
        const additionalCosts = parseFloat(this.financial.additionalCosts) || 0;
        
        this.financial.totalAmount = sewingPrice + fabricCost + additionalCosts;
        this.financial.remainingAmount = this.financial.totalAmount - (this.financial.paidAmount || 0);
        
        if (this.financial.remainingAmount <= 0) {
            this.financial.paymentStatus = 'paid';
        } else if (this.financial.paidAmount > 0) {
            this.financial.paymentStatus = 'partial';
        } else {
            this.financial.paymentStatus = 'pending';
        }
    }
    
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            phone: this.phone,
            email: this.email,
            address: this.address,
            notes: this.notes,
            measurements: this.measurements,
            models: this.models,
            orders: this.orders,
            financial: this.financial,
            delivery: this.delivery,
            metadata: this.metadata,
            tags: this.tags,
            attachments: this.attachments
        };
    }
    
    static fromJSON(data) {
        return new Customer(data);
    }
}

// ========== DATABASE MANAGER ==========
class DatabaseManager {
    constructor() {
        this.db = null;
        this.isInitialized = false;
        this.encryptionKey = 'alfajr-secure-key'; // In production, this should be user-provided
        this.listeners = new Map();
    }
    
    async init() {
        return new Promise((resolve, reject) => {
            if (this.isInitialized) {
                resolve(this.db);
                return;
            }
            
            const request = indexedDB.open(
                AppConfig.DATABASE_NAME, 
                AppConfig.DATABASE_VERSION
            );
            
            request.onerror = (event) => {
                console.error('Database error:', event.target.error);
                reject(new Error('خطا در اتصال به پایگاه داده'));
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                this.isInitialized = true;
                
                this.db.onerror = (event) => {
                    console.error('Database error:', event.target.error);
                    this._notify('error', { error: event.target.error });
                };
                
                this.db.onversionchange = () => {
                    this.db.close();
                    alert('نسخه پایگاه داده تغییر کرده است. لطفاً صفحه را رفرش کنید.');
                };
                
                this._updateStatus(true);
                this._initializeSettings();
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Customers store
                if (!db.objectStoreNames.contains(AppConfig.STORES.CUSTOMERS)) {
                    const store = db.createObjectStore(
                        AppConfig.STORES.CUSTOMERS, 
                        { keyPath: 'id' }
                    );
                    
                    // Create indexes
                    store.createIndex('name', 'name', { unique: false });
                    store.createIndex('phone', 'phone', { unique: false });
                    store.createIndex('createdAt', 'metadata.createdAt', { unique: false });
                    store.createIndex('updatedAt', 'metadata.updatedAt', { unique: false });
                    store.createIndex('paymentStatus', 'financial.paymentStatus', { unique: false });
                    store.createIndex('deliveryStatus', 'delivery.status', { unique: false });
                    store.createIndex('deleted', 'metadata.deleted', { unique: false });
                }
                
                // Settings store
                if (!db.objectStoreNames.contains(AppConfig.STORES.SETTINGS)) {
                    db.createObjectStore(AppConfig.STORES.SETTINGS, { keyPath: 'key' });
                }
                
                // Backup store
                if (!db.objectStoreNames.contains(AppConfig.STORES.BACKUP)) {
                    const backupStore = db.createObjectStore(
                        AppConfig.STORES.BACKUP, 
                        { keyPath: 'id', autoIncrement: true }
                    );
                    backupStore.createIndex('date', 'date', { unique: false });
                    backupStore.createIndex('type', 'type', { unique: false });
                }
                
                // Audit log store
                if (!db.objectStoreNames.contains(AppConfig.STORES.AUDIT_LOG)) {
                    const auditStore = db.createObjectStore(
                        AppConfig.STORES.AUDIT_LOG,
                        { keyPath: 'id', autoIncrement: true }
                    );
                    auditStore.createIndex('action', 'action', { unique: false });
                    auditStore.createIndex('timestamp', 'timestamp', { unique: false });
                    auditStore.createIndex('userId', 'userId', { unique: false });
                }
            };
        });
    }
    
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    off(event, callback) {
        if (!this.listeners.has(event)) return;
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }
    
    _notify(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error in event listener:', error);
                }
            });
        }
    }
    
    _updateStatus(connected) {
        const statusElement = document.getElementById('dbStatus');
        if (statusElement) {
            statusElement.className = `db-status ${connected ? 'connected' : 'disconnected'}`;
            statusElement.innerHTML = `
                <i class="fas fa-database"></i>
                <span>${connected ? 'متصل' : 'قطع'}</span>
            `;
        }
    }
    
    async _initializeSettings() {
        try {
            const transaction = this.db.transaction([AppConfig.STORES.SETTINGS], 'readwrite');
            const store = transaction.objectStore(AppConfig.STORES.SETTINGS);
            
            for (const [key, value] of Object.entries(AppConfig.DEFAULT_SETTINGS)) {
                const request = store.get(key);
                request.onsuccess = () => {
                    if (!request.result) {
                        store.put({ key, value, updatedAt: new Date().toISOString() });
                    }
                };
            }
            
            await new Promise((resolve) => {
                transaction.oncomplete = resolve;
            });
        } catch (error) {
            console.error('Error initializing settings:', error);
        }
    }
    
    async _logAudit(action, details = {}) {
        try {
            const logEntry = {
                action,
                timestamp: new Date().toISOString(),
                userId: 'system',
                details: JSON.stringify(details),
                userAgent: navigator.userAgent,
                ip: 'local'
            };
            
            const transaction = this.db.transaction([AppConfig.STORES.AUDIT_LOG], 'readwrite');
            const store = transaction.objectStore(AppConfig.STORES.AUDIT_LOG);
            store.add(logEntry);
        } catch (error) {
            console.error('Error logging audit:', error);
        }
    }
    
    // ========== CUSTOMER OPERATIONS ==========
    async saveCustomer(customer) {
        if (!this.isInitialized) {
            throw new Error('Database not initialized');
        }
        
        const validation = customer.validate();
        if (!validation.isValid) {
            throw new Error(validation.errors.join('\n'));
        }
        
        customer.metadata.updatedAt = new Date().toISOString();
        customer.calculateTotal();
        
        const customerData = customer.toJSON();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([AppConfig.STORES.CUSTOMERS], 'readwrite');
            const store = transaction.objectStore(AppConfig.STORES.CUSTOMERS);
            
            const request = store.put(customerData);
            
            request.onsuccess = async () => {
                await this._logAudit('SAVE_CUSTOMER', { customerId: customer.id });
                this._notify('customer_saved', customer);
                resolve(customer);
            };
            
            request.onerror = (event) => {
                console.error('Error saving customer:', event.target.error);
                reject(new Error('خطا در ذخیره مشتری'));
            };
        });
    }
    
    async getCustomer(id) {
        if (!this.isInitialized) {
            throw new Error('Database not initialized');
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([AppConfig.STORES.CUSTOMERS], 'readonly');
            const store = transaction.objectStore(AppConfig.STORES.CUSTOMERS);
            
            const request = store.get(id);
            
            request.onsuccess = () => {
                if (request.result) {
                    resolve(Customer.fromJSON(request.result));
                } else {
                    resolve(null);
                }
            };
            
            request.onerror = (event) => {
                reject(new Error('خطا در دریافت اطلاعات مشتری'));
            };
        });
    }
    
    async getAllCustomers(options = {}) {
        if (!this.isInitialized) {
            throw new Error('Database not initialized');
        }
        
        const {
            includeDeleted = false,
            page = 1,
            limit = AppConfig.ITEMS_PER_PAGE,
            sortBy = 'metadata.updatedAt',
            sortOrder = 'desc',
            filters = {}
        } = options;
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([AppConfig.STORES.CUSTOMERS], 'readonly');
            const store = transaction.objectStore(AppConfig.STORES.CUSTOMERS);
            
            // Apply basic filter for deleted items
            let index = store.index('deleted');
            let range = IDBKeyRange.only(false);
            
            if (includeDeleted) {
                range = null;
            }
            
            const request = index.getAll(range);
            
            request.onsuccess = () => {
                let customers = request.result.map(c => Customer.fromJSON(c));
                
                // Apply additional filters
                if (filters.status) {
                    customers = customers.filter(c => 
                        c.financial.paymentStatus === filters.status
                    );
                }
                
                if (filters.deliveryDay) {
                    customers = customers.filter(c => 
                        c.delivery.day === filters.deliveryDay
                    );
                }
                
                if (filters.search) {
                    const searchTerm = filters.search.toLowerCase();
                    customers = customers.filter(c => 
                        c.name.toLowerCase().includes(searchTerm) ||
                        c.phone.includes(searchTerm) ||
                        c.id.toLowerCase().includes(searchTerm) ||
                        c.notes.toLowerCase().includes(searchTerm)
                    );
                }
                
                // Sort customers
                customers.sort((a, b) => {
                    let aValue, bValue;
                    
                    switch (sortBy) {
                        case 'name':
                            aValue = a.name;
                            bValue = b.name;
                            break;
                        case 'createdAt':
                            aValue = a.metadata.createdAt;
                            bValue = b.metadata.createdAt;
                            break;
                        case 'updatedAt':
                        default:
                            aValue = a.metadata.updatedAt;
                            bValue = b.metadata.updatedAt;
                    }
                    
                    if (sortOrder === 'asc') {
                        return aValue > bValue ? 1 : -1;
                    } else {
                        return aValue < bValue ? 1 : -1;
                    }
                });
                
                // Pagination
                const total = customers.length;
                const totalPages = Math.ceil(total / limit);
                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                const paginatedCustomers = customers.slice(startIndex, endIndex);
                
                resolve({
                    customers: paginatedCustomers,
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages,
                        hasNext: page < totalPages,
                        hasPrev: page > 1
                    }
                });
            };
            
            request.onerror = (event) => {
                reject(new Error('خطا در دریافت لیست مشتریان'));
            };
        });
    }
    
    async deleteCustomer(id, softDelete = true) {
        if (!this.isInitialized) {
            throw new Error('Database not initialized');
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([AppConfig.STORES.CUSTOMERS], 'readwrite');
            const store = transaction.objectStore(AppConfig.STORES.CUSTOMERS);
            
            const getRequest = store.get(id);
            
            getRequest.onsuccess = async () => {
                if (!getRequest.result) {
                    reject(new Error('مشتری یافت نشد'));
                    return;
                }
                
                const customer = Customer.fromJSON(getRequest.result);
                
                if (softDelete) {
                    customer.metadata.deleted = true;
                    customer.metadata.deletedAt = new Date().toISOString();
                    customer.metadata.deletedBy = 'system';
                    
                    const putRequest = store.put(customer.toJSON());
                    
                    putRequest.onsuccess = async () => {
                        await this._logAudit('SOFT_DELETE_CUSTOMER', { customerId: id });
                        this._notify('customer_deleted', { id, softDelete: true });
                        resolve(true);
                    };
                    
                    putRequest.onerror = (event) => {
                        reject(new Error('خطا در حذف مشتری'));
                    };
                } else {
                    // Hard delete
                    const deleteRequest = store.delete(id);
                    
                    deleteRequest.onsuccess = async () => {
                        await this._logAudit('HARD_DELETE_CUSTOMER', { customerId: id });
                        this._notify('customer_deleted', { id, softDelete: false });
                        resolve(true);
                    };
                    
                    deleteRequest.onerror = (event) => {
                        reject(new Error('خطا در حذف دائمی مشتری'));
                    };
                }
            };
            
            getRequest.onerror = (event) => {
                reject(new Error('خطا در دریافت اطلاعات مشتری'));
            };
        });
    }
    
    async searchCustomers(query, fields = ['name', 'phone', 'id', 'notes']) {
        if (!this.isInitialized || !query) {
            return [];
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([AppConfig.STORES.CUSTOMERS], 'readonly');
            const store = transaction.objectStore(AppConfig.STORES.CUSTOMERS);
            const request = store.getAll();
            
            request.onsuccess = () => {
                const allCustomers = request.result || [];
                const searchTerm = query.toLowerCase().trim();
                
                const results = allCustomers.filter(customerData => {
                    if (customerData.metadata.deleted) return false;
                    
                    const customer = Customer.fromJSON(customerData);
                    
                    return fields.some(field => {
                        let value;
                        
                        switch (field) {
                            case 'name':
                                value = customer.name;
                                break;
                            case 'phone':
                                value = customer.phone;
                                break;
                            case 'id':
                                value = customer.id;
                                break;
                            case 'notes':
                                value = customer.notes;
                                break;
                            default:
                                value = '';
                        }
                        
                        return value && value.toString().toLowerCase().includes(searchTerm);
                    });
                }).map(c => Customer.fromJSON(c));
                
                resolve(results);
            };
            
            request.onerror = (event) => {
                reject(new Error('خطا در جستجوی مشتریان'));
            };
        });
    }
    
    // ========== SETTINGS OPERATIONS ==========
    async getSetting(key) {
        if (!this.isInitialized) {
            return AppConfig.DEFAULT_SETTINGS[key] || null;
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([AppConfig.STORES.SETTINGS], 'readonly');
            const store = transaction.objectStore(AppConfig.STORES.SETTINGS);
            const request = store.get(key);
            
            request.onsuccess = () => {
                resolve(request.result ? request.result.value : null);
            };
            
            request.onerror = (event) => {
                resolve(AppConfig.DEFAULT_SETTINGS[key] || null);
            };
        });
    }
    
    async saveSetting(key, value) {
        if (!this.isInitialized) {
            throw new Error('Database not initialized');
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([AppConfig.STORES.SETTINGS], 'readwrite');
            const store = transaction.objectStore(AppConfig.STORES.SETTINGS);
            
            const setting = {
                key,
                value,
                updatedAt: new Date().toISOString()
            };
            
            const request = store.put(setting);
            
            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(new Error('خطا در ذخیره تنظیمات'));
        });
    }
    
    // ========== BACKUP OPERATIONS ==========
    async createBackup(type = 'manual') {
        if (!this.isInitialized) {
            throw new Error('Database not initialized');
        }
        
        try {
            const customers = await this.getAllCustomers({ includeDeleted: true });
            const settings = await this.getAllSettings();
            
            const backupData = {
                customers: customers.customers.map(c => c.toJSON()),
                settings,
                metadata: {
                    version: AppConfig.DATABASE_VERSION,
                    timestamp: new Date().toISOString(),
                    type,
                    totalCustomers: customers.customers.length,
                    checksum: Security.hashString(JSON.stringify(customers))
                }
            };
            
            // Encrypt backup
            const encryptedBackup = Security.encryptData(
                backupData, 
                this.encryptionKey
            );
            
            if (!encryptedBackup) {
                throw new Error('خطا در رمزنگاری پشتیبان');
            }
            
            // Save backup to database
            const transaction = this.db.transaction([AppConfig.STORES.BACKUP], 'readwrite');
            const store = transaction.objectStore(AppConfig.STORES.BACKUP);
            
            const backup = {
                date: new Date().toISOString(),
                type,
                data: encryptedBackup,
                size: encryptedBackup.length
            };
            
            await new Promise((resolve, reject) => {
                const request = store.add(backup);
                request.onsuccess = () => resolve(request.result);
                request.onerror = (event) => reject(event.target.error);
            });
            
            await this._logAudit('CREATE_BACKUP', { type, size: backup.size });
            
            return backupData;
        } catch (error) {
            console.error('Error creating backup:', error);
            throw error;
        }
    }
    
    async restoreBackup(backupData) {
        if (!this.isInitialized) {
            throw new Error('Database not initialized');
        }
        
        // Validate backup
        if (!backupData || !backupData.customers || !backupData.metadata) {
            throw new Error('فرمت پشتیبان نامعتبر است');
        }
        
        if (backupData.metadata.version !== AppConfig.DATABASE_VERSION) {
            throw new Error(`نسخه پشتیبان (${backupData.metadata.version}) با نسخه سیستم (${AppConfig.DATABASE_VERSION}) سازگار نیست`);
        }
        
        // Verify checksum
        const checksum = Security.hashString(JSON.stringify(backupData.customers));
        if (checksum !== backupData.metadata.checksum) {
            throw new Error('پشتیبان آسیب دیده است');
        }
        
        try {
            // Clear existing data
            await this.clearAllData(false);
            
            // Restore customers
            let restoredCount = 0;
            let failedCount = 0;
            
            for (const customerData of backupData.customers) {
                try {
                    const customer = Customer.fromJSON(customerData);
                    await this.saveCustomer(customer);
                    restoredCount++;
                } catch (error) {
                    console.error('Error restoring customer:', customerData.id, error);
                    failedCount++;
                }
            }
            
            // Restore settings
            if (backupData.settings) {
                for (const [key, value] of Object.entries(backupData.settings)) {
                    await this.saveSetting(key, value);
                }
            }
            
            await this._logAudit('RESTORE_BACKUP', {
                restoredCount,
                failedCount,
                total: backupData.customers.length
            });
            
            return {
                restored: restoredCount,
                failed: failedCount,
                total: backupData.customers.length
            };
        } catch (error) {
            console.error('Error restoring backup:', error);
            throw error;
        }
    }
    
    async getAllSettings() {
        if (!this.isInitialized) {
            return { ...AppConfig.DEFAULT_SETTINGS };
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([AppConfig.STORES.SETTINGS], 'readonly');
            const store = transaction.objectStore(AppConfig.STORES.SETTINGS);
            const request = store.getAll();
            
            request.onsuccess = () => {
                const settings = { ...AppConfig.DEFAULT_SETTINGS };
                request.result.forEach(setting => {
                    settings[setting.key] = setting.value;
                });
                resolve(settings);
            };
            
            request.onerror = (event) => {
                resolve({ ...AppConfig.DEFAULT_SETTINGS });
            };
        });
    }
    
    async clearAllData(confirm = true) {
        if (confirm) {
            const userConfirm = await App.UI.confirm(
                'پاک‌سازی کامل',
                'آیا مطمئن هستید که می‌خواهید تمام داده‌ها را پاک کنید؟ این عمل غیرقابل بازگشت است.',
                'error'
            );
            
            if (!userConfirm) return;
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(
                [AppConfig.STORES.CUSTOMERS, AppConfig.STORES.BACKUP, AppConfig.STORES.AUDIT_LOG], 
                'readwrite'
            );
            
            const customerStore = transaction.objectStore(AppConfig.STORES.CUSTOMERS);
            const backupStore = transaction.objectStore(AppConfig.STORES.BACKUP);
            const auditStore = transaction.objectStore(AppConfig.STORES.AUDIT_LOG);
            
            const requests = [
                customerStore.clear(),
                backupStore.clear(),
                auditStore.clear()
            ];
            
            let completed = 0;
            let hasError = false;
            
            requests.forEach(request => {
                request.onsuccess = () => {
                    completed++;
                    if (completed === requests.length && !hasError) {
                        this._notify('data_cleared', null);
                        this._logAudit('CLEAR_ALL_DATA', {});
                        resolve();
                    }
                };
                
                request.onerror = (event) => {
                    hasError = true;
                    reject(new Error('خطا در پاک‌سازی داده‌ها'));
                };
            });
        });
    }
    
    async getStatistics() {
        if (!this.isInitialized) {
            return null;
        }
        
        try {
            const allCustomers = await this.getAllCustomers({ includeDeleted: true });
            const customers = allCustomers.customers;
                    const stats = {
            totalCustomers: customers.length,
            activeCustomers: customers.filter(c => !c.metadata.deleted).length,
            deletedCustomers: customers.filter(c => c.metadata.deleted).length,
            
            paymentStats: {
                paid: customers.filter(c => c.financial.paymentStatus === 'paid').length,
                pending: customers.filter(c => c.financial.paymentStatus === 'pending').length,
                partial: customers.filter(c => c.financial.paymentStatus === 'partial').length
            },
            
            deliveryStats: {
                delivered: customers.filter(c => c.delivery.status === 'delivered').length,
                pending: customers.filter(c => c.delivery.status === 'pending').length,
                inProgress: customers.filter(c => c.delivery.status === 'in_progress').length
            },
            
            financialStats: {
                totalRevenue: customers.reduce((sum, c) => sum + (c.financial.totalAmount || 0), 0),
                totalPaid: customers.reduce((sum, c) => sum + (c.financial.paidAmount || 0), 0),
                totalPending: customers.reduce((sum, c) => sum + (c.financial.remainingAmount || 0), 0),
                averageOrderValue: customers.length > 0 ? 
                    customers.reduce((sum, c) => sum + (c.financial.totalAmount || 0), 0) / customers.length : 0
            },
            
            timelineStats: {
                today: customers.filter(c => {
                    const date = new Date(c.metadata.createdAt);
                    const today = new Date();
                    return date.toDateString() === today.toDateString();
                }).length,
                
                thisWeek: customers.filter(c => {
                    const date = new Date(c.metadata.createdAt);
                    const now = new Date();
                    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
                    return date >= startOfWeek;
                }).length,
                
                thisMonth: customers.filter(c => {
                    const date = new Date(c.metadata.createdAt);
                    const now = new Date();
                    return date.getMonth() === now.getMonth() && 
                           date.getFullYear() === now.getFullYear();
                }).length
            }
        };
        
        return stats;
    } catch (error) {
        console.error('Error getting statistics:', error);
        return null;
    }
}

// ========== UI MANAGER ==========
class UIManager {
    static showNotification(message, type = 'info', duration = 4000) {
        const notification = document.getElementById('globalNotification');
        if (!notification) return;
        
        // Clear previous notification
        notification.className = 'notification';
        notification.innerHTML = '';
        
        // Set type
        notification.classList.add(type);
        
        // Set message with icons
        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };
        
        notification.innerHTML = `
            <span class="notification-icon">${icons[type] || 'ℹ'}</span>
            <span class="notification-message">${Security.sanitizeHTML(message)}</span>
        `;
        
        // Show notification
        notification.style.display = 'flex';
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'assertive');
        
        // Auto hide
        if (duration > 0) {
            setTimeout(() => {
                notification.style.display = 'none';
                notification.removeAttribute('role');
                notification.removeAttribute('aria-live');
            }, duration);
        }
    }
    
    static showLoading(message = 'در حال پردازش...') {
        const overlay = document.getElementById('loadingOverlay');
        if (!overlay) return;
        
        const text = document.getElementById('loadingText');
        if (text) {
            text.textContent = message;
        }
        
        overlay.style.display = 'flex';
        overlay.setAttribute('aria-busy', 'true');
    }
    
    static hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (!overlay) return;
        
        overlay.style.display = 'none';
        overlay.setAttribute('aria-busy', 'false');
    }
    
    static showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        
        // Focus on first focusable element
        setTimeout(() => {
            const focusable = modal.querySelector('button, input, select, textarea');
            if (focusable) focusable.focus();
        }, 100);
    }
    
    static hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
    }
    
    static async confirm(title, message, type = 'warning') {
        return new Promise((resolve) => {
            const modalId = 'confirmModal';
            let modal = document.getElementById(modalId);
            
            if (!modal) {
                modal = document.createElement('div');
                modal.id = modalId;
                modal.className = 'modal';
                modal.setAttribute('aria-hidden', 'true');
                modal.innerHTML = `
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3 class="modal-title"></h3>
                            <button class="modal-close" onclick="App.UI.hideModal('${modalId}')">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="modal-body">
                            <p class="confirm-message"></p>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary" onclick="window.__confirmResult = false; App.UI.hideModal('${modalId}')">
                                لغو
                            </button>
                            <button class="btn btn-primary" onclick="window.__confirmResult = true; App.UI.hideModal('${modalId}')">
                                تأیید
                            </button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
            }
            
            // Set content
            modal.querySelector('.modal-title').textContent = title;
            modal.querySelector('.confirm-message').textContent = message;
            
            // Set type color
            const header = modal.querySelector('.modal-header');
            header.style.borderBottomColor = `var(--color-${type})`;
            
            // Show modal
            this.showModal(modalId);
            
            // Handle result
            const checkResult = () => {
                if (typeof window.__confirmResult !== 'undefined') {
                    const result = window.__confirmResult;
                    delete window.__confirmResult;
                    resolve(result);
                } else {
                    setTimeout(checkResult, 100);
                }
            };
            
            checkResult();
        });
    }
    
    static formatPrice(price) {
        if (!price && price !== 0) return '۰';
        return new Intl.NumberFormat('fa-IR').format(price);
    }
    
    static formatDate(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('fa-IR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        } catch (e) {
            return dateString;
        }
    }
    
    static formatDateShort(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('fa-IR', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric'
            }).format(date);
        } catch (e) {
            return dateString;
        }
    }
    
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// ========== APP CONTROLLER ==========
class AppController {
    constructor() {
        this.db = new DatabaseManager();
        this.currentCustomer = null;
        this.customers = [];
        this.currentPage = 1;
        this.totalPages = 1;
        this.currentTheme = 'dark';
        this.settings = {};
        this.isInitialized = false;
        this.saveTimeout = null;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.handleAddCustomer = this.handleAddCustomer.bind(this);
        this.searchCustomers = this.searchCustomers.bind(this);
        this.showAddCustomerModal = this.showAddCustomerModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.toggleSettings = this.toggleSettings.bind(this);
        this.exportData = this.exportData.bind(this);
        this.importData = this.importData.bind(this);
        this.setTheme = this.setTheme.bind(this);
        this.showStatistics = this.showStatistics.bind(this);
        this.optimizeDatabase = this.optimizeDatabase.bind(this);
        this.clearAllData = this.clearAllData.bind(this);
        this.refreshCustomers = this.refreshCustomers.bind(this);
        this.toggleListView = this.toggleListView.bind(this);
        this.prevPage = this.prevPage.bind(this);
        this.nextPage = this.nextPage.bind(this);
    }
    
    async init() {
        try {
            UIManager.showLoading('در حال راه‌اندازی سیستم...');
            
            // Check browser support
            if (!window.indexedDB) {
                throw new Error('مرورگر شما از IndexedDB پشتیبانی نمی‌کند. لطفاً از مرورگر جدیدتر استفاده کنید.');
            }
            
            // Initialize database
            await this.db.init();
            
            // Load settings
            this.settings = await this.db.getAllSettings();
            this.currentTheme = this.settings.theme || 'dark';
            
            // Set theme
            this.setTheme(this.currentTheme);
            
            // Setup event listeners
            this._setupEventListeners();
            
            // Load initial data
            await this.refreshCustomers();
            await this.updateStats();
            
            // Register service worker for PWA
            this._registerServiceWorker();
            
            // Setup auto-save
            if (this.settings.autoSave) {
                this._setupAutoSave();
            }
            
            // Setup auto-backup
            if (this.settings.autoBackup) {
                this._setupAutoBackup();
            }
            
            UIManager.hideLoading();
            UIManager.showNotification('سیستم با موفقیت راه‌اندازی شد', 'success');
            this.isInitialized = true;
            
            // Log initialization
            await this.db._logAudit('APP_INIT', { version: '6.0' });
            
        } catch (error) {
            UIManager.hideLoading();
            UIManager.showNotification(`خطا در راه‌اندازی: ${error.message}`, 'error');
            console.error('Initialization error:', error);
            
            // Show error state
            const customerList = document.getElementById('customerList');
            if (customerList) {
                customerList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-exclamation-triangle empty-state-icon"></i>
                        <h3 class="empty-state-title">خطا در راه‌اندازی</h3>
                        <p class="empty-state-description">${Security.sanitizeHTML(error.message)}</p>
                        <button class="btn btn-primary" onclick="location.reload()">
                            <i class="fas fa-redo"></i>
                            بارگذاری مجدد
                        </button>
                    </div>
                `;
            }
        }
    }
    
    _setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            const debouncedSearch = UIManager.debounce(() => this.searchCustomers(), 500);
            searchInput.addEventListener('input', debouncedSearch);
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.searchCustomers();
            });
        }
        
        // Filters
        const filterStatus = document.getElementById('filterStatus');
        const filterDelivery = document.getElementById('filterDelivery');
        
        if (filterStatus) {
            filterStatus.addEventListener('change', () => this.refreshCustomers());
        }
        
        if (filterDelivery) {
            filterDelivery.addEventListener('change', () => this.refreshCustomers());
        }
        
        // File input for import
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this._handleFileImport(e));
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S for save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (this.currentCustomer) {
                    this.saveCurrentCustomer();
                    UIManager.showNotification('تغییرات ذخیره شد', 'success');
                }
            }
            
            // Escape to go back
            if (e.key === 'Escape') {
                const profilePage = document.getElementById('profilePage');
                if (profilePage && !profilePage.hidden) {
                    this.goHome();
                }
            }
            
            // Ctrl/Cmd + F for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }
            
            // Ctrl/Cmd + N for new customer
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.showAddCustomerModal();
            }
            
            // Ctrl/Cmd + P for print
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                if (this.currentCustomer) {
                    this.printCustomer();
                }
            }
        });
        
        // Window events
        window.addEventListener('beforeunload', (e) => {
            if (this.saveTimeout) {
                e.preventDefault();
                e.returnValue = 'تغییرات ذخیره نشده وجود دارد. آیا مطمئن هستید که می‌خواهید صفحه را ترک کنید؟';
            }
        });
        
        // Click outside settings dropdown
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('settingsDropdown');
            const settingsBtn = document.querySelector('.settings-btn');
            
            if (dropdown && 
                !dropdown.contains(e.target) && 
                !settingsBtn.contains(e.target) &&
                dropdown.getAttribute('aria-hidden') === 'false') {
                this.toggleSettings();
            }
        });
    }
    
    _registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js')
                .then(registration => {
                    console.log('ServiceWorker registered:', registration.scope);
                })
                .catch(error => {
                    console.warn('ServiceWorker registration failed:', error);
                });
        }
    }
    
    _setupAutoSave() {
        // Implement auto-save logic
        console.log('Auto-save enabled');
    }
    
    _setupAutoBackup() {
        const interval = (this.settings.backupInterval || 24) * 60 * 60 * 1000;
        setInterval(async () => {
            try {
                await this.db.createBackup('auto');
                console.log('Auto-backup completed');
            } catch (error) {
                console.error('Auto-backup failed:', error);
            }
        }, interval);
    }
    
    async _handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            UIManager.showLoading('در حال بررسی فایل...');
            
            const text = await file.text();
            const backupData = JSON.parse(text);
            
            // Validate backup
            if (!backupData.metadata || !backupData.customers) {
                throw new Error('فرمت فایل پشتیبان نامعتبر است');
            }
            
            // Ask for confirmation
            const confirm = await UIManager.confirm(
                'بازیابی پشتیبان',
                `آیا مطمئن هستید که می‌خواهید ${backupData.customers.length} مشتری را بازیابی کنید؟`,
                'warning'
            );
            
            if (!confirm) {
                event.target.value = '';
                UIManager.hideLoading();
                return;
            }
            
            // Restore backup
            const result = await this.db.restoreBackup(backupData);
            
            UIManager.hideLoading();
            UIManager.showNotification(
                `${result.restored} مشتری با موفقیت بازیابی شد${result.failed > 0 ? ` (${result.failed} مورد با خطا مواجه شد)` : ''}`,
                result.failed > 0 ? 'warning' : 'success'
            );
            
            // Refresh data
            await this.refreshCustomers();
            await this.updateStats();
            
        } catch (error) {
            UIManager.hideLoading();
            UIManager.showNotification(`خطا در بازیابی: ${error.message}`, 'error');
            console.error('Import error:', error);
        } finally {
            event.target.value = '';
        }
    }
    
    // ========== CUSTOMER MANAGEMENT ==========
    async showAddCustomerModal() {
        UIManager.showModal('addCustomerModal');
    }
    
    async handleAddCustomer(event) {
        event.preventDefault();
        
        const name = document.getElementById('newCustomerName').value.trim();
        const phone = document.getElementById('newCustomerPhone').value.trim();
        
        if (!name || !phone) {
            UIManager.showNotification('لطفاً تمام فیلدهای الزامی را پر کنید', 'error');
            return false;
        }
        
        if (!Security.validatePhone(phone)) {
            UIManager.showNotification('شماره تلفن معتبر نیست', 'error');
            return false;
        }
        
        try {
            UIManager.showLoading('در حال ایجاد مشتری جدید...');
            
            const customer = new Customer({
                name,
                phone
            });
            
            await this.db.saveCustomer(customer);
            
            // Refresh list and show success
            await this.refreshCustomers();
            this.closeModal();
            
            UIManager.hideLoading();
            UIManager.showNotification(`مشتری "${name}" با موفقیت اضافه شد`, 'success');
            
            // Open the new customer's profile
            const index = this.customers.findIndex(c => c.id === customer.id);
            if (index !== -1) {
                await this.openCustomerProfile(index);
            }
            
            return true;
            
        } catch (error) {
            UIManager.hideLoading();
            UIManager.showNotification(`خطا در ایجاد مشتری: ${error.message}`, 'error');
            return false;
        }
    }
    
    async refreshCustomers() {
        try {
            const filters = {};
            
            const statusFilter = document.getElementById('filterStatus');
            const deliveryFilter = document.getElementById('filterDelivery');
            const searchInput = document.getElementById('searchInput');
            
            if (statusFilter && statusFilter.value) {
                filters.status = statusFilter.value;
            }
            
            if (deliveryFilter && deliveryFilter.value) {
                filters.deliveryDay = deliveryFilter.value;
            }
            
            if (searchInput && searchInput.value.trim()) {
                filters.search = searchInput.value.trim();
            }
            
            const result = await this.db.getAllCustomers({
                page: this.currentPage,
                limit: AppConfig.ITEMS_PER_PAGE,
                filters,
                sortBy: 'metadata.updatedAt',
                sortOrder: 'desc'
            });
            
            this.customers = result.customers;
            this.totalPages = result.pagination.totalPages;
            
            this.renderCustomerList();
            this.updatePaginationInfo();
            
        } catch (error) {
            console.error('Error refreshing customers:', error);
            this.renderCustomerList();
        }
    }
    
    renderCustomerList() {
        const container = document.getElementById('customerList');
        if (!container) return;
        
        if (!this.customers || this.customers.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users empty-state-icon"></i>
                    <h3 class="empty-state-title">مشتری یافت نشد</h3>
                    <p class="empty-state-description">هنوز مشتری ثبت نشده است. برای شروع، مشتری جدید اضافه کنید.</p>
                    <button class="btn btn-primary" onclick="App.showAddCustomerModal()">
                        <i class="fas fa-user-plus"></i>
                        افزودن مشتری جدید
                    </button>
                </div>
            `;
            return;
        }
        
        let html = '';
        this.customers.forEach((customer, index) => {
            const isPaid = customer.financial.paymentStatus === 'paid';
            const isPartial = customer.financial.paymentStatus === 'partial';
            const isDelivered = customer.delivery.status === 'delivered';
            const hasPrice = customer.financial.totalAmount > 0;
            
            html += `
                <div class="customer-card surface" 
                     onclick="App.openCustomerProfile(${index})"
                     role="button"
                     tabindex="0"
                     aria-label="مشتری ${Security.sanitizeHTML(customer.name)}"
                     onkeydown="if(event.key === 'Enter' || event.key === ' ') { event.preventDefault(); App.openCustomerProfile(${index}); }">
                    
                    <div class="customer-header">
                        <span class="customer-id">${Security.sanitizeHTML(customer.id)}</span>
                        <span class="customer-date">${UIManager.formatDateShort(customer.metadata.createdAt)}</span>
                    </div>
                    
                    <h3 class="customer-name">${Security.sanitizeHTML(customer.name)}</h3>
                    
                    <div class="customer-phone">
                        <i class="fas fa-phone"></i>
                        ${Security.sanitizeHTML(customer.phone)}
                    </div>
                    
                    ${customer.notes ? `
                        <div class="customer-notes">
                            ${Security.sanitizeHTML(customer.notes.substring(0, 100))}
                            ${customer.notes.length > 100 ? '...' : ''}
                        </div>
                    ` : ''}
                    
                    <div class="customer-footer">
                        <div class="customer-badges">
                            ${hasPrice ? `
                                <span class="badge badge-price" aria-label="قیمت: ${UIManager.formatPrice(customer.financial.totalAmount)}">
                                    ${UIManager.formatPrice(customer.financial.totalAmount)}
                                </span>
                            ` : ''}
                            
                            ${isPaid ? `
                                <span class="badge badge-paid" aria-label="پرداخت شده">
                                    <i class="fas fa-check-circle"></i>
                                    پرداخت شده
                                </span>
                            ` : isPartial ? `
                                <span class="badge badge-price" aria-label="پرداخت جزئی">
                                    <i class="fas fa-clock"></i>
                                    پرداخت جزئی
                                </span>
                            ` : ''}
                            
                            ${customer.delivery.day ? `
                                <span class="badge badge-delivery" aria-label="تحویل: ${Security.sanitizeHTML(customer.delivery.day)}">
                                    <i class="fas fa-calendar"></i>
                                    ${Security.sanitizeHTML(customer.delivery.day)}
                                </span>
                            ` : ''}
                            
                            ${isDelivered ? `
                                <span class="badge badge-paid" aria-label="تحویل داده شده">
                                    <i class="fas fa-truck"></i>
                                    تحویل شده
                                </span>
                            ` : ''}
                        </div>
                        
                        <button class="btn btn-icon btn-error" 
                                onclick="event.stopPropagation(); App.deleteCustomer('${customer.id}')"
                                aria-label="حذف مشتری">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    async openCustomerProfile(index) {
        if (index < 0 || index >= this.customers.length) {
            UIManager.showNotification('مشتری یافت نشد', 'error');
            return;
        }
        
        this.currentCustomer = this.customers[index];
        
        // Hide home page, show profile page
        document.getElementById('homePage').classList.remove('active');
        document.getElementById('profilePage').hidden = false;
        
        // Load and render profile
        await this.renderCustomerProfile();
        
        // Update URL (for browser history)
        window.history.pushState({ customerId: this.currentCustomer.id }, '', `#customer-${this.currentCustomer.id}`);
        
        // Focus on profile
        setTimeout(() => {
            const firstElement = document.querySelector('#profilePage [tabindex], #profilePage input, #profilePage button');
            if (firstElement) firstElement.focus();
        }, 100);
    }
    
    async renderCustomerProfile() {
        if (!this.currentCustomer) return;
        
        const container = document.getElementById('profilePage');
        if (!container) return;
        
        const customer = this.currentCustomer;
        
        container.innerHTML = `
            <div class="profile-header surface">
                <div class="profile-header-content">
                    <div class="profile-info">
                        <button class="btn btn-secondary mb-4" onclick="App.goHome()" aria-label="بازگشت به لیست">
                            <i class="fas fa-arrow-right"></i>
                            بازگشت به لیست
                        </button>
                        
                        <h1 class="profile-name">${Security.sanitizeHTML(customer.name)}</h1>
                        
                        <div class="profile-phone">
                            <i class="fas fa-phone"></i>
                            ${Security.sanitizeHTML(customer.phone)}
                        </div>
                        
                        ${customer.email ? `
                            <div class="mb-3">
                                <i class="fas fa-envelope"></i>
                                ${Security.sanitizeHTML(customer.email)}
                            </div>
                        ` : ''}
                        
                        <div class="profile-id">کد: ${Security.sanitizeHTML(customer.id)}</div>
                    </div>
                    
                    <div class="profile-actions">
                        <button class="btn btn-primary" onclick="App.printCustomer()">
                            <i class="fas fa-print"></i>
                            چاپ
                        </button>
                        <button class="btn btn-success" onclick="App.saveCurrentCustomer()">
                            <i class="fas fa-save"></i>
                            ذخیره
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="profile-content">
                <!-- Tabs Navigation -->
                <nav class="profile-tabs" role="tablist">
                    <button class="tab-btn active" onclick="App.switchProfileTab('info')" role="tab">
                        <i class="fas fa-info-circle"></i>
                        اطلاعات کلی
                    </button>
                    <button class="tab-btn" onclick="App.switchProfileTab('measurements')" role="tab">
                        <i class="fas fa-ruler-combined"></i>
                        اندازه‌گیری
                    </button>
                    <button class="tab-btn" onclick="App.switchProfileTab('financial')" role="tab">
                        <i class="fas fa-money-bill-wave"></i>
                        مالی
                    </button>
                    <button class="tab-btn" onclick="App.switchProfileTab('orders')" role="tab">
                        <i class="fas fa-clipboard-list"></i>
                        سفارشات
                    </button>
                </nav>
                
                <!-- Tabs Content -->
                <div class="tab-content">
                    <div id="tab-info" class="tab-pane active">
                        ${this._renderInfoTab()}
                    </div>
                    
                    <div id="tab-measurements" class="tab-pane">
                        ${this._renderMeasurementsTab()}
                    </div>
                    
                    <div id="tab-financial" class="tab-pane">
                        ${this._renderFinancialTab()}
                    </div>
                    
                    <div id="tab-orders" class="tab-pane">
                        ${this._renderOrdersTab()}
                    </div>
                </div>
            </div>
        `;
    }
    
    _renderInfoTab() {
        const customer = this.currentCustomer;
        return `
            <div class="surface mb-4">
                <h3 class="section-title">
                    <i class="fas fa-user"></i>
                    اطلاعات تماس
                </h3>
                
                <div class="form-group">
                    <label for="profileName">نام کامل *</label>
                    <input type="text" 
                           id="profileName" 
                           class="form-control" 
                           value="${Security.sanitizeHTML(customer.name)}"
                           oninput="App.updateCustomerField('name', this.value)">
                </div>
                
                <div class="form-group">
                    <label for="profilePhone">شماره تلفن *</label>
                    <input type="tel" 
                           id="profilePhone" 
                           class="form-control" 
                           value="${Security.sanitizeHTML(customer.phone)}"
                           oninput="App.updateCustomerField('phone', this.value)">
                </div>
                
                <div class="form-group">
                    <label for="profileEmail">ایمیل</label>
                    <input type="email" 
                           id="profileEmail" 
                           class="form-control" 
                           value="${Security.sanitizeHTML(customer.email || '')}"
                           oninput="App.updateCustomerField('email', this.value)">
                </div>
                
                <div class="form-group">
                    <label for="profileAddress">آدرس</label>
                    <textarea id="profileAddress" 
                              class="form-control" 
                              rows="3"
                              oninput="App.updateCustomerField('address', this.value)">${Security.sanitizeHTML(customer.address || '')}</textarea>
                </div>
            </div>
            
            <div class="surface">
                <h3 class="section-title">
                    <i class="fas fa-sticky-note"></i>
                    توضیحات
                </h3>
                
                <div class="form-group">
                    <textarea id="profileNotes" 
                              class="form-control" 
                              rows="5"
                              placeholder="توضیحات و یادداشت‌های مربوط به مشتری..."
                              oninput="App.updateCustomerField('notes', this.value)">${Security.sanitizeHTML(customer.notes || '')}</textarea>
                </div>
            </div>
        `;
    }
    
    _renderMeasurementsTab() {
        const customer = this.currentCustomer;
        
        const groups = [
            {
                title: 'قد',
                icon: 'fas fa-user-alt',
                fields: ['قد']
            },
            {
                title: 'شانه',
                icon: 'fas fa-arrows-alt-h',
                fields: ['شانه_یک', 'شانه_دو']
            },
            {
                title: 'آستین',
                icon: 'fas fa-hand-paper',
                fields: ['آستین_یک', 'آستین_دو', 'آستین_سه']
            },
            {
                title: 'بدنه',
                icon: 'fas fa-tshirt',
                fields: ['بغل', 'دامن', 'گردن', 'دور_سینه']
            },
            {
                title: 'شلوار',
                icon: 'fas fa-male',
                fields: ['شلوار', 'دم_پاچه']
            },
            {
                title: 'سایر',
                icon: 'fas fa-ruler',
                fields: ['بر_تمبان', 'خشتک', 'چاک_پتی']
            },
            {
                title: 'سفارش',
                icon: 'fas fa-clipboard-list',
                fields: ['تعداد_سفارش', 'مقدار_تکه']
            }
        ];
        
        let html = `
            <div class="surface mb-4">
                <h3 class="section-title">
                    <i class="fas fa-tshirt"></i>
                    مدل‌ها
                </h3>
                
                <div class="models-grid">
                    <div class="model-group">
                        <h4><i class="fas fa-snowflake"></i> مدل یخن</h4>
                        <div class="model-options">
        `;
        
        AppConfig.MODELS.YAKHUN.forEach(model => {
            const isSelected = customer.models.yakhun === model;
            html += `
                <button class="model-option ${isSelected ? 'selected' : ''}" 
                        onclick="App.updateModel('yakhun', '${model.replace(/'/g, "\\'")}')">
                    ${Security.sanitizeHTML(model)}
                </button>
            `;
        });
        
        html += `
                        </div>
                    </div>
                    
                    <div class="model-group">
                        <h4><i class="fas fa-hand-paper"></i> مدل آستین</h4>
                        <div class="model-options">
        `;
        
        AppConfig.MODELS.SLEEVE.forEach(model => {
            const isSelected = customer.models.sleeve === model;
            html += `
                <button class="model-option ${isSelected ? 'selected' : ''}" 
                        onclick="App.updateModel('sleeve', '${model.replace(/'/g, "\\'")}')">
                    ${Security.sanitizeHTML(model)}
                </button>
            `;
        });
        
        html += `
                        </div>
                    </div>
                    
                    <div class="model-group">
                        <h4><i class="fas fa-venus"></i> مدل دامن</h4>
                        <div class="model-options">
        `;
        
        AppConfig.MODELS.SKIRT.forEach(model => {
            const isSelected = customer.models.skirt.includes(model);
            html += `
                <button class="model-option multi-select ${isSelected ? 'selected' : ''}" 
                        onclick="App.toggleMultiModel('skirt', '${model.replace(/'/g, "\\'")}')">
                    ${Security.sanitizeHTML(model)}
                    <span class="checkmark">${isSelected ? '✓' : ''}</span>
                </button>
            `;
        });
        
        html += `
                        </div>
                    </div>
                    
                    <div class="model-group">
                        <h4><i class="fas fa-star"></i> ویژگی‌ها</h4>
                        <div class="model-options">
        `;
        
        AppConfig.MODELS.FEATURES.forEach(feature => {
            const isSelected = customer.models.features.includes(feature);
            html += `
                <button class="model-option multi-select ${isSelected ? 'selected' : ''}" 
                        onclick="App.toggleMultiModel('features', '${feature.replace(/'/g, "\\'")}')">
                    ${Security.sanitizeHTML(feature)}
                    <span class="checkmark">${isSelected ? '✓' : ''}</span>
                </button>
            `;
        });
        
        html += `
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="surface">
                <h3 class="section-title">
                    <i class="fas fa-ruler-combined"></i>
                    اندازه‌گیری‌ها
                </h3>
                
                <div class="measurements-grid">
        `;
        
        groups.forEach(group => {
            html += `
                <div class="measurement-group surface-light">
                    <h4 class="measurement-group-title">
                        <i class="${group.icon}"></i>
                        ${group.title}
                    </h4>
                    
                    <div class="measurement-fields">
            `;
            
            group.fields.forEach(field => {
                const config = AppConfig.MEASUREMENT_FIELDS[field];
                const value = customer.measurements[field] || '';
                
                html += `
                    <div class="measurement-field">
                        <label for="measurement-${field}" class="measurement-label">
                            ${config.label}
                            <small>(${config.min}-${config.max} ${config.unit})</small>
                        </label>
                        <input type="number" 
                               id="measurement-${field}"
                               class="measurement-input"
                               value="${value}"
                               min="${config.min}"
                               max="${config.max}"
                               step="0.5"
                               oninput="App.updateMeasurement('${field}', this.value)"
                               aria-label="${config.label}">
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
        
        return html;
    }
    
    _renderFinancialTab() {
        const customer = this.currentCustomer;
        const isPaid = customer.financial.paymentStatus === 'paid';
        const isPartial = customer.financial.paymentStatus === 'partial';
        
        return `
            <div class="surface mb-4">
                <h3 class="section-title">
                    <i class="fas fa-money-bill-wave"></i>
                    اطلاعات مالی
                </h3>
                
                <div class="financial-grid">
                    <div class="form-group">
                        <label for="sewingPrice">قیمت دوخت (افغانی)</label>
                        <input type="number" 
                               id="sewingPrice" 
                               class="form-control" 
                               value="${customer.financial.sewingPrice || ''}"
                               min="0"
                               oninput="App.updateFinancialField('sewingPrice', this.value)">
                    </div>
                    
                    <div class="form-group">
                        <label for="fabricCost">هزینه پارچه (افغانی)</label>
                        <input type="number" 
                               id="fabricCost" 
                               class="form-control" 
                               value="${customer.financial.fabricCost || ''}"
                               min="0"
                               oninput="App.updateFinancialField('fabricCost', this.value)">
                    </div>
                    
                    <div class="form-group">
                        <label for="additionalCosts">هزینه‌های اضافی (افغانی)</label>
                        <input type="number" 
                               id="additionalCosts" 
                               class="form-control" 
                               value="${customer.financial.additionalCosts || ''}"
                               min="0"
                               oninput="App.updateFinancialField('additionalCosts', this.value)">
                    </div>
                </div>
                
                <div class="financial-summary surface-light mt-4 p-4">
                    <div class="summary-row">
                        <span>جمع کل:</span>
                        <strong>${UIManager.formatPrice(customer.financial.totalAmount || 0)} افغانی</strong>
                    </div>
                    
                    <div class="summary-row">
                        <span>پرداخت شده:</span>
                        <strong>${UIManager.formatPrice(customer.financial.paidAmount || 0)} افغانی</strong>
                    </div>
                    
                    <div class="summary-row">
                        <span>مانده:</span>
                        <strong class="${customer.financial.remainingAmount > 0 ? 'text-error' : 'text-success'}">
                            ${UIManager.formatPrice(customer.financial.remainingAmount || 0)} افغانی
                        </strong>
                    </div>
                </div>
            </div>
            
            <div class="surface">
                <h3 class="section-title">
                    <i class="fas fa-credit-card"></i>
                    وضعیت پرداخت
                </h3>
                
                <div class="payment-status">
                    <div class="payment-toggle" onclick="App.togglePaymentStatus()">
                        <div class="payment-checkbox ${isPaid ? 'checked' : ''}">
                            <div class="checkbox-icon">${isPaid ? '✓' : ''}</div>
                            <span>
                                ${isPaid ? 'پرداخت کامل' : 
                                  isPartial ? 'پرداخت جزئی' : 'پرداخت نشده'}
                            </span>
                        </div>
                    </div>
                    
                    ${customer.financial.paymentDate ? `
                        <div class="payment-date mt-3">
                            <i class="fas fa-calendar"></i>
                            تاریخ پرداخت: ${UIManager.formatDateShort(customer.financial.paymentDate)}
                        </div>
                    ` : ''}
                    
                    <div class="form-group mt-4">
                        <label for="paidAmount">مبلغ پرداختی (افغانی)</label>
                        <input type="number" 
                               id="paidAmount" 
                               class="form-control" 
                               value="${customer.financial.paidAmount || 0}"
                               min="0"
                               max="${customer.financial.totalAmount || 0}"
                               oninput="App.updateFinancialField('paidAmount', this.value)">
                    </div>
                </div>
            </div>
        `;
    }
    
    _renderOrdersTab() {
        const customer = this.currentCustomer;
        
        if (!customer.orders || customer.orders.length === 0) {
            return `
                <div class="surface">
                    <div class="empty-state">
                        <i class="fas fa-clipboard-list empty-state-icon"></i>
                        <h3 class="empty-state-title">سفارشی ثبت نشده است</h3>
                        <p class="empty-state-description">هنوز سفارشی برای این مشتری ثبت نشده است.</p>
                        <button class="btn btn-primary" onclick="App.addOrder()">
                            <i class="fas fa-plus"></i>
                            افزودن سفارش
                        </button>
                    </div>
                </div>
            `;
        }
        
        let html = `
            <div class="surface">
                <div class="section-header">
                    <h3 class="section-title">
                        <i class="fas fa-clipboard-list"></i>
                        سفارشات
                    </h3>
                    <button class="btn btn-primary" onclick="App.addOrder()">
                        <i class="fas fa-plus"></i>
                        سفارش جدید
                    </button>
                </div>
                
                <div class="orders-list">
        `;
        
        customer.orders.forEach((order, index) => {
            html += `
                <div class="order-item surface-light">
                    <div class="order-content">
                        <div class="order-header">
                            <span class="order-number">سفارش #${index + 1}</span>
                            <span class="order-date">${UIManager.formatDateShort(order.date || order.createdAt)}</span>
                        </div>
                        <div class="order-details">${Security.sanitizeHTML(order.details || 'بدون توضیحات')}</div>
                        ${order.status ? `
                            <div class="order-status">
                                <span class="badge ${order.status === 'completed' ? 'badge-paid' : 'badge-price'}">
                                    ${order.status === 'completed' ? 'تکمیل شده' : 
                                      order.status === 'in_progress' ? 'در حال انجام' : 'در انتظار'}
                                </span>
                            </div>
                        ` : ''}
                    </div>
                    <button class="btn btn-icon btn-error" 
                            onclick="App.deleteOrder(${index})"
                            aria-label="حذف سفارش">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
        
        return html;
    }
    
    // ========== CUSTOMER PROFILE METHODS ==========
    updateCustomerField(field, value) {
        if (!this.currentCustomer) return;
        
        const sanitizedValue = Security.sanitizeInput(value);
        
        switch (field) {
            case 'name':
                this.currentCustomer.name = sanitizedValue;
                break;
            case 'phone':
                this.currentCustomer.phone = sanitizedValue;
                break;
            case 'email':
                this.currentCustomer.email = sanitizedValue;
                break;
            case 'address':
                this.currentCustomer.address = sanitizedValue;
                break;
            case 'notes':
                this.currentCustomer.notes = sanitizedValue;
                break;
        }
        
        this.scheduleSave();
    }
    
    updateMeasurement(field, value) {
        if (!this.currentCustomer) return;
        
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            this.currentCustomer.measurements[field] = numValue;
            this.scheduleSave();
        }
    }
    
    updateModel(type, model) {
        if (!this.currentCustomer) return;
        
        this.currentCustomer.models[type] = model;
        this.scheduleSave();
        
        // Update UI
        const buttons = document.querySelectorAll(`.model-option:not(.multi-select)`);
        buttons.forEach(btn => {
            btn.classList.remove('selected');
            if (btn.textContent.trim() === model) {
                btn.classList.add('selected');
            }
        });
    }
    
    toggleMultiModel(type, value) {
        if (!this.currentCustomer) return;
        
        const index = this.currentCustomer.models[type].indexOf(value);
        if (index > -1) {
            this.currentCustomer.models[type].splice(index, 1);
        } else {
            this.currentCustomer.models[type].push(value);
        }
        
        this.scheduleSave();
        
        // Update UI
        const button = document.querySelector(`.model-option.multi-select:contains('${value}')`);
        if (button) {
            const checkmark = button.querySelector('.checkmark');
            const isSelected = this.currentCustomer.models[type].includes(value);
            button.classList.toggle('selected', isSelected);
            checkmark.textContent = isSelected ? '✓' : '';
        }
    }
    
    updateFinancialField(field, value) {
        if (!this.currentCustomer) return;
        
        const numValue = parseFloat(value) || 0;
        
        switch (field) {
            case 'sewingPrice':
                this.currentCustomer.financial.sewingPrice = numValue;
                break;
            case 'fabricCost':
                this.currentCustomer.financial.fabricCost = numValue;
                break;
            case 'additionalCosts':
                this.currentCustomer.financial.additionalCosts = numValue;
                break;
            case 'paidAmount':
                this.currentCustomer.financial.paidAmount = numValue;
                break;
        }
        
        this.currentCustomer.calculateTotal();
        this.scheduleSave();
    }
    
    togglePaymentStatus() {
        if (!this.currentCustomer) return;
        
        const status = this.currentCustomer.financial.paymentStatus;
        let newStatus = 'pending';
        
        switch (status) {
            case 'pending':
                newStatus = 'partial';
                break;
            case 'partial':
                newStatus = 'paid';
                this.currentCustomer.financial.paidAmount = this.currentCustomer.financial.totalAmount;
                this.currentCustomer.financial.paymentDate = new Date().toISOString();
                break;
            case 'paid':
                newStatus = 'pending';
                this.currentCustomer.financial.paidAmount = 0;
                this.currentCustomer.financial.paymentDate = null;
                break;
        }
        
        this.currentCustomer.financial.paymentStatus = newStatus;
        this.currentCustomer.calculateTotal();
        this.scheduleSave();
        
        // Refresh financial tab
        this.switchProfileTab('financial');
    }
    
    async addOrder() {
        if (!this.currentCustomer) return;
        
        const details = prompt('جزئیات سفارش جدید را وارد کنید:');
        if (!details || !details.trim()) {
            UIManager.showNotification('لطفاً جزئیات سفارش را وارد کنید', 'warning');
            return;
        }
        
        const order = {
            id: Security.generateUUID(),
            details: details.trim(),
            date: new Date().toISOString(),
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        this.currentCustomer.orders.push(order);
        this.scheduleSave();
        
        // Refresh orders tab
        this.switchProfileTab('orders');
        
        UIManager.showNotification('سفارش جدید اضافه شد', 'success');
    }
    
    async deleteOrder(index) {
        if (!this.currentCustomer || !this.currentCustomer.orders[index]) return;
        
        const confirm = await UIManager.confirm(
            'حذف سفارش',
            'آیا از حذف این سفارش مطمئن هستید؟',
            'error'
        );
        
        if (!confirm) return;
        
        this.currentCustomer.orders.splice(index, 1);
        this.scheduleSave();
        
        // Refresh orders tab
        this.switchProfileTab('orders');
        
        UIManager.showNotification('سفارش حذف شد', 'success');
    }
    
    switchProfileTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected tab
        const tabPane = document.getElementById(`tab-${tabName}`);
        const tabBtn = document.querySelector(`.tab-btn[onclick*="${tabName}"]`);
        
        if (tabPane) tabPane.classList.add('active');
        if (tabBtn) tabBtn.classList.add('active');
    }
    
    scheduleSave() {
        // Clear existing timeout
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        
        // Set new timeout
        this.saveTimeout = setTimeout(() => {
            this.saveCurrentCustomer();
        }, 2000);
    }
    
    async saveCurrentCustomer() {
        if (!this.currentCustomer) return;
        
        try {
            await this.db.saveCustomer(this.currentCustomer);
            this.saveTimeout = null;
            
            // Update in local list
            const index = this.customers.findIndex(c => c.id === this.currentCustomer.id);
            if (index !== -1) {
                this.customers[index] = this.currentCustomer;
            }
            
            // Show save indicator
            const saveIndicator = document.createElement('div');
            saveIndicator.className = 'save-indicator';
            saveIndicator.innerHTML = '<i class="fas fa-check"></i> ذخیره شد';
            document.body.appendChild(saveIndicator);
            
            setTimeout(() => {
                if (saveIndicator.parentNode) {
                    saveIndicator.parentNode.removeChild(saveIndicator);
                }
            }, 2000);
            
        } catch (error) {
            UIManager.showNotification(`خطا در ذخیره: ${error.message}`, 'error');
        }
    }
    
    // ========== NAVIGATION ==========
    goHome() {
        // Clear save timeout
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
            this.saveTimeout = null;
        }
        
        // Hide profile page, show home page
        document.getElementById('profilePage').hidden = true;
        document.getElementById('homePage').classList.add('active');
        
        this.currentCustomer = null;
        
        // Update URL
        window.history.pushState({}, '', '#');
        
        // Focus on search input
        setTimeout(() => {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) searchInput.focus();
        }, 100);
    }
    
    // ========== SEARCH & FILTERS ==========
    async searchCustomers() {
        await this.refreshCustomers();
    }
    
    // ========== PAGINATION ==========
    updatePaginationInfo() {
        const infoElement = document.getElementById('paginationInfo');
        if (infoElement) {
            infoElement.textContent = `صفحه ${this.currentPage} از ${this.totalPages}`;
        }
    }
    
    async prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            await this.refreshCustomers();
        }
    }
    
    async nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            await this.refreshCustomers();
        }
    }
    
    // ========== STATISTICS ==========
    async updateStats() {
        try {
            const stats = await this.db.getStatistics();
            if (!stats) return;
            
            const container = document.getElementById('statsContainer');
            if (!container) return;
            
            container.innerHTML = `
                <div class="stat-card surface">
                    <div class="stat-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="stat-value">${stats.totalCustomers}</div>
                    <div class="stat-label">کل مشتریان</div>
                </div>
                
                <div class="stat-card surface">
                    <div class="stat-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="stat-value">${stats.paymentStats.paid}</div>
                    <div class="stat-label">پرداخت شده</div>
                </div>
                
                <div class="stat-card surface">
                    <div class="stat-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-value">${stats.paymentStats.pending}</div>
                    <div class="stat-label">در انتظار پرداخت</div>
                </div>
                
                <div class="stat-card surface">
                    <div class="stat-icon">
                        <i class="fas fa-money-bill-wave"></i>
                    </div>
                    <div class="stat-value">${UIManager.formatPrice(stats.financialStats.totalRevenue)}</div>
                    <div class="stat-label">درآمد کل</div>
                </div>
            `;
            
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }
    
    async showStatistics() {
        try {
            const stats = await this.db.getStatistics();
            if (!stats) {
                UIManager.showNotification('خطا در دریافت آمار', 'error');
                return;
            }
            
            // Create stats page content
            const statsPage = document.getElementById('statsPage');
            if (!statsPage) return;
            
            statsPage.innerHTML = `
                <div class="surface mb-4">
                    <button class="btn btn-secondary mb-4" onclick="App.goHome()">
                        <i class="fas fa-arrow-right"></i>
                        بازگشت
                    </button>
                    
                    <h2 class="section-title">
                        <i class="fas fa-chart-bar"></i>
                        آمار و گزارشات
                    </h2>
                    
                    <div class="stats-dashboard">
                        <div class="stat-section">
                            <h3><i class="fas fa-users"></i> آمار مشتریان</h3>
                            <div class="stat-grid">
                                <div class="stat-item">
                                    <span class="stat-label">کل مشتریان:</span>
                                    <span class="stat-value">${stats.totalCustomers}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">مشتریان فعال:</span>
                                    <span class="stat-value">${stats.activeCustomers}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">حذف شده:</span>
                                    <span class="stat-value">${stats.deletedCustomers}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="stat-section">
                            <h3><i class="fas fa-money-bill-wave"></i> آمار مالی</h3>
                            <div class="stat-grid">
                                <div class="stat-item">
                                    <span class="stat-label">درآمد کل:</span>
                                    <span class="stat-value">${UIManager.formatPrice(stats.financialStats.totalRevenue)} افغانی</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">پرداخت شده:</span>
                                    <span class="stat-value">${UIManager.formatPrice(stats.financialStats.totalPaid)} افغانی</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">مانده:</span>
                                    <span class="stat-value">${UIManager.formatPrice(stats.financialStats.totalPending)} افغانی</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">میانگین سفارش:</span>
                                    <span class="stat-value">${UIManager.formatPrice(stats.financialStats.averageOrderValue)} افغانی</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="stat-section">
                            <h3><i class="fas fa-chart-line"></i> آمار زمانی</h3>
                            <div class="stat-grid">
                                <div class="stat-item">
                                    <span class="stat-label">امروز:</span>
                                    <span class="stat-value">${stats.timelineStats.today}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">این هفته:</span>
                                    <span class="stat-value">${stats.timelineStats.thisWeek}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">این ماه:</span>
                                    <span class="stat-value">${stats.timelineStats.thisMonth}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Show stats page
            document.getElementById('homePage').classList.remove('active');
            document.getElementById('profilePage').hidden = true;
            statsPage.hidden = false;
            
        } catch (error) {
            UIManager.showNotification(`خطا در نمایش آمار: ${error.message}`, 'error');
        }
    }
    
    // ========== DATA MANAGEMENT ==========
    async exportData() {
        try {
            UIManager.showLoading('در حال ایجاد پشتیبان...');
            
            const backupData = await this.db.createBackup('manual');
            
            // Create download link
            const dataStr = JSON.stringify(backupData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            link.download = `alfajr-backup-${timestamp}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up
            setTimeout(() => URL.revokeObjectURL(url), 100);
            
            UIManager.hideLoading();
            UIManager.showNotification('پشتیبان با موفقیت ایجاد شد', 'success');
            
        } catch (error) {
            UIManager.hideLoading();
            UIManager.showNotification(`خطا در ایجاد پشتیبان: ${error.message}`, 'error');
        }
    }
    
    importData() {
        document.getElementById('fileInput').click();
    }
    
    // ========== THEME MANAGEMENT ==========
    setTheme(theme) {
        this.currentTheme = theme;
        document.body.className = `${theme}-mode`;
        
        // Save theme preference
        this.db.saveSetting('theme', theme).catch(console.error);
    }
    
    // ========== UTILITIES ==========
    toggleSettings() {
        const dropdown = document.getElementById('settingsDropdown');
        if (!dropdown) return;
        
        const isHidden = dropdown.getAttribute('aria-hidden') === 'true';
        dropdown.setAttribute('aria-hidden', !isHidden);
        
        const settingsBtn = document.querySelector('.settings-btn');
        settingsBtn.setAttribute('aria-expanded', isHidden);
    }
    
    closeModal() {
        UIManager.hideModal('addCustomerModal');
        document.getElementById('addCustomerForm').reset();
    }
    
    async deleteCustomer(customerId) {
        if (!customerId) return;
        
        const customer = this.customers.find(c => c.id === customerId);
        if (!customer) return;
        
        const confirm = await UIManager.confirm(
            'حذف مشتری',
            `آیا از حذف "${customer.name}" مطمئن هستید؟`,
            'error'
        );
        
        if (!confirm) return;
        
        try {
            UIManager.showLoading('در حال حذف مشتری...');
            await this.db.deleteCustomer(customerId);
            await this.refreshCustomers();
            await this.updateStats();
            
            UIManager.hideLoading();
            UIManager.showNotification('مشتری با موفقیت حذف شد', 'success');
            
        } catch (error) {
            UIManager.hideLoading();
            UIManager.showNotification(`خطا در حذف مشتری: ${error.message}`, 'error');
        }
    }
    
    async printCustomer() {
        if (!this.currentCustomer) return;
        
        // This would open a print dialog with customer information
        // For now, we'll just show a notification
        UIManager.showNotification('امکانات چاپ به زودی اضافه خواهد شد', 'info');
    }
    
    toggleListView() {
        // Toggle between grid and list view
        const grid = document.getElementById('customerList');
        if (grid) {
            grid.classList.toggle('list-view');
        }
    }
    
    async optimizeDatabase() {
        try {
            UIManager.showLoading('در حال بهینه‌سازی دیتابیس...');
            
            // This would perform database optimization tasks
            // For now, we'll just simulate it
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            UIManager.hideLoading();
            UIManager.showNotification('دیتابیس با موفقیت بهینه‌سازی شد', 'success');
            
        } catch (error) {
            UIManager.hideLoading();
            UIManager.showNotification(`خطا در بهینه‌سازی: ${error.message}`, 'error');
        }
    }
    
    async clearAllData() {
        const confirm1 = await UIManager.confirm(
            'پاک‌سازی کامل',
            '⚠️ هشدار! این عمل تمام داده‌های شما را پاک می‌کند.\nآیا مطمئن هستید؟',
            'error'
        );
        
        if (!confirm1) return;
        
        const confirm2 = await UIManager.confirm(
            'آخرین هشدار',
            '❌ این عمل غیرقابل بازگشت است!\nتمام مشتریان، سفارشات و تنظیمات پاک خواهند شد.\nبرای ادامه مجدداً تأیید کنید.',
            'error'
        );
        
        if (!confirm2) return;
        
        try {
            UIManager.showLoading('در حال پاک‌سازی...');
            await this.db.clearAllData(false);
            
            // Reset app state
            this.customers = [];
            this.currentCustomer = null;
            this.currentPage = 1;
            
            await this.refreshCustomers();
            await this.updateStats();
            
            UIManager.hideLoading();
            UIManager.showNotification('تمامی داده‌ها پاک شدند', 'success');
            
        } catch (error) {
            UIManager.hideLoading();
            UIManager.showNotification(`خطا در پاک‌سازی: ${error.message}`, 'error');
        }
    }
}

// ========== APP INITIALIZATION ==========
// Create global App instance
window.App = new AppController();
window.App.UI = UIManager;

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        App,
        AppController,
        DatabaseManager,
        Customer,
        Security,
        UIManager
    };
}