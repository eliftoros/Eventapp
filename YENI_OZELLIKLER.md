# Event App - Rol Bazlı Yetkilendirme ve Fotoğraf Yükleme Özellikleri

## 🎯 Özellikler

### 1. Rol Bazlı Yetkilendirme

#### **ADMIN (Yönetici)**
- ✅ Tüm kullanıcıların rollerini değiştirebilir
- ✅ Tüm eventleri görebilir ve silebilir
- ✅ City, Location, Category oluşturabilir
- ✅ Event oluşturabilir ve düzenleyebilir
- ✅ Başkalarının eventlerini silebilir

#### **ORGANIZER (Organizatör)**
- ✅ Sadece kendi eventlerini görebilir
- ✅ Event oluşturabilir
- ✅ Sadece kendi eventlerini düzenleyebilir
- ✅ Sadece kendi eventlerini silebilir
- ✅ Event'lere fotoğraf yükleyebilir
- ❌ Başkalarının eventlerini silemez/düzenleyemez

#### **USER (Katılımcı)**
- ✅ Tüm eventleri görebilir
- ✅ Event'lere katılabilir
- ✅ Katıldığı eventlerden ayrılabilir
- ❌ Event oluşturamaz
- ❌ Event düzenleyemez/silemez

---

## 📁 Yeni Eklenen Dosyalar

### Backend
1. **`/backend/src/config/multer.config.ts`** - Fotoğraf yükleme yapılandırması
2. **`/backend/uploads/`** - Yüklenen fotoğrafların saklandığı klasör

### Frontend
1. **`/frontend/src/pages/EventManagement.jsx`** - Event yönetim sayfası (Admin & Organizer)

---

## 🔧 Backend Değişiklikleri

### 1. Events Controller (`events.controller.ts`)
```typescript
// Yeni endpoint: Fotoğraf yükleme
POST /events/upload
- Sadece ADMIN ve ORGANIZER erişebilir
- Multer ile dosya yükleme
- Max 5MB, sadece resim formatları (jpg, jpeg, png, gif, webp)

// Güncellenen endpoint: Event'den ayrılma
DELETE /events/:id/leave
- Kullanıcı katıldığı eventlerden ayrılabilir
```

### 2. Events Service (`events.service.ts`)
```typescript
// Yeni method
async leaveEvent(userId: number, eventId: number)
- Kullanıcının event katılımını siler
```

### 3. Main.ts
```typescript
// Static file serving eklendi
app.useStaticAssets(join(__dirname, '..', 'uploads'), {
  prefix: '/uploads/',
});
```

---

## 🎨 Frontend Değişiklikleri

### 1. Event Management Sayfası (`EventManagement.jsx`)
**Özellikler:**
- Event oluşturma/düzenleme modal'ı
- Fotoğraf yükleme (drag & drop veya file input)
- Rol bazlı event filtreleme
- CRUD işlemleri (Create, Read, Update, Delete)
- Responsive tasarım

**Erişim:**
- URL: `/events`
- Sadece ADMIN ve ORGANIZER erişebilir

### 2. Home Sayfası (`Home.jsx`)
**Güncellemeler:**
- Event fotoğraflarını gösterme
- Join/Leave event butonları (sadece USER için)
- Katılım durumu kontrolü

### 3. Layout (`Layout.jsx`)
**Yeni Navigasyon Linkleri:**
- Admin Panel (sadece ADMIN)
- My Events (ADMIN ve ORGANIZER)

### 4. App.jsx
**Yeni Route:**
```javascript
<Route path="events" element={
  <PrivateRoute allowedRoles={['ADMIN', 'ORGANIZER']}>
    <EventManagement />
  </PrivateRoute>
} />
```

### 5. Admin Dashboard (`AdminDashboard.jsx`)
**Yeni Tab:**
- **Users** - Kullanıcı yönetimi
  - Tüm kullanıcıları listeleme
  - Rol değiştirme (USER ↔ ORGANIZER ↔ ADMIN)

---

## 🚀 Kullanım Kılavuzu

