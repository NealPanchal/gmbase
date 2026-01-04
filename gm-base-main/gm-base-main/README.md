# GM Base Mini App

A daily GM tracker on Base blockchain where users can say GM once per day and build their streak!

## Features

- 🎯 Say GM once per UTC day
- 🔥 Track your GM streak
- 👥 GM to friends by address
- ⏰ Countdown timer to next GM reset
- 📊 View global GM stats

## Screenshots

The app matches your design with:
- Purple gradient background with blur effects
- Main "Tap to GM" button with ripple effect
- Stats display (Global GM Count, Your GMs, GMs Received)
- GM type selection modal
- Countdown timer for daily reset

## Setup

### Prerequisites

- Node.js 18+
- MetaMask or compatible wallet
- Base Sepolia testnet configured in your wallet

### Installation

```bash
# Install dependencies (already done)
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables

Create a `.env.local` file (already created):

```env
NEXT_PUBLIC_HOME_URL=http://localhost:3000
NEXT_PUBLIC_CONTRACT_ADDRESS=0xe449f79ec594e609abc5fe170d678ae758e8efd7
```

## Smart Contract

The app uses your DailyGM contract deployed at:
- **Address**: `0xe449f79ec594e609abc5fe170d678ae758e8efd7`
- **Network**: Base Sepolia
- **Functions**:
  - `gm()` - Say GM to yourself
  - `gmTo(address)` - Say GM to a friend
  - `streak(address)` - Get user's streak count
  - `lastGM(address)` - Get last GM timestamp

## How It Works

1. **Connect Wallet**: Click "Connect Wallet" to connect MetaMask
2. **Tap to GM**: Click the main button to open GM options
3. **Choose GM Type**:
   - "GM" - Say GM to yourself
   - "GM to a Fren" - Say GM to a friend's address
4. **Cooldown**: If you've already GM'd today, see countdown to next reset

## Base Mini App Configuration

The `minikit.config.ts` file contains the Base mini app manifest:

```typescript
{
  name: "GM Base",
  subtitle: "Say GM every day on Base",
  description: "Daily GM streak tracker on Base blockchain",
  primaryCategory: "social",
  tags: ["social", "daily", "gm", "streak", "base", "blockchain"]
}
```

## Deployment to Base

### Step 1: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Step 2: Configure Account Association

1. Push changes to your main branch
2. Disable Vercel's Deployment Protection in Settings
3. Use Base Build's account association tool
4. Paste your domain and complete verification
5. Copy the `accountAssociation` object into `minikit.config.ts`

### Step 3: Publish

Create a post in the Base app containing your app's URL to make it discoverable.

## Tech Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Web3**: wagmi + viem
- **Network**: Base Sepolia
- **Contract**: Solidity 0.8.20

## Development

```bash
# Run dev server
npm run dev

# Build
npm run build

# Lint
npm run lint
```

## Contract Integration

The app reads from and writes to your smart contract:

- **Read Operations**: User streak, last GM timestamp
- **Write Operations**: Send GM, send GM to friend
- **Events**: Listens for GMSent and StreakUpdated events

## UI Components

- `app/page.tsx` - Main page with GM button and stats
- `components/GMModal.tsx` - Modal for choosing GM type
- `components/CountdownTimer.tsx` - Countdown to next reset
- `components/Stats.tsx` - Display GM statistics
- `components/WalletConnect.tsx` - Wallet connection button

## Notes

- The Global GM Count currently uses mock data (218,889,973)
- GMs Received needs event indexing to track incoming GMs
- Add images at `public/icon.png` and `public/cover.png` before deployment

## License

MIT
