# COMICKU

Baca Komik lengkap hanya di Comic Ku

## Fitur Baru & Integrasi Firebase

Proyek ini telah diperbarui untuk menyertakan fitur-fitur berikut:

*   **Autentikasi Pengguna**: Sistem login dan pendaftaran menggunakan Firebase Authentication.
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
3.  Di bawah tab **"Sign-in method"**, pilih dan aktifkan *provider* **"Email/Password"**.

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

3.  Klik **"Publish"** untuk menyimpan aturan baru. Aturan ini memastikan bahwa pengguna yang sudah login hanya dapat mengakses data mereka sendiri.

### Langkah 5.1: Buat Indeks Firestore

Untuk memastikan fungsionalitas komentar berjalan dengan lancar dan cepat, Anda perlu membuat *index* komposit di Firestore. Tanpa *index* ini, *query* untuk mengambil dan mengurutkan komentar akan gagal, menyebabkan komentar tidak muncul setelah halaman disegarkan.

1.  Di Firebase Console, buka **Build > Firestore Database**.
2.  Pilih tab **"Indexes"**.
3.  Klik **"Composite"** lalu **"Create index"**.
4.  Isi formulir dengan detail berikut:
    *   **Collection ID**: `comments`
    *   **Fields to index**:
        1.  `comicSlug` - `Ascending`
        2.  `createdAt` - `Descending`
    *   **Query scopes**: `Collection`
5.  Klik **"Create"**. Pembuatan *index* mungkin memerlukan beberapa menit. Setelah selesai, masalah komentar yang hilang akan teratasi.

Anda juga perlu membuat *index* lain untuk fitur **Room Chat**:

1.  Klik **"Create index"** lagi.
2.  Isi formulir dengan detail berikut:
    *   **Collection ID**: `chat_messages`
    *   **Fields to index**:
        1.  `createdAt` - `Ascending`
    *   **Query scopes**: `Collection`
3.  Klik **"Create"**. *Index* ini memastikan pesan di *room chat* dapat diambil dan diurutkan berdasarkan waktu dengan efisien.

### Langkah 6: Masukkan Konfigurasi Firebase ke Aplikasi

1.  Buka file `client/src/firebaseConfig.ts` di proyek ini.
2.  Anda akan melihat objek `firebaseConfig` dengan nilai *placeholder*.
3.  Ganti nilai-nilai *placeholder* tersebut dengan objek `firebaseConfig` yang Anda salin dari Firebase pada **Langkah 2**.
4.  Simpan file tersebut.

Setelah menyelesaikan semua langkah ini, aplikasi Anda akan sepenuhnya terhubung dengan Firebase. Anda bisa menjalankan aplikasi secara lokal dan semua fitur autentikasi, favorit, dan riwayat akan berfungsi.

---

## Konfigurasi Admin

Untuk mengakses dasbor admin, Anda perlu menambahkan UID pengguna Anda ke dalam daftar admin.

1.  **Dapatkan UID Pengguna**:
    *   Login ke aplikasi Anda dengan akun yang ingin Anda jadikan admin.
    *   Buka Firebase Console, lalu navigasi ke **Authentication > Users**.
    *   Salin UID dari akun yang baru saja Anda gunakan untuk login.

2.  **Tambahkan UID ke Kode**:
    *   Buka file `client/src/hooks/use-admin.ts`.
    *   Ganti `'YOUR_ADMIN_UID_HERE'` dengan UID yang telah Anda salin. Anda bisa menambahkan beberapa UID jika diperlukan.

    ```typescript
    const ADMIN_UIDS = ['UID_ADMIN_1', 'UID_ADMIN_2']; // Ganti dengan UID admin Anda
    ```

Setelah menyimpan perubahan, pengguna dengan UID tersebut akan memiliki akses ke dasbor admin di `/admin`.

### Langkah 7: Siapkan Koleksi Admin untuk Verifikasi Pengguna

Fitur verifikasi pengguna (centang biru/lencana admin) dikelola melalui koleksi khusus di Firestore.

1.  **Buat Koleksi `admins`**:
    *   Di Firebase Console, buka **Firestore Database**.
    *   Klik **"Start collection"**.
    *   Masukkan `admins` sebagai **Collection ID**.

2.  **Tambahkan Admin Pertama Anda**:
    *   Klik **"Add document"**.
    *   Untuk **Document ID**, gunakan UID pengguna yang ingin Anda jadikan admin (Anda bisa mendapatkannya dari tab **Authentication**).
    *   Untuk *field* di dalam dokumen, tambahkan *field* `isAdmin` dengan tipe `Boolean` dan atur nilainya ke `true`. Dokumennya bisa dibiarkan kosong jika Anda mau; yang penting adalah keberadaan dokumen dengan ID yang benar.
    *   Ulangi proses ini untuk setiap pengguna yang ingin Anda berikan hak admin.

Pendekatan ini lebih aman daripada menyimpan daftar UID admin di dalam kode aplikasi dan memungkinkan Anda mengelola admin secara dinamis langsung dari Firebase Console.

---

## Mengaktifkan Login Google & GitHub (OAuth)

Aplikasi ini mendukung login melalui Google dan GitHub. Untuk mengaktifkannya, ikuti langkah-langkah berikut di Firebase Console.

### Langkah 1: Aktifkan Penyedia OAuth

1.  Buka proyek Anda di **Firebase Console**.
2.  Navigasi ke **Build > Authentication > Sign-in method**.
3.  Klik **"Add new provider"**.
4.  Pilih **Google** dan aktifkan. Anda mungkin perlu memberikan nama proyek publik dan email dukungan.
5.  Ulangi proses untuk **GitHub**. Anda harus memberikan **Client ID** dan **Client secret** dari aplikasi OAuth GitHub Anda.
    *   Untuk mendapatkan kredensial ini, buat aplikasi OAuth baru di [GitHub Developer Settings](https://github.com/settings/developers).
    *   Saat membuat aplikasi, GitHub akan meminta **Authorization callback URL**. Firebase akan menyediakan URL ini untuk Anda salin dan tempel di pengaturan aplikasi GitHub Anda.

### Langkah 2: Otorisasi Domain Anda

Penting untuk mengotorisasi domain tempat Anda akan menerapkan aplikasi agar Firebase dapat menangani callback OAuth dengan aman.

1.  Di Firebase Console, navigasi ke **Build > Authentication > Settings**.
2.  Di bawah tab **"Authorized domains"**, klik **"Add domain"**.
3.  Masukkan domain tempat aplikasi Anda akan di-host (misalnya, `your-app-name.vercel.app` atau domain kustom Anda).
4.  Jika Anda melakukan pengujian secara lokal, `localhost` biasanya sudah diotorisasi secara default.

Setelah menyelesaikan langkah-langkah ini, pengguna akan dapat masuk ke aplikasi Anda menggunakan akun Google atau GitHub mereka.
