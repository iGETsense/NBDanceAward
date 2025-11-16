# Partner Logos Implementation Guide

## Overview
A professional partner logos section has been added to the NB Dance Award website with a modern, responsive design that showcases sponsor relationships through a tiered system.

## Placement
- **Location**: Between "How It Works" section and Footer
- **Page**: Main landing page (`/app/page.tsx`)
- **Section**: Lines 1381-1405

## Component Details

### PartnerLogos Component (`/components/PartnerLogos.tsx`)

#### Props:
```typescript
interface PartnerLogosProps {
  partners: Partner[]              // Array of partner objects
  title?: string                   // Section title (default: "Nos Partenaires")
  subtitle?: string                // Section subtitle
  className?: string               // Additional CSS classes
  showTier?: boolean              // Display tier badges (default: false)
  animated?: boolean              // Enable scroll animations (default: true)
}

interface Partner {
  name: string                     // Partner name
  logo: string                     // Logo image path
  url?: string                     // Optional partner website URL
  tier?: "platinum" | "gold" | "silver" | "bronze"
}
```

#### Features:
1. **Responsive Grid**
   - Mobile: 2 columns
   - Tablet: 3 columns
   - Desktop: 4 columns
   - Extra Large: 6 columns

2. **Hover Effects**
   - Grayscale to color transition
   - Scale up effect (1.05x)
   - Shadow enhancement
   - Smooth 300ms animation

3. **Tier System**
   - Platinum: Gray gradient (top sponsors)
   - Gold: Yellow gradient (major sponsors)
   - Silver: Gray gradient (sponsors)
   - Bronze: Orange gradient (partners)

4. **Accessibility**
   - Proper alt text for all logos
   - Keyboard navigation support
   - Optional external links

## Styling

### Colors by Tier:
- **Platinum**: `from-gray-100 to-gray-200 border-gray-300`
- **Gold**: `from-yellow-100 to-yellow-200 border-yellow-300`
- **Silver**: `from-gray-100 to-gray-200 border-gray-300`
- **Bronze**: `from-orange-100 to-orange-200 border-orange-300`

### Badge Colors:
- **Platinum**: `from-gray-600 to-gray-700`
- **Gold**: `from-yellow-500 to-yellow-600`
- **Silver**: `from-gray-500 to-gray-600`
- **Bronze**: `from-orange-600 to-orange-700`

## Partner Logos

All logos are stored in `/public/partners/` as SVG files:

### Platinum Tier
- `orange.svg` - Orange Cameroun
- `mtn.svg` - MTN Cameroun

### Gold Tier
- `canalplus.svg` - Canal+ Afrique
- `rti.svg` - RTI Cameroun

### Silver Tier
- `express-union.svg` - Express Union
- `ecobank.svg` - EcoBank Cameroun

### Bronze Tier
- `africa-magic.svg` - Africa Magic
- `trace.svg` - Trace TV
- `vox.svg` - Vox Africa
- `cameroon-tribune.svg` - Cameroon Tribune
- `le-messager.svg` - Le Messager
- `spectrum.svg` - Spectrum TV

## Usage Example

```tsx
<PartnerLogos 
  partners={[
    { name: "Orange Cameroun", logo: "/partners/orange.svg", tier: "platinum" },
    { name: "MTN Cameroun", logo: "/partners/mtn.svg", tier: "platinum" },
    // ... more partners
  ]}
  title="Nos Partenaires Prestigieux"
  subtitle="Des leaders de l'industrie qui soutiennent l'excellence de la danse africaine"
  showTier={true}
  animated={true}
/>
```

## Customization

### Adding New Partners:
1. Create/add logo SVG to `/public/partners/`
2. Add partner object to the partners array in page.tsx
3. Assign appropriate tier

### Changing Tier Colors:
Edit the `getTierColor()` and `getTierBadge()` functions in `PartnerLogos.tsx`

### Adjusting Grid Layout:
Modify the grid classes in the `renderPartnerGrid()` function:
- `grid-cols-2` - Mobile columns
- `md:grid-cols-3` - Tablet columns
- `lg:grid-cols-4` - Desktop columns
- `xl:grid-cols-6` - Extra large columns

## Professional Design Principles Applied

1. **Visual Hierarchy**: Tier system clearly shows sponsorship levels
2. **Responsive Design**: Optimal viewing on all devices
3. **Micro-interactions**: Hover effects provide visual feedback
4. **Accessibility**: Proper semantic HTML and alt text
5. **Performance**: SVG logos for scalability and small file size
6. **Consistency**: Matches existing design system and color palette
7. **Spacing**: Proper padding and gaps for professional appearance

## Integration with Existing Design

- Matches dark theme (`bg-zinc-900/30`)
- Uses yellow accents consistent with site branding
- Integrates with ScrollAnimatedElement for scroll animations
- Follows Tailwind CSS conventions
- Compatible with responsive breakpoints

## Future Enhancements

- Add partner links/URLs
- Implement partner filtering by tier
- Add partner testimonials or descriptions
- Create partner tier management dashboard
- Add analytics tracking for partner logo clicks
