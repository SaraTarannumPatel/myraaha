# MyRaaha Web App — Inside UI Typography & Design Guidelines

This document details the typography, layout, scale, and color rules specifically for the **in-app authenticated workspace / dashboard** of the MyRaaha application, classified by standard design system semantic tokens.

---

## Semantic Typography Reference Table

| Design System Token | Applied Layer / Element | Desktop Font Size | Mobile Font Size | Font Weight | Line Height | Letter Spacing | Font Family | Primary Color / Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Heading 1** | Onboarding Welcome Headline / Page Hero Titles | `48px` | `30px` | `700` (Bold) | `1.2` | `-0.03em` | `Poppins` | `#000000` / `#5500CB` |
| **Heading 2** | Module Page Title / Primary Content H1 | `36px` | `28px` | `700` (Bold) | `1.2` | `-0.02em` | `Poppins` | `#000000` / `#5500CB` |
| **Heading 3** | Dashboard Greeting / Reward Celebration Title | `30px` | `24px` | `700` (Bold) | `1.3` | `0` | `Poppins` | `#000000` |
| **Subtitle 1** | Module Subheadings / Article Section Titles | `28px` | `22px` | `700` (Bold) | `1.3` | `0` | `Poppins` | `#000000` |
| **Subtitle 2** | Article Pullquotes / Onboarding Hero Descriptions | `22px` | `18px` | `300` (Light) or `500` (Medium) | `1.6` | `0` | `Poppins` | `#000000` / `#5500CB` (Italic) |
| **Subtitle 3** | Card Titles / Dialog Titles / Primary Nav Labels | `16px` | `15px` | `600` (Semibold) | `1.4` | `-0.01em` | `Poppins` | `#000000` |
| **Description Text 1** | Article Content Body / Long-form prose reads | `17px` | `16px` | `400` (Normal) | `1.85` | `0` | `Poppins` | `#000000` (Max 65ch width) |
| **Description Text 2** | Card Body Copy / Standard Interface Text | `14px` | `13px` | `400` (Normal) | `1.65` | `0` | `Poppins` | `#4B5563` |
| **Description Text 3** | Input Helper text / Caption text / Tooltips | `12px` | `11px` | `400` (Normal) | `1.5` | `0.01em` | `Poppins` | `#4B5563` |
| **Button Text** | Action Button Labels / Interactive Targets | `15px` | `15px` | `700` (Bold) / `600` (Semibold) | `1.4` | `0.05em` | `Poppins` | `#FFFFFF` |
| **Overline Text** | Dashboard Section Headings / Category Labels | `11px` | `11px` | `700` (Bold) | `1.3` | `0.15em` | `Poppins` | `#5500CB` (Uppercase) |
| **Monospace / Score Display** | SelfGraph Score Displays / OTP Digits / telemetry counters | `56px` (Primary) | `48px` (Primary) | `700` (Bold) | `1.1` - `1.3` | `-0.02em` | `JetBrains Mono` | `#5500CB` / `#000000` |

---

## Detailed Specifications by Semantic Token

### Heading 1 (Hero Title)
* **Applied UI Component**: Onboarding initial welcomes and global section opener headers.
* **Font Specs**: `Poppins`, Desktop `48px` / Mobile `30px`, Weight `700` (Bold), Line height `1.2`, Letter spacing `-0.03em`.
* **Primary Color**: `#000000` (Main title) with highlights in Brand Purple (`#5500CB`).

### Heading 2 (Page Title)
* **Applied UI Component**: In-app page title headings (e.g. Curiosity Compass, AI Roadmap H1 headers).
* **Font Specs**: `Poppins`, Desktop `36px` / Mobile `28px`, Weight `700` (Bold), Line height `1.2`, Letter spacing `-0.02em`.
* **Primary Color**: `#000000` (Main text) or Brand Purple (`#5500CB`).

### Heading 3 (Section Header)
* **Applied UI Component**: Dashboard greetings, reward celebration headers.
* **Font Specs**: `Poppins`, Desktop `30px` / Mobile `24px`, Weight `700` (Bold), Line height `1.3`.
* **Primary Color**: `#000000`.

### Subtitle 1 (Module Title / Section Title)
* **Applied UI Component**: Large section divisions, article subtitles.
* **Font Specs**: `Poppins`, Desktop `28px` / Mobile `22px`, Weight `700` (Bold), Line height `1.3`.
* **Primary Color**: `#000000`.

### Subtitle 2 (Highlight Callout)
* **Applied UI Component**: Article callouts, secondary onboarding guidelines.
* **Font Specs**: `Poppins`, Desktop `22px` / Mobile `18px`, Weight `300` (Light) / `500` (Medium), Line height `1.6`, italic style options.
* **Primary Color**: `#000000` or Brand Purple (`#5500CB`).

### Subtitle 3 (Card Title / Nav Label)
* **Applied UI Component**: Interface card H3 headers, modal titles, sidebar menu active items.
* **Font Specs**: `Poppins`, Desktop `16px` / Mobile `15px`, Weight `600` (Semibold), Line height `1.4`, Letter spacing `-0.01em`.
* **Primary Color**: `#000000`.

### Description Text 1 (Long-form Reading Layer)
* **Applied UI Component**: Long-form article/story text paragraphs.
* **Font Specs**: `Poppins`, Desktop `17px` / Mobile `16px`, Weight `400` (Normal), Line height `1.85`.
* **Primary Color**: `#000000`.
* **Design Rule**: Enforced limit of `65ch` (max 65 characters per line width) to prevent visual fatigue.

### Description Text 2 (Interface Body Copy)
* **Applied UI Component**: Card description copy, list item details, standard instructions.
* **Font Specs**: `Poppins`, Desktop `14px` / Mobile `13px`, Weight `400` (Normal), Line height `1.65`.
* **Primary Color**: `#4B5563` (Slate-600).

### Description Text 3 (Micro copy)
* **Applied UI Component**: Small caption tags, input field helper hints, tooltips.
* **Font Specs**: `Poppins`, Desktop `12px` / Mobile `11px`, Weight `400` (Normal), Line height `1.5`, Letter spacing `0.01em`.
* **Primary Color**: `#4B5563`.

### Button Text
* **Applied UI Component**: Action button labels (primary, secondary, outlined).
* **Font Specs**: `Poppins`, Desktop `15px` / Mobile `15px`, Weight `700` (Bold) / `600` (Semibold), Line height `1.4`, Letter spacing `0.05em`.
* **Primary Color**: `#FFFFFF` (in primary purple button background) or Brand Purple (`#5500CB` in outlined states).

### Overline Text
* **Applied UI Component**: Category identifiers, uppercase tag overlays, sub-tab labels.
* **Font Specs**: `Poppins`, Desktop `11px` / Mobile `11px`, Weight `700` (Bold), Line height `1.3`, Letter spacing `0.15em`, Text-transform `uppercase`.
* **Primary Color**: Brand Purple (`#5500CB`).

### Monospace / Score Display
* **Applied UI Component**: Telemetry outputs, SelfGraph scores, OTP codes, progress counters.
* **Font Specs**: `JetBrains Mono`, Desktop `56px` (Primary Score) / Mobile `48px` (Primary Score), Weight `700` (Bold), Line height `1.1` - `1.3`, Letter spacing `-0.02em`.
* **Primary Color**: Brand Purple (`#5500CB`) or Text Dark (`#000000`).
