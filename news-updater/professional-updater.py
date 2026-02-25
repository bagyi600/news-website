        # Get admin user ID
        self.cursor.execute("SELECT id FROM users WHERE role = 'admin' LIMIT 1")
        author_result = self.cursor.fetchone()
        author_id = author_result[0] if author_result else 1
        
        # Calculate quality score
        quality_score = self.calculate_quality_score(verification_data, len(content_data['content']))
        
        # Determine fact check status based on verification
        if verification_data.get('has_multiple_sources') and verification_data.get('has_named_sources'):
            fact_check_status = 'verified'
        elif verification_data.get('has_multiple_sources'):
            fact_check_status = 'mostly-true'
        else:
            fact_check_status = 'unverified'
        
        # Insert the professional post
        try:
            self.cursor.execute("""
                INSERT INTO posts (
                    title, slug, excerpt, content, author_id, category_id,
                    status, published_at, view_count, like_count, share_count,
                    is_featured, is_trending, fact_check_status, source_url, source_name,
                    featured_image_url, featured_image_alt, analysis_content,
                    key_facts, professional_perspective, sources_verified,
                    original_content, content_quality_score
                ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), 0, 0, 0, 
                0, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                catchy_title,
                slug,
                content_data['excerpt'],
                content_data['content'],
                author_id,
                category_id,
                'published',
                fact_check_status,
                item['link'],
                source['name'],
                image_data['url'],
                image_data['alt'],
                content_data['analysis_content'],
                content_data['key_facts'],
                content_data['professional_perspective'],
                1 if verification_data.get('has_multiple_sources') else 0,
                1,  # original_content
                quality_score
            ))
            
            post_id = self.cursor.lastrowid
            self.log_message(f"✅ Created professional post: {catchy_title[:60]}... (ID: {post_id}, Score: {quality_score})", "SUCCESS")
            return True
            
        except Exception as e:
            self.log_message(f"Error creating post '{catchy_title[:30]}...': {str(e)}", "ERROR")
            return False
    
    def update_frontend_templates(self):
        """Update frontend to display featured images and professional content"""
        try:
            # Check if post.html needs updating
            post_html_path = '/var/www/news-site/public/post-simple.html'
            if os.path.exists(post_html_path):
                with open(post_html_path, 'r') as f:
                    content = f.read()
                
                # Check if featured image display is already added
                if 'featured_image_url' not in content:
                    self.log_message("Updating post template to display featured images", "INFO")
                    
                    # Read the template
                    with open(post_html_path, 'r') as f:
                        lines = f.readlines()
                    
                    # Find where to insert featured image
                    for i, line in enumerate(lines):
                        if 'article-title' in line:
                            # Insert featured image after the title
                            image_html = '''
                            <!-- Featured Image -->
                            <div id="featured-image-container" style="margin: 20px 0;">
                                <img id="featured-image" src="" alt="" style="width: 100%; max-height: 500px; object-fit: cover; border-radius: 8px; display: none;">
                            </div>
                            '''
                            lines.insert(i + 1, image_html)
                            break
                    
                    # Update JavaScript to load featured image
                    for i, line in enumerate(lines):
                        if 'displayArticle(article)' in line:
                            # Find the function and add image display
                            for j in range(i, len(lines)):
                                if 'function displayArticle' in lines[j]:
                                    # Insert image display code
                                    image_js = '''
        // Display featured image if available
        if (article.featured_image_url) {
            const img = document.getElementById('featured-image');
            img.src = article.featured_image_url;
            img.alt = article.featured_image_alt || article.title;
            img.style.display = 'block';
        }
                                    '''
                                    lines.insert(j + 1, image_js)
                                    break
                            break
                    
                    # Write updated template
                    with open(post_html_path, 'w') as f:
                        f.writelines(lines)
                    
                    self.log_message("Post template updated successfully", "SUCCESS")
            
            # Update index.html to show featured images in cards
            index_html_path = '/var/www/news-site/public/index.html'
            if os.path.exists(index_html_path):
                with open(index_html_path, 'r') as f:
                    content = f.read()
                
                # Check if card images are implemented
                if 'post.featured_image_url' not in content:
                    self.log_message("Updating index template to show card images", "INFO")
                    
                    # This would require more complex template updates
                    # For now, we'll just note it needs to be done
                    self.log_message("Note: Frontend card images need manual implementation", "INFO")
            
        except Exception as e:
            self.log_message(f"Error updating frontend templates: {str(e)}", "ERROR")
    
    def process_source(self, source):
        """Process a single news source professionally"""
        self.log_message(f"📰 Processing {source['name']} ({source['category']})...", "INFO")
        
        items = self.fetch_rss_feed(source['url'])
        self.log_message(f"  Found {len(items)} potential stories", "INFO")
        
        new_posts = 0
        
        # Process items (limit to 2 per source for quality)
        for i, item in enumerate(items[:2]):
            try:
                self.log_message(f"  Researching: {item['title'][:60]}...", "INFO")
                
                # Research and verify
                verification_data = self.research_and_verify(item)
                
                # Skip if research failed
                if 'error' in verification_data:
                    self.log_message(f"    Research failed: {verification_data['error']}", "WARNING")
                    continue
                
                # Create professional post
                if self.create_professional_post(item, source, verification_data):
                    new_posts += 1
                    self.conn.commit()
                    
                    # Brief pause between posts
                    time.sleep(1)
                    
            except Exception as e:
                self.log_message(f"    Error processing item: {str(e)}", "ERROR")
                continue
        
        return new_posts
    
    def run(self):
        """Main execution method"""
        self.log_message("=" * 70, "INFO")
        self.log_message("🚀 STARTING PROFESSIONAL JOURNALISM NEWS UPDATE", "INFO")
        self.log_message("=" * 70, "INFO")
        self.log_message(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", "INFO")
        
        total_new_posts = 0
        
        try:
            # Process each professional source
            for source in PROFESSIONAL_SOURCES:
                new_posts = self.process_source(source)
                total_new_posts += new_posts
            
            # Update frontend templates if needed
            self.update_frontend_templates()
            
            # Get statistics
            self.cursor.execute("SELECT COUNT(*) FROM posts")
            total_posts = self.cursor.fetchone()[0]
            
            self.cursor.execute("SELECT AVG(content_quality_score) FROM posts WHERE content_quality_score > 0")
            avg_quality = self.cursor.fetchone()[0] or 0
            
            self.log_message("=" * 70, "INFO")
            self.log_message(f"📊 UPDATE COMPLETED SUCCESSFULLY", "SUCCESS")
            self.log_message(f"   New professional posts: {total_new_posts}", "INFO")
            self.log_message(f"   Total posts in database: {total_posts}", "INFO")
            self.log_message(f"   Average quality score: {avg_quality:.1f}/100", "INFO")
            self.log_message("=" * 70, "INFO")
            
            # Refresh website cache
            try:
                requests.get("http://localhost:3001/api/posts?limit=1", timeout=5)
                self.log_message("Website cache refreshed", "INFO")
            except:
                self.log_message("Cache refresh failed (website may be down)", "WARNING")
            
        except Exception as e:
            self.log_message(f"Critical error in main execution: {str(e)}", "ERROR")
            import traceback
            self.log_message(traceback.format_exc(), "ERROR")
        
        finally:
            if self.conn:
                self.conn.close()
                self.log_message("Database connection closed", "INFO")
        
        return total_new_posts

def main():
    """Entry point"""
    updater = ProfessionalJournalistUpdater()
    return updater.run()

if __name__ == "__main__":
    try:
        result = main()
        sys.exit(0 if result > 0 else 1)
    except KeyboardInterrupt:
        print("\n⚠️ Update interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Fatal error: {str(e)}")
        sys.exit(1)