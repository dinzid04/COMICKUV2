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
    // Pengguna hanya bisa membaca/menulis data mereka sendiri
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
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
  }
}
```

3.  Klik **"Publish"** untuk menyimpan aturan baru. Aturan ini memastikan bahwa pengguna yang sudah login hanya dapat mengakses data mereka sendiri.

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

---

## Mengaktifkan Login Google & GitHub (OAuth)

Aplikasi ini mendukung login melalui Google dan GitHub. Berikut adalah cara mengkonfigurasinya.

### Konfigurasi Login Google

Login dengan Google dikelola sepenuhnya oleh Firebase, sehingga konfigurasinya sangat sederhana.

1.  Buka proyek Anda di **Firebase Console**.
2.  Navigasi ke **Build > Authentication > Sign-in method**.
3.  Klik **"Add new provider"** dan pilih **Google**.
4.  **Aktifkan** provider tersebut. Anda mungkin akan diminta untuk memasukkan nama proyek yang akan dilihat publik dan memilih email dukungan.
5.  Klik **"Save"**.

**Itu saja!** Firebase secara otomatis menangani Client ID, Client Secret, dan URL callback untuk Anda.

**Catatan Penting:** Anda **tidak perlu** mengunjungi Google Cloud Console atau mengkonfigurasi "Authorized redirect URIs" secara manual. Satu-satunya langkah otorisasi yang perlu Anda lakukan adalah menambahkan domain hosting Anda (misalnya, `comicku.dinzid.biz.id`) ke daftar **"Authorized domains"** di pengaturan Firebase Authentication (seperti yang dijelaskan di bawah).

### Konfigurasi Login GitHub

Login dengan GitHub memerlukan beberapa langkah manual untuk menghubungkan Firebase dengan aplikasi OAuth GitHub.

**Langkah 1: Dapatkan URL Callback dari Firebase**

1.  Di **Firebase Console**, navigasi ke **Build > Authentication > Sign-in method**.
2.  Klik **"Add new provider"** dan pilih **GitHub**.
3.  **Aktifkan** provider tersebut. Firebase akan menampilkan **URL callback otorisasi**. **Salin URL ini**; Anda akan memerlukannya di langkah berikutnya.
4.  **Biarkan halaman ini terbuka** karena Anda akan kembali untuk memasukkan Client ID dan Secret.

**Langkah 2: Buat Aplikasi OAuth di GitHub**

1.  Buka [GitHub Developer Settings](https://github.com/settings/developers) di tab browser baru.
2.  Klik **"New OAuth App"**.
3.  Isi formulir:
    *   **Application name**: Beri nama aplikasi Anda (misalnya, "COMICKU App").
    *   **Homepage URL**: Masukkan URL aplikasi Anda.
    *   **Authorization callback URL**: **Tempel URL callback** yang Anda salin dari Firebase.
4.  Klik **"Register application"**.

**Langkah 3: Dapatkan Client ID & Secret dari GitHub**

1.  Setelah aplikasi Anda dibuat, GitHub akan menampilkan halaman ringkasan.
2.  Anda akan melihat **Client ID**. Salin nilai ini.
3.  Klik **"Generate a new client secret"**. Salin secret yang baru dibuat.

**Langkah 4: Masukkan Kredensial GitHub ke Firebase**

1.  Kembali ke tab browser Firebase Anda.
2.  **Tempel Client ID** dan **Client Secret** yang Anda dapatkan dari GitHub ke dalam kolom yang sesuai.
3.  Klik **"Save"**.

### Langkah Penting: Otorisasi Domain Anda

Untuk kedua provider, Anda harus mengotorisasi domain tempat aplikasi Anda akan di-host.

1.  Di Firebase Console, navigasi ke **Build > Authentication > Settings**.
2.  Di bawah tab **"Authorized domains"**, klik **"Add domain"**.
3.  Masukkan domain tempat aplikasi Anda akan di-host (misalnya, `nama-aplikasi-anda.vercel.app` atau domain kustom Anda).
4.  `localhost` biasanya sudah diotorisasi secara default untuk pengujian lokal.

Setelah menyelesaikan langkah-langkah ini, pengguna akan dapat masuk ke aplikasi Anda menggunakan akun Google dan GitHub mereka.
