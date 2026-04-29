# Bitcoin Wallet — Interface Design

## Overview

A clean, modern Bitcoin wallet app following Apple HIG principles. The app enables users to manage their Bitcoin holdings with a focus on security, simplicity, and real-time data. Designed for one-handed mobile use in portrait orientation.

---

## Screen List

| Screen | Tab | Description |
|--------|-----|-------------|
| Home / Portfolio | Wallet | Main dashboard showing BTC balance, fiat equivalent, and price chart |
| Transaction History | Wallet | List of all sent/received transactions |
| Send BTC | — | Modal/sheet for sending Bitcoin to an address |
| Receive BTC | — | Shows user's wallet address + QR code |
| Settings | Settings | App preferences, wallet backup, network selection |

---

## Primary Content and Functionality

### Home / Portfolio Screen (Wallet Tab)
- **Large BTC balance** displayed prominently at top (e.g., "0.0234 BTC")
- **Fiat equivalent** below (e.g., "≈ $1,542.30 USD")
- **24h price change** indicator (green/red with percentage)
- **Mini price chart** showing 7-day BTC/USD trend
- **Quick action buttons**: Send and Receive (two large pill buttons)
- **Recent transactions** list (last 5 items)

### Transaction History Screen
- Full scrollable list of transactions
- Each item shows: type (sent/received), amount in BTC, fiat value, date, and address snippet
- Pull-to-refresh functionality
- Empty state for new wallets

### Send BTC Screen (Modal)
- Recipient address input field
- QR code scanner button to scan address
- Amount input (toggle BTC/USD)
- Network fee selector (low/medium/high)
- Review & confirm button
- Success/failure feedback

### Receive BTC Screen (Modal)
- Large QR code of user's wallet address
- Wallet address text (tappable to copy)
- Share button
- Amount request field (optional)

### Settings Screen
- Wallet backup / export seed phrase
- Currency preference (USD, EUR, GBP)
- Network selection (Mainnet/Testnet)
- Security (biometric lock toggle)
- About / version info

---

## Key User Flows

### First Launch
1. App opens → Welcome screen with "Create Wallet" or "Import Wallet"
2. User taps "Create Wallet" → Seed phrase displayed (12 words)
3. User confirms backup → Home screen

### Send Bitcoin
1. User taps "Send" on Home → Send modal opens
2. User enters/scans recipient address
3. User enters amount
4. User selects fee tier
5. User taps "Review" → Confirmation sheet
6. User confirms → Transaction submitted → Success animation

### Receive Bitcoin
1. User taps "Receive" on Home → Receive modal opens
2. QR code and address displayed
3. User can copy address or share via system sheet

---

## Color Choices

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| primary | #F7931A | #F7931A | Bitcoin orange — accent, buttons, highlights |
| background | #FFFFFF | #0D1117 | Main screen background |
| surface | #F6F8FA | #161B22 | Cards, elevated containers |
| foreground | #1C1E21 | #E6EDF3 | Primary text |
| muted | #6E7781 | #8B949E | Secondary text, labels |
| border | #D0D7DE | #30363D | Dividers, card borders |
| success | #2DA44E | #3FB950 | Received transactions, positive price |
| warning | #BF8700 | #D29922 | Pending states |
| error | #CF222E | #F85149 | Failed transactions, negative price |

---

## Typography & Layout

- Large numeric displays for balance (36-42pt, bold)
- Card-based layout for transactions and sections
- Bottom tab bar with 2 tabs: Wallet, Settings
- Generous padding (16-24px) for touch targets
- Rounded corners (12-16px) on cards and buttons
- Standard iOS navigation patterns (modals slide up)

---

## Tab Bar

| Tab | Icon (SF Symbol) | Label |
|-----|------------------|-------|
| Wallet | `creditcard.fill` | Wallet |
| Settings | `gearshape.fill` | Settings |
