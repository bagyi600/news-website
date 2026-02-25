/* ============================================
   ENHANCED FEATURES - NewsHub
   Advanced features and utilities
   ============================================ */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('✨ Enhanced features loaded');
    
    // Initialize advanced features
    initBackToTop();
    initViewToggle();
    initNewsletter();
    initNotifications();
    initPerformanceMonitor();
    initOfflineSupport();
    initShareFeatures();
    initReadingProgress();
    initContentFilters();
    initUserPreferences();
});

/* ==================== BACK TO TOP ==================== */
function initBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    if (!backToTopBtn) return;
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });
    
    // Smooth scroll to top
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // Focus on main content for accessibility
        document.getElementById('main-content').focus();
    });
    
    // Keyboard support
    backToTopBtn.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.click();
        }
    });
}

/* ==================== VIEW TOGGLE ==================== */
function initViewToggle() {
    const viewBtns = document.querySelectorAll('.view-btn');
    const postsContainer = document.getElementById('posts-container');
    
    if (!viewBtns.length || !postsContainer) return;
    
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.dataset.view;
            
            // Update active state
            viewBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update view
            postsContainer.setAttribute('data-view', view);
            
            // Save preference
            localStorage.setItem('preferred-view', view);
            
            // Show feedback
            showToast(`Switched to ${view} view`, 'info');
        });
    });
    
    // Load saved preference
    const savedView = localStorage.getItem('preferred-view') || 'grid';
    const savedBtn = document.querySelector(`.view-btn[data-view="${savedView}"]`);
    if (savedBtn) {
        savedBtn.click();
    }
}

/* ==================== NEWSLETTER ==================== */
function initNewsletter() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (!newsletterForm) return;
    
    newsletterForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const emailInput = this.querySelector('input[type="email"]');
        const submitBtn = this.querySelector('button[type="submit"]');
        const email = emailInput.value.trim();
        
        if (!isValidEmail(email)) {
            showToast('Please enter a valid email address', 'error');
            emailInput.focus();
            return;
        }
        
        // Show loading state
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
        submitBtn.disabled = true;
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Success
            showToast('Successfully subscribed to newsletter!', 'success');
            emailInput.value = '';
            
            // Save subscription
            localStorage.setItem('newsletter-subscribed', 'true');
            
            // Update UI
            const subscribeBtn = document.getElementById('subscribe-btn');
            if (subscribeBtn) {
                subscribeBtn.innerHTML = '<i class="fas fa-bell-slash"></i> Unsubscribe';
                subscribeBtn.onclick = () => unsubscribeFromNewsletter();
            }
            
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            showToast('Failed to subscribe. Please try again.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
    
    // Check existing subscription
    if (localStorage.getItem('newsletter-subscribed') === 'true') {
        const subscribeBtn = document.getElementById('subscribe-btn');
        if (subscribeBtn) {
            subscribeBtn.innerHTML = '<i class="fas fa-bell-slash"></i> Unsubscribe';
            subscribeBtn.onclick = () => unsubscribeFromNewsletter();
        }
    }
}

function unsubscribeFromNewsletter() {
    if (confirm('Are you sure you want to unsubscribe from the newsletter?')) {
        localStorage.removeItem('newsletter-subscribed');
        showToast('Successfully unsubscribed', 'info');
        
        const subscribeBtn = document.getElementById('subscribe-btn');
        if (subscribeBtn) {
            subscribeBtn.innerHTML = '<i class="fas fa-bell"></i> Get Notifications';
            subscribeBtn.onclick = null;
        }
    }
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/* ==================== NOTIFICATIONS ==================== */
function initNotifications() {
    const subscribeBtn = document.getElementById('subscribe-btn');
    if (!subscribeBtn) return;
    
    // Check Notification API support
    if (!('Notification' in window)) {
        subscribeBtn.style.display = 'none';
        return;
    }
    
    // Check current permission
    if (Notification.permission === 'granted') {
        updateNotificationButton(true);
    } else if (Notification.permission === 'denied') {
        updateNotificationButton(false);
        subscribeBtn.disabled = true;
        subscribeBtn.title = 'Notifications blocked by browser';
    }
    
    // Request permission on click
    subscribeBtn.addEventListener('click', async function() {
        if (Notification.permission === 'granted') {
            // Already subscribed, show unsubscribe option
            if (confirm('Disable browser notifications?')) {
                updateNotificationButton(false);
                showToast('Notifications disabled', 'info');
            }
        } else if (Notification.permission === 'default') {
            // Request permission
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                updateNotificationButton(true);
                showToast('Notifications enabled!', 'success');
                sendWelcomeNotification();
            } else {
                updateNotificationButton(false);
                showToast('Notifications blocked', 'error');
            }
        }
    });
}

