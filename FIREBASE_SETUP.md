# Firebase Setup for Skye Project

Your Firebase credentials have been configured! ?

## Project Details
- **Project ID**: skye-be687
- **Auth Domain**: skye-be687.firebaseapp.com
- **Storage Bucket**: skye-be687.firebasestorage.app

## Required Configuration Steps

### 1. Enable Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/project/skye-be687)
2. Click **Firestore Database** in the left menu
3. Click **Create database**
4. Choose **Start in test mode** (for development)
5. Select your preferred location
6. Click **Enable**

### 2. Set Firestore Security Rules

Once Firestore is enabled:

1. Go to **Firestore Database** > **Rules** tab
2. Replace the content with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to tokens collection
    match /tokens/{tokenId} {
      allow read: if true;
      allow create: if true;
      allow update: if true;
      
      // Allow read/write to trades subcollection
      match /trades/{tradeId} {
        allow read: if true;
        allow create: if true;
      }
      
      // Allow read/write to comments subcollection
      match /comments/{commentId} {
        allow read: if true;
        allow create: if true;
      }
    }
  }
}
```

3. Click **Publish**

### 3. Enable Firebase Storage

1. Click **Storage** in the left menu
2. Click **Get Started**
3. Choose **Start in test mode**
4. Click **Done**

### 4. Set Storage Security Rules

1. Go to **Storage** > **Rules** tab
2. Replace the content with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow read/write access to token images
    match /tokens/{allPaths=**} {
      allow read: if true;
      allow write: if request.resource.size < 5 * 1024 * 1024  // 5MB limit
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

3. Click **Publish**

## Verify Configuration

After completing the steps above, you can verify everything is working:

```bash
cd C:\xampp\htdocs\pumpproject
npm run dev
```

Open http://localhost:3000 and try:
1. Creating a new token
2. Uploading an image
3. Trading (buy/sell)
4. Adding comments

## Firestore Collections Structure

Your app will automatically create these collections:

### `tokens` (Root Collection)
```
tokens/
  {tokenId}/
    - name: string
    - ticker: string
    - description: string
    - imageUrl: string
    - creatorAddress: string
    - marketCap: number
    - bondingCurveProgress: number
    - createdAt: timestamp
```

### `trades` (Subcollection)
```
tokens/{tokenId}/trades/
  {tradeId}/
    - type: "buy" | "sell"
    - amountSol: number
    - timestamp: timestamp
    - userAddress: string
```

### `comments` (Subcollection)
```
tokens/{tokenId}/comments/
  {commentId}/
    - text: string
    - userAddress: string
    - timestamp: timestamp
```

## Production Security (Important!)

?? **Current rules allow anyone to read/write**. This is fine for development/MVP.

For production, you should:
1. Add Firebase Authentication
2. Restrict writes to authenticated users
3. Add rate limiting
4. Validate data server-side

## Troubleshooting

### "Firebase: Error (auth/operation-not-allowed)"
- Enable Email/Password auth in Firebase Console > Authentication

### "Missing or insufficient permissions"
- Check that Firestore rules are published
- Make sure you're using test mode rules

### Images not uploading
- Verify Storage is enabled
- Check Storage rules are published
- Check browser console for CORS errors

### Data not updating in real-time
- Check Firestore is enabled
- Verify your internet connection
- Check browser console for errors

## Next Steps

Once everything is working:
- [ ] Test creating multiple tokens
- [ ] Test real-time updates (open 2 browser tabs)
- [ ] Add your custom token ideas
- [ ] Integrate Solana wallet (Phase 2)
- [ ] Deploy to Vercel

---

**Configuration Status**: ? Credentials Added
**Last Updated**: January 2026
**Firebase Console**: https://console.firebase.google.com/project/skye-be687

