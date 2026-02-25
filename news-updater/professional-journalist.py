        # Extract keywords for SEO
        keywords = self.extract_keywords(full_article, category)
        
        return {
            'content': full_article,
            'excerpt': excerpt,
            'read_time': read_time,
            'keywords': ','.join(keywords),
            'professional_score': self.calculate_professional_score(verification_data, len(full_article))
        }
    
    def extract_keywords(self, text, category):
        """Extract SEO keywords from article"""
        # Remove common words
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been'}
        
        # Extract words
        words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())
        words = [word for word in words if word not in stop_words]
        
        # Count frequency
        from collections import Counter
        word_counts = Counter(words)
        
        # Get top keywords
        keywords = [word for word, count in word_counts.most_common(10)]
        
        # Add category-specific keywords
        category_keywords = {
            'world-news': ['global', 'international', 'world', 'news', 'update'],
            'technology': ['tech', 'innovation', 'digital', 'future', 'ai'],
            'business': ['market', 'economy', 'finance', 'business', 'investment'],
            'general': ['news', 'update', 'analysis', 'report', 'development']
        }
        
        keywords.extend(category_keywords.get(category, []))
        return list(set(keywords))[:15]  # Limit to 15 unique keywords
    
    def calculate_professional_score(self, verification_data, content_length):
        """Calculate professional journalism quality score (0-100)"""
        score = 60  # Base score
        
        # Research quality
        if verification_data.get('source_credibility') == 'high':
            score += 10
        if verification_data.get('has_quotes'):
            score += 5
        if verification_data.get('has_data'):
            score += 10
        if verification_data.get('has_named_sources'):
            score += 5
        
        # Content quality
        if content_length > 1500:
            score += 10
        if content_length > 2500:
            score += 5
        
        # Cap at 100
        return min(score, 100)
    
    # ==================== STEP 3: IMAGE SEARCH & SELECTION ====================
    
    def find_relevant_image(self, title, category, entities):
        """Find relevant high-quality image for article"""
        # Category-based image URLs (using Unsplash)
        category_images = {
            'world-news': [
                'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=800&fit=crop&auto=format',
                'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&h=800&fit=crop&auto=format',
                'https://images.unsplash.com/photo-1551135049-8a33b2fb2f5c?w=1200&h=800&fit=crop&auto=format'
            ],
            'technology': [
                'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=800&fit=crop&auto=format',
                'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=800&fit=crop&auto=format',
                'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=1200&h=800&fit=crop&auto=format'
            ],
            'business': [
                'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=1200&h=800&fit=crop&auto=format',
                'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&h=800&fit=crop&auto=format',
                'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=800&fit=crop&auto=format'
            ],
            'general': [
                'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=1200&h=800&fit=crop&auto=format',
                'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=800&fit=crop&auto=format',
                'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200&h=800&fit=crop&auto=format'
            ]
        }
        
        # Select image based on category
        image_urls = category_images.get(category, category_images['general'])
        image_url = random.choice(image_urls)
        
        # Generate descriptive alt text
        alt_text = self.generate_alt_text(title, category, entities)
        
        # Add cache busting timestamp
        timestamp = int(datetime.now().timestamp())
        if '?' in image_url:
            image_url += f'&t={timestamp}'
        else:
            image_url += f'?t={timestamp}'
        
        self.log(f"Selected image: {image_url[:50]}...", "INFO")
        return {
            'url': image_url,
            'alt': alt_text
        }
    
    def generate_alt_text(self, title, category, entities):
        """Generate SEO-friendly alt text for image"""
        # Base description
        category_descriptions = {
            'world-news': 'World news and international events',
            'technology': 'Technology innovation and digital development',
            'business': 'Business news and economic analysis',
            'general': 'News coverage and current events'
        }
        
        base_desc = category_descriptions.get(category, 'News coverage')
        
        # Add specific details if available
        if entities.get('people'):
            people = entities['people'][:2]
            alt_text = f"{base_desc} featuring {', '.join(people)}: {title[:40]}..."
        elif entities.get('organizations'):
            orgs = entities['organizations'][:2]
            alt_text = f"{base_desc} about {', '.join(orgs)}: {title[:40]}..."
        else:
            alt_text = f"{base_desc}: {title[:50]}..."
        
        # Ensure appropriate length
        if len(alt_text) > 125:
            alt_text = alt_text[:122] + "..."
        
        return alt_text
    
    # ==================== STEP 4: DATABASE INTEGRATION ====================
    
    def generate_slug(self, title):
        """Generate URL-friendly slug from title"""
        slug = title.lower()
        slug = re.sub(r'[^a-z0-9\s-]', '', slug)
        slug = re.sub(r'\s+', '-', slug)
        slug = re.sub(r'-+', '-', slug)
        slug = slug.strip('-')
        
        if len(slug) > 100:
            slug = slug[:100]
        
        return slug
    
    def post_exists(self, title):
        """Check if post already exists"""
        slug = self.generate_slug(title)
        self.cursor.execute("SELECT COUNT(*) FROM posts WHERE slug = ?", (slug,))
        return self.cursor.fetchone()[0] > 0
    
    def save_professional_article(self, original_item, professional_content, image_data, verification_data, source):
        """Save professional article to database"""
        
        # Generate professional title
        pro_title = self.create_catchy_title(original_item['title'], source['category'], verification_data.get('key_entities', {}))
        
        # Check for duplicates
        if self.post_exists(pro_title):
            self.log(f"Skipping duplicate: {pro_title[:50]}...", "INFO")
            return False
        
        # Generate slug
        slug = self.generate_slug(pro_title)
        
        # Get category ID
        self.cursor.execute("SELECT id FROM categories WHERE slug = ?", (source['category'],))
        cat_result = self.cursor.fetchone()
        category_id = cat_result[0] if cat_result else 1
        
        # Get admin author
        self.cursor.execute("SELECT id FROM users WHERE role = 'admin'")
        author_result = self.cursor.fetchone()
        author_id = author_result[0] if author_result else 1
        
        # Determine fact check status
        if verification_data.get('source_credibility') == 'high' and verification_data.get('has_named_sources'):
            fact_status = 'verified'
        elif verification_data.get('source_credibility') == 'high':
            fact_status = 'mostly-true'
        else:
            fact_status = 'unverified'
        
        # Insert professional article
        try:
            self.cursor.execute("""
                INSERT INTO posts (
                    title, slug, excerpt, content, author_id, category_id,
                    status, featured_image, image_caption, source_url, source_name,
                    fact_check_status, view_count, like_count, share_count,
                    is_featured, is_trending, published_at, content_original,
                    analysis_included, image_alt_text, professional_score,
                    read_time_minutes, keywords, sources_verified
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, 0, 
                datetime('now'), 1, 1, ?, ?, ?, ?, ?)
            """, (
                pro_title,
                slug,
                professional_content['excerpt'],
                professional_content['content'],
                author_id,
                category_id,
                'published',
                image_data['url'],
                image_data['alt'],
                original_item['link'],
                source['name'],
                fact_status,
                image_data['alt'],
                professional_content['professional_score'],
                professional_content['read_time'],
                professional_content['keywords'],
                1 if verification_data.get('source_credibility') == 'high' else 0
            ))
            
            post_id = self.cursor.lastrowid
            self.conn.commit()
            
            self.log(f"✅ Created professional article: {pro_title[:60]}...", "SUCCESS")
            self.log(f"   ID: {post_id}, Score: {professional_content['professional_score']}/100", "INFO")
            self.log(f"   Image: {image_data['url'][:50]}...", "INFO")
            
            return True
            
        except Exception as e:
            self.log(f"Error saving article: {str(e)}", "ERROR")
            return False
    
    # ==================== STEP 5: MAIN WORKFLOW ====================
    
    def fetch_rss_feed(self, url):
        """Fetch and parse RSS feed"""
        try:
            response = requests.get(url, headers=HEADERS, timeout=15)
            response.raise_for_status()
            
            root = ET.fromstring(response.content)
            items = []
            
            for item in root.findall('.//item'):
                title_elem = item.find('title')
                link_elem = item.find('link')
                desc_elem = item.find('description')
                pubdate_elem = item.find('pubDate')
                
                if title_elem is not None and link_elem is not None:
                    title = title_elem.text.strip() if title_elem.text else ''
                    link = link_elem.text.strip() if link_elem.text else ''
                    description = desc_elem.text.strip() if desc_elem is not None and desc_elem.text else ''
                    pubdate = pubdate_elem.text.strip() if pubdate_elem is not None and pubdate_elem.text else ''
                    
                    if title and link:
                        items.append({
                            'title': title,
                            'link': link,
                            'description': description,
                            'pubdate': pubdate
                        })
            
            return items
        except Exception as e:
            self.log(f"Error fetching RSS: {str(e)}", "ERROR")
            return []
    
    def process_news_item(self, item, source):
        """Complete professional journalism workflow for one news item"""
        self.log(f"Processing: {item['title'][:60]}...", "INFO")
        
        # Step 1: Research & Verify
        source_content, verification_data = self.fetch_article_content(item['link'])
        
        if not source_content or 'error' in verification_data:
            self.log(f"Research failed, skipping: {item['title'][:50]}...", "WARNING")
            return False
        
        # Step 2: Create Original Content
        professional_content = self.write_professional_article(
            source_content, verification_data, source['category'], 
            verification_data.get('key_entities', {})
        )
        
        # Step 3: Find Relevant Image
        image_data = self.find_relevant_image(
            item['title'], source['category'], 
            verification_data.get('key_entities', {})
        )
        
        # Step 4: Save to Database
        success = self.save_professional_article(
            item, professional_content, image_data, verification_data, source
        )
        
        return success
    
    def update_frontend_for_images(self):
        """Ensure frontend displays featured images properly"""
        try:
            # Check post template
            post_path = '/var/www/news-site/public/post-simple.html'
            if os.path.exists(post_path):
                with open(post_path, 'r') as f:
                    content = f.read()
                
                # Check if featured image display is present
                if 'featured-image' not in content:
                    self.log("Updating post template for featured images", "INFO")
                    
                    # Simple update - in production would be more sophisticated
                    updated = content
                    
                    # Add image container after title
                    if '<h1 class="article-title">' in updated:
                        image_html = '''
                        <!-- Featured Image -->
                        <div id="featured-image-container" style="margin: 20px 0; text-align: center;">
                            <img id="featured-image" src="" alt="" style="max-width: 100%; max-height: 500px; border-radius: 8px; display: none;">
                        </div>
                        '''
                        updated = updated.replace('<h1 class="article-title">', image_html + '\n<h1 class="article-title">')
                    
                    # Update JavaScript to load image
                    if 'displayArticle(article)' in updated:
                        js_code = '''
        // Display featured image if available
        if (article.featured_image) {
            const img = document.getElementById('featured-image');
            img.src = article.featured_image;
            img.alt = article.image_caption || article.title;
            img.style.display = 'block';
        }
                        '''
                        updated = updated.replace('function displayArticle(article) {', 'function displayArticle(article) {\n' + js_code)
                    
                    with open(post_path, 'w') as f:
                        f.write(updated)
                    
                    self.log("Post template updated for featured images", "SUCCESS")
            
        except Exception as e:
            self.log(f"Error updating frontend: {str(e)}", "ERROR")
    
    def run_professional_update(self):
        """Run complete professional journalism update"""
        self.log("=" * 70, "INFO")
        self.log("🚀 STARTING PROFESSIONAL JOURNALISM UPDATE", "INFO")
        self.log("=" * 70, "INFO")
        
        total_created = 0
        
        try:
            # Update frontend first
            self.update_frontend_for_images()
            
            # Process each professional source
            for source in PROFESSIONAL_SOURCES:
                self.log(f"📰 Processing {source['name']} ({source['category']})...", "INFO")
                
                items = self.fetch_rss_feed(source['url'])
                self.log(f"  Found {len(items)} potential stories", "INFO")
                
                # Process items (limit to 2 per source for quality)
                for item in items[:2]:
                    try:
                        if self.process_news_item(item, source):
                            total_created += 1
                            time.sleep(2)  # Be polite to sources
                    except Exception as e:
                        self.log(f"  Error processing item: {str(e)}", "ERROR")
                        continue
            
            # Statistics
            self.cursor.execute("SELECT COUNT(*) FROM posts WHERE content_original = 1")
            total_professional = self.cursor.fetchone()[0]
            
            self.cursor.execute("SELECT AVG(professional_score) FROM posts WHERE professional_score > 0")
            avg_score = self.cursor.fetchone()[0] or 0
            
            self.log("=" * 70, "INFO")
            self.log(f"📊 UPDATE COMPLETE", "SUCCESS")
            self.log(f"   New professional articles: {total_created}", "INFO")
            self.log(f"   Total professional articles: {total_professional}", "INFO")
            self.log(f"   Average quality score: {avg_score:.1f}/100", "INFO")
            self.log("=" * 70, "INFO")
            
            # Refresh website cache
            try:
                requests.get("http://localhost:3001/api/posts?limit=1", timeout=5)
                self.log("Website cache refreshed", "INFO")
            except:
                self.log("Cache refresh failed", "WARNING")
            
            return total_created
            
        except Exception as e:
            self.log(f"Update failed: {str(e)}", "ERROR")
            import traceback
            self.log(traceback.format_exc(), "ERROR")
            return 0
        
        finally:
            self.conn.close()
            self.log("Database connection closed", "INFO")

def main():
    """Entry point"""
    journalist = ProfessionalJournalist()
    return journalist.run_professional_update()

if __name__ == "__main__":
    try:
        result = main()
        sys.exit(0 if result > 0 else 1)
    except KeyboardInterrupt:
        print("\nUpdate interrupted by user")
        sys.exit