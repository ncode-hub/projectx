# Quick Start Guide

## 1. Install Dependencies (First Time Only)

```bash
cd C:\xampp\htdocs\pumpproject
npm install
```

## 2. Set Up Firebase

### Create Firebase Project
1. Visit https://console.firebase.google.com/
2. Click "Add project"
3. Name it (e.g., "solana-launchpad-mvp")
4. Disable Google Analytics (optional)
5. Click "Create project"

### Enable Firestore
1. In Firebase Console, click "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode"
4. Select your location
5. Click "Enable"

### Enable Storage
1. Click "Storage" in left menu
2. Click "Get Started"
3. Choose "Start in test mode"
4. Click "Done"

### Get Configuration
1. Click the gear icon ?? > Project settings
2. Scroll to "Your apps" section
3. Click the Web icon `</>`
4. Register app (name: "Pump Launchpad")
5. Copy the firebaseConfig object

## 3. Create Environment File

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc123
```

## 4. Update Firestore Rules

In Firebase Console > Firestore > Rules tab, replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tokens/{tokenId} {
      allow read, write: if true;
      match /{document=**} {
        allow read, write: if true;
      }
    }
  }
}
```

Click "Publish"

## 5. Update Storage Rules

In Firebase Console > Storage > Rules tab, replace with:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

Click "Publish"

## 6. Run the App

```bash
npm run dev
```

Open http://localhost:3000

## Testing the App

1. **Create a Token**
   - Click "+ Launch Token" button
   - Fill in: Name, Ticker, Description
   - Upload an image (optional)
   - Click "Launch Token"

2. **View Real-time Feed**
   - Homepage shows all tokens
   - Cards update in real-time when traded

3. **Trade & Comment**
   - Click any token card
   - Use Buy/Sell tabs
   - Enter SOL amount
   - Watch market cap update instantly
   - Add comments in chat

## Troubleshooting

### "Loading tokens..." forever
- Check Firebase config in `.env.local`
- Verify Firestore is enabled
- Check browser console for errors

### Image upload fails
- Verify Storage is enabled
- Check Storage rules are published

### Build errors
- Delete `node_modules` and `.next` folders
- Run `npm install` again
- Check Node version (need 18+)

## File Structure

```
pumpproject/
+-- app/
¦   +-- page.tsx              # Homepage (token feed)
¦   +-- create/page.tsx       # Create token form
¦   +-- token/[id]/page.tsx   # Token detail & trading
¦   +-- layout.tsx            # App layout
+-- firebase/config.js         # Firebase setup
+-- types/index.ts            # TypeScript types
+-- .env.local                # Your config (create this!)
```

## Next Steps

- [ ] Test creating multiple tokens
- [ ] Test real-time updates (open in 2 tabs)
- [ ] Customize colors in `tailwind.config.ts`
- [ ] Add Solana wallet integration
- [ ] Deploy to Vercel

Enjoy building! ??

