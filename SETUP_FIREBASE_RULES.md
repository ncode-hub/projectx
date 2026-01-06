 # Firebase Security Rules Setup
 
 ## PENTING: Anda HARUS mengatur Firestore Rules untuk app berfungsi!
 
 ### Langkah 1: Buka Firebase Console
 
 1. Buka [Firebase Console - Firestore Rules](https://console.firebase.google.com/project/skye-be687/firestore/rules)
 2. Atau: Firebase Console → Firestore Database → Rules tab
 
 ### Langkah 2: Copy & Paste Rules Berikut
 
 Hapus semua isi rules yang ada, lalu copy-paste ini:
 
 ```
 rules_version = '2';
 service cloud.firestore {
   match /databases/{database}/documents {
     // Allow read/write access to tokens collection
     match /tokens/{tokenId} {
       allow read, write: if true;
       
       // Allow read/write to all subcollections
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
 }
 ```
 
 ### Langkah 3: Publish Rules
 
 1. Klik tombol **"Publish"** (warna biru di kanan atas)
 2. Tunggu sampai muncul notifikasi "Rules published successfully"
 
 ### Langkah 4: Verify Rules Active
 
 Setelah publish, refresh halaman web Anda dan coba trading lagi.
 
 ---
 
 ## Troubleshooting
 
 ### Jika masih error "Missing or insufficient permissions":
 
 1. **Cek Database Name**: Pastikan Firestore database sudah dibuat
 2. **Tunggu 1-2 menit**: Rules baru butuh waktu untuk aktif
 3. **Hard Refresh Browser**: Tekan Ctrl+Shift+R atau Cmd+Shift+R
 4. **Cek Console Log**: Buka DevTools → Console untuk melihat error detail
 
 ### Alternative: Super Permissive Rules (Development Only)
 
 Jika masih tidak work, gunakan ini (HANYA untuk development):
 
 ```
 rules_version = '2';
 service cloud.firestore {
   match /databases/{database}/documents {
     match /{document=**} {
       allow read, write: if true;
     }
   }
 }
 ```
 
 ⚠️ **WARNING**: Rules ini allow semua orang read/write ke semua collection. 
 Hanya gunakan untuk development/testing!
 
 ---
 
 ## Verification
 
 Setelah rules di-publish, test dengan:
 
 1. Buka token detail page
 2. Masukkan amount (misal: 0.5 SOL)
 3. Klik "Buy"
 4. Seharusnya berhasil dan muncul di:
    - Trade History
    - Holder Distribution
    - Market Cap update