function updateNotificationButton(isSubscribed) {
    const btn = document.getElementById('subscribe-btn');
    if (!btn) return;
    
    if (isSubscribed) {
        btn.innerHTML = '<i class="fas fa-bell-slash"></i> Disable Notifications';
        btn.classList.remove('btn-ghost');
        btn.classList.add('btn-success');
    } else {
        btn.innerHTML = '<i class="fas fa-bell"></i> Get Notifications';
        btn.classList.remove('btn-success');
        btn.classList.add('btn-ghost');
    }
}

function sendWelcomeNotification() {
    if (Notification.permission === 'granted') {
        const notification = new Notification('Welcome to NewsHub!', {
            body: 'You will now receive breaking news notifications.',
            icon: '/images/logo.png',
            badge: '/images/badge.png',
            tag: 'welcome'
        });
        
        notification.onclick = function() {
            window.focus();
            this.close();
        };
    }
}

/* ==================== PERFORMANCE MONITOR ==================== */
function initPerformanceMonitor() {
    // Only run in development or for admins
    if (!localStorage.getItem('debug-mode')) return;
    
    // Monitor performance metrics
    const perfData = {
        loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
        domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
        pageSize: performance.getEntriesByType('resource').reduce((acc, resource) => acc + resource.transferSize, 0)
    };
    
    // Log performance data
    console.group('📊 Performance Metrics');
    console.log('Page Load Time:', perfData.loadTime, 'ms');
    console.log('DOM Ready:', perfData.domReady, 'ms');
    console.log('Total Page Size:', (perfData.pageSize / 1024).toFixed(2), 'KB');
    console.groupEnd();
    
    // Monitor memory usage (if supported)
    if (performance.memory) {
        console.log('Memory Usage:', {
            used: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
            total: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
            limit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB'
        });
    }
    
    // Monitor network requests
    const resources = performance.getEntriesByType('resource');
    const slowResources = resources.filter(r => r.duration > 1000);
    
    if (slowResources.length > 0) {
        console.warn('⚠️ Slow resources detected:', slowResources);
    }
}

/* ==================== OFFLINE SUPPORT ==================== */
function initOfflineSupport() {
    // Check online status
    function updateOnlineStatus() {
        const isOnline = navigator.onLine;
        document.body.classList.toggle('offline', !isOnline);
        
        if (!isOnline) {
            showToast('You are offline. Some features may be limited.', 'warning', 5000);
        } else {
            showToast('Back online!', 'success', 3000);
        }
    }
    
    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Initial check
    updateOnlineStatus();
    
    // Cache important resources
    if ('caches' in window) {
        // Pre-cache critical resources
        const criticalResources = [
            '/',
            '/css/main-enhanced.css',
            '/js/enhanced-interactions.js',
            '/images/logo.png',
            '/manifest.json'
        ];
        
        // Cache these resources on page load
        window.addEventListener('load', () => {
            caches.open('newshub-critical').then(cache => {
                return cache.addAll(criticalResources);
            }).catch(console.error);
        });
    }
}

