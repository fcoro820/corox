# 🚀 Corox CLI Development Roadmap

Dokumen ini berisi rencana pembangunan proyek **Corox**, sebuah CLI interaktif yang dirancang untuk meningkatkan efisiensi workflow.

## 🟢 Phase 1: Foundation & Core UX (Completed)
*Tujuan: Memastikan stabilitas dasar dan pengalaman pengguna yang mulus.*

- [x] Inisialisasi proyek dengan TypeScript & ES Modules.
- [x] Implementasi `commander` untuk parsing argument.
- [x] Implementasi `inquirer` untuk menu interaktif.
- [x] Integrasi `chalk` dan `ora` untuk visual feedback.
- [x] **Refactoring Arsitektur**: Memisahkan logic command ke folder `src/commands/`.
- [x] **Error Handling Global**: Wrapper `runSafe` untuk menangani crash.
- [x] **Config System**: Implementasi `conf` untuk penyimpanan preferensi lokal.

## 🟡 Phase 2: Feature Expansion (Completed)
*Tujuan: Memberikan nilai guna nyata bagi pengguna.*

- [x] **Project Generator**: Pembuatan folder dan file template nyata.
- [x] **System Integration**: Command `sys-info` untuk info sistem.
- [x] **API Integration**: Simulasi cek update versi terbaru.
- [x] **Advanced Prompts**: Implementasi `checkbox` untuk multi-select template.
- [x] **Environment Support**: Integrasi `dotenv` untuk mendukung API Keys dan variabel lingkungan.

## 🟠 Phase 3: Quality Assurance & DX (Completed)
*Tujuan: Memastikan kode berkualitas tinggi dan mudah didistribusikan.*

- [x] **Testing Suite**: Implementasi unit testing dengan `Vitest`.
- [x] **Comprehensive README**: Dokumentasi lengkap instalasi dan penggunaan.
- [x] **Build Pipeline**: Optimasi `tsc` untuk output produksi di folder `dist/`.
- [x] **Version Management**: Pembacaan versi dari `package.json`.

## 🔴 Phase 4: Advanced Capabilities (Completed)
*Tujuan: Menjadikan Corox sebagai tool CLI kelas profesional.*

- [x] **Plugin System**: Dynamic loading plugins dari `~/.corox/plugins`.
- [x] **Shell Autocompletion**: Command `completions` untuk bash/zsh.
- [x] **Interactive Dashboard**: Tampilan tabular menggunakan `cli-table3`.
- [x] **Telemetry**: Pencatatan penggunaan fitur ke `~/.corox/usage.log`.

## 🔵 Phase 5: Polishing & Maintenance (Completed)
*Tujuan: Mencapai kesempurnaan teknis dan stabilitas jangka panjang.*

- [x] **Refactor Menu Loop**: Mengubah rekursi `mainMenu` menjadi `while` loop.
- [x] **Expand Test Coverage**: Menambahkan unit test untuk `env.ts` dan `plugin-loader.ts`.
- [x] **Plugin Metadata**: Menambahkan support untuk nama, versi, dan deskripsi pada plugin melalui `CoroxPlugin` interface.
- [x] **Advanced Telemetry**: Mengubah log file menjadi format JSON untuk analisis yang lebih mudah.

## 🟣 Phase 6: Product Evolution (Must to Do Next)
*Tujuan: Mengubah framework CLI menjadi tool produktivitas yang memberikan value nyata.*

- [ ] **Binary Distribution**: Implementasi packaging menjadi single binary (menggunakan `pkg` atau `bun`).
- [ ] **Plugin Manager**: Command untuk install/uninstall/update plugin secara otomatis.
- [ ] **Real Toolsets Implementation**:
    - [ ] Project Scaffolding yang lebih advance.
    - [ ] API Request Tester (Curl-like interface).
    - [ ] File system cleaner/optimizer.
- [ ] **CI/CD Pipeline**: Setup GitHub Actions untuk Automated Testing & Build.
- [ ] **Interactive Help System**: Dokumentasi command yang lebih detail dan dinamis.


---

## 🛠️ Tech Stack Summary
- **Language**: TypeScript
- **Runtime**: Node.js
- **Parsing**: Commander.js
- **Interactive**: Inquirer.js
- **Styling**: Chalk, Ora, cli-table3
- **Config**: `conf`
- **Environment**: `dotenv`
- **Testing**: Vitest
