# God Codex Pipeline v0.9 — Kullanıcı Kılavuzu

**Versiyon:** v0.9 (Persistent Backend)  
**Tarih:** 24 Aralık 2025  
**Hedef Kitle:** Operatörler, Geliştiriciler

---

## 1. Ürün Nedir?

**God Codex**, çoklu AI ajanlarının (Agent Squad) belirli bir hedefe yönelik koordineli çalışmasını sağlayan bir orkestrasyon motorudur. "Tek bir prompt yazayım, AI bana çıktı versin" yerine; bir görevi planlayan (**Planner**), parçaları üreten (**Producer**) ve kalite kontrolü yapan (**QA**) özel ajanları yönetir.

**Ne Çözer?**
- Karmaşık işleri (örn. tüm bir dokümantasyon seti yazmak) yönetilebilir parçalara böler.
- Deterministik Kalite Kontrol (QA) ile sadece belirli standartları geçen çıktıları onaylar.
- Durum bilgisini (State) veritabanında tutar; tarayıcıyı kapatsanız bile iş kaldığı yerden devam eder.

---

## 2. Mimari Genel Bakış

Sistem 4 ana bileşenden oluşur:

1.  **UI (Kullanıcı Arayüzü):** Next.js App Router üzerinde çalışan, işleri başlatan ve izleyen paneller (`PhaseDetail`, `RunConsole`).
2.  **API Katmanı:** Frontend ile Backend arasındaki köprü (`/api/runs/*`). İş emirlerini veritabanına yazar.
3.  **Veritabanı (SQLite):** Tüm işlerin (Jobs), çıktıların (Artifacts) ve değerlendirmelerin (Evaluations) saklandığı kalıcı hafıza.
4.  **Worker (İşçi):** Arka planda çalışan, "beyin" görevi gören Node.js süreci (`scripts/worker.ts`). Planlama, Üretim ve QA işlerini sırayla işler.

**Akış Şeması:**
`AUTO RUN` (UI) -> `API` -> `DB` (Pending Job) -> `WORKER` (Process) -> `GEMINI API` (Generate) -> `DB` (Save) -> `UI` (Update)

---

## 3. Kurulum Önkoşulları

Sistemi çalıştırmadan önce şunların hazır olduğundan emin olun:

1.  **Node.js & NPM:** (v18+ önerilir)
2.  **Veritabanı Dosyası:** Proje kök dizininde SQLite dosyası (`dev.db` veya benzeri).
3.  **.env Dosyası:** Aşağıdaki anahtarları içermelidir:
    ```ini
    DATABASE_URL="file:./dev.db"
    GEMINI_API_KEY="AI_API_ANAHTARINIZ"
    ```

**İlk Kurulum Komutları:**
```bash
# Bağımlılıkları yükle
npm install

# Veritabanı şemasını oluştur (Eğer db yoksa)
npx prisma migrate dev --name init
```

---

## 4. Hızlı Başlangıç (5 Dakikada Çalıştır)

Sistemi ayağa kaldırmak için **iki** terminal penceresine ihtiyacınız var.

**Terminal 1: Web Sunucusu**
```bash
npm run dev
# http://localhost:3000 adresinde çalışır
```

**Terminal 2: Worker (İşçi)**
```bash
npx tsx scripts/worker.ts
# veya geliştirme modunda (dosya değişince restart atar):
npx tsx watch scripts/worker.ts
```

*Not: Worker çalışmazsa, işler "Pending" durumunda takılı kalır.*

---

## 5. Kullanım

### Adım 1: Proje/Faz Sayfasına Git
Tarayıcıda `http://localhost:3000/projects/demo/phases/m1` (veya `m2`, `m3`) adresine gidin.

### Adım 2: Auto Run Başlat
Sayfadaki **AUTO RUN** butonuna basın.

### Adım 3: İzleme
**Run Console** panelinden süreci takip edin:
1.  **PLANNING:** Ajan yapılacak işlerin listesini çıkarır.
2.  **PRODUCING:** Ajanlar içerikleri üretir (Artifact listesi dolar).
3.  **QA:** Üretilen içerikler değerlendirilir (Pass/Fail).
4.  **DONE:** Süreç tamamlanır.

### Adım 4: Sonuçları İnceleme
- **Artifacts List:** Üretilen dosyalar. Her birinin yanında QA rozeti (PASS/FAIL) ve puanı bulunur.
- **Preview:** Bir dosyaya tıkladığınızda içeriğini ve detaylı QA raporunu sağ panelde görürsünüz.
- **FINAL ARTIFACT:** Eğer QA'den geçen başarılı bir iş varsa, yeşil "FINAL" rozeti ile işaretlenir.

---

## 6. Kritik Konsept: Final Artifact Mantığı

**"Neden FINAL ARTIFACT READY görmüyorum?"**

Sistem, **"Sadece en iyisi kazanır"** mantığıyla çalışır; ancak bir şartla: **Barajı geçmek zorundadır.**

- **Kural:** Bir artifact'ın "Final" seçilmesi için Rubric (Değerlendirme Kriterleri) üzerinden **PASS** notu (genellikle 70/100 üzeri) alması gerekir.
- **Durum:** Eğer üretilen **tüm** artifact'lar 70 puanın altında kalırsa (FAIL), sistem hiçbirini "Final" olarak işaretlemez.
- **Sonuç:** UI'da **"NO PASSING ARTIFACT"** uyarısı görürsünüz. Bu bir hata değil, **kalite standardıdır**.

