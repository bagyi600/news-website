#!/bin/bash

# Automated News Updater Script
# Runs every 15 minutes via cron

LOG_FILE="/var/log/news-updater.log"
SCRIPT_DIR="/var/www/news-site/news-updater"
DB_PATH="/var/www/news-site/database.db"

# Create log directory if it doesn't exist
mkdir -p /var/log

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Function to escape SQL strings
escape_sql() {
    echo "$1" | sed "s/'/''/g"
}

# Function to check if post exists
check_post_exists() {
    local title="$1"
    local slug=$(echo "$title" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/-\+/-/g' | sed 's/^-//' | sed 's/-$//')
    local count=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM posts WHERE slug = '$slug';" 2>/dev/null)
    [ "$count" -gt 0 ] && return 0 || return 1
}

# Function to create post
create_post() {
    local title="$1"
    local description="$2"
    local link="$3"
    local source="$4"
    local category="${5:-world-news}"
    
    # Check if post already exists
    if check_post_exists "$title"; then
        log_message "Skipping existing post: $title"
        return 1
    fi
    
    # Generate slug
    local slug=$(echo "$title" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/-\+/-/g' | sed 's/^-//' | sed 's/-$//')
    
    # Create excerpt (first 150 chars of description)
    local excerpt=$(echo "$description" | head -c 150)
    
    # Clean content (remove HTML tags, limit to 500 chars)
    local content=$(echo "$description" | sed 's/<[^>]*>//g' | head -c 500)
    
    # Get category ID
    local category_id=$(sqlite3 "$DB_PATH" "SELECT id FROM categories WHERE slug = '$category' LIMIT 1;" 2>/dev/null || echo "9")
    
    # Get admin user ID
    local author_id=$(sqlite3 "$DB_PATH" "SELECT id FROM users WHERE role = 'admin' LIMIT 1;" 2>/dev/null || echo "1")
    
    # Escape single quotes for SQL
    local title_escaped=$(escape_sql "$title")
    local excerpt_escaped=$(escape_sql "$excerpt")
    local content_escaped=$(escape_sql "$content")
    local link_escaped=$(escape_sql "$link")
    local source_escaped=$(escape_sql "$source")
    
    # Insert post
    sqlite3 "$DB_PATH" <<EOF
    INSERT INTO posts (
        title, slug, excerpt, content, author_id, category_id,
        status, published_at, view_count, like_count, share_count,
        is_featured, is_trending, fact_check_status, source_url, source_name
    ) VALUES (
        '$title_escaped',
        '$slug',
        '$excerpt_escaped',
        '$content_escaped',
        $author_id,
        $category_id,
        'published',
        datetime('now'),
        0, 0, 0,
        0, 0,
        'verified',
        '$link_escaped',
        '$source_escaped'
    );
EOF
    
    if [ $? -eq 0 ]; then
        log_message "Posted: $title"
        return 0
    else
        log_message "Error posting: $title"
        return 1
    fi
}

# Function to fetch RSS feed
fetch_rss() {
    local url="$1"
    local source="$2"
    local category="$3"
    
    # Use curl to fetch RSS and parse with grep/sed
    local rss_content=$(curl -s -L --max-time 10 -A "Mozilla/5.0" "$url" 2>/dev/null)
    
    if [ -z "$rss_content" ]; then
        log_message "Failed to fetch RSS from $source"
        return 1
    fi
    
    # Parse RSS items (simple parsing)
    echo "$rss_content" | grep -o '<item>.*</item>' | while read -r item; do
        # Extract title
        local title=$(echo "$item" | grep -o '<title>.*</title>' | sed 's/<title>//' | sed 's/<\/title>//' | head -1)
        
        # Extract link
        local link=$(echo "$item" | grep -o '<link>.*</link>' | sed 's/<link>//' | sed 's/<\/link>//' | head -1)
        
        # Extract description
        local description=$(echo "$item" | grep -o '<description>.*</description>' | sed 's/<description>//' | sed 's/<\/description>//' | head -1)
        
        if [ -n "$title" ] && [ -n "$link" ]; then
            create_post "$title" "$description" "$link" "$source" "$category"
            
            # Limit to 2 posts per source
            local post_count=$((post_count + 1))
            if [ $post_count -ge 2 ]; then
                break
            fi
        fi
    done
}

# Main update function
update_news() {
    log_message "="*60
    log_message "STARTING NEWS UPDATE"
    log_message "="*60
    
    local total_posts=0
    
    # BBC News
    log_message "Fetching BBC News..."
    fetch_rss "http://feeds.bbci.co.uk/news/rss.xml" "BBC News" "world-news"
    
    # AP News
    log_message "Fetching AP News..."
    fetch_rss "https://apnews.com/hub/ap-top-news.rss" "AP News" "general"
    
    log_message "="*60
    log_message "UPDATE COMPLETED"
    log_message "="*60
    
    # Show current post count
    local current_count=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM posts;" 2>/dev/null)
    log_message "Total posts in database: $current_count"
}

# Run update
update_news

# Also update via website API to refresh cache
curl -s "http://localhost:3001/api/posts?limit=1" > /dev/null 2>&1