#!/bin/bash

# News Monitor and Dashboard
# Provides status and statistics for the automated news system

DB_PATH="/var/www/news-site/database.db"
LOG_FILE="/var/log/news-updater.log"
MONITOR_FILE="/tmp/news-monitor-status.txt"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Function to check system status
check_system_status() {
    echo "="*70
    echo "📊 NEWS SYSTEM MONITOR - $(date)"
    echo "="*70
    echo ""
    
    # Check database
    print_status "Checking database..."
    if [ -f "$DB_PATH" ]; then
        print_success "Database file exists"
        
        # Check database connection
        if sqlite3 "$DB_PATH" "SELECT 1;" >/dev/null 2>&1; then
            print_success "Database is accessible"
        else
            print_error "Cannot access database"
        fi
    else
        print_error "Database file not found"
    fi
    echo ""
    
    # Check total posts
    print_status "Checking posts..."
    TOTAL_POSTS=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM posts;" 2>/dev/null || echo "0")
    PUBLISHED_POSTS=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM posts WHERE status = 'published';" 2>/dev/null || echo "0")
    TODAY_POSTS=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM posts WHERE date(published_at) = date('now');" 2>/dev/null || echo "0")
    
    print_success "Total posts: $TOTAL_POSTS"
    print_success "Published posts: $PUBLISHED_POSTS"
    print_success "Posts today: $TODAY_POSTS"
    echo ""
    
    # Check latest posts
    print_status "Latest posts:"
    sqlite3 "$DB_PATH" "SELECT id, title, source_name, strftime('%H:%M', published_at) as time FROM posts ORDER BY id DESC LIMIT 5;" 2>/dev/null | while IFS='|' read -r id title source time; do
        echo "  #$id: ${title:0:50}... ($source @ $time)"
    done
    echo ""
    
    # Check categories distribution
    print_status "Posts by category:"
    sqlite3 "$DB_PATH" "SELECT c.name, COUNT(p.id) as count FROM categories c LEFT JOIN posts p ON c.id = p.category_id GROUP BY c.id ORDER BY count DESC LIMIT 5;" 2>/dev/null | while IFS='|' read -r category count; do
        echo "  $category: $count posts"
    done
    echo ""
    
    # Check cron job
    print_status "Checking cron job..."
    if crontab -l | grep -q "improved-updater.py"; then
        print_success "Cron job is configured"
        CRON_TIME=$(crontab -l | grep "improved-updater.py" | awk '{print $1}')
        echo "  Schedule: $CRON_TIME (every 15 minutes)"
    else
        print_error "Cron job not found"
    fi
    echo ""
    
    # Check log file
    print_status "Checking update logs..."
    if [ -f "$LOG_FILE" ]; then
        print_success "Log file exists"
        LAST_UPDATE=$(tail -5 "$LOG_FILE" | grep "UPDATE COMPLETED" | tail -1 | cut -d' ' -f2- || echo "Never")
        echo "  Last update: $LAST_UPDATE"
        
        # Check for errors in last run
        ERROR_COUNT=$(tail -20 "$LOG_FILE" | grep -i "error\|failed" | wc -l)
        if [ "$ERROR_COUNT" -gt 0 ]; then
            print_warning "Found $ERROR_COUNT error(s) in recent logs"
        else
            print_success "No recent errors found"
        fi
    else
        print_warning "Log file not found"
    fi
    echo ""
    
    # Check website accessibility
    print_status "Checking website..."
    if curl -s -f "http://localhost:3001/api/health" >/dev/null 2>&1; then
        print_success "Website API is accessible"
        
        # Get health status
        HEALTH=$(curl -s "http://localhost:3001/api/health" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('status', 'unknown'))" 2>/dev/null || echo "unknown")
        echo "  API status: $HEALTH"
        
        # Check public access
        PUBLIC_ACCESS=$(curl -s "http://localhost:3001/api/health" | python3 -c "import sys, json; data=json.load(sys.stdin); print('Yes' if data.get('public_access', False) else 'No')" 2>/dev/null || echo "unknown")
        echo "  Public access: $PUBLIC_ACCESS"
    else
        print_error "Website API is not accessible"
    fi
    echo ""
    
    # Check next scheduled update
    print_status "Next scheduled update:"
    NEXT_UPDATE=$(python3 -c "
from datetime import datetime, timedelta
now = datetime.now()
minute = now.minute
next_minute = ((minute // 15) + 1) * 15
if next_minute >= 60:
    next_minute = 0
    now = now + timedelta(hours=1)
next_time = now.replace(minute=next_minute, second=0, microsecond=0)
print(next_time.strftime('%H:%M'))
")
    echo "  Scheduled for: $NEXT_UPDATE"
    echo ""
    
    # System resources
    print_status "System resources:"
    MEMORY_USAGE=$(free -m | awk 'NR==2{printf "%.1f%%", $3*100/$2}')
    CPU_LOAD=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}')
    DISK_USAGE=$(df -h / | awk 'NR==2{print $5}')
    
    echo "  Memory usage: $MEMORY_USAGE"
    echo "  CPU load: $CPU_LOAD"
    echo "  Disk usage: $DISK_USAGE"
    echo ""
    
    # Recommendations
    print_status "Recommendations:"
    
    if [ "$TODAY_POSTS" -eq 0 ]; then
        print_warning "  No posts added today. Check news sources."
    fi
    
    if [ "$PUBLISHED_POSTS" -lt 5 ]; then
        print_warning "  Low number of published posts. Consider adding more sources."
    fi
    
    if [ ! -f "$LOG_FILE" ] || [ -z "$LAST_UPDATE" ] || [ "$LAST_UPDATE" = "Never" ]; then
        print_warning "  No recent updates detected. Check cron job."
    fi
    
    print_success "  System is operational"
    echo ""
    
    echo "="*70
    echo "🌐 Website: http://72.61.210.61/"
    echo "📰 Public access: No login required"
    echo "🔄 Auto-update: Every 15 minutes"
    echo "="*70
}

# Function to force manual update
force_update() {
    echo "="*70
    echo "🔄 FORCING MANUAL NEWS UPDATE"
    echo "="*70
    echo ""
    
    print_status "Running news updater..."
    cd /var/www/news-site/news-updater && python3 improved-updater.py
    
    echo ""
    echo "="*70
    echo "✅ UPDATE COMPLETE"
    echo "="*70
}

# Function to show help
show_help() {
    echo "News System Monitor - Usage:"
    echo "  $0 status    - Show system status (default)"
    echo "  $0 update    - Force manual update"
    echo "  $0 logs      - Show recent logs"
    echo "  $0 stats     - Show statistics"
    echo "  $0 help      - Show this help"
}

# Function to show logs
show_logs() {
    echo "="*70
    echo "📋 RECENT UPDATE LOGS"
    echo "="*70
    echo ""
    
    if [ -f "$LOG_FILE" ]; then
        tail -30 "$LOG_FILE"
    else
        print_error "Log file not found: $LOG_FILE"
    fi
}

# Function to show statistics
show_stats() {
    echo "="*70
    echo "📈 NEWS SYSTEM STATISTICS"
    echo "="*70
    echo ""
    
    if [ ! -f "$DB_PATH" ]; then
        print_error "Database not found"
        return
    fi
    
    # Overall statistics
    print_status "Overall Statistics:"
    TOTAL_POSTS=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM posts;")
    TOTAL_CATEGORIES=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM categories;")
    TOTAL_USERS=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM users;")
    
    echo "  Total posts: $TOTAL_POSTS"
    echo "  Total categories: $TOTAL_CATEGORIES"
    echo "  Total users: $TOTAL_USERS"
    echo ""
    
    # Posts by source
    print_status "Posts by News Source:"
    sqlite3 "$DB_PATH" "SELECT source_name, COUNT(*) as count FROM posts WHERE source_name != '' GROUP BY source_name ORDER BY count DESC;" | while IFS='|' read -r source count; do
        echo "  $source: $count posts"
    done
    echo ""
    
    # Posts by day (last 7 days)
    print_status "Posts Added (Last 7 Days):"
    sqlite3 "$DB_PATH" "SELECT date(published_at) as day, COUNT(*) as count FROM posts WHERE published_at >= date('now', '-7 days') GROUP BY day ORDER BY day DESC;" | while IFS='|' read -r day count; do
        echo "  $day: $count posts"
    done
    echo ""
    
    # Most viewed posts
    print_status "Top 5 Most Viewed Posts:"
    sqlite3 "$DB_PATH" "SELECT title, view_count FROM posts ORDER BY view_count DESC LIMIT 5;" | while IFS='|' read -r title views; do
        echo "  ${title:0:40}... - $views views"
    done
    echo ""
    
    # Update frequency
    print_status "Update Performance:"
    if [ -f "$LOG_FILE" ]; then
        TOTAL_UPDATES=$(grep -c "UPDATE COMPLETED" "$LOG_FILE" 2>/dev/null || echo "0")
        SUCCESSFUL_UPDATES=$(grep -c "UPDATE COMPLETED: [1-9]" "$LOG_FILE" 2>/dev/null || echo "0")
        
        if [ "$TOTAL_UPDATES" -gt 0 ]; then
            SUCCESS_RATE=$((SUCCESSFUL_UPDATES * 100 / TOTAL_UPDATES))
            echo "  Total updates: $TOTAL_UPDATES"
            echo "  Successful updates: $SUCCESSFUL_UPDATES"
            echo "  Success rate: $SUCCESS_RATE%"
        else
            echo "  No update history available"
        fi
    else
        echo "  No log file available"
    fi
    echo ""
    
    echo "="*70
}

# Main execution
case "${1:-status}" in
    "status")
        check_system_status
        ;;
    "update")
        force_update
        ;;
    "logs")
        show_logs
        ;;
    "stats")
        show_stats
        ;;
    "help")
        show_help
        ;;
    *)
        check_system_status
        ;;
esac