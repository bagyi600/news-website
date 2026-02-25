# Professional Journalism Workflow for NewsHub

## 🎯 Core Principles

### 1. **Research & Verify**
- Read source articles thoroughly
- Cross-check facts with multiple sources
- Verify credibility of information
- Document sources and evidence

### 2. **Original Content Creation**
- Write unique, engaging headlines
- Create comprehensive article content
- Add professional analysis and perspective
- Structure for readability and impact

### 3. **Visual Enhancement**
- Find relevant high-quality images
- Add proper alt text for SEO
- Display images prominently
- Ensure visual relevance to content

### 4. **Quality Standards**
- Fact-check before publishing
- Maintain professional tone
- Provide actionable insights
- Update as new information emerges

## 📋 Step-by-Step Process

### Step 1: Source Selection
```python
PROFESSIONAL_SOURCES = [
    {'name': 'BBC News', 'url': 'http://feeds.bbci.co.uk/news/rss.xml', 'category': 'world-news'},
    {'name': 'TechCrunch', 'url': 'https://techcrunch.com/feed/', 'category': 'technology'},
    # Add more credible sources
]
```

### Step 2: Research & Verification
```python
def research_article(url):
    # Fetch and analyze article
    # Check for quotes, data points, named sources
    # Verify facts and context
    return verification_data
```

### Step 3: Content Creation
```python
def create_professional_content(item, verification, category):
    # 1. Generate engaging headline
    # 2. Write comprehensive article
    # 3. Add analysis section
    # 4. Include key facts
    # 5. Provide professional perspective
    return professional_content
```

### Step 4: Image Selection
```python
def find_relevant_image(title, category):
    # Search for category-appropriate images
    # Use high-quality sources (Unsplash, Pexels)
    # Generate descriptive alt text
    return image_data
```

### Step 5: Database Integration
```python
def save_professional_post(content, image_data, verification):
    # Save to database with all metadata
    # Include featured_image and image_caption
    # Set fact_check_status based on verification
    # Add quality score
```

## 🎨 Content Structure Template

### Headline Formulas
```
[Category Context]: [Main Topic] - [Key Insight]
[Analysis Type]: [What Happened] and [Why It Matters]
[Impact Statement]: [Event] Could Change [Sector]
```

### Article Structure
```
1. **Engaging Lead** (1-2 paragraphs)
   - Hook the reader
   - Summarize key points
   - State why it matters

2. **Key Facts** (Bullet points)
   - Verified information
   - Important statistics
   - Relevant context

3. **Detailed Analysis** (2-3 paragraphs)
   - What happened and why
   - Historical context
   - Systemic factors

4. **Professional Perspective** (1-2 paragraphs)
   - Journalistic assessment
   - Implications analysis
   - Expert insights

5. **What's Next** (Bullet points)
   - Short-term developments
   - Medium-term consequences
   - Long-term implications

6. **Sources & Methodology**
   - Information sources
   - Verification process
   - Analysis framework
```

## 🖼️ Image Guidelines

### Image Selection Criteria
- **Relevance**: Directly related to topic
- **Quality**: High resolution, good composition
- **Appropriateness**: Professional, non-sensational
- **Licensing**: Royalty-free or properly licensed

### Category-Specific Images
- **Technology**: Innovation, devices, data visualization
- **Business**: Markets, finance, corporate settings
- **World News**: Global events, international locations
- **Politics**: Government buildings, political events
- **Health**: Medical settings, wellness, research
- **Science**: Laboratories, research, discoveries

### Alt Text Best Practices
```
[Category] news about [topic]: [brief description]
Example: "Technology news about AI breakthrough: visualization of neural networks and data processing"
```

## 🔍 Fact-Checking Standards

### Verification Levels
- **✅ Verified**: Multiple independent sources confirm
- **⚠️ Mostly True**: Core facts verified, some details unclear
- **❓ Unverified**: Single source, needs confirmation
- **🔮 Analytical**: Based on analysis of available evidence

### Source Evaluation
1. **Primary Sources**: Original documents, direct participants
2. **Secondary Sources**: Reputable news organizations
3. **Expert Sources**: Subject matter experts
4. **Data Sources**: Official statistics, research studies

## 📊 Quality Metrics

### Content Quality Score (0-100)
- **Research Depth** (30 points): Source verification, fact-checking
- **Originality** (25 points): Unique analysis, fresh perspective
- **Structure** (20 points): Clear organization, readability
- **Visuals** (15 points): Relevant images, proper alt text
- **Impact** (10 points): Actionable insights, practical value

