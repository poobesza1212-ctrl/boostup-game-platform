-- ====================================================================
-- BOOSTUP - GAME TOPUP PLATFORM DATABASE SCHEMA
-- Compatible with SQLite, MySQL 8.0+, and PostgreSQL 14+
-- ====================================================================

-- 1. Users Table (Customer accounts & Member Portal)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(64) UNIQUE NOT NULL,
    email VARCHAR(128) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(128) NOT NULL,
    phone VARCHAR(32),
    role VARCHAR(32) DEFAULT 'user', -- 'user'
    wallet_balance DECIMAL(12, 2) DEFAULT 0.00,
    points INT DEFAULT 50, -- Boost Coins
    tier VARCHAR(32) DEFAULT 'Bronze', -- 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'
    total_spent DECIMAL(12, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Admins Table (Role-Based Access Control - RBAC)
CREATE TABLE IF NOT EXISTS admins (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(64) UNIQUE NOT NULL,
    email VARCHAR(128) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(128) NOT NULL,
    role VARCHAR(32) NOT NULL, -- 'super_admin', 'operator', 'content_editor'
    department VARCHAR(64),
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Games Catalog Table
CREATE TABLE IF NOT EXISTS games (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    publisher VARCHAR(128) NOT NULL,
    slug VARCHAR(128) UNIQUE NOT NULL,
    category VARCHAR(64) NOT NULL, -- 'MOBA', 'Battle Royale', 'FPS', 'RPG'
    icon_url TEXT NOT NULL,
    banner_url TEXT,
    badge VARCHAR(64),
    currency_name VARCHAR(64) NOT NULL,
    input_type VARCHAR(64) DEFAULT 'uid_only', -- 'uid_only', 'uid_server', 'riot_id'
    input_placeholder VARCHAR(255),
    input_help TEXT,
    servers_json TEXT, -- JSON array of server names
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Packages Table
CREATE TABLE IF NOT EXISTS packages (
    id VARCHAR(64) PRIMARY KEY,
    game_id VARCHAR(64) NOT NULL,
    name VARCHAR(128) NOT NULL,
    currency_amount INT NOT NULL,
    original_price DECIMAL(10, 2) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2) NOT NULL,
    bonus VARCHAR(64),
    api_sku VARCHAR(64),
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

-- 5. API Providers Table
CREATE TABLE IF NOT EXISTS api_providers (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    code VARCHAR(64) UNIQUE NOT NULL, -- 'SMILE_ONE', 'UNIPIN', 'CODASHOP', 'LAPAKGAMING'
    endpoint TEXT NOT NULL,
    api_key VARCHAR(255),
    api_secret VARCHAR(255),
    balance DECIMAL(12, 2) DEFAULT 0.00,
    currency VARCHAR(16) DEFAULT 'THB',
    status VARCHAR(32) DEFAULT 'online', -- 'online', 'maintenance', 'offline'
    latency_ms INT DEFAULT 150,
    success_rate DECIMAL(5, 2) DEFAULT 99.00,
    priority INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Game Provider Routes (Smart Failover Mapping)
CREATE TABLE IF NOT EXISTS game_provider_routes (
    game_id VARCHAR(64) PRIMARY KEY,
    primary_provider_id VARCHAR(64) NOT NULL,
    fallback_provider_id VARCHAR(64) NOT NULL,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    FOREIGN KEY (primary_provider_id) REFERENCES api_providers(id),
    FOREIGN KEY (fallback_provider_id) REFERENCES api_providers(id)
);

-- 7. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(64) PRIMARY KEY,
    order_number VARCHAR(64) UNIQUE NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    customer_name VARCHAR(128),
    game_id VARCHAR(64) NOT NULL,
    game_name VARCHAR(128) NOT NULL,
    package_id VARCHAR(64) NOT NULL,
    package_name VARCHAR(128) NOT NULL,
    currency_amount INT DEFAULT 0,
    currency_name VARCHAR(64),
    player_id VARCHAR(128) NOT NULL,
    player_nickname VARCHAR(128),
    server VARCHAR(64),
    original_amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    final_amount DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2) DEFAULT 0.00,
    coupon_code VARCHAR(64),
    payment_method VARCHAR(64) NOT NULL, -- 'promptpay', 'truemoney', 'bank_transfer', 'wallet'
    payment_status VARCHAR(32) DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
    topup_status VARCHAR(32) DEFAULT 'processing', -- 'processing', 'completed', 'failed', 'pending_manual'
    provider_id VARCHAR(64),
    provider_name VARCHAR(128),
    provider_order_id VARCHAR(128),
    provider_latency_ms INT,
    provider_response TEXT,
    error_message TEXT,
    is_fallback_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- 8. Coupons & Promotions Table
CREATE TABLE IF NOT EXISTS coupons (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(64) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(32) NOT NULL, -- 'percent', 'fixed'
    discount_value DECIMAL(10, 2) NOT NULL,
    min_spend DECIMAL(10, 2) DEFAULT 0.00,
    max_discount DECIMAL(10, 2),
    usage_limit INT DEFAULT 1000,
    used_count INT DEFAULT 0,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Carousel Slides Table (CMS Storefront Banners)
CREATE TABLE IF NOT EXISTS carousel_slides (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    badge VARCHAR(64),
    badge_color VARCHAR(64),
    image_url TEXT NOT NULL,
    cta_text VARCHAR(64),
    cta_target VARCHAR(128),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Audit Logs Table (Admin activity tracking)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    admin_id VARCHAR(64) NOT NULL,
    admin_name VARCHAR(128) NOT NULL,
    action VARCHAR(128) NOT NULL,
    details TEXT,
    ip_address VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for high-performance querying
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(topup_status, payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_packages_game_id ON packages(game_id);
