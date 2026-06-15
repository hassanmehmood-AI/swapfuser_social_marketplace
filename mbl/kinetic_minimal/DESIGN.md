---
name: Kinetic Minimal
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#424754'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#727785'
  outline-variant: '#c2c6d6'
  surface-tint: '#005ac2'
  primary: '#0058be'
  on-primary: '#ffffff'
  primary-container: '#2170e4'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#8127cf'
  on-secondary: '#ffffff'
  secondary-container: '#9c48ea'
  on-secondary-container: '#fffbff'
  tertiary: '#924700'
  on-tertiary: '#ffffff'
  tertiary-container: '#b75b00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#f0dbff'
  secondary-fixed-dim: '#ddb7ff'
  on-secondary-fixed: '#2c0051'
  on-secondary-fixed-variant: '#6900b3'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb786'
  on-tertiary-fixed: '#311400'
  on-tertiary-fixed-variant: '#723600'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
  success-green: '#00A63F'
  sky-blue: '#BFE5F8'
  ink-black: '#0F172A'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md-mobile:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  username-sm:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  container-max: 1280px
  feed-width: 600px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 24px
---

## Brand & Style

The design system is engineered for a high-velocity social exchange platform where discovery and interaction are paramount. The brand personality is **modern, social, and intelligently discoverable**, moving away from the static nature of traditional forums toward a dynamic, "always-on" ecosystem.

The aesthetic follows a **Modern Minimalism** approach with subtle **Glassmorphism** influences. By prioritizing heavy whitespace and high-quality typography, the system ensures that user-generated content remains the focus. The UI is designed to feel light and airy, using soft transitions and translucent layers to maintain a sense of depth without overwhelming the user. It evokes a feeling of efficiency and technical sophistication, tailored for a community that values both speed and clarity.

## Colors

This design system utilizes a vibrant duo-tone primary palette to signify different interaction types. **Swap Blue (#3B82F6)** is the primary action color, used for core utilities and navigation. **Fuser Purple (#A855F7)** serves as the secondary accent, reserved for "social" actions like connecting, fusing content, or special notifications.

The background is a pure `#FFFFFF` to maximize contrast, while `#F8FAFC` (Minimal Gray) is used for surface containers and cards to create soft separation. The `sky-blue` and `success-green` derived from the brand's legacy colors are utilized for low-priority alerts and validation states. Text should primarily use `ink-black` for maximum readability against the light surfaces.

## Typography

The typography system leverages a pairing of **Geist** for structural elements and **Inter** for long-form content. 

**Geist** is used for headlines, usernames, and labels to provide a technical, modern edge with its slightly condensed and precise geometric forms. **Inter** handles the body text, chosen for its exceptional legibility in dense social feeds and varying screen sizes. A strict visual hierarchy is enforced: usernames are always semi-bold Geist, while post content remains in neutral Inter. Scaling is handled through specific mobile tokens to ensure headlines remain readable on smaller viewports without breaking the layout.

## Layout & Spacing

The layout employs a **hybrid fixed-fluid grid**. The central feed is constrained to a maximum width of `600px` to mirror the highly efficient reading experience of modern social timelines, while sidebars and navigation are fluid within a `1280px` outer container.

On **Desktop**, a three-column structure is used: 
1.  **Left:** Fixed-width navigation icons/labels.
2.  **Center:** The main scrollable feed with sticky headers.
3.  **Right:** Contextual widgets and the minimal map interface.

On **Mobile**, the layout collapses into a single column with a bottom navigation bar. Spacing follows a 4px base unit, ensuring all margins, paddings, and gutters are mathematical multiples (e.g., 16px, 24px, 32px), creating a predictable rhythmic flow across all screen sizes.

## Elevation & Depth

This design system avoids heavy drop shadows in favor of **Tonal Layers** and **Glassmorphism**. Depth is established through:

1.  **Level 0 (Base):** Pure White (#FFFFFF) background.
2.  **Level 1 (Cards/Feed):** Minimal Gray (#F8FAFC) with a subtle 1px border (#E2E8F0).
3.  **Level 2 (Modals/Sticky Headers):** Semi-transparent white with a `20px` backdrop blur (Glassmorphism), creating a sense of height when content scrolls beneath.

Interactions use **Ambient Shadows**: when a post card is hovered, it receives a very soft, diffused shadow (10% opacity) and a slight scale-up (1.01x) to signal interactivity. No harsh outlines are used unless they are functional.

## Shapes

The shape language is consistently **Rounded**, using a 0.5rem (8px) base radius. This strikes a balance between the friendly nature of a social platform and the professional precision of a technical tool. 

- **Primary Buttons:** High roundedness (rounded-xl) for a tactile feel.
- **Feed Cards:** Standard roundedness (0.5rem) to maximize screen real estate.
- **Input Fields:** Soft roundedness (0.25rem) to distinguish them from action buttons.
- **Avatars:** Fully circular (pill-shaped) to represent users and personify the experience.

## Components

### Buttons
- **Primary:** Swap Blue background, white text. Bold Geist labels. High-rounded corners.
- **Secondary:** Transparent background with Fuser Purple border and text.
- **Ghost:** No background/border, text changes to Primary Blue on hover with a light sky-blue background tint.

### Cards (Posts)
The primary unit of the design system. Cards are borderless on mobile but feature a 1px soft border on desktop. They use the Minimal Gray surface. Interaction icons (Like, Swap, Comment) are tucked at the bottom in a neutral gray, shifting to their respective brand colors on hover.

### Inputs & Search
Minimalist inputs with 1px borders. The search bar is a pill-shaped element with a subtle Glassmorphism effect when used within the sticky header.

### Sticky Headers
Headers remain fixed at the top of the viewport. They use a 90% opacity white background with a backdrop-blur to maintain context of the feed underneath.

### Minimal Map Interface
Used for discovery, the map component should use a grayscale base (Stadia Alidade Smooth or similar) with Swap Blue and Fuser Purple pulses indicating activity hotspots. All map UI elements (zoom, locate) follow the 0.5rem roundedness of the system.