### Performance Tracking
- **Engagement**: Time on page, scroll depth
- **Sharing**: Social shares, link clicks
- **Discussion**: Comments, debate quality
- **Return Visits**: Reader retention

## 🚀 Implementation Files

### Core Scripts
1. **`professional-updater-fixed.py`**
   - Main journalism workflow
   - Research → Write → Image → Publish

2. **`image_search.py`**
   - Image finding and optimization
   - Alt text generation
   - Cache management

### Configuration
1. **Source List**: Curated credible RSS feeds
2. **Image Sources**: Approved image providers
3. **Category Mapping**: Topic to image/style mapping
4. **Quality Thresholds**: Minimum standards for publication

## ⚙️ Automation Setup

### Cron Job Configuration
```bash
# Run every 2 hours for fresh content
0 */2 * * * cd /var/www/news-site/news-updater && python3 professional-updater-fixed.py >> /var/log/news-professional.log 2>&1

# Daily quality audit at 3 AM
0 3 * * * cd /var/www/news-site && python3 scripts/quality-audit.py
```

### Monitoring
```bash
# Check update status
tail -f /var/log/news-professional.log

# Monitor content quality
sqlite3 database.db "SELECT AVG(content_quality_score) FROM posts;"

# Track engagement
sqlite3 database.db "SELECT COUNT(*), AVG(view_count) FROM posts WHERE published_at > date('now', '-7 days');"
```

## 🎯 Success Indicators

### Short-term (1-2 weeks)
- ✅ Professional content replacing source links
- ✅ Featured images displaying properly
- ✅ Improved article structure and analysis
- ✅ Higher reader engagement metrics

### Medium-term (1-2 months)
- ✅ Consistent quality scores above 80/100
- ✅ Increased time-on-page and scroll depth
- ✅ More social shares and discussion
- ✅ Recognition as credible news source

### Long-term (3-6 months)
- ✅ Established reputation for quality journalism
- ✅ Loyal reader base and return visitors
- ✅ Industry recognition and citations
- ✅ Sustainable content production system

## 🔄 Continuous Improvement

### Weekly Review
1. **Content Audit**: Review last week's articles
2. **Performance Analysis**: Check engagement metrics
3. **Quality Assessment**: Evaluate against standards
4. **Process Refinement**: Identify improvements

### Monthly Updates
1. **Source Evaluation**: Add/remove news sources
2. **Template Refinement**: Update content structures
3. **Image Library**: Expand visual resources
4. **Reader Feedback**: Incorporate suggestions

### Quarterly Strategy
1. **Trend Analysis**: Identify successful patterns
2. **Competitive Review**: Compare with other sources
3. **Innovation Planning**: New features and formats
4. **Team Training**: Skill development and updates

## 🆘 Troubleshooting

### Common Issues
1. **No Images Found**
   - Check image search configuration
   - Verify API keys (if using paid services)
   - Review category-image mapping

2. **Low Quality Scores**
   - Improve research depth
   - Enhance analysis sections
   - Add more verified sources

3. **Poor Engagement**
   - Review headline effectiveness
   - Check content readability
   - Assess image relevance

4. **Technical Errors**
   - Check database connections
   - Verify file permissions
   - Review log files for errors

### Emergency Procedures
1. **Content Error**: Immediate correction with transparency
2. **System Failure**: Fallback to basic updater
3. **Quality Drop**: Pause updates until resolved
4. **Legal Issues**: Consult and act promptly

## 📚 Training Resources

### For New Journalists
1. **Style Guide**: NewsHub writing standards
2. **Research Methods**: Fact-checking techniques
3. **Analysis Frameworks**: Critical thinking tools
4. **Ethics Handbook**: Professional standards

### Technical Documentation
1. **System Architecture**: How components work together
2. **API References**: Available data and functions
3. **Database Schema**: Table structures and relationships
4. **Deployment Guide**: Setup and maintenance

### Quality Resources
1. **Fact-Checking Tools**: Verification resources
2. **Image Sources**: Approved visual resources
3. **Style References**: Writing and formatting guides
4. **Legal Guidelines**: Copyright and fair use

---

**Remember**: Professional journalism isn't just about reporting news—it's about providing understanding, context, and value to readers. Every article should leave readers better informed and more capable of engaging with the world.

**Quality > Quantity | Accuracy > Speed | Insight > Information**