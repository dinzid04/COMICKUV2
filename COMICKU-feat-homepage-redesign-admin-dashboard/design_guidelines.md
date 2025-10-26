# COMIC KU Design Guidelines

## Design Approach
**Reference-Based Design** inspired by professional webtoon/manhwa platforms (Webtoon, Tapas, MangaDex) combined with modern streaming platform UX patterns (Netflix, Crunchyroll). Focus on content-first, immersive reading experience with elegant, sophisticated aesthetics.

## Core Design Principles
1. **Content Dominance**: Manhwa covers and chapters are the stars
2. **Reading-Optimized**: Distraction-free, comfortable long-form content consumption
3. **Elegant Restraint**: Sophisticated without being flashy or garish
4. **Seamless Dark Mode**: System-aware theme switching with perfect contrast

## Color Palette

### Dark Mode (Primary Theme)
- **Background**: 217 19% 12% (Deep charcoal base)
- **Surface**: 217 19% 16% (Elevated cards/panels)
- **Surface Elevated**: 217 19% 20% (Hover states, modals)
- **Primary Accent**: 262 83% 58% (Vibrant purple for CTAs, highlights)
- **Text Primary**: 0 0% 98% (High contrast white)
- **Text Secondary**: 0 0% 70% (Muted information)
- **Border**: 217 19% 24% (Subtle dividers)

### Light Mode
- **Background**: 0 0% 98% (Clean white)
- **Surface**: 0 0% 100% (Pure white cards)
- **Primary Accent**: 262 83% 48% (Deeper purple for light backgrounds)
- **Text Primary**: 217 19% 12% (Deep charcoal)
- **Text Secondary**: 0 0% 40% (Medium gray)
- **Border**: 0 0% 90% (Light dividers)

### Semantic Colors
- **Rating/Success**: 142 76% 36% (Green for ratings 7+)
- **Warning**: 38 92% 50% (Amber for ratings 5-7)
- **Error/Danger**: 0 84% 60% (Red for errors)

## Typography

### Font Families
- **Primary**: 'Inter', system-ui, -apple-system, sans-serif (body text, UI elements)
- **Display**: 'Outfit', 'Inter', sans-serif (headings, manhwa titles)
- **Monospace**: 'JetBrains Mono', monospace (chapter numbers)

### Type Scale
- **Hero Title**: text-5xl md:text-6xl font-bold (manhwa titles on detail pages)
- **Section Heading**: text-3xl font-bold (category headers like "Terbaru", "Populer")
- **Card Title**: text-lg font-semibold (manhwa titles in cards)
- **Body**: text-base (descriptions, synopsis)
- **Metadata**: text-sm text-muted (chapter info, dates, ratings)
- **Caption**: text-xs (footer, credits)

## Layout System

### Spacing Primitives
- **Micro**: 2, 4 (component internal spacing)
- **Standard**: 6, 8 (card padding, between elements)
- **Section**: 12, 16 (between major sections)
- **Major**: 20, 24 (page-level spacing)

### Grid Patterns
- **Manhwa Grid**: grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 (homepage listings)
- **Featured Grid**: grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 (recommendations)
- **Chapter List**: Single column with subtle dividers for easy scanning

### Container Widths
- **Max Width**: max-w-7xl (main content container)
- **Reading Width**: max-w-4xl (detail pages, synopsis)
- **Full Bleed**: w-full (slider/carousel sections)

## Component Library

### Header/Navigation
- Fixed top header with blur backdrop (backdrop-blur-xl bg-background/80)
- Logo "COMIC KU" in top left with icon/text combination
- Centered search bar with rounded-full design, icon prefix
- Dark mode toggle icon (sun/moon) - follows system preference by default
- Hamburger menu for mobile with slide-out drawer

### Manhwa Cards
- **Aspect Ratio**: 2:3 portrait covers with rounded-lg edges
- **Hover Effect**: Scale transform (hover:scale-105) with smooth transition
- **Overlay**: Gradient overlay on hover revealing chapter count, rating badge
- **Rating Badge**: Absolute positioned top-right, rounded-full with backdrop blur
- **Shadow**: shadow-lg on hover for depth

### Slider/Carousel (Homepage Recommendations)
- Full-width hero slider featuring top 5-8 recommended manhwa
- Large background images with gradient overlay (bottom to top)
- Centered content with title, rating, synopsis preview, "Read Now" CTA
- Dot indicators at bottom, auto-rotate every 5 seconds
- Smooth transitions with opacity + transform

### Chapter Reader
- Vertical scrolling layout, full-width images
- Sticky bottom navigation bar with prev/next chapter buttons
- Progress indicator (thin line at top showing scroll progress)
- Minimal UI - hide header on scroll down, show on scroll up
- Loading skeleton with shimmer for images

### Footer
- Multi-column layout: Logo/About | Quick Links | Social | Legal
- "COMIC KU" branding with tagline
- "Created by Lannz" credit
- Subtle top border with background surface color
- Responsive: stack to single column on mobile

### Loading States
- **Card Skeleton**: Animated shimmer effect with pulse
- **Image Placeholders**: Gradient backgrounds matching theme
- **Infinite Scroll**: Spinner at bottom of manhwa lists

### Error States
- **404 Page**: Centered layout with illustration suggestion, "Back to Home" button
- **Empty State**: Icon + message + suggested action for no results
- **Network Error**: Retry button with clear error message

## Visual Enhancements

### Shadows & Depth
- Cards: shadow-md default, shadow-xl on hover
- Modals/Dialogs: shadow-2xl
- Floating elements (search results): shadow-lg

### Borders & Dividers
- Use sparingly: 1px borders in border color
- Prefer subtle background color changes over borders
- Dividers in chapter lists: border-t border-border

### Animations (Minimal)
- Transitions: transition-all duration-300 ease-in-out
- Hover transforms: transform, scale, opacity only
- Page transitions: Fade in content on route change
- No distracting scroll animations or parallax

### Icons
- Use Heroicons (outline style) via CDN
- Consistent 24px size for UI icons
- 20px for inline icons (ratings, metadata)

## Page-Specific Layouts

### Homepage
- Hero slider (recommendations) full-width, h-96 md:h-[500px]
- Section "Terbaru" with horizontal scroll or grid (6 items)
- Section "Populer" with grid layout (12 items initially, infinite scroll)
- Section "Top Rated" with ranked list appearance

### Detail Page
- Split layout: Left cover (sticky on desktop), Right info/chapters
- Large cover image with shadow and rounded corners
- Title, rating (star icon + number), status badge (ongoing/completed)
- Genre tags as pills with hover effects
- Synopsis in readable width container
- Chapter list with alternating row backgrounds, hover highlight

### Search Page
- Persistent search input at top
- Grid results matching homepage card style
- Empty state when no results
- Pagination at bottom

### Genre Page
- Genre filter chips at top (horizontal scroll on mobile)
- Grid layout matching homepage
- Active genre highlighted with primary accent color

## Images
- **Hero Slider Images**: Landscape manhwa cover art, 1920x600px, with dark gradient overlay from bottom 60%
- **Manhwa Covers**: Portrait 2:3 ratio, minimum 300x450px, displayed with rounded-lg and shadow
- **Logo**: Simple text-based "COMIC KU" with optional book/manga icon, displayed at 180px width
- No placeholder images needed - use solid color backgrounds during loading

## Responsive Breakpoints
- **Mobile**: Base styles, single column layouts
- **Tablet** (md: 768px): 2-4 column grids, side-by-side components
- **Desktop** (lg: 1024px): Full multi-column layouts, sticky elements
- **Large** (xl: 1280px): Max content width, optimized spacing