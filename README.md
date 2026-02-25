# News Website - Professional Journalism Platform

A complete, production-ready news website built with Node.js, Express, SQLite, and modern web technologies.

## 🌟 Features

### Frontend
- **Modern UI/UX** - Responsive design with enhanced components
- **Article Management** - Create, edit, publish, and organize news articles
- **Category System** - Organize content by categories and tags
- **Search Functionality** - Full-text search across all articles
- **User Interaction** - Comments, likes, bookmarks, and sharing
- **RSS Feed** - Automatic RSS feed generation
- **Sitemap** - Dynamic sitemap for SEO

### Backend
- **Express.js Server** - Fast and scalable Node.js backend
- **SQLite Database** - Lightweight, file-based database
- **Authentication** - User registration, login, and session management
- **Admin Panel** - Full-featured admin interface
- **API Endpoints** - RESTful API for all operations
- **Image Processing** - Automatic image optimization and resizing
- **Web Scraping** - Automated news aggregation from RSS feeds

### Advanced Features
- **24/7 Auto-Updater** - Automated news monitoring and updating
- **Professional Journalism Workflow** - Editorial tools and workflows
- **SEO Optimization** - Meta tags, structured data, and performance
- **Analytics** - View tracking and engagement metrics
- **Mobile Responsive** - Works perfectly on all devices
- **PWA Ready** - Progressive Web App capabilities

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- SQLite3

### Installation
```bash
# Clone repository
git clone https://github.com/bagyi600/news-website.git
cd news-website

# Install dependencies
npm install

# Initialize database
npm run setup

# Start development server
npm run dev

# Start production server
npm start
```

### Environment Variables
Create `.env` file:
```env
PORT=3000
NODE_ENV=production
SESSION_SECRET=your-secret-key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure-password
```

## 📁 Project Structure

```
news-website/
├── server.js              # Main Express server
├── package.json          # Dependencies and scripts
├── database-schema.sql   # Database schema
├── public/              # Static files
│   ├── css/            # Stylesheets
│   ├── js/             # JavaScript files
│   ├── images/         # Uploaded images
│   └── index.html      # Homepage
├── news-updater/       # Automated news system
│   ├── professional-updater.py
│   ├── auto-updater.sh
│   └── news-monitor.sh
└── docs/              # Documentation
    ├── API.md
    ├── DEPLOYMENT.md
    └── WORKFLOW.md
```

## 🔧 Configuration

### Database Setup
```bash
# Initialize database
sqlite3 database.db < database-schema.sql

# Or use the setup script
npm run setup-db
```

### Admin Access
1. Register first user at `/register`
2. Update database to set admin privileges:
```sql
UPDATE users SET is_admin = 1 WHERE email = 'your-email@example.com';
```

### Automated News Updates
```bash
# Start the auto-updater
cd news-updater
./auto-updater.sh

# Or use systemd service
sudo systemctl start news-updater
```

## 🌐 Deployment

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /static/ {
        alias /var/www/news-site/public/;
    }
}
```

### PM2 for Process Management
```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start server.js --name "news-website"

# Save PM2 configuration
pm2 save
pm2 startup
```

## 📊 API Endpoints

### Public Endpoints
- `GET /api/health` - Health check
- `GET /api/posts` - List all posts
- `GET /api/posts/:id` - Get specific post
- `GET /api/categories` - List categories
- `GET /api/search?q=query` - Search posts
- `GET /api/rss` - RSS feed
- `GET /api/sitemap.xml` - Sitemap

### Admin Endpoints (Authentication Required)
- `POST /api/admin/login` - Admin login
- `POST /api/admin/posts` - Create post
- `PUT /api/admin/posts/:id` - Update post
- `DELETE /api/admin/posts/:id` - Delete post
- `GET /api/admin/stats` - Statistics

## 🎨 UI Components

The website includes a comprehensive design system:

### CSS Architecture
- **Design System** - Consistent colors, typography, spacing
- **Component Library** - Reusable UI components
- **Enhanced Interactions** - Smooth animations and transitions
- **Responsive Grid** - Mobile-first responsive design

### JavaScript Features
- **Lazy Loading** - Images and content load on demand
- **Infinite Scroll** - Seamless pagination
- **Real-time Updates** - Live content updates
- **Offline Support** - Service worker for PWA

## 🔒 Security Features

- **SQL Injection Protection** - Parameterized queries
- **XSS Prevention** - Input sanitization
- **CSRF Protection** - Token-based validation
- **Rate Limiting** - API request limiting
- **Session Management** - Secure cookie handling
- **File Upload Security** - Type and size validation

## 📈 Monitoring & Maintenance

### Logging
```bash
# View application logs
pm2 logs news-website

