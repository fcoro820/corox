# 🚀 Corox CLI

**Corox** adalah tool command-line interaktif yang dirancang untuk mengotomatisasi workflow developer, menyediakan scaffolding proyek standar industri, dan diagnostik sistem secara instan.

![License](https://img.shields.io/npm/l/corox-cli)
![Version](https://img.shields.io/npm/v/corox-cli)
![Build](https://img.shields.io/badge/build-passing-brightgreen)

---

## ✨ Fitur Utama

### 🛠️ Advanced Project Scaffolder
Jangan mulai proyek Anda dari nol. Corox menyediakan generator struktur folder standar industri:
- **Express.js Enterprise**: Implementasi *Clean Architecture* (Domain, Application, Infrastructure).
- **TypeScript Library**: Struktur optimal untuk pembuatan package NPM.
- **Node.js Basic**: Template minimalis untuk automation script.

### 🖥️ System Diagnostics
Pantau kesehatan environment Anda dengan satu perintah. Corox menampilkan informasi hardware, OS, dan Node.js dalam dashboard tabular yang rapi.

### 🔌 Extensible Plugin System
Corox bukan sekadar tool, tapi sebuah platform. Anda bisa menambahkan fungsionalitas kustom tanpa menyentuh kode core melalui sistem plugin dynamic loading.

### 🛡️ Secure Env Management
Dukungan penuh terhadap `.env` dengan fitur masking untuk memastikan API Key Anda tetap aman saat diverifikasi.

---

## 📦 Instalasi

### ⚡ Cara Tercepat (via curl)
```bash
curl -sSL https://raw.githubusercontent.com/yourusername/corox/main/install.sh | bash
```

### 📦 Via NPM (Global)
```bash
npm install -g corox-cli
```

---

## 🛠️ Daftar Command

| Command | Deskripsi |
| :--- | :--- |
| `corox` | Membuka menu interaktif utama |
| `corox init` | Membuat project baru dengan template profesional |
| `corox sys-info` | Menampilkan dashboard informasi sistem |
| `corox env` | Verifikasi API Key yang terload dari `.env` |
| `corox config` | Mengatur preferensi dan tema CLI |
| `corox completions` | Menghasilkan script autocompletion untuk shell |

---

## 🏗️ Arsitektur

Corox dibangun dengan prinsip **Separation of Concerns**:
- **Core Router**: Mengelola routing command via `commander`.
- **Command Layer**: Logic terpisah untuk setiap aksi di `src/commands/`.
- **Utility Layer**: Standarisasi logging, API handler, dan env management.
- **Plugin Engine**: Dynamic loader untuk ekstensi pihak ketiga.

---

## 🤝 Kontribusi

Kontribusi sangat terbuka! Silakan buka *Issue* atau kirim *Pull Request* untuk meningkatkan Corox.

1. Clone repo ini.
2. Buat branch baru (`git checkout -b feature/AmazingFeature`).
3. Commit perubahan Anda (`git commit -m 'Add some AmazingFeature'`).
4. Push ke branch tersebut (`git push origin feature/AmazingFeature`).
5. Buka Pull Request.

## 📄 Lisensi
Distributed under the ISC License.
