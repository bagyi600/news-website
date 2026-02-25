#!/usr/bin/env python3

import sqlite3
import requests
import xml.etree.ElementTree as ET
from datetime import datetime
import re
import sys
import os

# Configuration
DB_PATH = '/var/www/news-site/database.db'
LOG_FILE = '/tmp/news-updater.log'

# News sources (verified working feeds)
NEWS_SOURCES = [
    {
        'name': 'BBC News',
        'url': 'http://feeds.bbci.co.uk/news/rss.xml',
        'category': 'world-news'
    },
    {
        'name': 'Al Jazeera',
        'url': 'https://www.aljazeera.com/xml/rss/all.xml',
        'category': 'world-news'
    },
    {
        'name': 'CNN World',
        'url': 'http://rss.cnn.com/rss/edition_world.rss',
        'category': 'world-news'
    },
    {
        'name': 'TechCrunch',
        'url': 'https://techcrunch.com/feed/',
        'category': 'technology'
    },
    {
        'name': 'NPR News',
        'url': 'https://feeds.npr.org/1004/rss.xml',
        'category': 'general'
    }
]

def log_message(message):
    """Log message to file and print to console"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    log_entry = f"[{timestamp}] {message}"
    print(log_entry)
    
    # Write to log file
    with open(LOG_FILE, 'a') as f:
        f.write(log_entry + '\n')

def clean_text(text, max_length=500):
    """Clean HTML text and limit length"""
    if not text:
        return ''
    
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', ' ', text)
    
    # Clean up whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Limit length
    if len(text) > max_length:
        text = text[:max_length] + '...'
    
    return text

def generate_slug(title):
    """Generate URL slug from title"""
    # Convert to lowercase
    slug = title.lower()
    
    # Remove special characters
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    
    # Replace spaces with hyphens
    slug = re.sub(r'\s+', '-', slug)
    
    # Remove multiple hyphens
    slug = re.sub(r'-+', '-', slug)
    
    # Trim hyphens from start and end
    slug = slug.strip('-')
    
    return slug

def check_post_exists(cursor, title):
    """Check if a post with similar title already exists"""
    slug = generate_slug(title)
    cursor.execute("SELECT COUNT(*) FROM posts WHERE slug = ?", (slug,))
    return cursor.fetchone()[0] > 0

def fetch_rss_feed(url):
    """Fetch and parse RSS feed"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept-Encoding': 'gzip, deflate'  # Avoid brotli encoding issues
        }
        
        # Special handling for AP News
        if 'apnews.com' in url:
            # Try alternative AP News RSS feed
            url = 'http://feeds.feedburner.com/AP-TopNews'
            log_message(f"Using alternative AP News feed: {url}")
        
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        # Parse XML
        root = ET.fromstring(response.content)
        
        # Find all items
        items = []
        for item in root.findall('.//item'):
            title_elem = item.find('title')
            link_elem = item.find('link')
            desc_elem = item.find('description')
            
            if title_elem is not None and link_elem is not None:
                title = title_elem.text.strip() if title_elem.text else ''
                link = link_elem.text.strip() if link_elem.text else ''
                description = desc_elem.text.strip() if desc_elem is not None and desc_elem.text else ''
                
                if title and link:
                    items.append({
                        'title': title,
                        'link': link,
                        'description': description
                    })
        
        return items
    except Exception as e:
        log_message(f"Error fetching RSS feed {url}: {str(e)}")
        return []

def create_post(cursor, item, source_name, category_slug):
    """Create a new post in the database"""
    
    # Check if post already exists
    if check_post_exists(cursor, item['title']):
        log_message(f"Skipping existing post: {item['title'][:50]}...")
        return False
    
    # Generate slug
    slug = generate_slug(item['title'])
    
    # Create excerpt (first 150 chars of cleaned description)
    excerpt = clean_text(item['description'], 150)
    
    # Create content
    content = clean_text(item['description'], 500)
    
    # Get category ID
    cursor.execute("SELECT id FROM categories WHERE slug = ? LIMIT 1", (category_slug,))
    category_result = cursor.fetchone()
    
    if category_result:
        category_id = category_result[0]
    else:
        # Fallback to first category
        cursor.execute("SELECT id FROM categories LIMIT 1")
        category_id = cursor.fetchone()[0]
    
    # Get admin user ID
    cursor.execute("SELECT id FROM users WHERE role = 'admin' LIMIT 1")
    author_result = cursor.fetchone()
    author_id = author_result[0] if author_result else 1
    
    # Insert post
    try:
        cursor.execute("""
            INSERT INTO posts (
                title, slug, excerpt, content, author_id, category_id,
                status, published_at, view_count, like_count, share_count,
                is_featured, is_trending, fact_check_status, source_url, source_name
            ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), 0, 0, 0, 0, 0, 'verified', ?, ?)
        """, (
            item['title'],
            slug,
            excerpt,
            content,
            author_id,
            category_id,
            'published',
            item['link'],
            source_name
        ))
        
        log_message(f"Posted: {item['title'][:60]}...")
        return True
    except Exception as e:
        log_message(f"Error creating post '{item['title'][:30]}...': {str(e)}")
        return False

def main():
    """Main update function"""
    log_message("=" * 60)
    log_message("STARTING NEWS UPDATE")
    log_message("=" * 60)
    
    # Connect to database
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
    except Exception as e:
        log_message(f"Database connection error: {str(e)}")
        return
    
    total_new_posts = 0
    
    # Process each news source
    for source in NEWS_SOURCES:
        log_message(f"Fetching {source['name']}...")
        
        items = fetch_rss_feed(source['url'])
        log_message(f"  Found {len(items)} items")
        
        # Process items (limit to 2 per source)
        for i, item in enumerate(items[:2]):
            if create_post(cursor, item, source['name'], source['category']):
                total_new_posts += 1
            
            # Commit after each post
            conn.commit()
    
    # Close database connection
    conn.close()
    
    # Get total post count
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM posts")
        total_posts = cursor.fetchone()[0]
        conn.close()
    except:
        total_posts = 0
    
    log_message("=" * 60)
    log_message(f"UPDATE COMPLETED: {total_new_posts} new posts added")
    log_message(f"Total posts in database: {total_posts}")
    log_message("=" * 60)
    
    # Refresh website cache
    try:
        requests.get("http://localhost:3001/api/posts?limit=1", timeout=5)
    except:
        pass

if __name__ == "__main__":
    main()