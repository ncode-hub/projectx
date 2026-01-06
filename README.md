# Solana Token Launchpad MVP

A Pump.fun-inspired token launchpad built with Next.js 14 and Firebase.

## Features

? Real-time token feed with live updates
? Token creation with image upload
? Bonding curve simulation
? Live trading interface (simulated)
? Real-time comments/chat
? Dark cyberpunk theme with Matrix aesthetics

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database
4. Enable Firebase Storage
5. Get your config from Project Settings > General > Your apps > Web app

### 3. Environment Variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Firestore Security Rules

Go to Firestore > Rules and paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tokens/{tokenId} {
      allow read: if true;
      allow create: if true;
      allow update: if true;
      
      match /trades/{tradeId} {
        allow read: if true;
        allow create: if true;
      }
      
      match /comments/{commentId} {
        allow read: if true;
        allow create: if true;
      }
    }
  }
}
```

### 5. Storage Rules

Go to Storage > Rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /tokens/{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
pumpproject/
+-- app/
¦   +-- page.tsx           # Homepage with token feed
¦   +-- create/
¦   ¦   +-- page.tsx       # Token creation page
¦   +-- token/
¦   ¦   +-- [id]/
¦   ¦       +-- page.tsx   # Token detail & trading
¦   +-- layout.tsx         # Root layout
¦   +-- globals.css        # Global styles
+-- firebase/
¦   +-- config.js          # Firebase initialization
+-- types/
¦   +-- index.ts           # TypeScript interfaces
+-- package.json
```

## How It Works

### Client-Side Trigger Architecture

This is a "Speed MVP" using client-side triggers:

1. User creates token ? Frontend uploads image ? Writes to Firestore
2. User trades ? Frontend calculates new price ? Updates Firestore
3. Real-time listeners (`onSnapshot`) update all connected clients instantly

### Database Collections

**tokens** (root collection)
- name, ticker, description, imageUrl
- creatorAddress, marketCap, bondingCurveProgress
- createdAt

**tokens/{id}/trades** (subcollection)
- type, amountSol, timestamp, userAddress

**tokens/{id}/comments** (subcollection)
- text, userAddress, timestamp

## Next Steps (Production)

- [ ] Integrate Solana wallet (Phantom/Solflare)
- [ ] Real bonding curve smart contract
- [ ] Backend indexer for price calculations
- [ ] Authentication
- [ ] Rate limiting
- [ ] Chart integration (TradingView)

## Notes

?? This is an MVP with simulated trading. No real blockchain transactions.
?? Cyberpunk dark theme with Matrix green accents
? Real-time updates via Firestore snapshots

