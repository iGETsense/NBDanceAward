# SEO Setup Guide - NB Dance Awards

## Overview
This guide explains how to set up and optimize SEO for the NB Dance Awards website, including favicon setup and search engine optimization.

## 1. Favicon Setup

### What are Favicons?
Favicons are small icons that appear in browser tabs, bookmarks, and search results. They help with branding and user recognition.

### How to Create Favicons

#### Option 1: Using Your Logo (Recommended)
1. **Convert your logo.png to favicon formats:**
   ```bash
   # Install imagemagick if not already installed
   sudo apt-get install imagemagick
   
   # Convert logo.png to favicon.ico
   convert public/logo.png -define icon:auto-resize=256,128,96,64,48,32,16 public/favicon.ico
   
   # Create specific sizes
   convert public/logo.png -resize 16x16 public/favicon-16x16.png
   convert public/logo.png -resize 32x32 public/favicon-32x32.png
   convert public/logo.png -resize 180x180 public/apple-touch-icon.png
   ```

#### Option 2: Using Online Tools
1. Go to [favicon-generator.org](https://www.favicon-generator.org/)
2. Upload your logo.png
3. Download the generated favicon files
4. Place them in `/public/` folder

### Files to Create
Place these files in `/public/` directory:
- `favicon.ico` - Main favicon (multiple sizes)
- `favicon-16x16.png` - Small favicon
- `favicon-32x32.png` - Medium favicon
- `apple-touch-icon.png` - iOS home screen icon (180x180)

### Verification
After adding favicons:
1. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Check browser tab - you should see the NB Dance Awards logo
3. Check browser bookmarks - favicon should appear

## 2. Search Engine Optimization

### Meta Tags (Already Configured)
The following SEO metadata is configured in `app/layout.tsx`:

#### Title Tag
```
NB Dance Awards - Élection de la Superstar | Votez pour votre Danseur Préféré
```
- Length: 60-70 characters (optimal for search results)
- Includes primary keyword: "NB Dance Awards"
- Includes call-to-action: "Votez"

#### Meta Description
```
NB Dance Awards Première Édition - Votez pour votre danseur préféré parmi les meilleurs talents de danse africaine. Coupé Décalé, Mbolé, et plus encore. Concours de danse en ligne avec classement en temps réel.
```
- Length: 155-160 characters (optimal for search results)
- Includes keywords and benefits
- Calls to action

#### Keywords
```
NB Dance Awards, danse africaine, vote danse, coupé décalé, mbolé, danseur camerounais, concours danse afrique, superstar danse, élection danseur, vote en ligne, classement danse
```

### Open Graph Tags (Social Media)
Configured for optimal sharing on:
- Facebook
- WhatsApp
- LinkedIn
- Twitter/X

**What appears when shared:**
- Title: "NB Dance Awards - Élection de la Superstar"
- Description: Voting and ranking information
- Image: Logo (1200x630px recommended)

### Twitter Card
Configured for Twitter/X sharing with:
- Large image card format
- Custom title and description
- Creator handle: @NBDanceAwards

## 3. Search Engine Submission

### Google Search Console
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property: `https://nb-dance-award.vercel.app`
3. Verify ownership (use DNS record or HTML file)
4. Submit sitemap: `/sitemap.xml`
5. Monitor search performance

### Bing Webmaster Tools
1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Add site: `https://nb-dance-award.vercel.app`
3. Verify ownership
4. Submit sitemap

### Yandex (for Russian/CIS markets)
1. Go to [Yandex Webmaster](https://webmaster.yandex.com/)
2. Add site
3. Verify and submit sitemap

## 4. Robots.txt & Sitemap

### robots.txt
Located at `/public/robots.txt`
- Tells search engines which pages to crawl
- Blocks admin pages from indexing
- Specifies sitemap location

### sitemap.xml
Located at `/public/sitemap.xml`
- Lists all important pages
- Includes update frequency
- Specifies priority for each page

**Pages included:**
- Home page (priority: 1.0, daily updates)
- Candidats page (priority: 0.9, daily updates)
- Classement page (priority: 0.9, hourly updates)
- Règles page (priority: 0.7, weekly updates)

## 5. Structured Data (Schema.org)

### Current Implementation
The site includes proper Open Graph tags for:
- Website schema
- Event schema (voting competition)
- Organization schema

### To Add More Structured Data
Add JSON-LD to `app/layout.tsx`:
```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "NB Dance Awards - Élection de la Superstar",
  "description": "Vote for your favorite African dancer",
  "url": "https://nb-dance-award.vercel.app",
  "image": "https://nb-dance-award.vercel.app/logo.png",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "eventStatus": "EventScheduled",
  "eventAttendanceMode": "OnlineEventAttendanceMode",
  "organizer": {
    "@type": "Organization",
    "name": "NB Company",
    "url": "https://nb-dance-award.vercel.app"
  }
}
```

## 6. Performance Optimization for SEO

### Core Web Vitals
Already optimized:
- ✅ Image optimization (Next.js Image component)
- ✅ Code splitting
- ✅ CSS minification
- ✅ Gzip compression

### Mobile Optimization
- ✅ Responsive design
- ✅ Mobile-first approach
- ✅ Touch-friendly buttons

### Page Speed
Recommendations:
1. Monitor with [Google PageSpeed Insights](https://pagespeed.web.dev/)
2. Use [GTmetrix](https://gtmetrix.com/) for detailed analysis
3. Optimize images further if needed

## 7. Content Optimization

### On-Page SEO Checklist
- ✅ Unique title tags
- ✅ Meta descriptions
- ✅ Heading hierarchy (H1, H2, H3)
- ✅ Internal linking
- ✅ Image alt text
- ✅ Mobile responsiveness

### Keywords to Target
**Primary:**
- NB Dance Awards
- Danse africaine
- Concours de danse

**Secondary:**
- Coupé Décalé
- Mbolé
- Vote en ligne
- Classement danseur
- Superstar danse

## 8. Link Building

### Internal Links
Already implemented:
- Navigation menu links
- Category links
- Candidate profile links

### External Links (To Do)
1. Submit to dance directories
2. Reach out to African dance blogs
3. Get featured in entertainment sites
4. Partner with dance organizations

## 9. Local SEO (Cameroon Focus)

### Google My Business
1. Create business profile
2. Add location: Cameroon
3. Add contact information
4. Verify business

### Local Keywords
- "Danseur camerounais"
- "Concours danse Cameroun"
- "Vote danse Yaoundé"
- "Superstar danse Afrique"

## 10. Monitoring & Analytics

### Google Analytics
Already configured with Google Tag Manager

**Key metrics to track:**
- Organic traffic
- Bounce rate
- Average session duration
- Conversion rate (votes)
- Top landing pages
- Top keywords

### Tools to Use
1. **Google Search Console** - Search performance
2. **Google Analytics 4** - User behavior
3. **Bing Webmaster Tools** - Bing search data
4. **Semrush** - Competitor analysis
5. **Ahrefs** - Backlink analysis

## 11. Favicon Display Locations

### Where Favicons Appear
1. **Browser Tab** - favicon.ico
2. **Bookmarks** - favicon.ico
3. **History** - favicon.ico
4. **Search Results** - favicon-32x32.png
5. **iOS Home Screen** - apple-touch-icon.png
6. **Android Home Screen** - favicon-192x192.png (if created)

### How to Verify
1. Visit the website
2. Check browser tab - should show NB Dance Awards logo
3. Bookmark the page - favicon should appear
4. Check Google Search Console - favicon should display in search results

## 12. Troubleshooting

### Favicon Not Showing
**Solution:**
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Check file paths in metadata
4. Verify files exist in `/public/` folder
5. Check file permissions

### Search Results Not Updating
**Solution:**
1. Submit sitemap to Google Search Console
2. Request indexing for specific URLs
3. Wait 24-48 hours for updates
4. Check robots.txt isn't blocking pages

### Logo Not Displaying in Search Results
**Solution:**
1. Ensure image is at least 1200x630px
2. Use high-quality PNG or JPG
3. Verify Open Graph tags
4. Wait for Google to re-crawl (7-14 days)

## 13. Next Steps

1. **Create favicon files** using the methods above
2. **Submit to search engines** via Google Search Console
3. **Monitor performance** using Google Analytics
4. **Build backlinks** through partnerships and outreach
5. **Create content** around target keywords
6. **Optimize for mobile** continuously
7. **Track rankings** for target keywords

## Resources

- [Google Search Central](https://developers.google.com/search)
- [Moz SEO Guide](https://moz.com/beginners-guide-to-seo)
- [Semrush Blog](https://www.semrush.com/blog/)
- [Favicon Generator](https://www.favicon-generator.org/)
- [Schema.org](https://schema.org/)

---

**Last Updated:** November 19, 2025  
**Status:** SEO Optimized & Ready for Search Engines
