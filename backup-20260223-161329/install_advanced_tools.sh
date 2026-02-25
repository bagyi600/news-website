#!/bin/bash
# ============================================
# INSTALL ALL VPS TOOLS - COMPREHENSIVE SCRIPT
# ============================================
# This script installs ALL VPS tools in categories
# Run with: sudo bash install_all_vps_tools.sh
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (use sudo)"
    exit 1
fi

# Update system first
log "Updating package lists..."
apt update -y

# ============================================
# CATEGORY 1: SECURITY & HARDENING
# ============================================
log "Installing Security & Hardening tools..."
SECURITY_TOOLS=(
    fail2ban          # Intrusion prevention
    clamav            # Antivirus
    clamav-daemon     # Antivirus daemon
    lynis             # Security auditing
    rkhunter          # Rootkit detection
    aide              # File integrity monitoring
    ufw               # Firewall (if not installed)
)

for tool in "${SECURITY_TOOLS[@]}"; do
    if ! dpkg -l | grep -q "^ii  $tool "; then
        apt install -y "$tool" 2>/dev/null && success "Installed $tool" || warning "Failed to install $tool"
    else
        success "$tool already installed"
    fi
done

# ============================================
# CATEGORY 2: MONITORING & PERFORMANCE
# ============================================
log "Installing Monitoring & Performance tools..."
MONITORING_TOOLS=(
    htop              # Process viewer
    iotop             # I/O monitoring
    nethogs           # Network traffic per process
    glances           # Cross-platform monitoring
    ncdu              # Disk usage analyzer
    iftop             # Network bandwidth monitoring
    dstat             # System resource statistics
    sysstat           # System performance tools
)

for tool in "${MONITORING_TOOLS[@]}"; do
    if ! dpkg -l | grep -q "^ii  $tool "; then
        apt install -y "$tool" 2>/dev/null && success "Installed $tool" || warning "Failed to install $tool"
    else
        success "$tool already installed"
    fi
done

# ============================================
# CATEGORY 3: NETWORK & CONNECTIVITY
# ============================================
log "Installing Network & Connectivity tools..."
NETWORK_TOOLS=(
    nmap              # Network discovery
    iperf3            # Network performance testing
    mtr               # Network diagnostic
    tcpdump           # Packet analyzer
    ngrep             # Network grep
    netcat            # Networking utility
    traceroute        # Route tracing
    whois             # Domain information
    dnsutils          # DNS utilities (dig, nslookup)
)

for tool in "${NETWORK_TOOLS[@]}"; do
    if ! dpkg -l | grep -q "^ii  $tool "; then
        apt install -y "$tool" 2>/dev/null && success "Installed $tool" || warning "Failed to install $tool"
    else
        success "$tool already installed"
    fi
done

# ============================================
# CATEGORY 4: STORAGE & FILE MANAGEMENT
# ============================================
log "Installing Storage & File Management tools..."
STORAGE_TOOLS=(
    rsync             # Advanced file sync
    mc                # Midnight Commander file manager
    tree              # Directory listing
    fdupes            # Find duplicate files
    pv                # Pipe viewer (progress bar)
    lsof              # List open files
    inotify-tools     # File system monitoring
)

for tool in "${STORAGE_TOOLS[@]}"; do
    if ! dpkg -l | grep -q "^ii  $tool "; then
        apt install -y "$tool" 2>/dev/null && success "Installed $tool" || warning "Failed to install $tool"
    else
        success "$tool already installed"
    fi
done

# ============================================
# CATEGORY 5: DEVELOPMENT & DEBUGGING
# ============================================
log "Installing Development & Debugging tools..."
DEV_TOOLS=(
    strace            # System call tracer
    ltrace            # Library call tracer
    gdb               # GNU debugger
    valgrind          # Memory debugger
    jq                # JSON processor
    xmlstarlet        # XML processor
    python3-pip       # Python package manager
    build-essential   # Build tools (gcc, make, etc.)
)

for tool in "${DEV_TOOLS[@]}"; do
    if ! dpkg -l | grep -q "^ii  $tool "; then
        apt install -y "$tool" 2>/dev/null && success "Installed $tool" || warning "Failed to install $tool"
    else
        success "$tool already installed"
    fi
done

# ============================================
# CATEGORY 6: LOG MANAGEMENT
# ============================================
log "Installing Log Management tools..."
LOG_TOOLS=(
    logwatch          # Log analyzer
    goaccess          # Web log analyzer
    multitail         # Multiple log viewer
    lnav              # Log file navigator
)

for tool in "${LOG_TOOLS[@]}"; do
    if ! dpkg -l | grep -q "^ii  $tool "; then
        apt install -y "$tool" 2>/dev/null && success "Installed $tool" || warning "Failed to install $tool"
    else
        success "$tool already installed"
    fi
done

# ============================================
# CATEGORY 7: AUTOMATION & SCRIPTING
# ============================================
log "Installing Automation & Scripting tools..."
AUTOMATION_TOOLS=(
    expect            # Automated interactive sessions
    parallel          # Parallel execution
    tmux              # Terminal multiplexer
    screen            # Alternative multiplexer
    byobu             # Enhanced terminal
    ansible           # Configuration management
    python3-paramiko  # SSH library for Python
)

