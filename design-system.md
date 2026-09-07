# SplitPay Design System Reference

## Philosophy
Apple-quality, calm, friendly, consumer-grade experience.
Every screen offers instant clarity: what you owe, what you're owed, and what to do next.

## Palette & Gradients
- **Primary Gradient** (Lavender → Violet → Soft Purple):
  Used for primary CTA buttons, hero balance cards (when settled/positive), and active navigation indicators.
  `linear-gradient(135deg, #7C5CFF 0%, #906BFA 50%, #B488FF 100%)`
- **Secondary Gradient** (Coral → Peach):
  Used for "You owe" emphasis, debt warnings, and destructive accents.
  `linear-gradient(135deg, #FF6F61 0%, #FFA07A 100%)`
- **Tertiary Gradient** (Mint → Sky Blue):
  Used for "You're owed" emphasis and positive balances.
  `linear-gradient(135deg, #10B981 0%, #38BDF8 100%)`
- **Settled / Neutral**:
  Used for "All settled" states.
  `linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)`

## Never-Color-Only Rule
Debt/balance direction is never communicated by color alone:
1. **You owe**: Coral tone + Down arrow icon (`↓`) + Text label ("owe" / "You owe")
2. **You're owed**: Mint tone + Up arrow icon (`↑`) + Text label ("owed" / "Owes you")
3. **Settled**: Neutral/Violet tone + Checkmark icon (`✓`) + Text label ("Settled")

## Typography Scale
- **Large Title / Hero**: `text-amount-hero` (36–44px, tabular-nums, tracking tight)
- **Title 1**: `text-2xl` font-bold (24px)
- **Title 2**: `text-xl` font-semibold (20px)
- **Title 3**: `text-lg` font-semibold (18px)
- **Body**: `text-base` / `text-sm` (14–16px)
- **Callout / Caption**: `text-xs` (12px)

## Touch Targets & Radii
- All interactive elements: min 44×44pt touch targets.
- Radii:
  - Small controls: 10–12px
  - Form inputs: 14px
  - Cards: 20px (`--radius-card`)
  - Sheets & modals: 28px top corners (`--radius-sheet`)
  - Buttons & pills: Fully rounded 9999px (`--radius-pill`)

## Deterministic Avatar Gradients
Name strings are hashed to select deterministically from 8 soft curated gradients across the lavender, coral, mint, and sky families so groups and users have vibrant avatars without manual configuration.