### Admin Olarak Giriş Yapma

1. **Yeni Admin Oluşturma:**
```bash
POST http://localhost:3000/auth/register
{
  "email": "admin@example.com",
  "password": "admin123",
  "name": "Admin User",
  "role": "ADMIN"
}
```

2. **Giriş Yapma:**
```bash
POST http://localhost:3000/auth/login
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

### Fotoğraf Yükleme

1. Event Management sayfasına git (`/events`)
2. "Create Event" veya bir event'i düzenle
3. "Upload Image" butonuna tıkla
4. Fotoğraf seç (max 5MB)
5. Fotoğraf otomatik yüklenir
6. Event'i kaydet

### Rol Değiştirme (Sadece Admin)

1. Admin Dashboard'a git (`/admin`)
2. "Users" tab'ına tıkla
3. Kullanıcının yanındaki dropdown'dan yeni rol seç
4. Otomatik olarak güncellenir

---

## 📊 API Endpoints

### Events
```
GET    /events              - Tüm eventleri listele
GET    /events/:id          - Tek event detayı
POST   /events              - Event oluştur (ADMIN, ORGANIZER)
POST   /events/upload       - Fotoğraf yükle (ADMIN, ORGANIZER)
POST   /events/:id/join     - Event'e katıl (Tüm kullanıcılar)
DELETE /events/:id/leave    - Event'den ayrıl (Tüm kullanıcılar)
PATCH  /events/:id          - Event güncelle (ADMIN, ORGANIZER - sadece kendi eventi)
DELETE /events/:id          - Event sil (ADMIN, ORGANIZER - sadece kendi eventi)
```

### Users
```
GET    /users               - Tüm kullanıcıları listele (ADMIN)
GET    /users/profile       - Kendi profilini getir
PATCH  /users/:id/role      - Kullanıcı rolünü değiştir (ADMIN)
```

---

## 🔒 Güvenlik Kuralları

1. **Event Oluşturma:** Sadece ADMIN ve ORGANIZER
2. **Event Düzenleme:** 
   - ADMIN: Tüm eventleri düzenleyebilir
   - ORGANIZER: Sadece kendi eventlerini düzenleyebilir
3. **Event Silme:**
   - ADMIN: Tüm eventleri silebilir
   - ORGANIZER: Sadece kendi eventlerini silebilir
4. **Rol Değiştirme:** Sadece ADMIN
5. **Fotoğraf Yükleme:** Sadece ADMIN ve ORGANIZER

---

## 📝 Notlar

- Fotoğraflar `/backend/uploads/` klasöründe saklanır
- Fotoğraf URL formatı: `http://localhost:3000/uploads/event-{timestamp}-{random}.{ext}`
- Max dosya boyutu: 5MB
- Desteklenen formatlar: JPG, JPEG, PNG, GIF, WEBP
- USER rolündeki kullanıcılar sadece event'lere katılabilir/ayrılabilir

---

## 🎨 UI/UX Özellikleri

- Modern, dark theme tasarım
- Smooth animasyonlar (Framer Motion)
- Responsive design (mobil uyumlu)
- Modal popup'lar
- Drag & drop fotoğraf yükleme
- Real-time rol değiştirme
- Color-coded rol badge'leri
- Hover efektleri ve transitions

---

## 🐛 Bilinen Sorunlar ve Çözümler

**Sorun:** Backend başlatıldığında uploads klasörü yoksa hata verebilir
**Çözüm:** `mkdir -p backend/uploads` komutu ile klasör oluşturuldu

**Sorun:** Fotoğraf yüklenirken CORS hatası
**Çözüm:** `main.ts`'de `app.enableCors()` eklendi

---

## 🚀 Sonraki Adımlar (Opsiyonel)

1. ✨ Cloudinary/AWS S3 entegrasyonu (production için)
2. 📧 Email bildirimleri
3. 🔔 Real-time bildirimler (Socket.io)
4. 📱 PWA desteği
5. 🌍 Çoklu dil desteği
6. 📊 Analytics dashboard
7. 🎫 QR kod ile check-in sistemi