for tool in "${AUTOMATION_TOOLS[@]}"; do
    if ! dpkg -l | grep -q "^ii  $tool "; then
        apt install -y "$tool" 2>/dev/null && success "Installed $tool" || warning "Failed to install $tool"
    else
        success "$tool already installed"
    fi
done

# ============================================
# CATEGORY 8: TERMINAL ENHANCEMENTS
# ============================================
log "Installing Terminal Enhancement tools..."
TERMINAL_TOOLS=(
    zsh               # Z shell
    fzf               # Fuzzy finder
    bat               # Better cat
    exa               # Modern ls replacement
    ripgrep           # Faster grep
    fd-find           # Faster find
    tldr              # Simplified man pages
    bash-completion   # Bash completion
)

for tool in "${TERMINAL_TOOLS[@]}"; do
    if ! dpkg -l | grep -q "^ii  $tool "; then
        apt install -y "$tool" 2>/dev/null && success "Installed $tool" || warning "Failed to install $tool"
    else
        success "$tool already installed"
    fi
done

# ============================================
# CATEGORY 9: WEB & API TOOLS
# ============================================
log "Installing Web & API tools..."
WEB_TOOLS=(
    httpie            # Modern HTTP client
    siege             # HTTP load testing
    curl              # Already installed, ensure latest
    wget              # Advanced downloading
    python3-requests  # Python HTTP library
    jmeter            # Performance testing (optional)
)

for tool in "${WEB_TOOLS[@]}"; do
    if ! dpkg -l | grep -q "^ii  $tool "; then
        apt install -y "$tool" 2>/dev/null && success "Installed $tool" || warning "Failed to install $tool"
    else
        success "$tool already installed"
    fi
done

# ============================================
# CATEGORY 10: MISCELLANEOUS UTILITIES
# ============================================
log "Installing Miscellaneous utilities..."
MISC_TOOLS=(
    unzip             # Archive extraction
    p7zip-full        # 7zip support
    rar               # RAR archive support
    unrar             # RAR extraction
    at                # Job scheduling
    cron              # Scheduled tasks
    mailutils         # Email utilities
    mutt              # Email client
    neofetch          # System information
    figlet            # ASCII art banners
    cowsay            # Talking cow
    fortune           # Fortune cookies
    lolcat            # Rainbow output
)

for tool in "${MISC_TOOLS[@]}"; do
    if ! dpkg -l | grep -q "^ii  $tool "; then
        apt install -y "$tool" 2>/dev/null && success "Installed $tool" || warning "Failed to install $tool"
    else
        success "$tool already installed"
    fi
done

# ============================================
# POST-INSTALLATION CONFIGURATION
# ============================================
log "Configuring installed tools..."

# Configure fail2ban
if [ -f /etc/fail2ban/jail.local ]; then
    log "Fail2ban already configured"
else
    cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
    systemctl enable fail2ban
    systemctl start fail2ban
    success "Fail2ban configured and started"
fi

# Update ClamAV definitions
if command -v freshclam &> /dev/null; then
    freshclam --quiet && success "ClamAV definitions updated"
fi

# Configure UFW if installed
if command -v ufw &> /dev/null; then
    ufw --force enable
    ufw allow ssh
    ufw allow http
    ufw allow https
    success "UFW firewall configured"
fi

# Create useful aliases
log "Creating useful aliases..."
cat >> /etc/profile.d/custom_aliases.sh << 'EOF'
# Custom Aliases for VPS Tools
alias syscheck='echo "=== System Check ==="; uptime; echo ""; free -h; echo ""; df -h; echo ""; top -bn1 | head -20'
alias logs='sudo multitail /var/log/syslog /var/log/auth.log'
alias netmon='sudo nethogs eth0'
alias iomon='sudo iotop -o'
alias psgrep='ps aux | grep -v grep | grep -i'
alias ports='sudo netstat -tulpn'
alias disks='lsblk -o NAME,SIZE,TYPE,MOUNTPOINT,FSTYPE'
alias weather='curl wttr.in'
alias myip='curl ifconfig.me'
alias update='sudo apt update && sudo apt upgrade -y'
alias clean='sudo apt autoremove -y && sudo apt autoclean'
alias size='du -sh * | sort -h'
alias findbig='find . -type f -exec du -h {} + | sort -rh | head -20'
EOF

success "Aliases created in /etc/profile.d/custom_aliases.sh"

# Create utility scripts directory
log "Creating utility scripts directory..."
mkdir -p /usr/local/bin/utils

