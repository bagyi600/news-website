// Main JavaScript for NewsHub

document.addEventListener('DOMContentLoaded', function() {
    console.log('NewsHub loaded');
    
    // Initialize features
    initDarkModeToggle();
    initSearch();
    initCategoryFilters();
    initPostInteractions();
    
    // Load initial data
    loadPosts();
    loadCategories();
});

// Dark mode toggle
function initDarkModeToggle() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
            updateDarkModeIcon();
        });
        
        // Check saved preference
        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark-mode');
        }
        updateDarkModeIcon();
    }
}

function updateDarkModeIcon() {
    const icon = document.querySelector('#darkModeToggle i');
    if (icon) {
        if (document.body.classList.contains('dark-mode')) {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }
}

// Search functionality
function initSearch() {
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    
    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                performSearch(query);
            }
        });
        
        // Real-time search suggestions
        searchInput.addEventListener('input', debounce(function() {
            const query = searchInput.value.trim();
            if (query.length >= 2) {
                showSearchSuggestions(query);
            }
        }, 300));
    }
}

function performSearch(query) {
    console.log('Searching for:', query);
    // Implement search logic here
    // For now, just redirect to search page with query
    window.location.href = `/search?q=${encodeURIComponent(query)}`;
}

function showSearchSuggestions(query) {
    // Implement search suggestions
    console.log('Suggestions for:', query);
}

// Category filters
function initCategoryFilters() {
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            const categoryId = this.dataset.categoryId;
            const categoryName = this.querySelector('.category-name').textContent;
            filterByCategory(categoryId, categoryName);
        });
    });
}

function filterByCategory(categoryId, categoryName) {
    console.log('Filtering by category:', categoryName);
    // Implement category filtering
    // For now, just show a message
    showMessage(`Showing posts in: ${categoryName}`, 'info');
}

// Post interactions
function initPostInteractions() {
    // Like buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('like-btn')) {
            const postId = e.target.dataset.postId;
            toggleLike(postId, e.target);
        }
        
        // Share buttons
        if (e.target.classList.contains('share-btn')) {
            const postId = e.target.dataset.postId;
            sharePost(postId);
        }
        
        // Bookmark buttons
        if (e.target.classList.contains('bookmark-btn')) {
            const postId = e.target.dataset.postId;
            toggleBookmark(postId, e.target);
        }
    });
}

function toggleLike(postId, button) {
    console.log('Toggling like for post:', postId);
    // Implement like functionality
    button.classList.toggle('liked');
    const icon = button.querySelector('i');
    if (icon) {
        if (button.classList.contains('liked')) {
            icon.className = 'fas fa-heart';
            showMessage('Post liked!', 'success');
        } else {
            icon.className = 'far fa-heart';
        }
    }
}

