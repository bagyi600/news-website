-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user', -- user, editor, admin
    avatar TEXT,
    bio TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#6366f1',
    icon TEXT DEFAULT 'fas fa-newspaper'
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    author_id INTEGER NOT NULL,
    category_id INTEGER,
    status TEXT DEFAULT 'draft', -- draft, published, archived
    featured_image TEXT,
    image_caption TEXT,
    source_url TEXT,
    source_name TEXT,
    fact_check_status TEXT DEFAULT 'unverified', -- unverified, verified, disputed, false
    fact_check_notes TEXT,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    reading_time INTEGER, -- in minutes
    is_featured BOOLEAN DEFAULT 0,
    is_trending BOOLEAN DEFAULT 0,
    published_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL
);

-- Post tags junction table
CREATE TABLE IF NOT EXISTS post_tags (
    post_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    parent_id INTEGER, -- for nested comments
    content TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT 1,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- Likes table
CREATE TABLE IF NOT EXISTS likes (
    user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
    user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Comment votes table
CREATE TABLE IF NOT EXISTS comment_votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    comment_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    vote_type TEXT NOT NULL, -- 'upvote' or 'downvote'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(comment_id, user_id),
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Media table for uploaded files
CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    path TEXT NOT NULL,
    thumbnail_path TEXT,
    uploaded_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Newsletter subscriptions
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at DATETIME
);

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER,
    user_id INTEGER,
    event_type TEXT NOT NULL, -- view, like, share, comment
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default categories
INSERT OR IGNORE INTO categories (name, slug, description, color, icon) VALUES
('Technology', 'technology', 'Latest tech news and innovations', '#3b82f6', 'fas fa-microchip'),
('Science', 'science', 'Scientific discoveries and research', '#10b981', 'fas fa-flask'),
('Politics', 'politics', 'Political news and analysis', '#ef4444', 'fas fa-landmark'),
('Business', 'business', 'Business and economic news', '#f59e0b', 'fas fa-chart-line'),
('Health', 'health', 'Health and medical news', '#8b5cf6', 'fas fa-heartbeat'),
('Environment', 'environment', 'Environmental news and climate', '#22c55e', 'fas fa-leaf'),
('Entertainment', 'entertainment', 'Entertainment and celebrity news', '#ec4899', 'fas fa-film'),
('Sports', 'sports', 'Sports news and updates', '#f97316', 'fas fa-running'),
('World News', 'world-news', 'International news coverage', '#6366f1', 'fas fa-globe'),
('Local News', 'local-news', 'Local community news', '#06b6d4', 'fas fa-map-marker-alt');

-- Insert default admin user (password: admin123)
INSERT OR IGNORE INTO users (username, email, password, role, bio) VALUES
('admin', 'admin@news.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye7Z7lZ2nW7J7q3V3q3J3q3J3q3J3q3J3q', 'admin', 'Site Administrator'),
('editor', 'editor@news.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye7Z7lZ2nW7J7q3V3q3J3q3J3q3J3q3J3q', 'editor', 'News Editor'),
('reporter', 'reporter@news.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye7Z7lZ2nW7J7q3V3q3J3q3J3q3J3q3J3q', 'user', 'News Reporter');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published_at);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_analytics_post ON analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(created_at);