# Create system health script
cat > /usr/local/bin/utils/system-health.sh << 'EOF'
#!/bin/bash
echo "========================================="
echo "SYSTEM HEALTH CHECK - $(date)"
echo "========================================="
echo ""
echo "1. SYSTEM UPTIME & LOAD:"
uptime
echo ""
echo "2. MEMORY USAGE:"
free -h
echo ""
echo "3. DISK USAGE:"
df -h
echo ""
echo "4. TOP PROCESSES (CPU):"
ps aux --sort=-%cpu | head -10
echo ""
echo "5. TOP PROCESSES (MEMORY):"
ps aux --sort=-%mem | head -10
echo ""
echo "6. NETWORK CONNECTIONS:"
ss -tulpn | head -20
echo ""
echo "7. LOGGED IN USERS:"
who
echo ""
echo "8. RECENT LOGINS:"
last -n 5
echo ""
echo "9. SERVICE STATUS:"
systemctl list-units --type=service --state=failed
echo ""
echo "========================================="
EOF
chmod +x /usr/local/bin/utils/system-health.sh

# Create backup script
cat > /usr/local/bin/utils/backup-system.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backup"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

mkdir -p "$BACKUP_DIR"

echo "Starting system backup..."
echo "Backup directory: $BACKUP_DIR"
echo "Date: $DATE"

# Backup important directories
tar -czf "$BACKUP_DIR/system-backup-$DATE.tar.gz" \
    /etc \
    /home \
    /var/www \
    /usr/local/bin \
    2>/dev/null

# Clean old backups
find "$BACKUP_DIR" -name "system-backup-*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: system-backup-$DATE.tar.gz"
echo "Size: $(du -h "$BACKUP_DIR/system-backup-$DATE.tar.gz" | cut -f1)"
EOF
chmod +x /usr/local/bin/utils/backup-system.sh

# Create log monitor script
cat > /usr/local/bin/utils/log-monitor.sh << 'EOF'
#!/bin/bash
LOG_FILES=(
    "/var/log/syslog"
    "/var/log/auth.log"
    "/var/log/nginx/error.log"
    "/var/log/mysql/error.log"
)

KEYWORDS=("ERROR" "CRITICAL" "FAILED" "panic" "segmentation fault")

echo "Monitoring logs for errors..."
echo "Press Ctrl+C to stop"
echo ""

for log_file in "${LOG_FILES[@]}"; do
    if [ -f "$log_file" ]; then
        echo "=== Monitoring: $log_file ==="
        tail -f "$log_file" | while read line; do
            for keyword in "${KEYWORDS[@]}"; do
                if echo "$line" | grep -qi "$keyword"; then
                    echo "[$(date '+%H:%M:%S')] $log_file: $line"
                fi
            done
        done &
    fi
done

# Wait for Ctrl+C
wait
EOF
chmod +x /usr/local/bin/utils/log-monitor.sh

success "Utility scripts created in /usr/local/bin/utils/"

# ============================================
# INSTALLATION SUMMARY
# ============================================
log "Generating installation summary..."

echo ""
echo "==========================================="
echo "VPS TOOLS INSTALLATION COMPLETE!"
echo "==========================================="
echo ""
echo "📦 INSTALLED CATEGORIES:"
echo "  1. Security & Hardening"
echo "  2. Monitoring & Performance"
echo "  3. Network & Connectivity"
echo "  4. Storage & File Management"
echo "  5. Development & Debugging"
echo "  6. Log Management"
echo "  7. Automation & Scripting"
echo "  8. Terminal Enhancements"
echo "  9. Web & API Tools"
echo "  10. Miscellaneous Utilities"
echo ""
echo "🔧 CONFIGURED:"
echo "  • Fail2ban (intrusion prevention)"
echo "  • UFW firewall (basic rules)"
echo "  • ClamAV (updated definitions)"
echo "  • Custom aliases (/etc/profile.d/)"
echo "  • Utility scripts (/usr/local/bin/utils/)"
echo ""
echo "🚀 QUICK COMMANDS:"
echo "  • system-health.sh - Comprehensive system check"
echo "  • backup-system.sh - System backup"
echo "  • log-monitor.sh - Real-time log monitoring"
echo "  • syscheck - Quick system status (alias)"
echo "  • netmon - Network monitoring (alias)"
echo ""
echo "📚 NEXT STEPS:"
echo "  1. Log out and back in for aliases to take effect"
echo "  2. Review /etc/fail2ban/jail.local for customization"
echo "  3. Configure UFW rules for your specific services"
echo "  4. Set up automated backups with cron"
echo "  5. Explore the new tools with 'man <toolname>'"
echo ""
echo "💡 TIPS:"
echo "  • Use 'htop' for process management"
echo "  • Use 'ncdu' for disk space analysis"
echo "  • Use 'glances' for system monitoring"
echo "  • Use 'tmux' for terminal sessions"
echo "  • Use 'fzf' for fuzzy file finding"
echo ""
echo "==========================================="
echo "Your VPS is now equipped with professional tools!"
echo "==========================================="

# Create a readme file
cat > /usr/local/share/vps-tools-README.md << 'EOF'
# VPS TOOLS INSTALLATION GUIDE

## Overview
This installation includes comprehensive tools for VPS management, security, monitoring, and automation.

## Key Tools Installed

### Security
- fail2ban: Intrusion prevention system
- clamav: Antivirus scanner
- lynis: Security auditing tool
- rkhunter: Rootkit detection
- aide: File