#!/bin/bash
# Monitor Professional Journalism Updates

LOG_FILE="/var/log/news-professional.log"
DB_PATH="/var/www/news-site/database.db"

echo "📊 PROFESSIONAL JOURNALISM MONITOR"
echo "=================================="
echo "Last check: $(date)"
echo ""

# Check if updater is running
if pgrep -f "professional-updater-fixed.py" >/dev/null; then
    echo "✅ Updater is currently running"
else
    echo "⚪ Updater is not running"
fi

echo ""
echo "📈 RECENT ACTIVITY"
echo "------------------"

# Show last 10 log entries
if [ -f "$LOG_FILE" ]; then
    echo "Last update log entries:"
    tail -10 "$LOG_FILE" | grep -E "(SUCCESS|ERROR|INFO.*Processing)" | tail -5 | while read line; do
        echo "  $line"
    done
else
    echo "No log file found"
fi

echo ""
echo "📊 CONTENT STATISTICS"
echo "---------------------"

# Get database stats
if [ -f "$DB_PATH" ]; then
    sqlite3 "$DB_PATH" << 'SQL'
SELECT 
    COUNT(*) as total_posts,
    SUM(CASE WHEN featured_image IS NOT NULL AND featured_image != '' THEN 1 ELSE 0 END) as posts_with_images,
    AVG(LENGTH(content)) as avg_content_length,
    AVG(view_count) as avg_views
FROM posts 
WHERE status = 'published';
SQL
else
    echo "Database not found"
fi

echo ""
echo "🎯 QUALITY METRICS"
echo "------------------"

# Check recent post quality
if [ -f "$DB_PATH" ]; then
    echo "Recent professional posts:"
    sqlite3 "$DB_PATH" "SELECT title, LENGTH(content) as chars, view_count FROM posts WHERE status = 'published' ORDER BY published_at DESC LIMIT 3;" | while read line; do
        IFS='|' read -r title chars views <<< "$line"
        echo "  • ${title:0:40}... (${chars} chars, ${views} views)"
    done
fi

echo ""
echo "🔧 SYSTEM STATUS"
echo "----------------"

# Check website
if curl -s -f --max-time 5 "http://localhost:3001/api/health" >/dev/null 2>&1; then
    echo "✅ Website API is healthy"
else
    echo "❌ Website API is not responding"
fi

# Check Nginx
if systemctl is-active nginx >/dev/null; then
    echo "✅ Nginx is running"
else
    echo "❌ Nginx is not running"
fi

echo ""
echo "⏰ NEXT UPDATE"
echo "--------------"
# Calculate next run time
current_hour=$(date +%H)
next_hour=$(( (current_hour + 2) % 24 ))
if [ $next_hour -lt 10 ]; then
    next_hour="0$next_hour"
fi
echo "Next update scheduled at: ${next_hour}:00"

echo ""
echo "=================================="
