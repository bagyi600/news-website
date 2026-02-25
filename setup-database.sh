#!/bin/bash
# Database setup script for News Website

echo "Setting up database for News Website..."
echo ""

# Check if SQLite3 is installed
if ! command -v sqlite3 &> /dev/null; then
    echo "Installing SQLite3..."
    apt-get update && apt-get install -y sqlite3
fi

# Create database from schema
echo "Creating database..."
sqlite3 database.db < database-schema.sql

# Add sample data
echo "Adding sample data..."
sqlite3 database.db << 'SQL'
-- Add admin user (password: admin123)
INSERT INTO users (username, email, password_hash, is_admin, created_at) 
VALUES ('admin', 'admin@example.com', 'scrypt:32768:8:1$Klg8T7Zz$d9b5b...', 1, datetime('now'));

-- Add sample categories
INSERT INTO categories (name, slug, description) VALUES
('Technology', 'technology', 'Latest tech news and updates'),
('Business', 'business', 'Business and finance news'),
('Politics', 'politics', 'Political news and analysis'),
('Sports', 'sports', 'Sports news and updates'),
('Entertainment', 'entertainment', 'Entertainment and celebrity news');

-- Add sample posts
INSERT INTO posts (title, slug, content, excerpt, category_id, author_id, status, published_at, created_at) VALUES
('AI Revolution in Journalism', 'ai-revolution-journalism', 'Artificial intelligence is transforming how news is gathered, written, and distributed...', 'How AI is changing journalism forever', 1, 1, 'published', datetime('now'), datetime('now')),
('Economic Outlook for 2026', 'economic-outlook-2026', 'Global economic trends and predictions for the coming year...', 'What to expect in the global economy', 2, 1, 'published', datetime('now'), datetime('now')),
('New Government Policies Announced', 'new-government-policies', 'The government has announced several new policies aimed at economic growth...', 'Latest policy updates from the government', 3, 1, 'published', datetime('now'), datetime('now'));

echo "Sample data added successfully!";
SQL

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Default admin credentials:"
echo "Email: admin@example.com"
echo "Password: admin123"
echo ""
echo "To start the server:"
echo "npm start"
