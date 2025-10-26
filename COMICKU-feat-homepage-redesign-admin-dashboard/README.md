# COMICKU

Baca Komik lengkap hanya di Comic Ku

## Fitur Baru & Integrasi Firebase

Proyek ini telah diperbarui untuk menyertakan fitur-fitur berikut:

*   **Autentikasi Pengguna**: Sistem login dan pendaftaran menggunakan Firebase Authentication.
*   **Favorit**: Pengguna dapat menyimpan manhwa favorit mereka.
*   **Riwayat Baca**: Aplikasi secara otomatis menyimpan chapter terakhir yang dibaca oleh pengguna.
*   **Admin Dashboard**: Panel admin untuk mengelola bagian kutipan (quote section) di halaman utama.

Untuk menjalankan fitur-fitur ini, Anda perlu membuat dan mengkonfigurasi proyek Firebase Anda sendiri.

---

## Panduan Setup Firebase

Ikuti langkah-langkah di bawah ini untuk menghubungkan aplikasi ini ke Firebase.

### Langkah 1: Buat Proyek Firebase

1.  Buka [Firebase Console](https://console.firebase.google.com/).
2.  Klik **"Add project"** atau **"Buat proyek"**.
3.  Masukkan nama proyek (misalnya, `comicku-app`) dan ikuti langkah-langkah yang diberikan.

### Langkah 2: Buat Aplikasi Web

1.  Di *Project Overview*, klik ikon Web (`</>`) untuk menambahkan aplikasi web baru.
2.  Masukkan nama panggilan aplikasi ("COMICKU Web").
3.  Klik **"Register app"**. Salin objek `firebaseConfig` yang diberikan.

### Langkah 3: Aktifkan Authentication

1.  Buka **Build > Authentication**.
2.  Klik **"Get started"**.
3.  Aktifkan provider **"Email/Password"**.

### Langkah 4: Atur Firestore Database

1.  Buka **Build > Firestore Database**.
2.  Klik **"Create database"** dan mulai dalam **Production mode**.

### Langkah 5: Inisialisasi Admin & Pengaturan Otomatis

Aplikasi ini sekarang memiliki fitur inisialisasi otomatis. **Anda tidak perlu lagi menambahkan UID admin secara manual.**

1.  Setelah menyelesaikan semua langkah setup lainnya, jalankan aplikasi.
2.  Daftarkan akun baru atau login dengan akun yang sudah ada. **Akun pertama yang mengunjungi halaman `/admin` akan menjadi admin secara otomatis.**
3.  Kunjungi halaman `/admin`.
4.  Aplikasi akan secara otomatis membuat dokumen `settings` yang diperlukan di Firestore, menambahkan UID Anda ke daftar admin, dan mengisi bagian kutipan dengan data default.

### Langkah 6: Atur Aturan Keamanan (Security Rules)

1.  Buka tab **"Rules"** di Firestore.
2.  Ganti aturan yang ada dengan yang ini:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User data is private
    match /users/{userId}/{documents=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Dashboard settings can be read by anyone.
    // They can be created by any authenticated user if they don't exist yet.
    // They can only be updated by users whose UID is in the 'admins' array.
    match /dashboard/settings {
      allow read: if true;
      allow create: if request.auth != null && !exists(/databases/$(database)/documents/dashboard/settings);
      allow update: if request.auth != null && request.auth.uid in get(/databases/$(database)/documents/dashboard/settings).data.admins;
    }
  }
}
```

3.  Klik **"Publish"**.

### Langkah 7: Masukkan Konfigurasi Firebase ke Aplikasi

1.  Buat file `.env` di dalam folder `client`.
2.  Salin isi dari `client/.env.example` ke `client/.env`.
3.  Ganti nilai placeholder dengan `firebaseConfig` Anda.

Setelah ini, aplikasi Anda akan terhubung sepenuhnya ke Firebase.
