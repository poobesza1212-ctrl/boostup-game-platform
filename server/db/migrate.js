/**
 * Database Migration & Schema Sync Script
 * Usage: node server/db/migrate.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');

console.log("==================================================");
console.log("🛠️  BOOSTUP - DATABASE MIGRATION RUNNER");
console.log("==================================================");

// 1. Ensure Directories exist
[DATA_DIR, UPLOADS_DIR, BACKUP_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`[Directory] Created: ${dir}`);
  }
});

// 2. Perform automated database backup if existing DB exists
if (fs.existsSync(DB_FILE)) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(BACKUP_DIR, `database_backup_${timestamp}.json`);
  fs.copyFileSync(DB_FILE, backupFile);
  console.log(`[Backup] Database backed up to: ${path.basename(backupFile)}`);
}

// 3. Load or Initialize Database
let dbData = {};
if (fs.existsSync(DB_FILE)) {
  try {
    dbData = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    console.log("[Load] Existing database loaded successfully.");
  } catch (err) {
    console.warn("[Warning] Could not parse existing DB, initializing fresh store:", err.message);
  }
}

// 4. Run Schema Migrations

// Migration A: Admins & RBAC Collection
if (!dbData.admins || dbData.admins.length === 0) {
  dbData.admins = [
    {
      id: "adm_super",
      username: "admin",
      email: "admin@boostup.com",
      password: "admin",
      name: "ผู้ดูแลระบบสูงสุด (Super Admin)",
      role: "super_admin",
      department: "Management",
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "adm_operator",
      username: "operator1",
      email: "operator@boostup.com",
      password: "operator123",
      name: "เจ้าหน้าที่ฝ่ายออเดอร์ (Operator)",
      role: "operator",
      department: "Customer Support & Orders",
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "adm_editor",
      username: "editor1",
      email: "editor@boostup.com",
      password: "editor123",
      name: "เจ้าหน้าที่ฝ่ายการตลาด (Content Editor)",
      role: "content_editor",
      department: "Marketing & CMS",
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ];
  console.log("[Migration] Seeded default RBAC admin accounts (Super Admin, Operator, Content Editor)");
}

// Migration B: CMS Carousel Slides Collection
if (!dbData.carouselSlides || dbData.carouselSlides.length === 0) {
  dbData.carouselSlides = [
    {
      id: "slide_1",
      badge: "⚡ ดีลพิเศษประจำวัน (DAILY FLASH SALE)",
      badgeColor: "bg-red-600 text-white",
      title: "FLASH SALE ดีลเดือดลดสูงสุด 30%",
      subtitle: "เติม ROV, Free Fire, Valorant, Genshin คูปองและเพชรเข้าเกมทันที 24 ชม. ไม่ต้องรอนาน",
      ctaText: "ช้อปดีล Flash Sale",
      ctaTarget: "flash-sale-section",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
      accentGradient: "from-red-950 via-zinc-900 to-black",
      displayOrder: 1,
      isActive: true
    },
    {
      id: "slide_2",
      badge: "🪙 สิทธิพิเศษสำหรับสมาชิก (COINS REWARD)",
      badgeColor: "bg-amber-500 text-black font-black",
      title: "รับเหรียญ BOOSTUP COINS คูณ 2 เท่า!",
      subtitle: "ยิ่งเติม ยิ่งคุ้ม ทุกยอดการเติมเกมสะสมเหรียญแลกรับส่วนลดเงินสด หรือรับแพ็กเกจเกมฟรี",
      ctaText: "ดูเกมยอดนิยม",
      ctaTarget: "popular-games",
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
      accentGradient: "from-amber-950 via-zinc-900 to-black",
      displayOrder: 2,
      isActive: true
    },
    {
      id: "slide_3",
      badge: "🎁 กิจกรรมพิเศษประจำเดือน (LUCKY DRAW)",
      badgeColor: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
      title: "เติมร้อย ลุ้นล้าน แจกใหญ่ทุกสัปดาห์",
      subtitle: "เติมเงินครบทุก 100 บาท รับสิทธิ์ลุ้นรับ Steam Deck, iPhone, บัตรของขวัญ และไอเท็มแรร์",
      ctaText: "เติมเงินรับสิทธิ์ลุ้น",
      ctaTarget: "popular-games",
      image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80",
      accentGradient: "from-purple-950 via-zinc-900 to-black",
      displayOrder: 3,
      isActive: true
    }
  ];
  console.log("[Migration] Seeded default CMS carousel slides");
}

// Migration C: Audit Logs Collection
if (!dbData.auditLogs) {
  dbData.auditLogs = [];
  console.log("[Migration] Initialized auditLogs collection");
}

// Migration D: Uploads Registry Collection
if (!dbData.uploads) {
  dbData.uploads = [];
  console.log("[Migration] Initialized uploads collection");
}

// Save migrated database
fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf8');

console.log("==================================================");
console.log("✅  ALL MIGRATIONS COMPLETED SUCCESSFULLY!");
console.log(`📁 Database Location: ${DB_FILE}`);
console.log(`🖼️ Uploads Folder:   ${UPLOADS_DIR}`);
console.log("==================================================");
