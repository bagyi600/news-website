const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Create uploads directory
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware - Simplified for public access
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware (kept for compatibility but not required for reading)
app.use(session({
    secret: 'news-site-secret-key-change-in-production',
    resave: false,
    saveUninitialized: true, // Changed to true for public access
    cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Database setup
const db = new sqlite3.Database('./database.db');

// Initialize database
const initDB = () => {
    const schema = fs.readFileSync(path.join(__dirname, 'database-schema.sql'), 'utf8');
    db.exec(schema, (err) => {
        if (err) {
            console.error('Error initializing database:', err);
        } else {
            console.log('Database initialized successfully');
            // Create default admin user if not exists
            const defaultPassword = bcrypt.hashSync('admin123', 10);
            db.run(`
                INSERT OR IGNORE INTO users (username, email, password, role, bio) 
                VALUES ('admin', 'admin@news.com', ?, 'admin', 'Site Administrator')
            `, [defaultPassword]);
        }
    });
};

// ==================== PUBLIC ROUTES ====================

// Serve homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve admin panel (public access for viewing)
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Get all published posts (public)
app.get('/api/posts', (req, res) => {
    const { category, author, limit = 20, page = 1 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = "p.status = 'published'";
    let params = [];
    
    if (category) {
        whereClause += " AND c.slug = ?";
        params.push(category);
    }
    
    if (author) {
        whereClause += " AND u.username = ?";
        params.push(author);
    }
    
    db.all(`
        SELECT p.*, 
               u.username as author_name,
               u.avatar as author_avatar,
               c.name as category_name,
               c.color as category_color,
               c.slug as category_slug,
               COUNT(DISTINCT l.user_id) as like_count,
               COUNT(DISTINCT cm.id) as comment_count
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN likes l ON p.id = l.post_id
        LEFT JOIN comments cm ON p.id = cm.post_id AND cm.is_approved = 1
        WHERE ${whereClause}
        GROUP BY p.id
        ORDER BY p.published_at DESC
        LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)], (err, rows) => {
        if (err) {
            console.error('Error fetching posts:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// Get single post by slug (public)
app.get('/api/posts/:slug', (req, res) => {
    const slug = req.params.slug;
    
    db.get(`
        SELECT p.*, 
               u.username as author_name,
               u.avatar as author_avatar,
               u.bio as author_bio,
               c.name as category_name,
               c.color as category_color,
               c.slug as category_slug,
               COUNT(DISTINCT l.user_id) as like_count
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN likes l ON p.id = l.post_id
        WHERE p.slug = ? AND p.status = 'published'
        GROUP BY p.id
    `, [slug], (err, post) => {
        if (err) {
            console.error('Error fetching post:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        // Increment view count
        db.run('UPDATE posts SET view_count = view_count + 1 WHERE id = ?', [post.id]);
        
        res.json(post);
    });
});

// Get categories (public)
app.get('/api/categories', (req, res) => {
    db.all('SELECT * FROM categories ORDER BY name', (err, categories) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(categories);
    });
});

// Get comments for a post (public)
app.get('/api/posts/:postId/comments', (req, res) => {
    const postId = req.params.postId;
    
    db.all(`
        SELECT c.*, 
               u.username, 
               u.avatar,
               (c.upvotes - c.downvotes) as vote_score
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.post_id = ? AND c.is_approved = 1
        ORDER BY 
            CASE WHEN c.parent_id IS NULL THEN c.id ELSE c.parent_id END,
            c.created_at
    `, [postId], (err, comments) => {
        if (err) {
            console.error('Error fetching comments:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        // Structure comments into tree
        const commentMap = {};
        const rootComments = [];
        
        comments.forEach(comment => {
            comment.replies = [];
            commentMap[comment.id] = comment;
            
            if (comment.parent_id) {
                if (commentMap[comment.parent_id]) {
                    commentMap[comment.parent_id].replies.push(comment);
                }
            } else {
                rootComments.push(comment);
            }
        });
        
        res.json(rootComments);
    });
});

// Search posts (public)
app.get('/api/search', (req, res) => {
    const { q, category, author, sort = 'recent', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClauses = ["p.status = 'published'"];
    let params = [];
    
    if (q) {
        whereClauses.push("(p.title LIKE ? OR p.content LIKE ? OR p.excerpt LIKE ?)");
        const searchTerm = `%${q}%`;
        params.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (category) {
        whereClauses.push("c.slug = ?");
        params.push(category);
    }
    
    if (author) {
        whereClauses.push("u.username = ?");
        params.push(author);
    }
    
    let orderBy = "p.published_at DESC";
    switch (sort) {
        case 'popular':
            orderBy = "(p.view_count + p.like_count * 2) DESC";
            break;
        case 'trending':
            orderBy = "p.is_trending DESC, p.view_count DESC";
            break;
        case 'featured':
            orderBy = "p.is_featured DESC, p.published_at DESC";
            break;
    }
    
    const whereClause = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';
    
    // Get total count
    db.get(`
        SELECT COUNT(*) as total
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        LEFT JOIN categories c ON p.category_id = c.id
        ${whereClause}
    `, params, (err, countResult) => {
        if (err) {
            console.error('Error counting search results:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        // Get posts
        db.all(`
            SELECT p.*, 
                   u.username as author_name,
                   c.name as category_name,
                   c.color as category_color,
                   c.slug as category_slug
            FROM posts p
            LEFT JOIN users u ON p.author_id = u.id
            LEFT JOIN categories c ON p.category_id = c.id
            ${whereClause}
            ORDER BY ${orderBy}
            LIMIT ? OFFSET ?
        `, [...params, limit, offset], (err, posts) => {
            if (err) {
                console.error('Error searching posts:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            res.json({
                posts,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: countResult.total,
                    totalPages: Math.ceil(countResult.total / limit)
                }
            });
        });
    });
});

// Get fact-checked posts (public)
app.get('/api/fact-check', (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = "p.status = 'published'";
    let params = [];
    
    if (status) {
        whereClause += " AND p.fact_check_status = ?";
        params.push(status);
    } else {
        whereClause += " AND p.fact_check_status != 'unverified'";
    }
    
    // Get total count
    db.get(`
        SELECT COUNT(*) as total
        FROM posts p
        WHERE ${whereClause}
    `, params, (err, countResult) => {
        if (err) {
            console.error('Error counting fact-check posts:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        // Get posts
        db.all(`
            SELECT p.*, 
                   u.username as author_name,
                   c.name as category_name,
                   c.color as category_color
            FROM posts p
            LEFT JOIN users u ON p.author_id = u.id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE ${whereClause}
            ORDER BY p.published_at DESC
            LIMIT ? OFFSET ?
        `, [...params, limit, offset], (err, posts) => {
            if (err) {
                console.error('Error fetching fact-check posts:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            res.json({
                posts,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: countResult.total,
                    totalPages: Math.ceil(countResult.total / limit)
                }
            });
        });
    });
});

// Get popular posts (public)
app.get('/api/stats/popular', (req, res) => {
    const { period = 'week' } = req.query;
    
    let dateFilter = '';
    switch (period) {
        case 'day':
            dateFilter = "AND p.published_at >= datetime('now', '-1 day')";
            break;
        case 'week':
            dateFilter = "AND p.published_at >= datetime('now', '-7 days')";
            break;
        case 'month':
            dateFilter = "AND p.published_at >= datetime('now', '-30 days')";
            break;
        case 'year':
            dateFilter = "AND p.published_at >= datetime('now', '-365 days')";
            break;
    }
    
    db.all(`
        SELECT p.*, 
               u.username as author_name,
               c.name as category_name,
               (p.view_count + p.like_count * 2) as popularity_score
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.status = 'published' ${dateFilter}
        ORDER BY popularity_score DESC
        LIMIT 10
    `, (err, posts) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(posts);
    });
});

// Newsletter subscription (public)
app.post('/api/newsletter/subscribe', (req, res) => {
    const { email } = req.body;
    
    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Valid email required' });
    }
    
    db.run(`
        INSERT OR REPLACE INTO newsletter_subscriptions (email, is_active, subscribed_at)
        VALUES (?, 1, CURRENT_TIMESTAMP)
    `, [email], function(err) {
        if (err) {
            console.error('Error subscribing to newsletter:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({ success: true, message: 'Subscribed to newsletter successfully' });
    });
});

// ==================== SIMPLIFIED WRITE ENDPOINTS ====================

// These endpoints would normally require authentication
// For now, we'll make them return informative messages

app.post('/api/posts/:postId/comments', (req, res) => {
    res.status(401).json({ 
        error: 'Commenting requires authentication',
        message: 'This is a public demo version. In a full implementation, users would need to login to comment.'
    });
});

app.post('/api/comments/:commentId/vote', (req, res) => {
    res.status(401).json({ 
        error: 'Voting requires authentication',
        message: 'This is a public demo version. In a full implementation, users would need to login to vote.'
    });
});

app.post('/api/posts/:postId/like', (req, res) => {
    res.status(401).json({ 
        error: 'Liking requires authentication',
        message: 'This is a public demo version. In a full implementation, users would need to login to like posts.'
    });
});

app.post('/api/posts/:postId/bookmark', (req, res) => {
    res.status(401).json({ 
        error: 'Bookmarking requires authentication',
        message: 'This is a public demo version. In a full implementation, users would need to login to bookmark posts.'
    });
});

// ==================== ADMIN ENDPOINTS (Simplified) ====================

// These would normally be protected but for demo we'll make them accessible
// with a note that they require admin privileges

app.get('/api/analytics/overview', (req, res) => {
    db.get(`
        SELECT 
            COUNT(*) as total_posts,
            COUNT(CASE WHEN status = 'published' THEN 1 END) as published_posts,
            COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_posts,
            SUM(view_count) as total_views,
            SUM(like_count) as total_likes,
            (SELECT COUNT(*) FROM comments) as total_comments,
            (SELECT COUNT(*) FROM users) as total_users,
            (SELECT COUNT(*) FROM newsletter_subscriptions WHERE is_active = 1) as newsletter_subscribers
        FROM posts
    `, (err, stats) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(stats);
    });
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'news-site',
        version: '1.0.0',
        public_access: true,
        message: 'Website is publicly accessible without login'
    });
});

// ==================== SITEMAP ====================

app.get('/sitemap.xml', (req, res) => {
    res.set('Content-Type', 'application/xml');
    
    db.all(`
        SELECT slug, updated_at
        FROM posts 
        WHERE status = 'published'
        UNION
        SELECT slug, NULL as updated_at
        FROM categories
    `, (err, items) => {
        if (err) {
            return res.status(500).send('Database error');
        }
        
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
        
        // Homepage
        xml += '  <url>\n';
        xml += '    <loc>http://72.61.210.61/</loc>\n';
        xml += '    <changefreq>daily</changefreq>\n';
        xml += '    <priority>1.0</priority>\n';
        xml += '  </url>\n';
        
        // Posts
        items.forEach(item => {
            xml += '  <url>\n';
            xml += `    <loc>http://72.61.210.61/post/${item.slug}</loc>\n`;
            if (item.updated_at) {
                xml += `    <lastmod>${item.updated_at.split(' ')[0]}</lastmod>\n`;
            }
            xml += '    <changefreq>weekly</changefreq>\n';
            xml += '    <priority>0.8</priority>\n';
            xml += '  </url>\n';
        });
        
        xml += '</urlset>';
        res.send(xml);
    });
});

// ==================== RSS FEED ====================

app.get('/api/rss', (req, res) => {
    res.set('Content-Type', 'application/rss+xml');
    
    db.all(`
        SELECT p.*, 
               u.username as author_name,
               c.name as category_name
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.status = 'published'
        ORDER BY p.published_at DESC
        LIMIT 20
    `, (err, posts) => {
        if (err) {
            console.error('Error fetching posts for RSS:', err);
            return res.status(500).send('Database error');
        }
        
        let rss = '<?xml version="1.0" encoding="UTF-8"?>\n';
        rss += '<rss version="2.0">\n';
        rss += '  <channel>\n';
        rss += '    <title>NewsHub - Latest News</title>\n';
        rss += '    <link>http://72.61.210.61/</link>\n';
        rss += '    <description>Latest verified news from around the world</description>\n';
        rss += '    <language>en-us</language>\n';
        rss += '    <lastBuildDate>' + new Date().toUTCString() + '</lastBuildDate>\n';
        rss += '    <generator>NewsHub RSS Generator</generator>\n';
        
        posts.forEach(post => {
            rss += '    <item>\n';
            rss += '      <title>' + escapeXml(post.title) + '</title>\n';
            rss += '      <link>http://72.61.210.61/post/' + post.slug + '</link>\n';
            rss += '      <description>' + escapeXml(post.excerpt || post.content.substring(0, 200)) + '</description>\n';
            rss += '      <category>' + escapeXml(post.category_name || 'General') + '</category>\n';
            rss += '      <author>' + escapeXml(post.author_name || 'admin') + '</author>\n';
            rss += '      <guid isPermaLink="false">post-' + post.id + '</guid>\n';
            rss += '      <pubDate>' + new Date(post.published_at).toUTCString() + '</pubDate>\n';
            rss += '    </item>\n';
        });
        
        rss += '  </channel>\n';
        rss += '</rss>';
        
        res.send(rss);
    });
});

// Helper function to escape XML
function escapeXml(unsafe) {
    if (!unsafe) return '';
    return unsafe.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// Serve individual post page
app.get('/post/:slug', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'post-simple.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
initDB();

app.listen(PORT, () => {
    console.log(`News site server running on port ${PORT}`);
    console.log(`Access at: http://localhost:${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin`);
    console.log(`✅ PUBLIC ACCESS: No login required to read content`);
    console.log(`📰 Sample posts available at: http://localhost:${PORT}/api/posts`);
});
