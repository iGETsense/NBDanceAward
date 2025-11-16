# Partners Carousel Implementation Guide

## Overview
A professional, auto-playing carousel component has been created to showcase partner logos directly under the banner section of the NB Dance Award website.

## Placement
- **Location**: Immediately after the hero banner section
- **Page**: Main landing page (`/app/page.tsx`)
- **Lines**: 1162-1181

## Component Details

### PartnersCarousel Component (`/components/PartnersCarousel.tsx`)

#### Props:
```typescript
interface PartnersCarouselProps {
  partners: CarouselPartner[]      // Array of partner objects
  autoPlay?: boolean               // Auto-play carousel (default: true)
  autoPlayInterval?: number        // Interval in ms (default: 4000)
  showControls?: boolean           // Show navigation buttons (default: true)
  className?: string               // Additional CSS classes
}

interface CarouselPartner {
  name: string                     // Partner name
  logo: string                     // Logo image path
  url?: string                     // Optional partner website URL
}
```

## Features

### 1. **Responsive Display**
   - Mobile: 2 logos visible
   - Tablet: 3 logos visible
   - Desktop: 5 logos visible
   - Smooth transitions between slides

### 2. **Auto-Play Functionality**
   - Automatically rotates through partners every 4 seconds
   - Pauses on hover
   - Resumes when mouse leaves
   - Smooth slide transitions (500ms)

### 3. **Navigation Controls**
   - Previous/Next arrow buttons
   - Dot indicators for quick navigation
   - Click dots to jump to specific slide
   - Buttons pause auto-play when clicked

### 4. **Visual Effects**
   - Grayscale logos by default
   - Color transition on hover
   - Yellow border glow on hover
   - Smooth shadow effects
   - Semi-transparent background with gradient

### 5. **Accessibility**
   - Proper ARIA labels
   - Keyboard accessible buttons
   - Semantic HTML structure
   - Alt text for all logos

## Styling

### Color Scheme:
- **Background**: Gradient from `zinc-900` to `zinc-800`
- **Hover Border**: `yellow-500`
- **Hover Glow**: `yellow-500/20` shadow
- **Controls**: Yellow accent with semi-transparent background
- **Active Dot**: `yellow-500`
- **Inactive Dot**: `zinc-600`

### Responsive Breakpoints:
- **Mobile**: 2 items per view
- **Tablet** (md): 3 items per view
- **Desktop** (lg): 5 items per view

## Current Partners (12 Total)

1. Orange Cameroun
2. MTN Cameroun
3. Canal+ Afrique
4. RTI Cameroun
5. Express Union
6. EcoBank Cameroun
7. Africa Magic
8. Trace TV
9. Vox Africa
10. Cameroon Tribune
11. Le Messager
12. Spectrum TV

## Usage Example

```tsx
<PartnersCarousel
  partners={[
    { name: "Orange Cameroun", logo: "/partners/orange.svg" },
    { name: "MTN Cameroun", logo: "/partners/mtn.svg" },
    // ... more partners
  ]}
  autoPlay={true}
  autoPlayInterval={4000}
  showControls={true}
/>
```

## Customization

### Changing Auto-Play Speed:
```tsx
<PartnersCarousel
  partners={partners}
  autoPlayInterval={3000}  // 3 seconds instead of 4
/>
```

### Disabling Auto-Play:
```tsx
<PartnersCarousel
  partners={partners}
  autoPlay={false}
/>
```

### Hiding Navigation Controls:
```tsx
<PartnersCarousel
  partners={partners}
  showControls={false}
/>
```

### Adding New Partners:
1. Create/add logo SVG to `/public/partners/`
2. Add partner object to the partners array:
```tsx
{ name: "Partner Name", logo: "/partners/logo.svg" }
```

## Technical Implementation

### Animation Details:
- **Transition Duration**: 500ms ease-out
- **Transform**: CSS translate for smooth scrolling
- **Auto-play Interval**: Configurable (default 4000ms)
- **Pause on Hover**: Automatic pause and resume

### Performance Optimizations:
- Uses CSS transforms for smooth animations
- Efficient state management with React hooks
- Minimal re-renders
- SVG logos for scalability

### Browser Compatibility:
- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Flexbox for layout
- CSS Transitions for animations
- No external animation libraries required

## Integration with Design System

- Matches dark theme (`bg-zinc-900/800`)
- Uses yellow accent color consistent with branding
- Responsive design following existing patterns
- Tailwind CSS utilities for styling
- Compatible with existing component library

## Professional Design Elements

1. **Visual Hierarchy**: Clear title and organized layout
2. **Micro-interactions**: Hover effects and smooth transitions
3. **User Feedback**: Dots and controls provide navigation feedback
4. **Accessibility**: Full keyboard and screen reader support
5. **Performance**: Smooth 60fps animations
6. **Responsiveness**: Optimal viewing on all devices

## Future Enhancement Ideas

- Add partner descriptions/tooltips on hover
- Implement touch/swipe gestures for mobile
- Add partner filtering by category
- Partner click tracking/analytics
- Testimonials or ratings display
- Partner tier badges
- Infinite scroll option
