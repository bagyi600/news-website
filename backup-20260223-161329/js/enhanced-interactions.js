/* ============================================
   ENHANCED INTERACTIONS - NewsHub
   Modern, smooth, accessible interactions
   ============================================ */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Enhanced NewsHub interactions loaded');
    
    // Initialize all enhanced features
    initEnhancedNavigation();
    initThemeSystem();
    initEnhancedSearch();
    initPostInteractions();
    initLoadingStates();
    initSmoothScrolling();
    initAccessibilityFeatures();
    initPerformanceOptimizations();
    initErrorHandling();
    initAnalytics();
});

/* ==================== ENHANCED NAVIGATION ==================== */
function initEnhancedNavigation() {
    console.log('🔧 Initializing enhanced navigation...');
    
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            mainNav.classList.toggle('show');
            
            // Toggle aria-expanded for accessibility
            const isExpanded = this.classList.contains('active');
            this.setAttribute('aria-expanded', isExpanded);
            mainNav.setAttribute('aria-hidden', !isExpanded);
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = isExpanded ? 'hidden' : '';
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (mainNav && mainNav.classList.contains('show') && 
            !mainNav.contains(event.target) && 
            !mobileMenuToggle.contains(event.target)) {
            mainNav.classList.remove('show');
            mobileMenuToggle.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            mainNav.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    });
    
    // Close mobile menu on escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && mainNav && mainNav.classList.contains('show')) {
            mainNav.classList.remove('show');
            mobileMenuToggle.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            mainNav.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    });
    
    // Add active state to current page in navigation
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === currentPath || 
            (currentPath.includes(linkPath) && linkPath !== '/')) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });
    
    // Add hover effects with delay for better UX
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        let hoverTimer;
        
        item.addEventListener('mouseenter', function() {
            clearTimeout(hoverTimer);
            this.classList.add('hover');
        });
        
        item.addEventListener('mouseleave', function() {
            hoverTimer = setTimeout(() => {
                this.classList.remove('hover');
            }, 300);
        });
    });
    
    // Keyboard navigation for dropdowns
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        if (toggle && menu) {
            toggle.addEventListener('keydown', function(event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    this.click();
                } else if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    const firstItem = menu.querySelector('a, button');
                    if (firstItem) firstItem.focus();
                }
            });
            
            // Trap focus within dropdown when open
            menu.addEventListener('keydown', function(event) {
                if (event.key === 'Escape') {
                    toggle.focus();
                    toggle.click();
                } else if (event.key === 'Tab') {
                    const focusableElements = menu.querySelectorAll('a, button, input, [tabindex]:not([tabindex="-1"])');
                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];
                    
                    if (event.shiftKey) {
                        if (document.activeElement === firstElement) {
                            event.preventDefault();
                            lastElement.focus();
                        }
                    } else {
                        if (document.activeElement === lastElement) {
                            event.preventDefault();
                            firstElement.focus();
                        }
                    }
                }
            });
        }
    });
}

/* ==================== THEME SYSTEM ==================== */
function initThemeSystem() {
    console.log('🎨 Initializing theme system...');
    
    const themeToggle = document.querySelector('.theme-toggle');
    const html = document.documentElement;
    
    // Get saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set initial theme
    const initialTheme = savedTheme === 'system' ? (prefersDark ? 'dark' : 'light') : savedTheme;
    setTheme(initialTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = html.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
            
            // Add animation class
            this.classList.add('theme-changing');
            setTimeout(() => this.classList.remove('theme-changing'), 300);
            
            // Show toast notification
            showToast(`Switched to ${newTheme} mode`, 'success');
        });
        
        // Update toggle icon based on theme
        updateThemeIcon(initialTheme);
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (localStorage.getItem('theme') === 'system') {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
    
    function setTheme(theme) {
        html.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        updateThemeIcon(theme);
        
        // Dispatch custom event for other components
        document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    }
    
    function updateThemeIcon(theme) {
        if (!themeToggle) return;
        
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        
        // Update aria-label for accessibility
        themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    }
}

