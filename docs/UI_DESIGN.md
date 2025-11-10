# Authentication UI - Visual Reference

## Login Page Dark Theme

```
┌─────────────────────────────────────────┐
│                                         │
│  V  volv                                │
│     Trading Platform                    │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  [Error Message - if any]               │
│                                         │
│  Client ID                              │
│  [Dark gray box with border]            │
│                                         │
│  [Continue Button - Blue]               │
│                                         │
└─────────────────────────────────────────┘

Background: Slate 900 (#0f172a)
Input Box: Gray 800 (#1f2937)
Border: Gray 700 (#374151)
Text: Gray 300 (#d1d5db)
Placeholder: Gray 500 (#6b7280)
```

## OTP Input (4 Digits)

```
┌─────────────────────────────────────────┐
│                                         │
│  OTP Code                               │
│  [0 0 0 0]  (4-digit numeric)          │
│                                         │
│  Time remaining: 0:30                   │
│                                         │
│  [Verify OTP Button - Blue]             │
│                                         │
└─────────────────────────────────────────┘

- Numeric input only
- Limits to 4 characters
- Centered with spacing
- Shows countdown timer
- Grayed out when expired
```

## 2FA PIN Input (6 Digits)

```
┌─────────────────────────────────────────┐
│                                         │
│  Please enter your pin                  │
│  [● ● ● ● ● ●]  (6-digit masked)      │
│                                         │
│  [Verify PIN Button - Blue]             │
│                                         │
└─────────────────────────────────────────┘

- Password field (masked)
- Numeric input only
- Limits to 6 characters
- Centered with spacing
```

## Success Screen

```
┌─────────────────────────────────────────┐
│                                         │
│           ✓ (in blue circle)            │
│                                         │
│  Login Successful!                      │
│                                         │
│  Welcome, USER NAME                     │
│                                         │
│  [Go to Dashboard Button]               │
│                                         │
└─────────────────────────────────────────┘

- Centered success icon
- Dark gray borders and background
- Blue accent color
```

## Error Display

```
┌─────────────────────────────────────────┐
│                                         │
│  [Error message in red box]             │
│   Background: Red 950 (#7f1d1d)        │
│   Border: Red 800 (#991b1b)            │
│   Text: Red 300 (#fca5a5)              │
│                                         │
│  [Form fields below]                    │
│                                         │
└─────────────────────────────────────────┘
```

## Color Palette

| Element | Color | Code |
|---------|-------|------|
| Background | Slate 900 | `#0f172a` |
| Card | Gray 900 | `#111827` |
| Border | Gray 800 | `#1f2937` |
| Input Bg | Gray 800 | `#1f2937` |
| Input Border | Gray 700 | `#374151` |
| Primary Text | Gray 300 | `#d1d5db` |
| Secondary Text | Gray 400 | `#9ca3af` |
| Placeholder | Gray 500 | `#6b7280` |
| Button | Blue 600 | `#2563eb` |
| Button Hover | Blue 700 | `#1d4ed8` |
| Error Bg | Red 950 | `#7f1d1d` |
| Error Border | Red 800 | `#991b1b` |
| Error Text | Red 300 | `#fca5a5` |
| Success | Blue 600 | `#2563eb` |

## Typography

- Font: System default (-apple-system, BlinkMacSystemFont, Segoe UI)
- Title: 24px, Bold, Gray 100
- Label: 14px, Medium, Gray 300
- Body: 16px, Regular, Gray 300
- Error: 14px, Regular, Red 300
- Timer: 14px, Medium, Gray 400

## Interaction States

### Input Fields
- **Normal**: Gray-800 bg, Gray-700 border
- **Focus**: Gray-700 bg, Blue-500 border
- **Disabled**: Opacity 50%, cursor not-allowed
- **Error**: Red-950 bg, Red-800 border

### Buttons
- **Normal**: Blue-600 bg, white text
- **Hover**: Blue-700 bg
- **Active**: Blue-800 bg
- **Disabled**: Opacity 50%, cursor not-allowed
- **Loading**: Shows "...ing" text

## Responsive Design

- Padding: 16px (p-4)
- Max Width: 28rem (max-w-md)
- Border Radius: 8px (rounded-lg)
- Mobile first approach
- Centered on viewport

## Animation

- Transitions: 200ms cubic-bezier (standard)
- Hover effects: Subtle color changes
- Loading: Button text changes
- Timer: 1s countdown update
