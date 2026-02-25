            title_elem = item.find('title')
            link_elem = item.find('link')
            desc_elem = item.find('description')
            
            if title_elem is not None and link_elem is not None:
                title = title_elem.text.strip() if title_elem.text else ''
                link = link_elem.text.strip() if link_elem.text else ''
                description = desc_elem.text.strip() if desc_elem is not None and desc_elem.text else ''
                
                if title and link:
                    items.append({
                        'title': title,
                        'link': link,
                        'description': description
                    })
        
        return items[:3]  # Process only 3 items per source
        
    except Exception as e:
        log(f"RSS error: {str(e)}", "ERROR")
        return []

def process_news_item(item, source_info):
    """Complete professional journalism workflow for one item"""
    log(f"Processing: {item['title'][:80]}...")
    
    # Step 1: Actually read the article
    article_content = fetch_article_content(item['link'])
    if not article_content or not article_content.get('content'):
        log(f"Could not read article content", "WARNING")
        return False
    
    # Step 2: Cross-check facts
    facts = cross_check_facts(article_content['content'], source_info['name'])
    log(f"Fact check: {facts}", "INFO")
    
    # Step 3: Write original article
    original_article = write_original_article(article_content, facts, source_info['name'])
    
    # Step 4: Create catchy title
    catchy_title = create_catchy_title(article_content['title'], facts)
    original_article['title'] = catchy_title
    
    # Step 5: Find relevant image
    image_data = find_relevant_image(article_content['title'], source_info['category'])
    
    # Step 6: Save to database
    success = save_to_database(original_article, article_content, facts, source_info, image_data)
    
    return success

def main():
    """Main execution"""
    log("=" * 70)
    log("📰 REAL PROFESSIONAL JOURNALIST SYSTEM - STARTING")
    log("=" * 70)
    
    total_created = 0
    
    for source in SOURCES:
        log(f"📋 Processing {source['name']}...")
        
        items = fetch_rss_items(source['url'])
        log(f"  Found {len(items)} news items")
        
        for item in items:
            try:
                if process_news_item(item, source):
                    total_created += 1
                    time.sleep(3)  # Be polite to servers
                    
            except Exception as e:
                log(f"  Error: {str(e)}", "ERROR")
                continue
    
    # Statistics
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM posts WHERE content_original = 1")
    total_original = cursor.fetchone()[0]
    
    cursor.execute("SELECT AVG(LENGTH(content)) FROM posts WHERE content_original = 1")
    avg_length = cursor.fetchone()[0] or 0
    
    cursor.execute("SELECT COUNT(*) FROM posts WHERE featured_image IS NOT NULL AND content_original = 1")
    total_with_images = cursor.fetchone()[0]
    
    conn.close()
    
    log("=" * 70)
    log(f"📊 JOURNALISM UPDATE COMPLETE", "SUCCESS")
    log(f"   New original articles: {total_created}", "INFO")
    log(f"   Total original articles: {total_original}", "INFO")
    log(f"   Average length: {avg_length:.0f} characters", "INFO")
    log(f"   Articles with images: {total_with_images}", "INFO")
    log("=" * 70)
    
    # Refresh website
    try:
        requests.get("http://localhost:3001/api/health", timeout=5)
        log("Website cache refreshed", "INFO")
    except:
        log("Cache refresh failed", "WARNING")
    
    return total_created

if __name__ == "__main__":
    try:
        result = main()
        sys.exit(0 if result > 0 else 1)
    except KeyboardInterrupt:
        log("Interrupted by user", "INFO")
        sys.exit(1)
    except Exception as e:
        log(f"Fatal error: {str(e)}", "ERROR")
        sys.exit(1)