function sharePost(postId) {
    console.log('Sharing post:', postId);
    // Implement share functionality
    if (navigator.share) {
        navigator.share({
            title: document.title,
            text: 'Check out this news article!',
            url: window.location.href
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(window.location.href);
        showMessage('Link copied to clipboard!', 'success');
    }
}

function toggleBookmark(postId, button) {
    console.log('Toggling bookmark for post:', postId);
    // Implement bookmark functionality
    button.classList.toggle('bookmarked');
    const icon = button.querySelector('i');
    if (icon) {
        if (button.classList.contains('bookmarked')) {
            icon.className = 'fas fa-bookmark';
            showMessage('Post bookmarked!', 'success');
        } else {
            icon.className = 'far fa-bookmark';
        }
    }
}

// Data loading
async function loadPosts() {
    try {
        const response = await fetch('/api/posts');
        if (!response.ok) throw new Error('Failed to load posts');
        
        const posts = await response.json();
        console.log('Loaded posts:', posts.length);
        renderPosts(posts);
    } catch (error) {
        console.error('Error loading posts:', error);
        showMessage('Failed to load posts. Please try again.', 'error');
    }
}

async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to load categories');
        
        const categories = await response.json();
        console.log('Loaded categories:', categories.length);
        renderCategories(categories);
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function renderPosts(posts) {
    const postsContainer = document.getElementById('postsContainer');
    if (!postsContainer) return;
    
    // Clear loading state
    postsContainer.innerHTML = '';
    
    if (posts.length === 0) {
        postsContainer.innerHTML = '<div class="no-posts">No posts found.</div>';
        return;
    }
    
    posts.forEach(post => {
        const postElement = createPostElement(post);
        postsContainer.appendChild(postElement);
    });
}

function createPostElement(post) {
    const div = document.createElement('div');
    div.className = 'post-card';
    div.innerHTML = `
        ${post.featured_image ? `<img src="${post.featured_image}" alt="${post.title}" class="post-image">` : ''}
        <div class="post-content">
            <h3 class="post-title">${post.title}</h3>
            <p class="post-excerpt">${post.excerpt || ''}</p>
            <div class="post-meta">
                <span class="post-category">${post.category_name || 'Uncategorized'}</span>
                <span class="post-date">${formatDate(post.published_at)}</span>
            </div>
            <div class="post-actions">
                <button class="like-btn" data-post-id="${post.id}">
                    <i class="far fa-heart"></i> ${post.like_count || 0}
                </button>
                <button class="share-btn" data-post-id="${post.id}">
                    <i class="fas fa-share"></i>
                </button>
                <button class="bookmark-btn" data-post-id="${post.id}">
                    <i class="far fa-bookmark"></i>
                </button>
            </div>
        </div>
    `;
    
    // Make the whole card clickable
    div.addEventListener('click', function(e) {
        if (!e.target.closest('.post-actions')) {
            window.location.href = `/post/${post.slug}`;
        }
    });
    
    return div;
}

function renderCategories(categories) {
    const categoriesContainer = document.getElementById('categoriesContainer');
    if (!categoriesContainer) return;
    
    categories.forEach(category => {
        const categoryElement = createCategoryElement(category);
        categoriesContainer.appendChild(categoryElement);
    });
}

function createCategoryElement(category) {
    const li = document.createElement('li');
    li.className = 'category-item';
    li.dataset.categoryId = category.id;
    li.innerHTML = `
        <span class="category-name">${category.name}</span>
        <span class="category-count">${category.post_count || 0}</span>
    `;
    return li;
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function showMessage(text, type = 'info') {
    // Remove existing messages
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message
    const message = document.createElement('div');
    message.className = `message ${type}-message`;
    message.textContent = text;
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    // Set color based on type
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6',
        warning: '#f59e0b'
    };
    message.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(message);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        message.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => message.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .dark-mode {
        background: #1a1a1a;
        color: #ffffff;
    }
    
    .dark-mode .header,
    .dark-mode .post-card,
    .dark-mode .sidebar {
        background: #2d2d2d;
        color: #ffffff;
    }
    
    .dark-mode .post-title,
    .dark-mode .sidebar-title {
        color: #ffffff;
    }
    
    .dark-mode .post-excerpt {
        color: #cccccc;
    }
    
    .post-actions {
        display: flex;
        gap: 10px;
        margin-top: 15px;
    }
    
    .post-actions button {
        background: none;
        border: none;
        color: #64748b;
        cursor: pointer;
        padding: 5px 10px;
        border-radius: 4px;
        transition: all 0.2s ease;
    }
    
    .post-actions button:hover {
        background: #f1f5f9;
        color: #2563eb;
    }
    
    .dark-mode .post-actions button:hover {
        background: #374151;
        color: #60a5fa;
    }
    
    .liked {
        color: #ef4444 !important;
    }
    
    .bookmarked {
        color: #f59e0b !important;
    }
    
    .no-posts {
        text-align: center;
        padding: 40px;
        color: #64748b;
        font-size: 1.1rem;
    }
`;
document.head.appendChild(style);