---

## 7. Operasyon Notları

- **Worker Restart:** Kodda bir değişiklik yaptığınızda veya worker takıldığında terminalde `Ctrl+C` yapıp tekrar `npx tsx scripts/worker.ts` komutunu çalıştırın.
- **Log Takibi:** Worker terminalindeki loglar (`[Producer] ...`, `[QA] ...`) en doğru bilgi kaynağıdır. UI gecikmeli olabilir, terminal gerçektir.
- **State Persistence:** İşlemler veritabanına yazıldığı için sayfayı yenileseniz veya sunucuyu kapatıp açsanız bile, işlediği son durum (örn. DONE) korunur.

---

## 8. Sık Karşılaşılan Sorunlar (Troubleshooting)

### 1) "Demo oluşturdum ama ilerlemiyor, statü PLANNING'de kaldı"
**Muhtemel neden:** Worker çalışmıyor (arka plan işçisi yoksa job'lar tüketilmez).
**Çözüm:**
1. Terminalde worker'ın açık olduğundan emin ol:
   ```bash
   npx tsx scripts/worker.ts
   ```
2. Worker loglarında job'ların işlendiğini görmelisin (`RUNNING` / `SUCCEEDED`).
3. Dashboard/Projects sayfasını yenile → statü akmaya başlamalı.

### 2) "Stuck at PRODUCING / QA"
**Muhtemel neden:** Geçici API hatası, provider timeout'u, veya önceki worker sürümü açık kalmış olabilir.
**Çözüm (en hızlı):**
1. Worker terminalinde durdur: `Ctrl + C`
2. Yeniden başlat: `npx tsx scripts/worker.ts`
*Not: Sistem idempotenttir — restart sonrası kaldığı yerden devam eder.*

### 3) "FINAL Artifact yok (No Winner)"
**Muhtemel neden:** Üretilen hiçbir OUTPUT artifact, QA rubric'inden PASS alamamıştır. Bu durumda `finalArtifactId = null` olur ve FINAL seçilmez.
**Çözüm:**
1. Runner ekranındaki QA skorlarına bakın.
2. Şunlardan birini yapın:
   - Prompt'u iyileştirin (daha net hedef, format, kısıtlar).
   - Rubric kriterlerini/threshold'u güncelleyin (ürün politikasına göre).
   - "Yeniden Üret / Yeniden Başlat" akışını çalıştırın (varsa UI CTA).
*Beklenen davranış: PASS yoksa FINAL yoktur — bu bir hata değil, kalite filtresidir.*

### 4) "Sidebar linkleri çalışmıyor / sayfalar boş"
**Durum:** Planlayıcı, RACI, İş Listesi, Rol Tanımları, Zaman Çizelgesi, SSS gibi sayfalar şu an Placeholder (Yapım Aşamasında) olabilir.
**Açıklama:** v0.9 odak noktası "pipeline engine + dashboard shell" idi. Bu sayfalar v1.0 backlog'undadır.

### 5) "Hydration failed / console'da HTML mismatch görüyorum"
**Muhtemel neden:** Tarayıcı eklentileri DOM'a `data-*` attribute ekleyebilir veya SSR/CSR farklı render üretebilir.
**Çözüm:**
1. Gizli pencere (Incognito) ile test edin.
2. Şüpheli eklentileri kapatın.

---

## 9. Hızlı Teşhis Komutları (Diagnostics)

Operatörler için sistem durumunu terminalden hızlıca sorgulama komutları.

### Worker Durumu
```bash
# İşlerin durumunu canlı izle (SQL)
npx prisma studio
# veya CLI ile son 5 job:
sqlite3 dev.db "SELECT type, status, updatedAt FROM Job ORDER BY createdAt DESC LIMIT 5;"
```

### Run Takibi
```bash
# Takılı kalan Run var mı? (PLANNING veya PRODUCING modunda 5 dakikadan uzun sürenler)
sqlite3 dev.db "SELECT id, status, createdAt FROM Run WHERE status NOT IN ('DONE','ERROR') AND createdAt < datetime('now', '-5 minutes');"
```

### Artifact Kalitesi
```bash
# Son üretilen artifactlar ve QA sonuçları
sqlite3 dev.db "SELECT id, fileName, qaStatus FROM Artifact ORDER BY createdAt DESC LIMIT 5;"
```

---

## 9. Green Test Protokolü (Doğrulama)

Sistemin %100 çalıştığını doğrulamak için şu adımları izleyin:

1.  **Temiz Sayfa:** `/phases/m4` (veya kullanılmamış bir ID) açın.
2.  **Komut:** `AUTO RUN` butonuna tıklayın.
3.  **Beklenti:** 
    - [ ] Status: `PLANNING` -> `PRODUCING` -> `QA` -> `DONE` (Otomatik akmalı).
    - [ ] Artifact listesi dolmalı.
    - [ ] QA puanları görünmeli.
4.  **Kontrol:** Sayfayı yenileyin (Refresh). Status `DONE` olarak kalmalı.

**Tebrikler!** God Codex Pipeline v0.9 başarıyla çalışıyor.
