# 📋 ÜRÜN GELİŞTİRME PROJESİ — FİKİR ONAY DOKÜMANI

> **Öğrenci Adı Soyadı:** Elif Toros
> **Öğrenci Numarası:** 22253012
> **Tarih:** 10/03/2026

---

## 1. 🏷️ Ürün İsmi

| Alan | Açıklama |
| :--- | :--- |
| **Ürün İsmi** | eventApp |
| **İsmin Anlamı / Hikayesi** | İngilizce "Event" (Etkinlik) ve "App" (Uygulama) kelimelerinin doğrudan ve net birleşimidir. Kullanıcıların platformun amacını ilk bakışta anlamasını sağlamak için karmaşadan uzak, işlevselliği ön planda tutan sade bir isim tercih edilmiştir. |
| **Slogan** | Kendi etkinliklerini oluştur veya yeni deneyimlere katıl. |

## 2. 🎨 Ürün Markası

| Alan | Açıklama |
| :--- | :--- |
| **Marka Adı** | EventApp |
| **Marka Kimliği** | Yenilikçi, dinamik ve kullanıcı dostu. Hem etkinlik düzenleyenlere kontrol gücü veren hem de katılımcılara pürüzsüz bir sosyalleşme aracı sunan modern bir yapı. |
| **Hedef Kitle Algısı** | "Hızlı, güvenilir ve trend bir buluşma noktası" algısı yaratmak. Arayüzdeki karanlık tema (dark mode) ile kullanıcılara premium ve teknolojik bir his vermek. |
| **Marka Renk Paleti** | Ana renk: Koyu Gri/Siyah (#09090b - Zinc 950)<br>Yardımcı renkler: Mavi (#3b82f6), Mor (#8b5cf6) ve Pembe (#f472b6) |
| **Tipografi** | 'Outfit' Sans-Serif font ailesi |

## 3. 🌐 Domain (Alan Adı) Kontrolü

| Alan | Açıklama |
| :--- | :--- |
| **Birincil Domain** | joineventapp.com |
| **Domain Müsait mi?** | Evet — Kontrol tarihi: 10/03/2026 |
| **Kontrol Yapılan Site** | whois.com |

*(Buraya domain ekran görüntüsünü ekleyebilirsin: `![Domain Kontrolü](./images/domain.png)`)*

## 5. 📊 Ürün Tanımı ve Problem Çözümü

### 5.1 Ürün Ne İş Yapar?
EventApp, insanların çevrelerindeki yeni etkinlikleri keşfetmesini ve kendi organizasyonlarını kolayca yönetmesini sağlayan dijital bir buluşma noktasıdır. Günümüzde bir etkinlik düzenlemek —kimlerin geleceğini takip etmek, kontenjanı ayarlamak ve duyuru yapmak— WhatsApp veya Telegram grupları üzerinden yürütülmeye çalışıldığında büyük bir karmaşaya dönüşür. Sosyalleşmek veya yeni deneyimler yaşamak isteyen katılımcılar için de etkinlikleri derli toplu görebilecekleri tek bir mecra yoktur.

EventApp tam olarak bu iletişim ve yönetim kopukluğunu çözer. Organizatörlere, etkinlikleri için katılımcı listesini, kapasiteyi ve afişleri yönetecekleri düzenli bir kontrol paneli sunar. Katılımcılara ise ilgi alanlarına uyan etkinlikleri görüp tek tıkla bilet/kayıt alma imkânı tanır. Kısacası EventApp, etkinlik planlamanın stresini ortadan kaldırır.

### 5.2 Kullanıcı Persona
- **Adı:** Elif
- **Yaşı:** 23
- **Mesleği:** Bilgisayar Mühendisliği Öğrencisi ve Öğrenci Kulübü Yöneticisi
- **Günlük Rutini:** Gününün büyük kısmı kampüste derslerde veya bilgisayar başında proje geliştirerek geçiyor. Akademik hayatının dışında sosyalleşmeye büyük önem veriyor. Hafta sonları yakın arkadaş grubu ile voleybol maçı organize etmeyi, hafta içi ise üyesi olduğu teknoloji kulübüyle siber güvenlik odaklı CTF yarışmaları düzenlemeyi seviyor.
- **Karşılaştığı Problem:** İster 10 kişilik bir voleybol maçı olsun, ister laboratuvarda düzenlenecek 50 kişilik bir CTF yarışması olsun; kimlerin kesin olarak geleceğini takip etmek onu çok zorluyor. WhatsApp'taki "ben de geliyorum", "yer kaldı mı?" mesajları arasında kayboluyor.
- **Ürünü Nasıl Kullanacak:** Elif, EventApp'e girerek "Bahar Dönemi CTF Yarışması" adında bir etkinlik oluşturur. Tarihi, yeri ve (örneğin 50 kişilik) katılımcı limitini belirler. Etkinliğin linkini kulüp grubuna gönderir. Katılmak isteyenler tek tıkla kayıt olur. Limit dolduğunda sistem otomatik olarak yeni kayıtları durdurur. Elif hiçbir karmaşa yaşamadan organizasyonunun tadını çıkarır.
- ## 7. 🛠️ Teknolojik Altyapı

### 7.1 Backend (Sunucu Tarafı)
| Alan | Seçim | Gerekçe |
| :--- | :--- | :--- |
| **Programlama Dili** | TypeScript | Tip güvenliği (type-safety) sağlayarak çalışma zamanı hatalarını aza indirmesi ve OOP desteği vermesi. |
| **Framework** | NestJS | Modüler mimarisi sayesinde projenin ölçeklenebilir olması, Prisma ve JWT ile yerleşik uyumluluk sağlaması. |
| **Veritabanı** | SQLite | Sunucu kurulumu gerektirmemesi, Prisma ORM ile kusursuz çalışması ve taşınabilir olması. |
| **API Mimarisi** | REST | İstemci ve Sunucu arasındaki veri alışverişini standart HTTP metodları ile en hızlı şekilde sağlaması. |
| **Kimlik Doğrulama** | JWT | Sunucu tarafında oturum tutmaya gerek kalmadan, token tabanlı ve güvenli (stateless) bir yetkilendirme sunması. |

### 7.2 Frontend (Ön Yüz) — Web
| Alan | Seçim | Gerekçe |
| :--- | :--- | :--- |
| **Programlama Dili** | JavaScript | React ekosistemiyle doğrudan uyumlu olması ve hızlı, dinamik web arayüzleri geliştirmeye olanak tanıması. |
| **Framework / Kütüphane** | React | Komponent tabanlı yapısı sayesinde kod tekrarını önlemesi ve sanal DOM ile yüksek performans sunması. |
| **CSS Framework** | Tailwind CSS | Ayrı CSS dosyaları yazmaya gerek kalmadan, doğrudan HTML/JSX içinde çok hızlı ve modern arayüzler tasarlamayı sağlaması. |
| **State Management** | Context API | Harici bir kütüphaneye (Redux vb.) ihtiyaç duymadan, kullanıcı oturumu (Auth) gibi global durumları kendi içinde yönetmesi. |

### 7.3 Mobil Uygulama & 7.4 DevOps
- **Mobil Yaklaşım:** Cross-platform (React Native) - Tek kod tabanı ile hem iOS hem Android desteği.
- **Versiyon Kontrolü:** Git & GitHub (Zorunlu)
- **Konteynerizasyon:** Docker + Docker Compose (Zorunlu)

> ⚠️ **Önemli Not:** Proje ilk günden itibaren Docker ile konteynerize edilmiş şekilde geliştirilecektir. Depodan `git pull` yapıldıktan sonra proje aşağıdaki komutla ayağa kalkmalıdır:
> ```bash
> docker-compose up --build
> ```

## 4. 💰 Paketleme Modeli (Free & Premium)

### 4.1 Free (Ücretsiz) Paket
- **Sınırlı Etkinlik Katılımı/Oluşturma:** Ayda en fazla 3 farklı etkinliğe kayıt veya oluşturma hakkı.
- **Standart Listeleme & Temel İstatistik:** Sadece toplam kişi sayısını görme.
- **Kısıtlamalar:** Reklam gösterimi, katılımcı listesini bilgisayara indirme (export) kapalı.

### 4.2 Premium (Ücretli) Paket — 49.90 ₺/Ay
- **Sınırsız Katılım:** Aylık 3 etkinlik limiti tamamen kaldırılır.
- **Detaylı Katılımcı Listesi:** Katılanların ad-soyad listesini açıkça görebilme.
- **Özel Afiş Yükleme & Öne Çıkanlar Vitrini:** Etkinlikler ana sayfada üstte listelenir.
- **Ekstra:** Premium/Onaylı rozeti, reklamsız deneyim.

**Neden Bir Kullanıcı Bunun İçin Para Öder?**
Üniversite kulüpleri, topluluk liderleri veya sosyal çevresi geniş kişiler için ayda 3 etkinlik kotası oldukça yetersiz kalacaktır. Kendi etkinliğini markalaştırmak ve "Öne Çıkanlar" vitrininde yer almak isteyen organizatörler için 49.90 ₺ mikro-ödeme son derece rasyonel bir bedeldir.