/* ==================== ENHANCED SEARCH ==================== */
function initEnhancedSearch() {
    console.log('🔍 Initializing enhanced search...');
    
    const searchInput = document.querySelector('.search-input');
    const searchForm = document.querySelector('.search-form');
    const searchContainer = document.querySelector('.search-container');
    
    if (!searchInput || !searchForm) return;
    
    // Create suggestions container
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'search-suggestions';
    suggestionsContainer.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--color-surface-01);
        border: 1px solid var(--color-border-light);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-xl);
        margin-top: var(--space-2);
        max-height: 300px;
        overflow-y: auto;
        z-index: var(--z-index-dropdown);
        display: none;
    `;
    
    searchContainer.appendChild(suggestionsContainer);
    
    // Debounced search suggestions
    let debounceTimer;
    searchInput.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        const query = this.value.trim();
        
        if (query.length < 2) {
            suggestionsContainer.style.display = 'none';
            return;
        }
        
        debounceTimer = setTimeout(() => {
            fetchSearchSuggestions(query);
        }, 300);
    });
    
    // Show suggestions on focus
    searchInput.addEventListener('focus', function() {
        const query = this.value.trim();
        if (query.length >= 2) {
            fetchSearchSuggestions(query);
        }
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', function(event) {
        if (!searchContainer.contains(event.target)) {
            suggestionsContainer.style.display = 'none';
        }
    });
    
    // Keyboard navigation for suggestions
    searchInput.addEventListener('keydown', function(event) {
        const suggestions = suggestionsContainer.querySelectorAll('.suggestion-item');
        const activeSuggestion = suggestionsContainer.querySelector('.suggestion-item.active');
        
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (!activeSuggestion) {
                suggestions[0]?.classList.add('active');
            } else {
                const next = activeSuggestion.nextElementSibling;
                if (next) {
                    activeSuggestion.classList.remove('active');
                    next.classList.add('active');
                }
            }
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (activeSuggestion) {
                const prev = activeSuggestion.previousElementSibling;
                if (prev) {
                    activeSuggestion.classList.remove('active');
                    prev.classList.add('active');
                }
            }
        } else if (event.key === 'Enter' && activeSuggestion) {
            event.preventDefault();
            activeSuggestion.click();
        } else if (event.key === 'Escape') {
            suggestionsContainer.style.display = 'none';
        }
    });
    
    async function fetchSearchSuggestions(query) {
        try {
            // Show loading state
            suggestionsContainer.innerHTML = '<div class="suggestion-loading">Loading suggestions...</div>';
            suggestionsContainer.style.display = 'block';
            
            // Fetch suggestions from API
            const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Failed to fetch suggestions');
            
            const suggestions = await response.json();
            renderSuggestions(suggestions, query);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            suggestionsContainer.innerHTML = '<div class="suggestion-error">Failed to load suggestions</div>';
        }
    }
    
    function renderSuggestions(suggestions, query) {
        if (!suggestions || suggestions.length === 0) {
            suggestionsContainer.innerHTML = '<div class="suggestion-empty">No suggestions found</div>';
            return;
        }
        
        let html = '';
        suggestions.forEach((suggestion, index) => {
            html += `
                <div class="suggestion-item" data-index="${index}" tabindex="0">
                    <div class="suggestion-text">${highlightMatch(suggestion.text, query)}</div>
                    <div class="suggestion-type">${suggestion.type}</div>
                </div>
            `;
        });
        
        suggestionsContainer.innerHTML = html;
        
        // Add click handlers
        const suggestionItems = suggestionsContainer.querySelectorAll('.suggestion-item');
        suggestionItems.forEach(item => {
            item.addEventListener('click', function() {
                const text = this.querySelector('.suggestion-text').textContent;
                searchInput.value = text;
                suggestionsContainer.style.display = 'none';
                searchForm.submit();
            });
            
            item.addEventListener('mouseenter', function() {
                suggestionItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }
    
    function highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
    
    // Enhanced form submission
    searchForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const query = searchInput.value.trim();
        
        if (!query) {
            showToast('Please enter a search term', 'error');
            searchInput.focus();
            return;
        }
        
        // Show loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
        submitBtn.disabled = true;
        
        // Perform search
        setTimeout(() => {
            window.location.href = `/search?q=${encodeURIComponent(query)}`;
        }, 500);
    });
}

/* ==================== POST INTERACTIONS ==================== */
function initPostInteractions() {
    console.log('📰 Initializing post interactions...');
    
    // Like functionality
    document.addEventListener('click', async function(event) {
        const likeBtn = event.target.closest('.like-btn');
        if (likeBtn) {
            event.preventDefault();
            event.stopPropagation();
            
            const postId = likeBtn.dataset.postId;
            await toggleLike(postId, likeBtn);
        }
        
        // Bookmark functionality
        const bookmarkBtn = event.target.closest('.bookmark-btn');
        if (bookmarkBtn) {
            event.preventDefault();
            event.stopPropagation();
            
            const postId = bookmarkBtn.dataset.postId;
            await toggleBookmark(postId, bookmarkBtn);
        }
        
        // Share functionality
        const shareBtn = event.target.closest('.share-btn');
        if (shareBtn) {
            event.preventDefault();
            event.stopPropagation();
            
            const postId = shareBtn.dataset.postId;
            await sharePost(postId, shareBtn);
        }
    });
    
    // Card hover effects
    const postCards = document.querySelectorAll('.post-card-regular, .post-card-featured');
    postCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
            this.style.boxShadow = 'var(--shadow-2xl)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-4px)';
            this.style.boxShadow = 'var(--shadow-lg)';
        });
        
        // Click to read
        card.addEventListener('click', function(event) {
            if (!event.target.closest('.post-action-btn')) {
                const link = this.querySelector('a[href^="/post/"]');
                if (link) {
                    window.location.href = link.href;
                }
            }
        });
    });
    
    // Infinite scroll for posts
    let isLoading = false;
    let page = 1;
    
    window.addEventListener('scroll', async function() {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        const isBottom = scrollTop + clientHeight >= scrollHeight - 100;
        
        if (isBottom && !isLoading) {
            isLoading = true;
            await loadMorePosts();
            isLoading = false;
        }
    });
}

async function toggleLike(postId, button) {
    try {
        // Show loading state
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        button.disabled = true;
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Toggle state
        const isLiked = button.classList.toggle('liked');
        const icon = button.querySelector('i');
        
        if (isLiked) {
            icon.className = 'fas fa-heart';
            showToast('Post liked!', 'success');
        } else {
            icon.className = 'far fa-heart';
            showToast('Like removed', 'info');
        }
        
        // Update count
        const countSpan = button.querySelector('.like-count');
        if (countSpan) {
            let count = parseInt(countSpan.textContent) || 0;
            count = isLiked ? count + 1 : Math.max(0, count - 1);
            countSpan.textContent = count;
        }
        
    } catch (error) {
        console.error('Error toggling like:', error);
        showToast('Failed to update like', 'error');
    } finally {
        button.disabled = false;
    }
}

async function toggleBookmark(postId, button) {
    try {
        // Show loading state
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        button.disabled = true;
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Toggle state
        const isBookmarked = button.classList.toggle('bookmarked');
        const icon = button.querySelector('i');
        
        if (isBookmarked) {
            icon.className = 'fas fa-bookmark';
            showToast('Post bookmarked!', 'success');
        } else {
            icon.className = 'far fa-bookmark';
            showToast('Bookmark removed', 'info');
        }
        
    } catch (error) {
        console.error('Error toggling bookmark:', error);
        showToast('Failed to update bookmark', 'error');
    } finally {
        button.disabled = false;
    }
}

async function sharePost(postId, button) {
    try {
        const postTitle = document.title;
        const postUrl = window.location.href;
        
        if (navigator.share) {
            // Use Web Share API if available
            await navigator.share({
                title: postTitle,
                text: 'Check out this article!',
                url: postUrl
            });
            showToast('Shared successfully!', 'success');
        } else {
            // Fallback: copy to clipboard
            await navigator.clipboard.writeText(postUrl);
            showToast('Link copied to clipboard!', 'success');
        }
    } catch (error) {
        console.error('Error sharing post:', error);
        showToast('Failed to share post', 'error');
    }
}

async function loadMorePosts() {
    try {
        page++;
        const response = await fetch(`/api/posts?page=${page}&limit=6`);
        if (!response.ok) throw new Error('Failed to load more posts');
        
        const posts