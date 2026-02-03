# UI Specification: Vault Timeline Control Surface

## Design Philosophy
The "Vault Timeline Control Surface" is designed to feel like a high-integrity, local-only system. It avoids the fluff of marketing landing pages in favor of a "software-first" aesthetic that building confidence through clarity, privacy, and motion.

## 1. Layout & Hierarchy
Consistent 12-column grid with a 3-column functional split:

| Panel | Width | Purpose |
| :--- | :--- | :--- |
| **Left Rail** | 250px (Fixed) | **Progress & Persistence**: Fixed vertical timeline tracking the user's journey from initialization to browsing. |
| **Center Panel** | Fluid (Primary) | **Active Control**: Where the user makes critical decisions and grants permissions. Uses large, legible components. |
| **Right Panel** | 400px (Fixed) | **Outcome Visualization**: A blurred, high-fidelity preview of the archive browser to sustain momentum. |

---

## 2. Design Tokens

### Color Palette
| Token | Hex | Usage |
| :--- | :--- | :--- |
| `bg-primary` | `#0D1117` | Main background (with center radial vignette) |
| `surface-frosted` | `rgba(22, 27, 34, 0.7)` | Frosted panels and cards |
| `stroke-subtle` | `rgba(255, 255, 255, 0.1)` | Surface borders and separators |
| `text-vibrant` | `#FFFFFF` | Headlines and primary focus items |
| `text-muted` | `#8B949E` | Secondary/body text and descriptions |
| `accent-ice` | `#58A6FF` | Focus rings, active steps, and primary CTA accents |
| `status-ready` | `#238636` | Completed steps or verified permissions |

### Typography (macOS Hierarchy)
- **Headlines**: Inter/SF Pro, Semibold, 32px–40px, -0.02em tracking.
- **Subheads**: Inter/SF Pro, Regular, 18px, 1.5 line-height.
- **Body**: Inter/SF Pro, Regular, 16px, 1.6 line-height.
- **Micro/Label**: Inter/SF Pro, Medium, 11px, 1.5 letter-spacing (Uppercase).

### Surfaces & Elevation
- **Radius**: `16px` for primary panels, `8px` for buttons/cards.
- **Glassmorphism**: 12px Backdrop-blur, 1px saturation boost.
- **Shadows**: `0 8px 32px 0 rgba(0, 0, 0, 0.8)` for deep depth.

---

## 3. Product Copy (High Contrast)

### Timeline Steps
1. **Initialize**: Local-only Vault
2. **Permission**: Full Disk Access
3. **Storage**: Setting directory
4. **Browse**: Ready to explore

### Primary Header (Outcome)
"Initialize your iMessage archive."

### Trust Card Items
- ✓ **Local-only processing**: Your messages never leave this machine.
- ✓ **Stored on this Mac**: Data is kept in your secure ~/Analyzed folder.
- ✓ **Read-only access**: The archiver cannot delete or modify your messages.
