const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Smart Persistent Path Resolution (Render Persistent Disk / Custom DATA_DIR)
const getDbDirectory = () => {
  if (process.env.DATA_DIR && fs.existsSync(process.env.DATA_DIR)) {
    return process.env.DATA_DIR;
  }
  // Check Render default persistent disk mount path
  if (fs.existsSync('/var/data')) {
    return '/var/data';
  }
  return path.join(__dirname, '..', 'data');
};

const DB_DIR = getDbDirectory();
const DB_FILE = path.join(DB_DIR, 'database.json');
const BACKUP_DIR = path.join(DB_DIR, 'backups');
const AUTO_BACKUP_FILE = path.join(BACKUP_DIR, 'latest_customers.json');

// Initial schema and rich Thai seed data matching mockup
const defaultData = {
  settings: {
    siteName: "BOOSTUP ร้านเติมเงินเกม",
    siteSlogan: "PLAY MORE GO FURTHER • เติมเกมสุดคุ้ม รวดเร็ว ปลอดภัย 100% เติมง่าย ได้ทันที ไม่ต้องรอนาน",
    announcement: "🔥 ยินดีต้อนรับสู่ BOOSTUP ร้านเติมเงินเกม! เติมไว ปลอดภัย 100% ระบบอัตโนมัติ 24 ชม.",
    promptpayNumber: "",
    promptpayName: "",
    truemoneyNumber: "",
    bankName: "",
    bankAccount: "",
    bankAccountName: "",
    contactLine: "@boostup",
    contactFacebook: "BoostUpGameStore",
    contactDiscord: "discord.gg/boostup",
    simulationMode: true, // Allows instant full end-to-end testing out of the box
    autoTopupEnabled: true,
    paymentMethods: {
      promptpay: {
        id: "promptpay",
        name: "พร้อมเพย์ QR Code (PromptPay)",
        sublabel: "สแกน QR Code จ่ายเงินผ่าน Mobile Banking ทุกธนาคาร (ค่าธรรมเนียม 0%)",
        enabled: true,
        icon: "QrCode"
      },
      truemoney: {
        id: "truemoney",
        name: "ซองของขวัญ ทรูมันนี่ (TrueMoney Wallet)",
        sublabel: "สร้างซองของขวัญอั่งเปาในแอป TrueMoney แล้วนำลิงก์มากรอก",
        enabled: true,
        icon: "Gift"
      },
      bank_transfer: {
        id: "bank_transfer",
        name: "โอนผ่านบัญชีธนาคาร (Bank Transfer)",
        sublabel: "โอนเงินเข้าบัญชีธนาคารของร้าน พร้อมระบบตรวจสอบและแนบสลิป",
        enabled: true,
        icon: "Building2"
      },
      wallet: {
        id: "wallet",
        name: "กระเป๋าเงินสมาชิก BOOSTUP (User Wallet)",
        sublabel: "ชำระเงินทันทีด้วยยอดเงินคงเหลือในกระเป๋า ไม่ต้องสแกนใหม่",
        enabled: true,
        icon: "Wallet"
      },
      credit_card: {
        id: "credit_card",
        name: "บัตรเครดิต / เดบิต (Credit / Debit Card)",
        sublabel: "ชำระผ่านบัตร Visa, Mastercard, JCB (ระบบเกตเวย์ภายนอก)",
        enabled: false,
        icon: "CreditCard"
      }
    },
    logoUrl: "/uploads/boostup_logo.jpg",
    trustPoints: [
      {
        id: "tp_1",
        icon: "ShieldCheck",
        title: "จดทะเบียนบริษัทถูกต้องตามกฎหมาย",
        desc: "ดำเนินงานโดย บริษัท บูสต์อัพ จำกัด มั่นใจได้ 100% ปลอดภัย มีเอกสารรับรองชัดเจน"
      },
      {
        id: "tp_2",
        icon: "Zap",
        title: "ระบบเติมเงินอัตโนมัติ 24 ชม.",
        desc: "สั่งซื้อเสร็จ ระบบยิง API เติมเข้าเกมทันทีเฉลี่ยใน 1-3 วินาที ไม่ต้องรอแอดมินตอบแชท"
      },
      {
        id: "tp_3",
        icon: "Lock",
        title: "ปลอดภัย เติมผ่าน UID เท่านั้น",
        desc: "ไม่ขอรหัสผ่าน ไม่เข้าไอดีของคุณ ป้องกันความเสี่ยงไอดีโดนแฮกหรือถูกระงับ 100%"
      },
      {
        id: "tp_4",
        icon: "Users",
        title: "ไว้วางใจกว่า 1,000,000+ รายการ",
        desc: "ได้รับความไว้วางใจจากเหล่าโปรเพลเยอร์ สตรีมเมอร์ และเกมเมอร์ทั่วประเทศอย่างต่อเนื่อง"
      }
    ],
    bankAccounts: [],
    autoSlipApproval: false, // Strict Security: requires admin to approve slips before adding balance
    coinsRewardRate: 10, // 10 coins per 100 THB
    coinsMultiplierText: "2X COINS",
    footerAbout: "ผู้ให้บริการแพลตฟอร์มเติมเกมออนไลน์ครบวงจรอันดับ 1 ในไทย ระบบอัตโนมัติ 24 ชั่วโมง เสถียร ปลอดภัย เติมไวใน 1-3 วินาที เชื่อมต่อ API ตรงกับผู้ให้บริการชั้นนำ",
    footerLegal: "จดทะเบียนนิติบุคคลเลขที่ 0105566000000 ออกใบเสร็จรับเงินถูกต้องตามกฎหมาย",
    footerCopyright: "© 2026 BOOSTUP ร้านเติมเงินเกม (PLAY MORE GO FURTHER) All Rights Reserved."
  },
  quickCategories: [
    {
      id: "cat_games",
      label: "เติมเกมออนไลน์",
      sublabel: "UID ออโต้ 24 ชม.",
      iconName: "Gamepad2",
      iconColor: "text-red-500",
      targetId: "popular-games",
      badge: "",
      badgeColor: "",
      isActive: true,
      displayOrder: 1
    },
    {
      id: "cat_cards",
      label: "บัตรเติมเงิน",
      sublabel: "Steam, Razer, Roblox",
      iconName: "CreditCard",
      iconColor: "text-blue-400",
      targetId: "gift-cards-section",
      badge: "",
      badgeColor: "",
      isActive: true,
      displayOrder: 2
    },
    {
      id: "cat_flash",
      label: "Flash Sale",
      sublabel: "ดีลฟ้าผ่า ลดสูงสุด 30%",
      iconName: "Zap",
      iconColor: "text-amber-400",
      targetId: "flash-sale-section",
      badge: "HOT 🔥",
      badgeColor: "bg-red-600 text-white",
      isActive: true,
      displayOrder: 3
    },
    {
      id: "cat_apps",
      label: "ต่ออายุสมาชิกแอป",
      sublabel: "YouTube, Netflix, Discord",
      iconName: "Film",
      iconColor: "text-purple-400",
      targetId: "apps-section",
      badge: "",
      badgeColor: "",
      isActive: true,
      displayOrder: 4
    },
    {
      id: "cat_mobile",
      label: "เติมเงินมือถือ",
      sublabel: "AIS, True, Dtac",
      iconName: "Smartphone",
      iconColor: "text-emerald-400",
      targetId: "popular-games",
      badge: "",
      badgeColor: "",
      isActive: true,
      displayOrder: 5
    },
    {
      id: "cat_coins",
      label: "Boost Coins",
      sublabel: "สะสมเหรียญแลกส่วนลด",
      iconName: "Coins",
      iconColor: "text-amber-500",
      targetId: "popular-games",
      badge: "2X COINS",
      badgeColor: "bg-amber-500 text-black",
      isActive: true,
      displayOrder: 6
    }
  ],
  users: [],
  admins: [
    {
      id: "adm_super",
      username: "admin",
      email: "admin@boostup.com",
      password: "admin",
      name: "ผู้ดูแลระบบสูงสุด (Super Admin)",
      role: "super_admin",
      department: "Management",
      isActive: true,
      createdAt: "2026-09-20T12:00:00Z"
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
      createdAt: "2026-09-20T12:00:00Z"
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
      createdAt: "2026-09-20T12:00:00Z"
    }
  ],
  games: [
    {
      id: "rov",
      name: "ROV (Realm of Valor)",
      publisher: "Garena",
      slug: "rov",
      category: "MOBA",
      icon: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80",
      badge: "🔥 ยอดนิยมอันดับ 1",
      currencyName: "คูปอง (Coupons)",
      inputType: "uid_only",
      inputPlaceholder: "กรอก OpenID หรือ UID ผู้เล่น",
      inputHelp: "ดู UID ได้ที่: เข้าเกม ROV > กดรูปโปรไฟล์มุมซ้ายบน > ดูที่แถบ UID (เลข 10-12 หลัก)",
      isPopular: true,
      displayOrder: 1,
      isActive: true,
      packages: [
        { id: "rov_35", name: "35 คูปอง", currencyAmount: 35, originalPrice: 39, price: 35, costPrice: 31, bonus: "+0", isPopular: false },
        { id: "rov_180", name: "180 คูปอง", currencyAmount: 180, originalPrice: 199, price: 179, costPrice: 160, bonus: "+10 คูปอง", isPopular: false },
        { id: "rov_360", name: "360 คูปอง", currencyAmount: 360, originalPrice: 399, price: 349, costPrice: 315, bonus: "+25 คูปอง", isPopular: true },
        { id: "rov_900", name: "900 คูปอง", currencyAmount: 900, originalPrice: 999, price: 869, costPrice: 790, bonus: "+75 คูปอง", isPopular: false },
        { id: "rov_1800", name: "1,800 คูปอง", currencyAmount: 1800, originalPrice: 1999, price: 1729, costPrice: 1580, bonus: "+180 คูปอง", isPopular: false },
        { id: "rov_pass", name: "Valor Pass บัตรผ่านฤดูกาล", currencyAmount: 1, originalPrice: 350, price: 299, costPrice: 270, bonus: "ไอเท็มพิเศษ", isPopular: true }
      ]
    },
    {
      id: "freefire",
      name: "Free Fire",
      publisher: "Garena",
      slug: "freefire",
      category: "Battle Royale",
      icon: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=400&q=80",
      badge: "⚡ เติมไวใน 1 วิ",
      currencyName: "เพชร (Diamonds)",
      inputType: "uid_only",
      inputPlaceholder: "กรอก Player ID (ตัวเลข 8-10 หลัก)",
      inputHelp: "เปิดหน้าต่างโปรไฟล์ในเกม Free Fire > คัดลอก UID ใต้ชื่อตัวละคร",
      isPopular: true,
      displayOrder: 2,
      isActive: true,
      packages: [
        { id: "ff_100", name: "100 เพชร", currencyAmount: 100, originalPrice: 39, price: 35, costPrice: 30, bonus: "+5", isPopular: false },
        { id: "ff_310", name: "310 เพชร", currencyAmount: 310, originalPrice: 119, price: 99, costPrice: 88, bonus: "+15", isPopular: false },
        { id: "ff_520", name: "520 เพชร", currencyAmount: 520, originalPrice: 199, price: 179, costPrice: 155, bonus: "+30", isPopular: true },
        { id: "ff_1060", name: "1,060 เพชร", currencyAmount: 1060, originalPrice: 399, price: 349, costPrice: 310, bonus: "+80", isPopular: false },
        { id: "ff_weekly", name: "สิทธิพิเศษสมาชิกรายสัปดาห์", currencyAmount: 1, originalPrice: 129, price: 99, costPrice: 85, bonus: "รวม 450 เพชร", isPopular: true }
      ]
    },
    {
      id: "pubg_mobile",
      name: "PUBG Mobile",
      publisher: "Tencent / Level Infinite",
      slug: "pubg-mobile",
      category: "Battle Royale",
      icon: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=400&q=80",
      badge: "🎯 ยอดนิยม",
      currencyName: "UC (Unknown Cash)",
      inputType: "uid_only",
      inputPlaceholder: "กรอก Character ID (เลข 9-11 หลัก)",
      inputHelp: "เปิดเมนูโปรไฟล์ในเกม PUBG Mobile เพื่อดู Character ID",
      isPopular: true,
      displayOrder: 3,
      isActive: true,
      packages: [
        { id: "pubg_60", name: "60 UC", currencyAmount: 60, originalPrice: 42, price: 35, costPrice: 31, bonus: "+0", isPopular: false },
        { id: "pubg_325", name: "300 + 25 UC", currencyAmount: 325, originalPrice: 210, price: 175, costPrice: 158, bonus: "+25 UC ฟรี", isPopular: true },
        { id: "pubg_660", name: "600 + 60 UC", currencyAmount: 660, originalPrice: 410, price: 349, costPrice: 310, bonus: "+60 UC ฟรี", isPopular: false },
        { id: "pubg_1800", name: "1,500 + 300 UC", currencyAmount: 1800, originalPrice: 1050, price: 879, costPrice: 790, bonus: "+300 UC ฟรี", isPopular: false },
        { id: "pubg_rp", name: "Royale Pass อัปเกรด", currencyAmount: 1, originalPrice: 420, price: 359, costPrice: 320, bonus: "ชุดแรร์ + สกินปืน", isPopular: true }
      ]
    },
    {
      id: "valorant",
      name: "Valorant",
      publisher: "Riot Games",
      slug: "valorant",
      category: "Tactical FPS",
      icon: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80",
      badge: "🔥 เรตถูกสุด",
      currencyName: "VP (Valorant Points)",
      inputType: "riot_id",
      inputPlaceholder: "กรอก Riot ID พร้อม Tag เช่น Player#TH1",
      inputHelp: "ดู Riot ID ได้ที่หน้าจอหลักมุมขวาบน หรือใน Riot Client",
      isPopular: true,
      displayOrder: 4,
      isActive: true,
      packages: [
        { id: "val_475", name: "475 VP", currencyAmount: 475, originalPrice: 175, price: 150, costPrice: 135, bonus: "+0", isPopular: false },
        { id: "val_1000", name: "1,000 VP", currencyAmount: 1000, originalPrice: 350, price: 299, costPrice: 270, bonus: "+50 VP", isPopular: true },
        { id: "val_2050", name: "2,050 VP", currencyAmount: 2050, originalPrice: 700, price: 599, costPrice: 540, bonus: "+150 VP", isPopular: false },
        { id: "val_3650", name: "3,650 VP", currencyAmount: 3650, originalPrice: 1250, price: 1049, costPrice: 950, bonus: "+350 VP", isPopular: false },
        { id: "val_5350", name: "5,350 VP", currencyAmount: 5350, originalPrice: 1750, price: 1499, costPrice: 1350, bonus: "+600 VP", isPopular: false }
      ]
    },
    {
      id: "genshin",
      name: "Genshin Impact",
      publisher: "HoYoverse",
      slug: "genshin-impact",
      category: "Action RPG",
      icon: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=400&q=80",
      badge: "✨ พรแห่งดวงจันทร์",
      currencyName: "Genesis Crystal",
      inputType: "uid_server",
      servers: ["Asia", "America", "Europe", "TW/HK/MO"],
      inputPlaceholder: "กรอก UID (เลข 9 หลัก)",
      inputHelp: "เปิดเมนู Paimon หรือดูที่มุมขวาล่างของหน้าจอเกม Genshin Impact",
      isPopular: true,
      displayOrder: 5,
      isActive: true,
      packages: [
        { id: "gi_moon", name: "Blessing of the Welkin Moon (พรแห่งดวงจันทร์)", currencyAmount: 1, originalPrice: 219, price: 169, costPrice: 150, bonus: "รวม 3,000 Primogems", isPopular: true },
        { id: "gi_60", name: "60 Genesis Crystals", currencyAmount: 60, originalPrice: 42, price: 35, costPrice: 30, bonus: "คูณ 2 เติมครั้งแรก", isPopular: false },
        { id: "gi_300", name: "300 + 30 Genesis Crystals", currencyAmount: 330, originalPrice: 210, price: 169, costPrice: 150, bonus: "+30 โบนัส", isPopular: false },
        { id: "gi_980", name: "980 + 110 Genesis Crystals", currencyAmount: 1090, originalPrice: 620, price: 519, costPrice: 470, bonus: "+110 โบนัส", isPopular: false },
        { id: "gi_1980", name: "1,980 + 260 Genesis Crystals", currencyAmount: 2240, originalPrice: 1250, price: 999, costPrice: 910, bonus: "+260 โบนัส", isPopular: false },
        { id: "gi_6480", name: "6,480 + 1,600 Genesis Crystals", currencyAmount: 8080, originalPrice: 4100, price: 3290, costPrice: 2990, bonus: "+1,600 โบนัส", isPopular: true }
      ]
    },
    {
      id: "hok",
      name: "Honor of Kings",
      publisher: "Level Infinite",
      slug: "honor-of-kings",
      category: "MOBA",
      icon: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80",
      badge: "🚀 มาแรง",
      currencyName: "Tokens",
      inputType: "uid_only",
      inputPlaceholder: "กรอก Player ID / UID",
      inputHelp: "เปิดหน้าตั้งค่าโปรไฟล์เพื่อคัดลอก UID",
      isPopular: true,
      displayOrder: 6,
      isActive: true,
      packages: [
        { id: "hok_80", name: "80 + 8 Tokens", currencyAmount: 88, originalPrice: 45, price: 35, costPrice: 30, bonus: "+8 ฟรี", isPopular: false },
        { id: "hok_240", name: "240 + 24 Tokens", currencyAmount: 264, originalPrice: 129, price: 99, costPrice: 85, bonus: "+24 ฟรี", isPopular: false },
        { id: "hok_400", name: "400 + 40 Tokens", currencyAmount: 440, originalPrice: 219, price: 169, costPrice: 150, bonus: "+40 ฟรี", isPopular: true },
        { id: "hok_800", name: "800 + 95 Tokens", currencyAmount: 895, originalPrice: 429, price: 349, costPrice: 305, bonus: "+95 ฟรี", isPopular: false },
        { id: "hok_pass", name: "Season Battle Pass", currencyAmount: 1, originalPrice: 350, price: 289, costPrice: 250, bonus: "สกินพิเศษ", isPopular: true }
      ]
    },
    {
      id: "roblox",
      name: "Roblox (Robux)",
      publisher: "Roblox Corporation",
      slug: "roblox",
      category: "Sandbox / MMO",
      icon: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80",
      badge: "🔥 เรตถูกสุด เติมไว",
      currencyName: "Robux",
      inputType: "username",
      inputPlaceholder: "กรอกชื่อผู้ใช้ Roblox (Username)",
      inputHelp: "ดู Username ได้ที่หน้าโปรไฟล์ของคุณใน roblox.com (ไม่ใช่ Display Name)",
      isPopular: true,
      displayOrder: 4,
      isActive: true,
      packages: [
        { id: "rob_80", name: "80 Robux", currencyAmount: 80, originalPrice: 39, price: 35, costPrice: 30, bonus: "+0", isPopular: false },
        { id: "rob_160", name: "160 Robux", currencyAmount: 160, originalPrice: 79, price: 69, costPrice: 60, bonus: "+5 Robux ฟรี", isPopular: false },
        { id: "rob_400", name: "400 Robux", currencyAmount: 400, originalPrice: 179, price: 159, costPrice: 140, bonus: "+15 Robux ฟรี", isPopular: true },
        { id: "rob_800", name: "800 Robux", currencyAmount: 800, originalPrice: 359, price: 319, costPrice: 280, bonus: "+40 Robux ฟรี", isPopular: true },
        { id: "rob_1200", name: "1,200 Robux", currencyAmount: 1200, originalPrice: 540, price: 475, costPrice: 420, bonus: "+80 Robux ฟรี", isPopular: false },
        { id: "rob_1700", name: "1,700 Robux", currencyAmount: 1700, originalPrice: 740, price: 649, costPrice: 570, bonus: "+150 Robux ฟรี", isPopular: true },
        { id: "rob_2000", name: "2,000 Robux", currencyAmount: 2000, originalPrice: 890, price: 769, costPrice: 680, bonus: "+200 Robux ฟรี", isPopular: false },
        { id: "rob_4500", name: "4,500 Robux", currencyAmount: 4500, originalPrice: 1990, price: 1690, costPrice: 1500, bonus: "+500 Robux ฟรี", isPopular: false },
        { id: "rob_10000", name: "10,000 Robux (VIP Pack)", currencyAmount: 10000, originalPrice: 4200, price: 3590, costPrice: 3200, bonus: "+1,200 Robux ฟรี", isPopular: true },
        { id: "rob_prem_450", name: "Roblox Premium (450 Robux/เดือน)", currencyAmount: 450, originalPrice: 229, price: 199, costPrice: 175, bonus: "สิทธิพิเศษ + โบนัส 10%", isPopular: true }
      ]
    }
  ],
  providers: [
    {
      id: "prov_smileone",
      name: "Smile One API",
      code: "SMILE_ONE",
      endpoint: "https://api.smile.one/v1/topup",
      apiKey: "sm_live_9482759103829103",
      apiSecret: "sec_a91048201948201",
      balance: 14250.00,
      currency: "THB",
      status: "online",
      latencyMs: 145,
      successRate: 99.4,
      priority: 1,
      isActive: true,
      supportedGames: ["rov", "freefire", "pubg_mobile", "hok", "roblox"]
    },
    {
      id: "prov_unipin",
      name: "UniPin B2B Gateway",
      code: "UNIPIN",
      endpoint: "https://api.unipin.com/v2/order",
      apiKey: "uni_b2b_th_847192048",
      apiSecret: "sec_uni_947192847",
      balance: 8900.50,
      currency: "THB",
      status: "online",
      latencyMs: 220,
      successRate: 98.8,
      priority: 2,
      isActive: true,
      supportedGames: ["rov", "freefire", "pubg_mobile", "genshin", "valorant", "roblox"]
    },
    {
      id: "prov_codashop",
      name: "Codashop Direct B2B",
      code: "CODASHOP",
      endpoint: "https://order.codashop.com/th/init",
      apiKey: "coda_partner_99182",
      apiSecret: "sec_coda_8819283",
      balance: 24500.00,
      currency: "THB",
      status: "online",
      latencyMs: 180,
      successRate: 99.7,
      priority: 3,
      isActive: true,
      supportedGames: ["valorant", "genshin", "pubg_mobile", "roblox"]
    },
    {
      id: "prov_lapak",
      name: "Lapakgaming Aggregator",
      code: "LAPAKGAMING",
      endpoint: "https://api.lapakgaming.com/v1/checkout",
      apiKey: "lpk_live_th_48192",
      apiSecret: "sec_lpk_93817",
      balance: 5120.00,
      currency: "THB",
      status: "standby",
      latencyMs: 310,
      successRate: 97.9,
      priority: 4,
      isActive: true,
      supportedGames: ["rov", "hok", "freefire", "roblox"]
    }
  ],
  gameRoutes: {
    "rov": { primary: "prov_smileone", fallback: "prov_unipin" },
    "freefire": { primary: "prov_smileone", fallback: "prov_unipin" },
    "pubg_mobile": { primary: "prov_smileone", fallback: "prov_codashop" },
    "valorant": { primary: "prov_codashop", fallback: "prov_unipin" },
    "genshin": { primary: "prov_unipin", fallback: "prov_codashop" },
    "hok": { primary: "prov_smileone", fallback: "prov_lapak" },
    "roblox": { primary: "prov_smileone", fallback: "prov_unipin" }
  },
  coupons: [
    {
      id: "cpn_welcome",
      code: "WELCOME10",
      description: "ส่วนลด 10% ต้อนรับสมาชิกใหม่ ทุกเกม ไม่มีขั้นต่ำ",
      discountType: "percent",
      discountValue: 10,
      minSpend: 0,
      maxDiscount: 100,
      usageLimit: 1000,
      usedCount: 238,
      expiresAt: "2026-12-31T23:59:59Z",
      isActive: true
    },
    {
      id: "cpn_promo50",
      code: "PROMO50",
      description: "ลดทันที 50 บาท เมื่อเติมครบ 300 บาทขึ้นไป",
      discountType: "fixed",
      discountValue: 50,
      minSpend: 300,
      maxDiscount: 50,
      usageLimit: 500,
      usedCount: 184,
      expiresAt: "2026-11-30T23:59:59Z",
      isActive: true
    },
    {
      id: "cpn_vip20",
      code: "BOOSTUP20",
      description: "ส่วนลดพิเศษ 20 บาท สำหรับเติม ROV และ Free Fire",
      discountType: "fixed",
      discountValue: 20,
      minSpend: 100,
      maxDiscount: 20,
      usageLimit: 300,
      usedCount: 95,
      expiresAt: "2026-10-31T23:59:59Z",
      isActive: true
    }
  ],
  orders: [],
  transactions: [],
  cards: [
    { id: "crd_1", gameId: "steam", code: "STEAM-XXXX-YYYY-ZZZZ", amount: 350, status: "available" },
    { id: "crd_2", gameId: "garena", code: "GAR-9948-2849-1029", amount: 100, status: "available" }
  ],
  flashSales: [
    {
      id: "fs_rov_360",
      gameId: "rov",
      gameName: "ROV (Realm of Valor)",
      packageName: "360 คูปอง",
      icon: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80",
      originalPrice: 399,
      flashPrice: 289,
      discountPercent: 28,
      totalStock: 50,
      soldStock: 38,
      currencyAmount: 360,
      currencyName: "คูปอง"
    },
    {
      id: "fs_ff_520",
      gameId: "freefire",
      gameName: "Free Fire",
      packageName: "520 เพชร",
      icon: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=400&q=80",
      originalPrice: 199,
      flashPrice: 149,
      discountPercent: 25,
      totalStock: 60,
      soldStock: 49,
      currencyAmount: 520,
      currencyName: "เพชร"
    },
    {
      id: "fs_val_1000",
      gameId: "valorant",
      gameName: "Valorant",
      packageName: "1,000 VP",
      icon: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80",
      originalPrice: 350,
      flashPrice: 269,
      discountPercent: 23,
      totalStock: 40,
      soldStock: 31,
      currencyAmount: 1000,
      currencyName: "VP"
    },
    {
      id: "fs_genshin_moon",
      gameId: "genshin",
      gameName: "Genshin Impact",
      packageName: "Blessing of the Welkin Moon",
      icon: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=400&q=80",
      originalPrice: 219,
      flashPrice: 155,
      discountPercent: 29,
      totalStock: 35,
      soldStock: 27,
      currencyAmount: 1,
      currencyName: "พรแห่งดวงจันทร์"
    },
    {
      id: "fs_pubg_325",
      gameId: "pubg_mobile",
      gameName: "PUBG Mobile",
      packageName: "300 + 25 UC",
      icon: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=400&q=80",
      originalPrice: 210,
      flashPrice: 159,
      discountPercent: 24,
      totalStock: 45,
      soldStock: 36,
      currencyAmount: 325,
      currencyName: "UC"
    },
    {
      id: "fs_roblox_800",
      gameId: "roblox",
      gameName: "Roblox (Robux)",
      packageName: "800 Robux (Flash Deal 🔥)",
      icon: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80",
      originalPrice: 359,
      flashPrice: 279,
      discountPercent: 22,
      totalStock: 50,
      soldStock: 36,
      currencyAmount: 800,
      currencyName: "Robux"
    },
    {
      id: "fs_roblox_1700",
      gameId: "roblox",
      gameName: "Roblox (Robux)",
      packageName: "1,700 Robux (Flash Deal 🔥)",
      icon: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80",
      originalPrice: 740,
      flashPrice: 549,
      discountPercent: 26,
      totalStock: 40,
      soldStock: 28,
      currencyAmount: 1700,
      currencyName: "Robux"
    }
  ],
  giftCards: [
    {
      id: "gc_steam",
      name: "Steam Wallet Code (THB)",
      publisher: "Valve",
      category: "PC Gaming",
      icon: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
      badge: "จัดส่งรหัสทันที",
      denominations: [
        { id: "gc_steam_50", name: "50 THB", price: 55 },
        { id: "gc_steam_200", name: "200 THB", price: 215 },
        { id: "gc_steam_350", name: "350 THB", price: 375 },
        { id: "gc_steam_1000", name: "1,000 THB", price: 1050 }
      ]
    },
    {
      id: "gc_razer",
      name: "Razer Gold PIN (TH)",
      publisher: "Razer",
      category: "Universal Game Card",
      icon: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80",
      badge: "เติมได้ทุกเกม",
      denominations: [
        { id: "gc_razer_100", name: "100 THB", price: 100 },
        { id: "gc_razer_300", name: "300 THB", price: 300 },
        { id: "gc_razer_500", name: "500 THB", price: 500 },
        { id: "gc_razer_1000", name: "1,000 THB", price: 1000 }
      ]
    },
    {
      id: "gc_roblox",
      name: "Roblox Gift Card (Robux)",
      publisher: "Roblox Corporation",
      category: "Roblox",
      icon: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80",
      badge: "ยอดนิยมในวัยรุ่น",
      denominations: [
        { id: "gc_rob_50", name: "50 THB (รับ ~120 Robux)", price: 55 },
        { id: "gc_rob_100", name: "100 THB (รับ ~250 Robux)", price: 105 },
        { id: "gc_rob_150", name: "150 THB (รับ ~380 Robux)", price: 155 },
        { id: "gc_rob_300", name: "300 THB (รับ ~800 Robux)", price: 310 },
        { id: "gc_rob_500", name: "500 THB (รับ ~1,400 Robux + Virtual Item)", price: 515 },
        { id: "gc_rob_750", name: "750 THB (รับ ~2,100 Robux + Virtual Item)", price: 765 },
        { id: "gc_rob_1000", name: "1,000 THB (รับ ~3,000 Robux + Virtual Item)", price: 1030 },
        { id: "gc_rob_1500", name: "1,500 THB (รับ ~4,500 Robux + Virtual Item)", price: 1540 },
        { id: "gc_rob_2000", name: "2,000 THB (รับ ~6,000 Robux + Virtual Item)", price: 2050 }
      ]
    },
    {
      id: "gc_riot",
      name: "Riot Points Card (TH)",
      publisher: "Riot Games",
      category: "Valorant / LoL",
      icon: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=400&q=80",
      badge: "ไม่มีหมดอายุ",
      denominations: [
        { id: "gc_riot_150", name: "150 THB (475 VP)", price: 150 },
        { id: "gc_riot_300", name: "300 THB (1,000 VP)", price: 299 },
        { id: "gc_riot_600", name: "600 THB (2,050 VP)", price: 595 }
      ]
    }
  ],
  appSubscriptions: [
    {
      id: "sub_discord",
      name: "Discord Nitro",
      publisher: "Discord Inc.",
      icon: "https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=400&q=80",
      badge: "บูสต์เซิร์ฟเวอร์",
      plans: [
        { id: "sub_dis_1m", name: "Nitro ราย 1 เดือน", price: 169, originalPrice: 219 },
        { id: "sub_dis_1y", name: "Nitro ราย 1 ปี", price: 1690, originalPrice: 2190 }
      ]
    },
    {
      id: "sub_youtube",
      name: "YouTube Premium",
      publisher: "Google LLC",
      icon: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=400&q=80",
      badge: "ไม่มีโฆษณาคั่น",
      plans: [
        { id: "sub_yt_1m", name: "สมาชิกส่วนตัว 1 เดือน", price: 99, originalPrice: 159 },
        { id: "sub_yt_3m", name: "สมาชิกส่วนตัว 3 เดือน", price: 279, originalPrice: 477 },
        { id: "sub_yt_1y", name: "สมาชิกส่วนตัว 1 ปี", price: 990, originalPrice: 1590 }
      ]
    },
    {
      id: "sub_netflix",
      name: "Netflix Premium (4K Ultra HD)",
      publisher: "Netflix Inc.",
      icon: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=400&q=80",
      badge: "ดูได้ 4 จอ 4K",
      plans: [
        { id: "sub_nf_1m", name: "จอส่วนตัว 1 เดือน (4K UHD)", price: 129, originalPrice: 169 },
        { id: "sub_nf_3m", name: "จอส่วนตัว 3 เดือน (4K UHD)", price: 369, originalPrice: 507 }
      ]
    },
    {
      id: "sub_spotify",
      name: "Spotify Premium",
      publisher: "Spotify AB",
      icon: "https://images.unsplash.com/photo-1614680376408-81e91ffe3db7?auto=format&fit=crop&w=400&q=80",
      badge: "ฟังเพลงไม่จำกัด",
      plans: [
        { id: "sub_sp_1m", name: "Premium ส่วนตัว 1 เดือน", price: 89, originalPrice: 139 },
        { id: "sub_sp_3m", name: "Premium ส่วนตัว 3 เดือน", price: 249, originalPrice: 417 }
      ]
    }
  ],
  chats: [],
  auditLogs: []
};

