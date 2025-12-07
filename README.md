# COMICKU

Baca Komik lengkap hanya di Comic Ku

## Fitur Baru & Integrasi Firebase

Proyek ini telah diperbarui untuk menyertakan fitur-fitur berikut:

*   **Autentikasi Pengguna**: Sistem login dan pendaftaran menggunakan Firebase Authentication (Email/Password, Google, GitHub, dan Email Link).
*   **Favorit**: Pengguna dapat menyimpan manhwa favorit mereka.
*   **Riwayat Baca**: Aplikasi secara otomatis menyimpan chapter terakhir yang dibaca oleh pengguna.

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
    *   **Email Link (Passwordless Sign-in)**: Pada bagian **Email/Password**, pastikan untuk mencentang/mengaktifkan **"Email link (passwordless sign-in)"**. Ini sangat penting karena metode pendaftaran utama kini menggunakan Email Link (tanpa password).
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
    // Aturan untuk data pengguna dan semua sub-koleksinya (favorites, history, dll.)
    match /users/{userId}/{document=**} {
      // Pengguna dapat membaca dan menulis ke data mereka sendiri.
      // Admin juga dapat membaca dan menulis ke data pengguna mana pun.
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

    // Aturan untuk Room Chat
    match /chat_messages/{messageId} {
      // Hanya pengguna yang sudah login yang dapat membaca dan mengirim pesan
      allow read, create: if request.auth != null;
      // Pengguna hanya bisa mengedit atau menghapus pesannya sendiri
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Aturan untuk profil pengguna publik (untuk fitur @mention)
    match /user_profiles/{userId} {
      // Siapa saja bisa membaca profil publik untuk menampilkan daftar mention
      allow read: if true;
      // Pengguna hanya bisa membuat atau mengubah profilnya sendiri
      allow create, update: if request.auth != null && request.auth.uid == userId;
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

Setelah menyelesaikan semua langkah ini, aplikasi Anda akan sepenuhnya terhubung dengan Firebase.

---

## Konfigurasi Tambahan untuk Email Link (Wajib)

Fitur pendaftaran saat ini mewajibkan verifikasi email melalui link. Agar ini bekerja:

1.  **Aktifkan Email Link**:
    *   Pastikan opsi **"Email link (passwordless sign-in)"** sudah dicentang di Firebase Console > Authentication > Sign-in method > Email/Password.

2.  **Authorized Domains**:
    *   Buka Firebase Console, lalu navigasi ke **Authentication > Settings > Authorized domains**.
    *   Pastikan domain tempat aplikasi Anda berjalan terdaftar di sini. `localhost` sudah ada secara default. Jika Anda mendeploy aplikasi, tambahkan domain produksi Anda di sini.

3.  **Redirect URL**:
    *   Saat pengguna mengklik link di email, mereka akan diarahkan kembali ke aplikasi. Kode saat ini mengarahkan pengguna ke `{origin}/login`.
    *   Pastikan tidak ada aturan firewall atau pengaturan server yang memblokir akses ke URL dengan parameter query.

---

## Troubleshooting (Jika Email Tidak Masuk)

Jika Anda telah mengklik "Sign Up with Email" namun tidak menerima email:

1.  **Periksa Folder Spam/Junk**:
    *   Email dari Firebase sering kali masuk ke folder Spam atau Junk, terutama jika Anda menggunakan domain gratis (seperti `comicku-app.firebaseapp.com`) sebagai pengirim.

2.  **Periksa Quota**:
    *   Firebase Free Tier (Spark Plan) memiliki batas jumlah email yang dapat dikirim per hari. Periksa Firebase Console > Usage untuk melihat apakah Anda telah mencapai batas.

3.  **Verifikasi Pengaturan Provider**:
    *   Kembali ke Firebase Console > Authentication > Sign-in method > Email/Password.
    *   Pastikan **"Email link (passwordless sign-in)"** benar-benar statusnya **Enabled**.

4.  **Cek Console Browser**:
    *   Buka Developer Tools di browser Anda (Klik kanan > Inspect > Console).
    *   Lihat apakah ada pesan error berwarna merah saat Anda mengklik tombol Sign Up.
    *   Jika ada error `auth/operation-not-allowed`, artinya fitur Email Link belum diaktifkan di Firebase Console.
    *   Jika ada error `auth/unauthorized-domain`, artinya domain Anda belum ditambahkan ke Authorized Domains.

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
