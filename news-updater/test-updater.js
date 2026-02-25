#!/usr/bin/env node

const axios = require('axios');
const cheerio = require('cheerio');

// Test RSS feed fetching
async function testRSSFetch() {
    console.log('🧪 Testing RSS feed fetching...\n');
    
    const testFeeds = [
        {
            name: 'BBC News',
            url: 'http://feeds.bbci.co.uk/news/rss.xml'
        },
        {
            name: 'Reuters',
            url: 'https://www.reutersagency.com/feed/?best-topics=tech&post_type=best'
        }
    ];
    
    for (const feed of testFeeds) {
        try {
            console.log(`Testing ${feed.name}...`);
            const response = await axios.get(feed.url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            const $ = cheerio.load(response.data, { xmlMode: true });
            const items = [];
            
            $('item').each((i, elem) => {
                if (items.length < 3) {
                    const title = $(elem).find('title').text().trim();
                    const link = $(elem).find('link').text().trim();
                    if (title && link) {
                        items.push({ title, link });
                    }
                }
            });
            
            console.log(`✅ ${feed.name}: Found ${items.length} items`);
            if (items.length > 0) {
                console.log(`   Sample: ${items[0].title.substring(0, 60)}...`);
            }
            console.log('');
            
        } catch (error) {
            console.log(`❌ ${feed.name}: Error - ${error.message}`);
            console.log('');
        }
    }
}

// Test database connection
function testDatabase() {
    console.log('🧪 Testing database connection...\n');
    
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('/var/www/news-site/database.db');
    
    db.serialize(() => {
        // Check tables
        db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
            if (err) {
                console.log(`❌ Database error: ${err.message}`);
            } else {
                console.log(`✅ Database connected successfully`);
                console.log(`   Tables found: ${tables.map(t => t.name).join(', ')}`);
                
                // Check posts count
                db.get("SELECT COUNT(*) as count FROM posts", (err, row) => {
                    if (!err) {
                        console.log(`   Total posts: ${row.count}`);
                    }
                    
                    // Check categories
                    db.get("SELECT COUNT(*) as count FROM categories", (err, row) => {
                        if (!err) {
                            console.log(`   Total categories: ${row.count}`);
                        }
                        
                        // Check users
                        db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
                            if (!err) {
                                console.log(`   Total users: ${row.count}`);
                            }
                            
                            db.close();
                            console.log('');
                            testSlugGeneration();
                        });
                    });
                });
            }
        });
    });
}

// Test slug generation
function testSlugGeneration() {
    console.log('🧪 Testing slug generation...\n');
    
    const testTitles = [
        'Breaking: Major Earthquake Hits California',
        'Tech Giants Announce New AI Partnership',
        'Sports: Team Wins Championship After 20 Years'
    ];
    
    testTitles.forEach(title => {
        const slug = title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
        
        console.log(`Title: ${title}`);
        console.log(`Slug:  ${slug}`);
        console.log('');
    });
}

// Test content extraction
async function testContentExtraction() {
    console.log('🧪 Testing content extraction...\n');
    
    // Test HTML cleaning
    const html = '<p>This is a <strong>test</strong> paragraph with <a href="#">links</a> and <em>formatting</em>.</p>';
    
    function cleanHTML(text) {
        return text
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }
    
    console.log('Original HTML:', html);
    console.log('Cleaned text:', cleanHTML(html));
    console.log('');
    
    // Test excerpt creation
    function createExcerpt(text, maxLength = 100) {
        const cleaned = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        return cleaned.length > maxLength ? cleaned.substring(0, maxLength) + '...' : cleaned;
    }
    
    const longText = 'This is a very long piece of text that needs to be shortened for use as an excerpt. It contains multiple sentences and should be truncated properly.';
    console.log('Long text:', longText);
    console.log('Excerpt:', createExcerpt(longText, 80));
}

// Main test function
async function runAllTests() {
    console.log('='.repeat(60));
    console.log('🚀 NEWS UPDATER TEST SUITE');
    console.log('='.repeat(60) + '\n');
    
    await testRSSFetch();
    testDatabase();
    await testContentExtraction();
    
    console.log('='.repeat(60));
    console.log('✅ All tests completed');
    console.log('='.repeat(60));
    
    // Show next steps
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Start the news updater service:');
    console.log('   sudo systemctl start news-updater');
    console.log('2. Enable auto-start on boot:');
    console.log('   sudo systemctl enable news-updater');
    console.log('3. Check status:');
    console.log('   sudo systemctl status news-updater');
    console.log('4. View logs:');
    console.log('   sudo journalctl -u news-updater -f');
    console.log('\n🔄 The updater will run:');
    console.log('   • Immediately on startup');
    console.log('   • Every 15 minutes automatically');
    console.log('   • Maximum 3 new posts per update');
    console.log('\n🌐 News will be available at:');
    console.log('   http://72.61.210.61/');
}

// Run tests
runAllTests().catch(console.error);