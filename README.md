# COMICKU

Baca Komik lengkap hanya di Comic Ku

## Fitur Baru & Integrasi Firebase

Proyek ini telah diperbarui untuk menyertakan fitur-fitur berikut:

*   **Autentikasi Pengguna**: Sistem login dan pendaftaran menggunakan Firebase Authentication (Email/Password, Google, GitHub).
*   **Favorit**: Pengguna dapat menyimpan manhwa favorit mereka.
*   **Riwayat Baca**: Aplikasi secara otomatis menyimpan chapter terakhir yang dibaca oleh pengguna.
*   **Keamanan**: Integrasi Cloudflare Turnstile untuk mencegah spam pendaftaran.
*   **Notifikasi & Pengumuman**: Fitur notifikasi mengambang yang dapat dikonfigurasi admin.
*   **Manajemen Chat**: Admin dapat menghapus semua pesan di chat komunitas.

Untuk menjalankan fitur-fitur ini, Anda perlu membuat dan mengkonfigurasi proyek Firebase Anda sendiri.

---

## Panduan Setup Firebase

Ikuti langkah-langkah di bawah ini untuk menghubungkan aplikasi ini ke Firebase.

### Langkah 1: Buat Proyek Firebase

1.  Buka [Firebase Console](https://console.firebase.google.com/).
2.  Klik **"Add project"** atau **"Buat proyek"**.
3.  Masukkan nama proyek (misalnya, `comicku-app`) dan ikuti langkah-langkah yang diberikan.
4.  Setelah proyek dibuat, Anda akan diarahkan ke halaman *Project Overview*.

### Langkah 2: Buat Aplikasi Web

1.  Di *Project Overview*, klik ikon Web (`</>`) untuk menambahkan aplikasi web baru.
2.  Masukkan nama panggilan aplikasi (misalnya, "COMICKU Web").
3.  Klik **"Register app"**. Firebase akan memberikan Anda objek `firebaseConfig`. **Salin objek ini**, kita akan membutuhkannya nanti.
4.  Anda bisa melewati langkah penambahan Firebase SDK, karena itu sudah diinstal di proyek ini.

### Langkah 3: Aktifkan Authentication

1.  Dari menu di sebelah kiri, buka **Build > Authentication**.
2.  Klik **"Get started"**.
3.  Di bawah tab **"Sign-in method"**, aktifkan *provider* berikut:
    *   **Email/Password**: Aktifkan toggle "Email/Password".
    *   **Google** (Opsional, jika ingin mengaktifkan login Google).
    *   **GitHub** (Opsional, jika ingin mengaktifkan login GitHub).

### Langkah 4: Atur Firestore Database

1.  Dari menu di sebelah kiri, buka **Build > Firestore Database**.
2.  Klik **"Create database"**.
3.  Pilih untuk memulai dalam **Production mode**.
4.  Pilih lokasi Cloud Firestore yang paling dekat dengan pengguna Anda.
5.  Klik **"Enable"**.

### Langkah 5: Atur Aturan Keamanan (Security Rules)

Aturan keamanan sangat penting untuk melindungi data Anda.

1.  Buka tab **"Rules"** di halaman Firestore.
2.  Ganti aturan yang ada dengan aturan berikut:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Aturan untuk dokumen pengguna utama (profil)
    match /users/{userId} {
      // Izinkan semua pengguna yang login untuk melihat profil pengguna lain (untuk search & chat)
      // Dan untuk menghitung statistik pengguna online
      allow read: if request.auth != null;
      // Hanya pemilik akun atau admin yang bisa mengedit
      allow write: if request.auth != null &&
        (request.auth.uid == userId || exists(/databases/$(database)/documents/admins/$(request.auth.uid)));
    }

    // Aturan untuk sub-koleksi pengguna
    // Favorites: Bisa dibaca publik (untuk fitur lihat profil user lain), tapi hanya bisa diedit pemilik
    match /users/{userId}/favorites/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && (request.auth.uid == userId || exists(/databases/$(database)/documents/admins/$(request.auth.uid)));
    }

    // Sub-koleksi lain (history, dll) - Tetap Privat
    match /users/{userId}/{subcollection}/{document=**} {
      allow read, write: if request.auth != null &&
        (request.auth.uid == userId || exists(/databases/$(database)/documents/admins/$(request.auth.uid)));
    }

    // Aturan untuk koleksi admin (untuk mengelola siapa yang dapat memverifikasi pengguna)
    match /admins/{userId} {
      // Hanya admin lain yang bisa melihat daftar admin
      allow read: if request.auth != null && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
      // Koleksi admin hanya boleh dikelola dari Firebase Console, bukan dari aplikasi
      allow write: if false;
    }

    // Aturan untuk konfigurasi settings (Notifikasi Mengambang & Gamification)
    match /settings/{document=**} {
      // Siapa saja bisa membaca konfigurasi (untuk menampilkan notifikasi)
      allow read: if true;
      // Hanya admin yang bisa mengubah pengaturan
      allow write: if request.auth != null && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    // Aturan untuk Locked Chapters (Override Content)
    match /locked_chapters/{chapterId} {
      // Siapa saja bisa membaca status lock (untuk UI)
      allow read: if true;
      // Hanya admin yang bisa mengatur lock
      allow write: if request.auth != null && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    // Aturan untuk koleksi 'leaderboard'
    match /leaderboard/{userId} {
      // Siapa saja bisa membaca data leaderboard
      allow read: if true;
      // Pengguna hanya bisa menulis data leaderboard mereka sendiri
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Aturan untuk koleksi 'quotes'
    match /quotes/{quoteId} {
      // Siapa saja bisa membaca kutipan
      allow read: if true;
      // Hanya pengguna yang sudah login yang bisa menulis (menambah/menghapus)
      allow write: if request.auth != null;
    }

    // Aturan untuk koleksi 'comments'
    match /comments/{commentId} {
      // Siapa pun dapat membaca komentar
      allow read: if true;

      // Pengguna yang sudah login dapat membuat komentar
      // dan hanya bisa mengedit atau menghapus komentarnya sendiri.
      allow create: if request.auth != null
                    && request.resource.data.userId == request.auth.uid
                    && request.resource.data.commentText is string
                    && request.resource.data.commentText.size() > 0;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Aturan untuk Room Chat (DIPERBARUI UNTUK ADMIN DELETE ALL)
    match /chat_messages/{messageId} {
      // Hanya pengguna yang sudah login yang dapat membaca dan mengirim pesan
      allow read, create: if request.auth != null;
      // Pengguna bisa hapus pesan sendiri, Admin bisa hapus semua (atau update)
      allow update, delete: if request.auth != null && (
        resource.data.userId == request.auth.uid ||
        exists(/databases/$(database)/documents/admins/$(request.auth.uid))
      );
    }

    // Aturan untuk profil pengguna publik (untuk fitur @mention)
    match /user_profiles/{userId} {
      // Siapa saja bisa membaca profil publik untuk menampilkan daftar mention
      allow read: if true;
      // Pengguna hanya bisa membuat atau mengubah profilnya sendiri
      allow create, update: if request.auth != null && request.auth.uid == userId;
    }

    // Aturan untuk Site Stats (Counter Visits)
    match /site_stats/{docId} {
       allow read: if true; // Admin needs to read, public might not need but harmless for stats
       // Allow incrementing visits by anyone (anonymous included)
       allow update: if request.resource.data.diff(resource.data).affectedKeys().hasOnly(['visits'])
                     && request.resource.data.visits == resource.data.visits + 1;
       allow create: if true; // Allow creation if doesn't exist (first run)
    }

    // Aturan untuk Donasi
    match /donations/{donationId} {
      allow read: if true; // Public leaderboard
      // Write is handled by Server-side Webhook or Admin SDK ideally.
      // If using Client SDK from server for now, allow create.
      allow create: if true;
    }

    // Aturan untuk Private Chat
    match /private_chats/{chatId} {
      // Pengguna bisa membuat chat baru jika mereka termasuk dalam partisipan
      allow create: if request.auth != null;
      // Pengguna bisa membaca chat jika UID mereka ada di array 'participants'
      allow read: if request.auth != null && request.auth.uid in resource.data.participants;
       // Pengguna bisa mengupdate chat (misal: lastMessage) jika mereka partisipan
      allow update: if request.auth != null && request.auth.uid in resource.data.participants;

      // Aturan untuk sub-koleksi messages
      match /messages/{messageId} {
        // Pengguna bisa membaca pesan jika mereka punya akses ke dokumen chat induk
        allow read: if request.auth != null && request.auth.uid in get(/databases/$(database)/documents/private_chats/$(chatId)).data.participants;
        // Pengguna bisa mengirim pesan jika mereka punya akses ke dokumen chat induk
        allow create: if request.auth != null && request.auth.uid in get(/databases/$(database)/documents/private_chats/$(chatId)).data.participants;
      }
    }
  }
}
```

3.  Klik **"Publish"** untuk menyimpan aturan baru.

### Langkah 6: Masukkan Konfigurasi Firebase ke Aplikasi

1.  Buka file `client/src/firebaseConfig.ts` di proyek ini.
2.  Anda akan melihat objek `firebaseConfig` dengan nilai *placeholder*.
3.  Ganti nilai-nilai *placeholder* tersebut dengan objek `firebaseConfig` yang Anda salin dari Firebase pada **Langkah 2**.
4.  Simpan file tersebut.

---

## Konfigurasi Cloudflare Turnstile (Wajib)

Untuk mencegah pendaftaran akun spam dan melindungi batas database, aplikasi ini menggunakan **Cloudflare Turnstile**.

### Langkah 1: Dapatkan Site Key

1.  Buat akun atau masuk ke [Cloudflare Dashboard](https://dash.cloudflare.com/).
2.  Navigasi ke menu **"Turnstile"** di sidebar kiri.
3.  Klik **"Add Site"**.
4.  Beri nama situs Anda (misalnya: "Comicku App").
5.  Masukkan domain aplikasi Anda (misalnya: `localhost`, `comicku.vercel.app`).
6.  Pilih **"Widget Mode"**: Managed (Disarankan).
7.  Klik **"Create"**.
8.  Salin **Site Key** yang diberikan.

### Langkah 2: Masukkan Site Key ke Kode

Secara default, aplikasi menggunakan **Dummy Site Key** untuk pengujian (`1x00000000000000000000AA`). Ini akan selalu lolos verifikasi.

Untuk menggantinya dengan Site Key asli Anda:

1.  Buka file `client/src/pages/auth.tsx`.
2.  Cari kode berikut:
    ```tsx
    <Turnstile
        sitekey="1x00000000000000000000AA" // <-- Ganti dengan Site Key Anda
        onVerify={(token) => setIsCaptchaVerified(true)}
    />
    ```
3.  Ganti string `"1x00000000000000000000AA"` dengan Site Key yang Anda dapatkan dari Cloudflare.

Setelah ini, tombol Sign Up hanya akan aktif jika pengguna lolos verifikasi Cloudflare Turnstile.

---

## Konfigurasi Admin

Untuk mengakses dasbor admin, Anda perlu menambahkan UID pengguna Anda ke dalam daftar admin.

1.  **Dapatkan UID Pengguna**:
    *   Login ke aplikasi Anda dengan akun yang ingin Anda jadikan admin.
    *   Buka Firebase Console, lalu navigasi ke **Authentication > Users**.
    *   Salin UID dari akun yang baru saja Anda gunakan untuk login.

2.  **Tambahkan UID ke Kode**:
    *   Buka file `client/src/hooks/use-admin.ts`.
    *   Ganti `'YOUR_ADMIN_UID_HERE'` dengan UID yang telah Anda salin.

    ```typescript
    const ADMIN_UIDS = ['UID_ADMIN_1', 'UID_ADMIN_2']; // Ganti dengan UID admin Anda
    ```

3.  **Setup Koleksi Admin**:
    *   Di Firebase Console, buka **Firestore Database**.
    *   Buat koleksi `admins`.
    *   Buat dokumen dengan ID sama dengan UID admin.
    *   Tambahkan field `isAdmin: true`.

---

## Mengaktifkan Login Google & GitHub (OAuth)

Aplikasi ini mendukung login melalui Google dan GitHub. Untuk mengaktifkannya, ikuti langkah-langkah berikut di Firebase Console.

1.  **Aktifkan Penyedia OAuth**:
    *   Buka proyek Anda di **Firebase Console**.
    *   Navigasi ke **Build > Authentication > Sign-in method**.
    *   Klik **"Add new provider"**.
    *   Pilih **Google** dan aktifkan.
    *   Ulangi proses untuk **GitHub**. Masukkan **Client ID** dan **Client secret** dari aplikasi OAuth GitHub Anda.

2.  **Otorisasi Domain Anda**:
    *   Di Firebase Console, navigasi ke **Build > Authentication > Settings**.
    *   Di bawah tab **"Authorized domains"**, tambahkan domain tempat aplikasi Anda di-host.

---

## Konfigurasi Saweria Webhook

Untuk mengaktifkan fitur leaderboard donasi otomatis:

1.  Login ke akun [Saweria](https://saweria.co/) Anda.
2.  Masuk ke menu **Integrasi** (Integration) > **Webhook**.
3.  Masukkan URL Webhook aplikasi Anda: `https://DOMAIN_ANDA.com/api/webhooks/saweria`.
    *   Jika menggunakan local environment, gunakan tool seperti Ngrok untuk mengekspos localhost.
4.  Centang event yang ingin dikirim (biasanya "Donation").
5.  Simpan.
6.  Setiap kali ada donasi masuk, Saweria akan mengirim data ke server, dan leaderboard di `/support` akan otomatis terupdate.