class Database {
  constructor() {
    this.isPgConnected = false;
    this.pgUrl = null;
    this.pgPool = null;
    this.ensureDir();
    this.load();
    this.initPg();
  }

  ensureDir() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
      }
    } catch (e) {
      console.error("ensureDir error:", e.message);
    }
  }

  async initPg(customUrl = null) {
    const dbUrl = customUrl || process.env.DATABASE_URL;
    if (!dbUrl || !dbUrl.trim()) {
      this.isPgConnected = false;
      return false;
    }

    try {
      let pg = null;
      try {
        pg = require('pg');
      } catch (e) {
        console.warn("pg module not found, continuing with local persistent file storage");
        this.isPgConnected = false;
        return false;
      }

      const cleanUrl = dbUrl.trim();
      const pool = new pg.Pool({
        connectionString: cleanUrl,
        ssl: cleanUrl.includes('localhost') ? false : { rejectUnauthorized: false },
        connectionTimeoutMillis: 7000
      });

      // Test connection
      await pool.query('SELECT NOW()');

      // Ensure KV storage table exists
      await pool.query(`
        CREATE TABLE IF NOT EXISTS system_kv (
          key VARCHAR(64) PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      this.pgPool = pool;
      this.isPgConnected = true;
      this.pgUrl = cleanUrl;

      // On startup: Check if PostgreSQL already has stored data
      const res = await this.pgPool.query(`SELECT data, updated_at FROM system_kv WHERE key = 'store_data'`);
      if (res.rows.length > 0 && res.rows[0].data) {
        const pgData = res.rows[0].data;
        const pgUserCount = pgData.users?.length || 0;
        const localUserCount = this.data?.users?.length || 0;

        console.log(`📦 [PostgreSQL Cloud] Connected! PG records: ${pgUserCount} users, Local records: ${localUserCount} users.`);

        // Master Truth: If Postgres has data, it takes precedence over git/local files
        if (pgUserCount >= localUserCount) {
          this.data = pgData;
          this.safeMergeDefaults();
          this.saveToFileOnly();
          console.log(`✅ [PostgreSQL Cloud] Successfully loaded live production database into memory!`);
        } else {
          // If local has more recent users, sync local to Postgres
          await this.syncToPostgres();
          console.log(`✅ [PostgreSQL Cloud] Synchronized local data to PostgreSQL cloud database.`);
        }
      } else {
        // Initialize first state in Postgres
        await this.syncToPostgres();
        console.log(`✅ [PostgreSQL Cloud] Initialized first store state into PostgreSQL.`);
      }

      return true;
    } catch (err) {
      console.error("PostgreSQL cloud sync notice:", err.message);
      this.isPgConnected = false;
      return false;
    }
  }

  async syncToPostgres() {
    if (!this.pgPool) return false;
    try {
      await this.pgPool.query(
        `INSERT INTO system_kv (key, data, updated_at) VALUES ('store_data', $1, CURRENT_TIMESTAMP)
         ON CONFLICT (key) DO UPDATE SET data = $1, updated_at = CURRENT_TIMESTAMP`,
        [this.data]
      );
      return true;
    } catch (err) {
      console.error("Failed to sync state to PostgreSQL:", err.message);
      return false;
    }
  }

  async connectPostgres(dbUrl) {
    if (!dbUrl || !dbUrl.trim()) throw new Error('กรุณาระบุ Connection String ของ PostgreSQL (DATABASE_URL)');
    const success = await this.initPg(dbUrl.trim());
    if (!success) {
      throw new Error('ไม่สามารถเชื่อมต่อฐานข้อมูล PostgreSQL ได้ โปรดตรวจสอบ Connection String');
    }
    // Update .env file if writable
    try {
      const envPath = path.join(__dirname, '..', '..', '.env');
      if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, 'utf8');
        if (envContent.includes('DATABASE_URL=')) {
          envContent = envContent.replace(/DATABASE_URL=.*/g, `DATABASE_URL=${dbUrl.trim()}`);
        } else {
          envContent += `\nDATABASE_URL=${dbUrl.trim()}\n`;
        }
        fs.writeFileSync(envPath, envContent, 'utf8');
      }
    } catch (e) {
      console.warn("Could not write DATABASE_URL to .env:", e.message);
    }
    process.env.DATABASE_URL = dbUrl.trim();
    // Sync current state into the new database immediately
    await this.syncToPostgres();
    return true;
  }

  safeMergeDefaults() {
    if (!this.data || typeof this.data !== 'object') this.data = {};
    if (!this.data.settings) this.data.settings = defaultData.settings;
    else {
      this.data.settings = { ...defaultData.settings, ...this.data.settings };
      if (!this.data.settings.trustPoints) this.data.settings.trustPoints = defaultData.settings.trustPoints;
      if (!this.data.settings.bankAccounts) this.data.settings.bankAccounts = defaultData.settings.bankAccounts;
      if (!this.data.settings.paymentMethods) {
        this.data.settings.paymentMethods = defaultData.settings.paymentMethods;
      } else {
        this.data.settings.paymentMethods = {
          ...defaultData.settings.paymentMethods,
          ...this.data.settings.paymentMethods
        };
      }
    }
    if (!this.data.users) this.data.users = [];
    if (!this.data.admins) this.data.admins = defaultData.admins || [];

    // Games: ensure defaults exist, and merge any missing default games (e.g. roblox)
    if (!this.data.games || this.data.games.length === 0) {
      this.data.games = defaultData.games;
    } else {
      defaultData.games.forEach(dg => {
        if (!this.data.games.some(g => g.id === dg.id || g.slug === dg.slug)) {
          this.data.games.push(dg);
        }
      });
    }

    if (!this.data.quickCategories || this.data.quickCategories.length === 0) this.data.quickCategories = defaultData.quickCategories;

    // Flash sales: merge any missing flash sales (e.g. fs_roblox_800)
    if (!this.data.flashSales || this.data.flashSales.length === 0) {
      this.data.flashSales = defaultData.flashSales;
    } else {
      defaultData.flashSales.forEach(dfs => {
        if (!this.data.flashSales.some(fs => fs.id === dfs.id)) {
          this.data.flashSales.push(dfs);
        }
      });
    }

    // Gift cards: merge missing cards and upgrade roblox denominations
    if (!this.data.giftCards || this.data.giftCards.length === 0) {
      this.data.giftCards = defaultData.giftCards;
    } else {
      defaultData.giftCards.forEach(dgc => {
        const existing = this.data.giftCards.find(gc => gc.id === dgc.id);
        if (!existing) {
          this.data.giftCards.push(dgc);
        } else if (dgc.id === 'gc_roblox' && (existing.denominations?.length || 0) < dgc.denominations.length) {
          existing.denominations = dgc.denominations;
        }
      });
    }

    if (!this.data.appSubscriptions || this.data.appSubscriptions.length === 0) this.data.appSubscriptions = defaultData.appSubscriptions;
    if (!this.data.carouselSlides || this.data.carouselSlides.length === 0) this.data.carouselSlides = defaultData.carouselSlides || [];
    if (!this.data.orders) this.data.orders = [];
    if (!this.data.transactions) this.data.transactions = [];
    if (!this.data.chats) this.data.chats = [];
    if (!this.data.auditLogs) this.data.auditLogs = [];
    if (!this.data.gameRoutes) {
      this.data.gameRoutes = defaultData.gameRoutes;
    } else if (!this.data.gameRoutes.roblox) {
      this.data.gameRoutes.roblox = { primary: "prov_smileone", fallback: "prov_unipin" };
    }
  }

  load() {
    try {
      let loaded = false;

      // 1. Try loading main DB_FILE
      if (fs.existsSync(DB_FILE)) {
        try {
          const raw = fs.readFileSync(DB_FILE, 'utf8');
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            this.data = parsed;
            loaded = true;
          }
        } catch (e) {
          console.error("Corrupted DB_FILE, attempting backup recovery:", e.message);
        }
      }

      // 2. Anti-Reset Recovery: If DB_FILE had no users, check AUTO_BACKUP_FILE
      if ((!loaded || !this.data.users || this.data.users.length === 0) && fs.existsSync(AUTO_BACKUP_FILE)) {
        try {
          const backupRaw = fs.readFileSync(AUTO_BACKUP_FILE, 'utf8');
          const backupParsed = JSON.parse(backupRaw);
          if (backupParsed && backupParsed.users && backupParsed.users.length > 0) {
            console.log(`🛡️ [Safety Recovery] Restored ${backupParsed.users.length} users from rolling auto-backup!`);
            if (!this.data) this.data = backupParsed;
            else {
              this.data.users = backupParsed.users;
              if (backupParsed.transactions && (!this.data.transactions || this.data.transactions.length === 0)) {
                this.data.transactions = backupParsed.transactions;
              }
              if (backupParsed.orders && (!this.data.orders || this.data.orders.length === 0)) {
                this.data.orders = backupParsed.orders;
              }
            }
            loaded = true;
          }
        } catch (e) {
          console.error("Backup recovery error:", e.message);
        }
      }

      // 3. Fallback to default template if fresh install
      if (!loaded || !this.data) {
        this.data = JSON.parse(JSON.stringify(defaultData));
      }

      // 4. Safe merge defaults (only fill missing keys, NEVER wipe existing data!)
      this.safeMergeDefaults();
      this.saveToFileOnly();
    } catch (err) {
      console.error("Critical error in load():", err);
      this.data = JSON.parse(JSON.stringify(defaultData));
      this.saveToFileOnly();
    }
  }

  save() {
    this.saveToFileOnly();

    if (this.pgPool) {
      this.pgPool.query(
        `INSERT INTO system_kv (key, data, updated_at) VALUES ('store_data', $1, CURRENT_TIMESTAMP)
         ON CONFLICT (key) DO UPDATE SET data = $1, updated_at = CURRENT_TIMESTAMP`,
        [this.data]
      ).catch(err => console.error("PostgreSQL cloud save error:", err.message));
    }
  }

  saveToFileOnly() {
    try {
      this.ensureDir();
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf8');
      fs.renameSync(tempPath, DB_FILE);

      // Rolling auto-backup if we have users or orders
      if (this.data && ((this.data.users && this.data.users.length > 0) || (this.data.orders && this.data.orders.length > 0))) {
        if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
        fs.writeFileSync(AUTO_BACKUP_FILE, JSON.stringify(this.data, null, 2), 'utf8');
      }
    } catch (err) {
      console.error("Error saving database:", err);
    }
  }

  exportDatabase() {
    return {
      exportedAt: new Date().toISOString(),
      platform: "BOOSTUP Thailand",
      version: "1.0.0",
      stats: {
        usersCount: (this.data.users || []).length,
        ordersCount: (this.data.orders || []).length,
        gamesCount: (this.data.games || []).length,
        bankAccountsCount: (this.data.settings?.bankAccounts || []).length,
        depositsCount: (this.data.transactions || []).filter(t => t.type === 'deposit').length
      },
      data: this.data
    };
  }

  importDatabase(importedJson) {
    if (!importedJson || typeof importedJson !== 'object') {
      throw new Error('ไฟล์ข้อมูลไม่ถูกต้อง');
    }
    const incomingData = importedJson.data || importedJson;
    if (!incomingData.games || !incomingData.settings) {
      throw new Error('โครงสร้างไฟล์สำรองไม่ถูกต้อง ไม่พบข้อมูลเกมหรือการตั้งค่า');
    }
    this.data = incomingData;
    this.safeMergeDefaults();
    this.save();
    return {
      success: true,
      usersCount: (this.data.users || []).length,
      ordersCount: (this.data.orders || []).length,
      message: 'กู้คืนฐานข้อมูลสำเร็จเรียบร้อย'
    };
  }

  getDatabaseStatus() {
    return {
      engine: this.isPgConnected ? 'PostgreSQL (Cloud Database)' : 'Local File Storage',
      isPgConnected: !!this.isPgConnected,
      storagePath: this.isPgConnected ? (this.pgUrl ? this.pgUrl.replace(/:[^:]*@/, ':****@') : 'PostgreSQL Cloud') : DB_FILE,
      isPersistentDisk: DB_FILE.startsWith('/var/data') || !!process.env.DATA_DIR,
      counts: {
        users: (this.data.users || []).length,
        orders: (this.data.orders || []).length,
        games: (this.data.games || []).length,
        bankAccounts: (this.data.settings?.bankAccounts || []).length,
        slides: (this.data.carouselSlides || []).length,
        auditLogs: (this.data.auditLogs || []).length,
        transactions: (this.data.transactions || []).length
      },
      lastSaved: new Date().toISOString()
    };
  }

  get(collection) {
    return this.data[collection] || [];
  }

  set(collection, items) {
    this.data[collection] = items;
    this.save();
  }

  getSettings() {
    return this.data.settings;
  }

  updateSettings(newSettings) {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.save();
    return this.data.settings;
  }

  // Users
  findUserById(id) {
    return this.data.users.find(u => u.id === id);
  }

  findUserByEmailOrUsername(identifier) {
    return this.data.users.find(u => u.email === identifier || u.username === identifier);
  }

  createUser(userData) {
    const newUser = {
      id: `usr_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      role: 'user',
      walletBalance: 0.00,
      points: 50, // Welcome gift 50 points
      tier: 'Bronze',
      createdAt: new Date().toISOString(),
      ...userData
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  updateUser(id, updates) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.save();
      return this.data.users[idx];
    }
    return null;
  }

  // ----------------------------------------------------
  // Quick Category Bar (CMS)
  // ----------------------------------------------------
  getQuickCategories() {
    return (this.data.quickCategories || defaultData.quickCategories || [])
      .filter(c => c.isActive !== false)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  getAllQuickCategoriesAdmin() {
    return this.data.quickCategories || defaultData.quickCategories || [];
  }

  saveQuickCategory(cat) {
    if (!this.data.quickCategories) this.data.quickCategories = defaultData.quickCategories || [];
    const idx = this.data.quickCategories.findIndex(c => c.id === cat.id);
    if (idx !== -1) {
      this.data.quickCategories[idx] = { ...this.data.quickCategories[idx], ...cat };
      this.save();
      return this.data.quickCategories[idx];
    } else {
      const newCat = {
        id: cat.id || `cat_${Date.now()}`,
        displayOrder: this.data.quickCategories.length + 1,
        isActive: true,
        ...cat
      };
      this.data.quickCategories.push(newCat);
      this.save();
      return newCat;
    }
  }

  updateAllQuickCategories(categories) {
    this.data.quickCategories = categories;
    this.save();
    return this.data.quickCategories;
  }

  deleteQuickCategory(id) {
    if (!this.data.quickCategories) return;
    this.data.quickCategories = this.data.quickCategories.filter(c => c.id !== id);
    this.save();
  }

  // ----------------------------------------------------
  // Flash Sales (ดีลฟ้าผ่า)
  // ----------------------------------------------------
  getFlashSales() {
    return (this.data.flashSales || defaultData.flashSales || []).filter(f => f.isActive !== false);
  }

  getAllFlashSalesAdmin() {
    return this.data.flashSales || defaultData.flashSales || [];
  }

  saveFlashSale(item) {
    if (!this.data.flashSales) this.data.flashSales = [];
    const idx = this.data.flashSales.findIndex(f => f.id === item.id);
    if (idx !== -1) {
      this.data.flashSales[idx] = { ...this.data.flashSales[idx], ...item };
      this.save();
      return this.data.flashSales[idx];
    } else {
      const newItem = {
        id: item.id || `fs_${Date.now()}`,
        totalStock: Number(item.totalStock) || 50,
        soldStock: Number(item.soldStock) || 0,
        isActive: item.isActive !== false,
        ...item
      };
      this.data.flashSales.push(newItem);
      this.save();
      return newItem;
    }
  }

  deleteFlashSale(id) {
    if (!this.data.flashSales) return;
    this.data.flashSales = this.data.flashSales.filter(f => f.id !== id);
    this.save();
  }

  // ----------------------------------------------------
  // Gift Cards (บัตรเติมเกม)
  // ----------------------------------------------------
  getGiftCards() {
    return (this.data.giftCards || defaultData.giftCards || []).filter(g => g.isActive !== false);
  }

  getAllGiftCardsAdmin() {
    return this.data.giftCards || defaultData.giftCards || [];
  }

  saveGiftCard(card) {
    if (!this.data.giftCards) this.data.giftCards = [];
    const idx = this.data.giftCards.findIndex(g => g.id === card.id);
    if (idx !== -1) {
      this.data.giftCards[idx] = { ...this.data.giftCards[idx], ...card };
      this.save();
      return this.data.giftCards[idx];
    } else {
      const newCard = {
        id: card.id || `gc_${Date.now()}`,
        denominations: card.denominations || [],
        isActive: card.isActive !== false,
        ...card
      };
      this.data.giftCards.push(newCard);
      this.save();
      return newCard;
    }
  }

  deleteGiftCard(id) {
    if (!this.data.giftCards) return;
    this.data.giftCards = this.data.giftCards.filter(g => g.id !== id);
    this.save();
  }

  addDenominationToGiftCard(cardId, deno) {
    if (!this.data.giftCards) this.data.giftCards = [];
    const card = this.data.giftCards.find(g => g.id === cardId);
    if (!card) throw new Error('ไม่พบบัตรเติมเงินนี้');
    if (!card.denominations) card.denominations = [];
    const newDeno = {
      id: deno.id || `${cardId}_${Date.now()}`,
      ...deno
    };
    card.denominations.push(newDeno);
    this.save();
    return newDeno;
  }

  deleteDenominationFromGiftCard(cardId, denoId) {
    if (!this.data.giftCards) return;
    const card = this.data.giftCards.find(g => g.id === cardId);
    if (!card || !card.denominations) return;
    card.denominations = card.denominations.filter(d => d.id !== denoId);
    this.save();
  }

  // ----------------------------------------------------
  // App Subscriptions (ต่ออายุสมาชิกแอป)
  // ----------------------------------------------------
  getAppSubscriptions() {
    return (this.data.appSubscriptions || defaultData.appSubscriptions || []).filter(a => a.isActive !== false);
  }

  getAllAppSubscriptionsAdmin() {
    return this.data.appSubscriptions || defaultData.appSubscriptions || [];
  }

  saveAppSubscription(app) {
    if (!this.data.appSubscriptions) this.data.appSubscriptions = [];
    const idx = this.data.appSubscriptions.findIndex(a => a.id === app.id);
    if (idx !== -1) {
      this.data.appSubscriptions[idx] = { ...this.data.appSubscriptions[idx], ...app };
      this.save();
      return this.data.appSubscriptions[idx];
    } else {
      const newApp = {
        id: app.id || `sub_${Date.now()}`,
        plans: app.plans || [],
        isActive: app.isActive !== false,
        ...app
      };
      this.data.appSubscriptions.push(newApp);
      this.save();
      return newApp;
    }
  }

  deleteAppSubscription(id) {
    if (!this.data.appSubscriptions) return;
    this.data.appSubscriptions = this.data.appSubscriptions.filter(a => a.id !== id);
    this.save();
  }

  addPlanToAppSubscription(appId, plan) {
    if (!this.data.appSubscriptions) this.data.appSubscriptions = [];
    const app = this.data.appSubscriptions.find(a => a.id === appId);
    if (!app) throw new Error('ไม่พบบริการแอปนี้');
    if (!app.plans) app.plans = [];
    const newPlan = {
      id: plan.id || `${appId}_${Date.now()}`,
      ...plan
    };
    app.plans.push(newPlan);
    this.save();
    return newPlan;
  }

  deletePlanFromAppSubscription(appId, planId) {
    if (!this.data.appSubscriptions) return;
    const app = this.data.appSubscriptions.find(a => a.id === appId);
    if (!app || !app.plans) return;
    app.plans = app.plans.filter(p => p.id !== planId);
    this.save();
  }

  // Carousel Slides (CMS)
  getCarouselSlides() {
    const active = (this.data.carouselSlides || []).filter(s => s.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
    if (active.length > 0) return active;
    return this.resetCarouselSlidesToDefaults();
  }

  getAllCarouselSlidesAdmin() {
    if (!this.data.carouselSlides || this.data.carouselSlides.length === 0) {
      return this.resetCarouselSlidesToDefaults();
    }
    return (this.data.carouselSlides || []).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  saveCarouselSlide(slide) {
    if (!this.data.carouselSlides) this.data.carouselSlides = [];
    const idx = this.data.carouselSlides.findIndex(s => s.id === slide.id);
    if (idx !== -1) {
      this.data.carouselSlides[idx] = { ...this.data.carouselSlides[idx], ...slide };
      this.save();
      return this.data.carouselSlides[idx];
    } else {
      const newSlide = {
        id: `slide_${Date.now()}`,
        displayOrder: this.data.carouselSlides.length + 1,
        isActive: true,
        ...slide
      };
      this.data.carouselSlides.push(newSlide);
      this.save();
      return newSlide;
    }
  }

  saveCarouselSlidesBatch(slidesArray) {
    if (!this.data.carouselSlides) this.data.carouselSlides = [];
    const added = [];
    let currentOrder = this.data.carouselSlides.length;
    for (const slide of slidesArray) {
      currentOrder += 1;
      const newSlide = {
        id: `slide_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        title: slide.title || '',
        subtitle: slide.subtitle || '',
        badge: slide.badge || '',
        badgeColor: slide.badgeColor || 'bg-red-600 text-white',
        ctaText: slide.ctaText || 'ดูรายละเอียด',
        ctaTarget: slide.ctaTarget || 'popular-games',
        image: slide.image,
        displayOrder: currentOrder,
        isActive: slide.isActive !== false,
        isPureGraphic: !slide.title && !slide.subtitle
      };
      this.data.carouselSlides.push(newSlide);
      added.push(newSlide);
    }
    this.save();
    return added;
  }

  updateCarouselSlide(id, updates) {
    if (!this.data.carouselSlides) return null;
    const idx = this.data.carouselSlides.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.data.carouselSlides[idx] = { ...this.data.carouselSlides[idx], ...updates };
      this.save();
      return this.data.carouselSlides[idx];
    }
    return null;
  }

  reorderCarouselSlides(orderedIds) {
    if (!this.data.carouselSlides || !Array.isArray(orderedIds)) return this.data.carouselSlides || [];
    orderedIds.forEach((id, index) => {
      const slide = this.data.carouselSlides.find(s => s.id === id);
      if (slide) slide.displayOrder = index + 1;
    });
    this.data.carouselSlides.sort((a, b) => a.displayOrder - b.displayOrder);
    this.save();
    return this.data.carouselSlides;
  }

  resetCarouselSlidesToDefaults() {
    this.data.carouselSlides = [
      {
        id: "slide_rov",
        badge: "⚡ FLASH SALE -30%",
        badgeColor: "bg-red-600 text-white",
        title: "เติมคูปอง ROV ราคาพิเศษ",
        subtitle: "เข้าเกมอัตโนมัติ 1-3 วินาที ปลอดภัย ไม่ต้องใช้รหัสผ่าน",
        ctaText: "เติม ROV ทันที",
        ctaTarget: "popular-games",
        image: "/banners/banner_rov.svg",
        displayOrder: 1,
        isActive: true,
        isPureGraphic: true
      },
      {
        id: "slide_ff",
        badge: "💎 โบนัสเพชร +50%",
        badgeColor: "bg-amber-500 text-black font-black",
        title: "เติมเพชร Free Fire รับโบนัสฟรี",
        subtitle: "กรอกเพียง UID ตัวเลข เข้าบัญชีทันที เติมได้ตลอด 24 ชม.",
        ctaText: "เติม Free Fire",
        ctaTarget: "popular-games",
        image: "/banners/banner_freefire.svg",
        displayOrder: 2,
        isActive: true,
        isPureGraphic: true
      },
      {
        id: "slide_val",
        badge: "⚡ FAST TOP-UP 24 ชม.",
        badgeColor: "bg-cyan-500 text-black font-black",
        title: "VALORANT POINTS (VP) เติมไว ปลอดภัย",
        subtitle: "เติม Riot ID ตรงเข้าบัญชีทันที รองรับ Night Market ทุกเซิร์ฟเวอร์",
        ctaText: "เติม VALORANT VP",
        ctaTarget: "popular-games",
        image: "/banners/banner_valorant.svg",
        displayOrder: 3,
        isActive: true,
        isPureGraphic: true
      },
      {
        id: "slide_gen",
        badge: "✨ สิทธิพิเศษ 2X COINS",
        badgeColor: "bg-purple-600 text-white font-bold",
        title: "Genshin Impact พรแห่งดวงจันทร์",
        subtitle: "Blessing of the Welkin Moon & Genesis Crystals ราคาคุ้มที่สุด",
        ctaText: "เติม Genshin Impact",
        ctaTarget: "popular-games",
        image: "/banners/banner_genshin.svg",
        displayOrder: 4,
        isActive: true,
        isPureGraphic: true
      }
    ];
    this.save();
    return this.data.carouselSlides;
  }

  deleteCarouselSlide(id) {
    if (!this.data.carouselSlides) return;
    this.data.carouselSlides = this.data.carouselSlides.filter(s => s.id !== id);
    this.save();
  }

  clearAllCarouselSlides() {
    this.data.carouselSlides = [];
    this.save();
    return true;
  }

  // Admins & RBAC
  getAdmins() {
    return (this.data.admins || []).map(a => ({
      id: a.id,
      username: a.username,
      name: a.name,
      email: a.email,
      role: a.role,
      department: a.department,
      isActive: a.isActive,
      createdAt: a.createdAt
    }));
  }

  findAdminById(id) {
    return (this.data.admins || []).find(a => a.id === id);
  }

  findAdminByEmailOrUsername(identifier) {
    return (this.data.admins || []).find(a => a.email === identifier || a.username === identifier);
  }

  createAdmin(adminData) {
    if (!this.data.admins) this.data.admins = [];
    const newAdmin = {
      id: `adm_${Date.now()}`,
      isActive: true,
      createdAt: new Date().toISOString(),
      ...adminData
    };
    this.data.admins.push(newAdmin);
    this.save();
    return newAdmin;
  }

  updateAdmin(id, updates) {
    const idx = (this.data.admins || []).findIndex(a => a.id === id);
    if (idx !== -1) {
      this.data.admins[idx] = { ...this.data.admins[idx], ...updates };
      this.save();
      return this.data.admins[idx];
    }
    return null;
  }

  deleteAdmin(id) {
    if (!this.data.admins) return;
    this.data.admins = this.data.admins.filter(a => a.id !== id);
    this.save();
  }

  // Games & Package CRUD
  deleteGame(id) {
    this.data.games = this.data.games.filter(g => g.id !== id);
    this.save();
  }

  addPackageToGame(gameId, pkg) {
    const game = this.getGameById(gameId);
    if (!game) throw new Error('Game not found');
    if (!game.packages) game.packages = [];
    const newPkg = {
      id: `${game.slug || gameId}_${Date.now().toString().slice(-4)}`,
      bonus: pkg.bonus || '',
      isPopular: Boolean(pkg.isPopular),
      ...pkg
    };
    game.packages.push(newPkg);
    this.save();
    return newPkg;
  }

  deletePackageFromGame(gameId, pkgId) {
    const game = this.getGameById(gameId);
    if (!game) throw new Error('Game not found');
    game.packages = (game.packages || []).filter(p => p.id !== pkgId);
    this.save();
  }

  // Audit Logs
  logAction(adminId, adminName, action, details) {
    if (!this.data.auditLogs) this.data.auditLogs = [];
    this.data.auditLogs.unshift({
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      adminId: adminId || 'admin',
      adminName: adminName || 'Admin',
      action,
      details,
      createdAt: new Date().toISOString()
    });
    if (this.data.auditLogs.length > 1000) this.data.auditLogs.pop();
    this.save();
  }

  getAuditLogs() {
    if (!this.data.auditLogs) this.data.auditLogs = [];
    return [...this.data.auditLogs].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  // Games
  getGames() {
    return this.data.games.filter(g => g.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
  }

  getAllGamesAdmin() {
    return this.data.games.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  getGameById(id) {
    return this.data.games.find(g => g.id === id || g.slug === id);
  }

  saveGame(gameData) {
    const idx = this.data.games.findIndex(g => g.id === gameData.id);
    if (idx !== -1) {
      this.data.games[idx] = { ...this.data.games[idx], ...gameData };
    } else {
      this.data.games.push(gameData);
    }
    this.save();
    return gameData;
  }

  // Providers
  getProviders() {
    return this.data.providers;
  }

  getProviderById(id) {
    return this.data.providers.find(p => p.id === id);
  }

  updateProvider(id, updates) {
    const idx = this.data.providers.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.providers[idx] = { ...this.data.providers[idx], ...updates };
      this.save();
      return this.data.providers[idx];
    }
    return null;
  }

  getGameRoutes() {
    return this.data.gameRoutes;
  }

  setGameRoute(gameId, route) {
    this.data.gameRoutes[gameId] = route;
    this.save();
    return this.data.gameRoutes;
  }

  // Coupons
  getCouponByCode(code) {
    if (!code) return null;
    return this.data.coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive);
  }

  getAllCoupons() {
    return this.data.coupons;
  }

  createCoupon(coupon) {
    const newCoupon = {
      id: `cpn_${Date.now()}`,
      usedCount: 0,
      isActive: true,
      ...coupon,
      code: coupon.code.toUpperCase()
    };
    this.data.coupons.push(newCoupon);
    this.save();
    return newCoupon;
  }

  updateCoupon(id, updates) {
    const idx = this.data.coupons.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.data.coupons[idx] = { ...this.data.coupons[idx], ...updates };
      this.save();
      return this.data.coupons[idx];
    }
    return null;
  }

  deleteCoupon(id) {
    this.data.coupons = this.data.coupons.filter(c => c.id !== id);
    this.save();
  }

  // Orders
  getOrders() {
    return this.data.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getOrderById(id) {
    return this.data.orders.find(o => o.id === id || o.orderNumber === id);
  }

  createOrder(orderData) {
    const orderCount = this.data.orders.length + 12570;
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const orderNumber = `BST-${dateStr}-${orderCount}`;
    
    const newOrder = {
      id: `ord_${orderCount}`,
      orderNumber,
      paymentStatus: 'pending',
      topupStatus: 'processing',
      createdAt: now.toISOString(),
      ...orderData
    };
    this.data.orders.unshift(newOrder);
    this.save();
    return newOrder;
  }

  updateOrder(id, updates) {
    const idx = this.data.orders.findIndex(o => o.id === id || o.orderNumber === id);
    if (idx !== -1) {
      this.data.orders[idx] = { 
        ...this.data.orders[idx], 
        ...updates,
        updatedAt: new Date().toISOString() 
      };
      this.save();
      return this.data.orders[idx];
    }
    return null;
  }

  createTransaction(txnData) {
    if (!this.data.transactions) this.data.transactions = [];
    const newTxn = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      ...txnData
    };
    this.data.transactions.unshift(newTxn);
    this.save();
    return newTxn;
  }

  getTransactions() {
    return this.data.transactions || [];
  }

  getTransactionById(id) {
    return (this.data.transactions || []).find(t => t.id === id) || null;
  }

  updateTransaction(id, updates) {
    const txn = this.getTransactionById(id);
    if (!txn) return null;
    Object.assign(txn, updates);
    this.save();
    return txn;
  }

  // Analytics & Stats
  getStats() {
    const orders = this.data.orders || [];
    const paidOrders = orders.filter(o => o.paymentStatus === 'paid' && o.topupStatus === 'completed');
    
    // Today's sales
    const today = new Date().toISOString().slice(0, 10);
    const todayOrders = paidOrders.filter(o => o.createdAt && o.createdAt.startsWith(today));
    const todaySales = todayOrders.reduce((sum, o) => sum + (o.finalAmount || 0), 0);
    
    const totalSales = paidOrders.reduce((sum, o) => sum + (o.finalAmount || 0), 0);
    const totalOrders = orders.length;
    const completedOrders = paidOrders.length;
    const successRate = totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(2) : "0.00";
    
    // Payment method distribution
    const paymentCounts = {};
    paidOrders.forEach(o => {
      const method = o.paymentMethod || 'other';
      paymentCounts[method] = (paymentCounts[method] || 0) + 1;
    });

    return {
      todaySales: todaySales,
      totalOrders: totalOrders,
      totalCustomers: (this.data.users || []).length,
      successRate: parseFloat(successRate),
      totalSales: totalSales,
      paymentDistribution: paymentCounts
    };
  }

  // ==========================================
  // Live Chat System
  // ==========================================
  getChats() {
    return (this.data.chats || []).slice().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  getChatById(chatId) {
    return (this.data.chats || []).find(c => c.id === chatId) || null;
  }

  getChatBySessionOrUserId(sessionId, userId) {
    const chats = this.data.chats || [];
    if (userId) {
      const byUser = chats.find(c => c.userId === userId);
      if (byUser) return byUser;
    }
    if (sessionId) {
      const bySess = chats.find(c => c.sessionId === sessionId);
      if (bySess) return bySess;
    }
    return null;
  }

  createOrGetChatSession({ sessionId, userId, customerName, customerContact }) {
    if (!this.data.chats) this.data.chats = [];

    let chat = this.getChatBySessionOrUserId(sessionId, userId);

    if (!chat) {
      chat = {
        id: `chat_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
        sessionId: sessionId || `sess_${Date.now()}`,
        userId: userId || null,
        customerName: customerName || (userId ? 'สมาชิก BOOSTUP' : 'ลูกค้า (Guest)'),
        customerContact: customerContact || '',
        unreadAdmin: 0,
        unreadCustomer: 0,
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [
          {
            id: `msg_welcome_${Date.now()}`,
            sender: 'bot',
            senderName: 'BOOSTUP Support Bot',
            text: 'สวัสดีครับ ยินดีต้อนรับสู่ระบบแชทสด BOOSTUP! เจ้าหน้าที่พร้อมให้บริการตลอด 24 ชม. สามารถพิมพ์สอบถามข้อมูล แจ้งปัญหาการเติมเกม หรือระบุเลขออเดอร์ไว้ได้เลยครับ',
            createdAt: new Date().toISOString()
          }
        ]
      };
      this.data.chats.unshift(chat);
      this.save();
    } else {
      if (userId && !chat.userId) chat.userId = userId;
      if (customerName && (chat.customerName === 'ลูกค้า (Guest)' || !chat.customerName)) {
        chat.customerName = customerName;
      }
      this.save();
    }

    return chat;
  }

  addChatMessage(chatId, { sender, senderName, text }) {
    if (!this.data.chats) this.data.chats = [];
    const chat = this.getChatById(chatId);
    if (!chat) return null;

    const newMsg = {
      id: `msg_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
      sender: sender || 'customer',
      senderName: senderName || (sender === 'admin' ? 'แอดมิน BOOSTUP' : 'ลูกค้า'),
      text: (text || '').trim(),
      createdAt: new Date().toISOString()
    };

    if (!chat.messages) chat.messages = [];
    chat.messages.push(newMsg);
    chat.updatedAt = new Date().toISOString();

    if (sender === 'customer') {
      chat.unreadAdmin = (chat.unreadAdmin || 0) + 1;
    } else if (sender === 'admin') {
      chat.unreadCustomer = (chat.unreadCustomer || 0) + 1;
    }

    this.save();
    return { chat, message: newMsg };
  }

  markChatAsRead(chatId, readerRole = 'admin') {
    const chat = this.getChatById(chatId);
    if (!chat) return null;
    if (readerRole === 'admin') chat.unreadAdmin = 0;
    if (readerRole === 'customer') chat.unreadCustomer = 0;
    this.save();
    return chat;
  }
}

const db = new Database();
module.exports = db;
