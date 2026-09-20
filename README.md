# 🎮 BOOSTUP - ร้านเติมเงินเกม (PLAY MORE GO FURTHER)

แพลตฟอร์มเว็บไซต์เติมเกมออนไลน์แบบครบวงจร พร้อมระบบเติมเงินอัตโนมัติ 24 ชั่วโมง, ระบบหลังบ้าน (Admin Dashboard) จัดการคำสั่งซื้อ, สถาปัตยกรรมเชื่อมต่อหลาย API (Multi-API Provider Aggregator & Smart Failover), รองรับช่องทางชำระเงินชั้นนำ (PromptPay EMVCo QR, TrueMoney, โอนธนาคาร, กระเป๋าเงินในเว็บ), และระบบส่งเสริมการขาย (คูปอง, ส่วนลด, สะสมแต้ม VIP) 

ออกแบบ UI/UX สไตล์ Cyberpunk Esports โทนมืด-แดงเรืองแสง (Dark/Neon Red) ตามภาพต้นแบบ 100%

---

## 🌟 จุดเด่นและฟีเจอร์หลักของระบบ

### 1. หน้าเว็บไซต์ลูกค้า (Storefront)
- **ดีไซน์ธีม Cyberpunk Esports**: โทนมืดตัดแดง (#e62020) พร้อมเอฟเฟกต์ Glow Border ตามแบบฉบับเกมเมอร์
- **ค้นหาเกมแบบเรียลไทม์ (Live Search)**: ค้นหาชื่อเกมหรือค่ายเกม แสดงผลลัพธ์ทันที
- **ระบบตรวจสอบชื่อตัวละคร (Character UID Verification)**: ป้องกันผู้เล่นกรอก UID ผิดพลาด ตรวจสอบและแสดงชื่อตัวละครจริงก่อนชำระเงิน
- **ช่องทางการชำระเงินที่ใช้งานได้จริง**:
  - **พร้อมเพย์ (PromptPay QR)**: สร้าง QR Code มาตรฐาน EMVCo พร้อมตัวนับเวลานับถอยหลังและตรวจสอบการชำระ
  - **ซองของขวัญ TrueMoney Wallet**: ตรวจสอบและดึงเงินจากลิงก์ซองอั่งเปาอัตโนมัติ
  - **โอนผ่านธนาคาร & แนบสลิป**: ระบบตรวจสอบความถูกต้องของยอดเงิน
  - **กระเป๋าเงินในเว็บ (User Wallet)**: ชำระเงินได้ทันทีจากเครดิตคงเหลือในบัญชี
- **ระบบคูปองและโปรโมชั่น**: ใส่โค้ดส่วนลดเพื่อรับส่วนลดเปอร์เซ็นต์หรือส่วนลดเป็นบาททันที เช่น `WELCOME10`, `PROMO50`, `BOOSTUP20`
- **หน้าจอติดตามสถานะสด (Live Order Status Modal)**: แสดงขั้นตอนการทำงานอัตโนมัติ 4 ระดับแบบเรียลไทม์ พร้อมเอฟเฟกต์พลุเฉลิมฉลอง (Confetti) และใบเสร็จคำสั่งซื้อดิจิทัล

### 2. ระบบหลังบ้านผู้ดูแล (Admin Dashboard)
- **แผงควบคุมสถิติสด (Overview)**:
  - การ์ดสถิติ 4 ตัวหลัก: ยอดขายวันนี้, คำสั่งซื้อทั้งหมด, ลูกค้าทั้งหมด, อัตราความสำเร็จ (%)
  - กราฟแท่ง/พื้นที่แสดงยอดขายย้อนหลัง (Sales Trend Chart)
  - กราฟวงกลมสัดส่วนช่องทางการชำระเงิน (Donut Chart: TrueMoney 45%, ธนาคาร 30%, พร้อมเพย์ 15%, อื่นๆ 10%)
- **จัดการคำสั่งซื้อ (Orders Management)**: ค้นหา, กรองสถานะ, ดูรายละเอียดเชิงลึกของ API Provider, และปุ่มกด **"เติมซ้ำ (Retry Auto Top-up)"**
- **ควบคุมระบบเติมเงินอัตโนมัติ (Auto Top-up Controller)**: ตรวจสอบความเร็วเฉลี่ย (Latency), คิวงานคงค้าง, และบันทึกข้อผิดพลาด
- **ระบบเชื่อมต่อหลาย API & Smart Failover**:
  - เชื่อมต่อ API ผู้ให้บริการ 4 ค่าย: Smile One, UniPin, Codashop, Lapakgaming
  - แสดงยอดเงินคงเหลือใน API แต่ละเจ้าแบบเรียลไทม์
  - **Smart Failover**: กำหนดผู้ให้บริการหลัก (Primary) และสำรอง (Fallback) รายเกม หาก Provider หลักยอดเงินหมดหรือ API ขัดข้อง ระบบจะสลับไปสั่งงานค่ายสำรองทันทีโดยอัตโนมัติ!
- **จัดการโปรโมชั่น & คูปอง (Coupons Management)**: สร้าง, แก้ไข, กำหนดขั้นต่ำ และลบโค้ดส่วนลด
- **จัดการลูกค้า & กระเป๋าเงิน (Customer Management)**: ดูรายชื่อสมาชิก, ปรับยอดเงินเครดิตในกระเป๋าของลูกค้าแบบเรียลไทม์
- **ตั้งค่าเว็บไซต์ (Site Settings)**: ข้อความประกาศแบนเนอร์, เบอร์พร้อมเพย์, เลขที่บัญชีธนาคาร

---

## 🚀 วิธีการติดตั้งและเริ่มใช้งาน (Quick Start)

### 1. ติดตั้งและรันระบบ
เปิด Terminal ในโฟลเดอร์โครงการ:
```bash
# 1. ติดตั้ง Dependencies (หากยังไม่ได้ติดตั้ง)
npm install

# 2. Build ส่วน Frontend
npm run build

# 3. เริ่มต้นรันเซิร์ฟเวอร์
npm start
```

เข้าใช้งานผ่านเว็บเบราว์เซอร์:
- **หน้าร้านค้าลูกค้า (Storefront)**: [http://localhost:5000](http://localhost:5000)
- **ระบบหลังบ้านผู้ดูแล (Admin Dashboard)**: เข้าผ่านปุ่ม *"ระบบหลังบ้าน (Dashboard)"* ที่มุมขวาบน หรือกดจากเมนู Footer

---

## 🔑 บัญชีตัวอย่างสำหรับทดสอบ (Demo Accounts)

ตัวระบบมีปุ่มลัดสำหรับกรอกข้อมูลอัตโนมัติในหน้าต่างเข้าสู่ระบบ หรือใช้ข้อมูลด้านล่างนี้:

| บทบาท | ชื่อผู้ใช้ / อีเมล | รหัสผ่าน | สิทธิ์การเข้าถึง |
| :--- | :--- | :--- | :--- |
| **ผู้ดูแลระบบ (Admin)** | `admin` | `admin` | สิทธิ์จัดการทุกเมนูใน Admin Dashboard |
| **ลูกค้าทั่วไป (Gamer)** | `user@gamer.th` | `password` | สิทธิ์เติมเกม, เติมเงินกระเป๋า, สะสมแต้ม |

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```
game-topup-platform/
├── package.json              # กำหนด dependencies และคำสั่ง scripts
├── vite.config.mjs           # การตั้งค่า Vite + Tailwind v4 + React
├── server/
│   ├── index.js              # Express API Server & Static Server
│   ├── config/
│   │   └── database.js       # SQLite/JSON Database Engine พร้อมข้อมูลเริ่มต้น
│   ├── routes/
│   │   └── api.js            # RESTful API สำหรับหน้าร้านค้าและหลังบ้าน
│   └── services/
│       ├── promptpay.js      # ตัวสร้าง Payload EMVCo Thai PromptPay QR
│       ├── paymentService.js # ตรวจสอบการชำระเงิน (PromptPay, TrueMoney, Slip)
│       ├── topupEngine.js    # Engine เติมเงินอัตโนมัติ 24 ชม. & Smart Failover
│       └── providers/        # Adapter เชื่อมต่อ API ผู้ให้บริการ
│           ├── baseProvider.js
│           ├── smileOneProvider.js
│           ├── unipinProvider.js
│           └── codashopProvider.js
├── client/
│   ├── index.html            # โครงสร้าง HTML พร้อม Google Fonts Prompt/Kanit
│   └── src/
│       ├── main.jsx          # จุดเริ่มต้นการแสดงผล React
│       ├── App.jsx           # การควบคุมสลับหน้าร้านค้าและหลังบ้าน
│       ├── index.css         # สไตล์ Cyberpunk Esports & Neon Red
│       ├── components/       # คอมโพเนนต์หน้าร้านค้า (Navbar, Hero, Grid, Modals)
│       └── pages/admin/      # หน้าจอระบบหลังบ้าน (AdminDashboard)
└── README.md
```

---

## ⚙️ การตั้งค่าเชื่อมต่อ API ผู้ให้บริการจริง (Production Integration)

สร้างไฟล์ `.env` ในโฟลเดอร์โครงการเพื่อระบุ API Key จริงของผู้ให้บริการ:

```env
PORT=5000

# Smile One API Credentials
SMILEONE_API_KEY=sm_live_your_api_key_here
SMILEONE_API_SECRET=sm_sec_your_api_secret_here

# UniPin B2B Gateway
UNIPIN_API_KEY=uni_live_your_api_key_here
UNIPIN_API_SECRET=uni_sec_your_api_secret_here

# Codashop Direct API
CODASHOP_API_KEY=coda_partner_your_key_here
CODASHOP_API_SECRET=coda_sec_your_secret_here

# ข้อมูลพร้อมเพย์สำหรับรับชำระเงิน
PROMPTPAY_NUMBER=0891234567
PROMPTPAY_NAME=บจก. บูสต์อัพ (BOOSTUP THAILAND)
```