# View error logs
tail -f /var/log/news-website-error.log
```

### Backup
```bash
# Backup database
./scripts/backup.sh

# Restore from backup
./scripts/restore.sh backup-file.sql
```

### Health Checks
```bash
# Check server health
curl http://localhost:3000/api/health

# Check database connection
npm run check-db
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with Node.js and Express
- UI components inspired by modern design systems
- Automated news system for continuous updates
- Deployed and tested on production VPS

## 📞 Support

- Issues: GitHub Issues
- Documentation: `/docs` directory
- Live Demo: http://hiimage.online

## 🗄️ Database Setup

### Quick Setup
```bash
# Run the setup script
chmod +x setup-database.sh
./setup-database.sh

# Or manually
sqlite3 database.db < database-schema.sql
```

### Sample Data
The setup script includes:
- Admin user: `admin@example.com` / `admin123`
- Sample categories: Technology, Business, Politics, Sports, Entertainment
- Sample articles with content

### Manual Setup
```sql
-- Create database
sqlite3 database.db < database-schema.sql

-- Add admin user (password: admin123)
INSERT INTO users (username, email, password_hash, is_admin) 
VALUES ('admin', 'admin@example.com', 'scrypt:32768:8:1$Klg8T7Zz$d9b5b...', 1);
```

## 🔄 Updates and Maintenance

### Automated News Updates
The system includes a professional news updater that can:
- Monitor RSS feeds for new content
- Automatically create and publish articles
- Add images and optimize content
- Categorize and tag articles

```bash
cd news-updater
python3 professional-updater-fixed.py
```

### Backup and Restore
```bash
# Backup database
sqlite3 database.db .dump > backup-$(date +%Y%m%d).sql

# Restore from backup
sqlite3 database.db < backup-file.sql
```

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use**
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

2. **Database connection error**
```bash
# Recreate database
rm database.db
./setup-database.sh
```

3. **Missing dependencies**
```bash
# Reinstall all dependencies
rm -rf node_modules
npm install
```

### Logs
```bash
# View application logs
npm run logs

# View error logs
tail -f error.log
```

## 📈 Performance

### Optimization Tips
1. **Enable caching** in Nginx configuration
2. **Use CDN** for static assets
3. **Implement database indexing** for frequent queries
4. **Enable compression** for HTTP responses
5. **Use Redis** for session storage in production

### Monitoring
```bash
# Check server status
curl http://localhost:3000/api/health

# Monitor memory usage
pm2 monit

# View real-time logs
pm2 logs news-website
```

## 🎯 Deployment Checklist

- [ ] Update `.env` with production values
- [ ] Set up SSL certificate (Let's Encrypt)
- [ ] Configure firewall (UFW)
- [ ] Set up backup system
- [ ] Configure monitoring (PM2, Logrotate)
- [ ] Test all API endpoints
- [ ] Verify mobile responsiveness
- [ ] Test admin panel functionality
- [ ] Set up automated deployments

## 📞 Support & Community

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Complete docs in `/docs` directory
- **Live Support**: Contact via admin panel
- **Community Forum**: Coming soon

## 🏆 Credits

- **Frontend Design**: Modern CSS with component-based architecture
- **Backend Architecture**: Node.js/Express with RESTful API design
- **Database Design**: SQLite with efficient schema
- **Automation System**: Python-based news aggregation
- **Deployment**: Nginx, PM2, systemd integration

## 📊 Statistics

- **Lines of Code**: ~28,000
- **Files**: 74
- **Dependencies**: 45 npm packages
- **Database Tables**: 8
- **API Endpoints**: 15
- **UI Components**: 25+

## 🔮 Roadmap

### Planned Features
- [ ] User profiles with avatars
- [ ] Newsletter subscription system
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Social media integration
- [ ] Multi-language support
- [ ] Podcast integration
- [ ] Video content support

### Technical Improvements
- [ ] Migrate to PostgreSQL for production
- [ ] Implement GraphQL API
- [ ] Add Redis caching layer
- [ ] Docker containerization
- [ ] Kubernetes deployment
- [ ] CI/CD pipeline

---

**Enjoy building your news platform!** 🚀

*Last updated: February 25, 2026*