/* ==================== SHARE FEATURES ==================== */
function initShareFeatures() {
    // Add share buttons to all posts
    const shareButtons = document.querySelectorAll('.share-btn');
    shareButtons.forEach(btn => {
        btn.addEventListener('click', async function() {
            const postId = this.dataset.postId;
            const postTitle = this.closest('.post-card').querySelector('.post-title')?.textContent || 'News Article';
            const postUrl = window.location.origin + '/post/' + postId;
            
            try {
                if (navigator.share) {
                    await navigator.share({
                        title: postTitle,
                        text: 'Check out this article on NewsHub',
                        url: postUrl
                    });
                } else {
                    // Fallback: copy to clipboard
                    await navigator.clipboard.writeText(`${postTitle} - ${postUrl}`);
                    showToast('Link copied to clipboard!', 'success');
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Share error:', error);
                    showToast('Failed to share', 'error');
                }
            }
        });
    });
    
    // Add social sharing buttons
    const socialShareContainer = document.createElement('div');
    socialShareContainer.className = 'social-share-container';
    socialShareContainer.innerHTML = `
        <button class="social-share-btn twitter" aria-label="Share on Twitter">
            <i class="fab fa-twitter"></i>
        </button>
        <button class="social-share-btn facebook" aria-label="Share on Facebook">
            <i class="fab fa-facebook"></i>
        </button>
        <button class="social-share-btn linkedin" aria-label="Share on LinkedIn">
            <i class="fab fa-linkedin"></i>
        </button>
        <button class="social-share-btn copy" aria-label="Copy link">
            <i class="fas fa-link"></i>
        </button>
    `;
    
    // Add to post cards
    document.querySelectorAll('.post-card').forEach(card => {
        const shareContainer = socialShareContainer.cloneNode(true);
        card.appendChild(shareContainer);
        
        // Add event listeners
        const twitterBtn = shareContainer.querySelector('.twitter');
        const facebookBtn = shareContainer.querySelector('.facebook');
        const linkedinBtn = shareContainer.querySelector('.linkedin');
        const copyBtn = shareContainer.querySelector('.copy');
        
        const postTitle = card.querySelector('.post-title')?.textContent || 'News Article';
        const postUrl = window.location.href;
        
        twitterBtn.addEventListener('click', () => {
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(postTitle)}&url=${encodeURIComponent(postUrl)}`, '_blank');
        });
        
        facebookBtn.addEventListener('click', () => {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`, '_blank');
        });
        
        linkedinBtn.addEventListener('click', () => {
            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`, '_blank');
        });
        
        copyBtn.addEventListener('click', async () => {
            await navigator.clipboard.writeText(postUrl);
            showToast('Link copied to clipboard!', 'success');
        });
    });
}

/* ==================== READING PROGRESS ==================== */
function initReadingProgress() {
    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, var(--color-primary-500), var(--color-secondary-500));
        z-index: var(--z-index-sticky);
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);
    
    // Update progress on scroll
    window.addEventListener('scroll', function() {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
    });
    
    // Add reading time estimates
    document.querySelectorAll('.post-card').forEach(card => {
        const content = card.querySelector('.post-excerpt')?.textContent || '';
        const words = content.split(/\s+/).length;
        const readingTime = Math.ceil(words / 200); // 200 words per minute
        
        if (readingTime > 0) {
            const timeBadge = document.createElement('span');
            timeBadge.className = 'reading-time';
            timeBadge.innerHTML = `<i class="fas fa-clock"></i> ${readingTime} min read`;
            card.querySelector('.post-meta')?.appendChild(timeBadge);
        }
    });
}

/* ==================== CONTENT FILTERS ==================== */
function initContentFilters() {
    const filterContainer = document.createElement('div');
    filterContainer.className = 'content-filters';
    filterContainer.innerHTML = `
        <div class="filter-group">
            <label for="sort-filter">Sort by:</label>
            <select id="sort-filter" class="form-control">
                <option value="latest">Latest</option>
                <option value="popular">Most Popular</option>
                <option value="trending">Trending</option>
                <option value="featured">Featured</option>
            </select>
        </div>
        <div class="filter-group">
            <label for="category-filter">Category:</label>
            <select id="category-filter" class="form-control">
                <option value="all">All Categories</option>
                <!-- Categories will be populated dynamically -->
            </select>
        </div>
        <div class="filter-group">
            <label for="time-filter">Time period:</label>
            <select id="time-filter" class="form-control">
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
            </select>
        </div>
    `;
    
    // Insert filters before posts container
    const postsSection = document.querySelector('.posts-section');
    if (postsSection) {
        postsSection.insertBefore(filterContainer, postsSection.querySelector('#posts-container'));
    }
    
    // Add event listeners
    const filters = ['sort-filter', 'category-filter', 'time-filter'];
    filters.forEach(filterId => {
        const filter = document.getElementById(filterId);
        if (filter) {
            filter.addEventListener('change', applyFilters);
        }
    });
    
    // Load categories for filter
    loadCategoriesForFilter();
}

async function loadCategoriesForFilter() {
    try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to load categories');
        
        const categories = await response.json();
        const filter = document.getElementById('category-filter');
        
        if (filter && categories.length > 0) {
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.slug;
                option.textContent = category.name;
                filter.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading categories for filter:', error);
    }
}

async function applyFilters() {
    const sort = document.getElementById('sort-filter')?.value || 'latest';
    const category = document.getElementById('category-filter')?.value || 'all';
    const time = document.getElementById('time-filter')?.value || 'all';
    
    // Show loading
    const postsContainer = document.getElementById('posts-container');
    if (postsContainer) {
        postsContainer.innerHTML = '<div class="loading">Applying filters...</div>';
    }
    
    try {
        //