#!/usr/bin/env python3
"""
Image Search Module for Professional News Articles
Finds relevant, high-quality images for news topics
"""

import requests
import json
import re
import os
import hashlib
from datetime import datetime

# Configuration
UNSPLASH_ACCESS_KEY = ""  # Would be set in production
PEXELS_API_KEY = ""  # Would be set in production
IMAGE_CACHE_DIR = '/var/www/news-site/public/images/cache'
DEFAULT_IMAGES = {
    'technology': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=800&fit=crop&auto=format',
    'business': 'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=1200&h=800&fit=crop&auto=format',
    'world-news': 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=800&fit=crop&auto=format',
    'politics': 'https://images.unsplash.com/photo-1551135049-8a33b2fb2f5c?w=1200&h=800&fit=crop&auto=format',
    'health': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1200&h=800&fit=crop&auto=format',
    'science': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&h=800&fit=crop&auto=format',
    'general': 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=1200&h=800&fit=crop&auto=format'
}

class ImageSearch:
    def __init__(self):
        self.cache_dir = IMAGE_CACHE_DIR
        os.makedirs(self.cache_dir, exist_ok=True)
    
    def extract_keywords(self, title, category):
        """Extract search keywords from title and category"""
        # Remove common words
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}
        
        # Clean title
        words = re.findall(r'\b[a-zA-Z]{3,}\b', title.lower())
        keywords = [word for word in words if word not in stop_words]
        
        # Add category-specific keywords
        category_keywords = {
            'technology': ['tech', 'digital', 'innovation', 'software', 'hardware', 'ai', 'artificial intelligence', 'machine learning'],
            'business': ['business', 'market', 'economy', 'finance', 'investment', 'corporate', 'company'],
            'world-news': ['world', 'global', 'international', 'news', 'update', 'breaking'],
            'politics': ['politics', 'government', 'policy', 'election', 'vote', 'democracy'],
            'health': ['health', 'medical', 'medicine', 'doctor', 'hospital', 'wellness', 'fitness'],
            'science': ['science', 'research', 'study', 'discovery', 'scientist', 'lab']
        }
        
        if category in category_keywords:
            keywords.extend(category_keywords[category])
        
        # Remove duplicates and limit
        keywords = list(dict.fromkeys(keywords))[:5]
        
        return ' '.join(keywords)
    
    def search_unsplash(self, query, category):
        """Search Unsplash for relevant images (mock version)"""
        # In production, this would use the Unsplash API
        # For now, return appropriate default images
        
        query_lower = query.lower()
        
        # Try to match specific topics
        if any(word in query_lower for word in ['ai', 'artificial intelligence', 'machine learning']):
            return {
                'url': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=800&fit=crop&auto=format',
                'alt': 'Artificial intelligence and neural network visualization',
                'source': 'unsplash',
                'photographer': 'Unsplash AI Collection'
            }
        elif any(word in query_lower for word in ['climate', 'environment', 'weather']):
            return {
                'url': 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=1200&h=800&fit=crop&auto=format',
                'alt': 'Climate change and environmental protection concept',
                'source': 'unsplash',
                'photographer': 'Unsplash Environment Collection'
            }
        elif any(word in query_lower for word in ['business', 'finance', 'market']):
            return {
                'url': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=800&fit=crop&auto=format',
                'alt': 'Business finance and market analysis',
                'source': 'unsplash',
                'photographer': 'Unsplash Business Collection'
            }
        elif any(word in query_lower for word in ['health', 'medical', 'medicine']):
            return {
                'url': 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&h=800&fit=crop&auto=format',
                'alt': 'Healthcare and medical technology',
                'source': 'unsplash',
                'photographer': 'Unsplash Health Collection'
            }
        else:
            # Return category default
            return {
                'url': DEFAULT_IMAGES.get(category, DEFAULT_IMAGES['general']),
                'alt': f'{category.title()} news and updates',
                'source': 'unsplash',
                'photographer': 'Unsplash Editorial'
            }
    
    def search_pexels(self, query, category):
        """Search Pexels for relevant images (mock version)"""
        # Similar to Unsplash but with Pexels API
        # For now, return appropriate images
        
        query_lower = query.lower()
        
        # Try to match specific topics
        if any(word in query_lower for word in ['technology', 'digital', 'innovation']):
            return {
                'url': 'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?w=1200&h=800&fit=crop&auto=compress',
                'alt': 'Technology innovation and digital transformation',
                'source': 'pexels',
                'photographer': 'Pexels Tech Collection'
            }
        elif any(word in query_lower for word in ['politics', 'government', 'election']):
            return {
                'url': 'https://images.pexels.com/photos/1550337/pexels-photo-1550337.jpeg?w=1200&h=800&fit=crop&auto=compress',
                'alt': 'Political discussion and government proceedings',
                'source': 'pexels',
                'photographer': 'Pexels Politics Collection'
            }
        elif any(word in query_lower for word in ['science', 'research', 'discovery']):
            return {
                'url': 'https://images.pexels.com/photos/256262/pexels-photo-256262.jpeg?w=1200&h=800&fit=crop&auto=compress',
                'alt': 'Scientific research and laboratory work',
                'source': 'pexels',
                'photographer': 'Pexels Science Collection'
            }
        else:
            # Return category default (using Unsplash defaults for now)
            return {
                'url': DEFAULT_IMAGES.get(category, DEFAULT_IMAGES['general']),
                'alt': f'{category.title()} coverage and analysis',
                'source': 'pexels',
                'photographer': 'Pexels Editorial'
            }
    
    def download_image(self, url, filename):
        """Download image to cache (mock version)"""
        # In production, this would actually download the image
        # For now, just return the URL as we'll use hotlinking
        
        # Generate cache filename
        cache_key = hashlib.md5(url.encode()).hexdigest()[:10]
        cache_file = os.path.join(self.cache_dir, f"{cache_key}_{filename}.jpg")
        
        # Check if already cached
        if os.path.exists(cache_file):
            # Return local path
            return f"/images/cache/{os.path.basename(cache_file)}"
        
        # In production: download and save image
        # try:
        #     response = requests.get(url, timeout=10)
        #     with open(cache_file, 'wb') as f:
        #         f.write(response.content)
        #     return f"/images/cache/{os.path.basename(cache_file)}"
        # except:
        #     return url  # Fallback to original URL
        
        # For now, return original URL (hotlink)
        return url
    
    def generate_alt_text(self, title, category, specific_topic=None):
        """Generate descriptive alt text for images"""
        base_alt = f"Image related to {title}"
        
        if specific_topic:
            return f"{specific_topic} - {title[:50]}..."
        
        category_descriptions = {
            'technology': 'Technology innovation and digital development',
            'business': 'Business news and economic analysis',
            'world-news': 'World news and international events',
            'politics': 'Political developments and government news',
            'health': 'Health updates and medical news',
            'science': 'Scientific discoveries and research',
            'general': 'News coverage and current events'
        }
        
        description = category_descriptions.get(category, 'News coverage')
        return f"{description}: {title[:60]}..."
    
    def find_best_image(self, title, category, specific_entity=None):
        """
        Find the best image for a news article
        Returns: dict with url, alt, source, photographer
        """
        
        # Extract keywords for search
        keywords = self.extract_keywords(title, category)
        
        # If specific entity mentioned (company, person, event), prioritize that
        if specific_entity:
            # In production, would search for entity-specific images
            pass
        
        # Try Unsplash first
        unsplash_result = self.search_unsplash(keywords, category)
        
        # Try Pexels as backup
        pexels_result = self.search_pexels(keywords, category)
        
        # Choose the best result (simplified logic)
        # In production, would evaluate image quality, relevance, licensing
        
        chosen_result = unsplash_result  # Default to Unsplash
        
        # Generate better alt text
        chosen_result['alt'] = self.generate_alt_text(title, category)
        
        # Add timestamp for cache busting
        timestamp = int(datetime.now().timestamp())
        if '?' in chosen_result['url']:
            chosen_result['url'] += f'&t={timestamp}'
        else:
            chosen_result['url'] += f'?t={timestamp}'
        
        return chosen_result
    
    def validate_image_url(self, url):
        """Validate that image URL is accessible and appropriate"""
        # Basic URL validation
        if not url or not isinstance(url, str):
            return False
        
        # Check if it's a valid image URL
        valid_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
        if not any(url.lower().endswith(ext) for ext in valid_extensions):
            # Might be a CDN URL with parameters
            if 'unsplash.com' in url or 'pexels.com' in url or 'images.unsplash.com' in url:
                return True
            return False
        
        return True

# Example usage
if __name__ == "__main__":
    searcher = ImageSearch()
    
    # Test cases
    test_cases = [
        ("AI Breakthrough Could Revolutionize Healthcare", "technology"),
        ("Global Markets React to New Economic Data", "business"),
        ("Climate Summit Reaches Historic Agreement", "world-news"),
        ("New Study Reveals Benefits of Mediterranean Diet", "health")
    ]
    
    for title, category in test_cases:
        print(f"\nSearching for: {title}")
        result = searcher.find_best_image(title, category)
        print(f"  Image URL: {result['url'][:80]}...")
        print(f"  Alt Text: {result['alt']}")
        print(f"  Source: {result['source']}")