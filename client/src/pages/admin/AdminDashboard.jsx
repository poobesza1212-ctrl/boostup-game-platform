import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Zap, 
  Gamepad2, 
  Package, 
  CreditCard, 
  Users, 
  Tag, 
  GitFork, 
  Wallet, 
  BarChart3, 
  Settings, 
  Shield, 
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCw,
  Search,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Film,
  Key,
  Upload,
  UserPlus,
  ShieldCheck,
  UserCheck,
  Building,
  Coins,
  LayoutGrid,
  HeartHandshake,
  FileText,
  LogOut,
  MessageSquare,
  Send,
  MessageCircle,
  FileCheck,
  Eye,
  XCircle,
  Check,
  X,
  Mail,
  History,
  Download,
  Filter,
  Phone,
  UserCog,
  Images,
  ArrowUp,
  ArrowDown,
  EyeOff,
  Loader2,
  Database,
  HardDrive,
  Cloud,
  Server,
  QrCode,
  Gift,
  Building2
} from 'lucide-react';
import GameEditorModal from './GameEditorModal';
import AdminRBACModal from './AdminRBACModal';
import FlashSaleModal from './FlashSaleModal';
import GiftCardModal from './GiftCardModal';
import AppSubscriptionModal from './AppSubscriptionModal';
import ImageUploader from '../../components/ImageUploader';

export default function AdminDashboard({ onBackToStore, adminUser, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [providers, setProviders] = useState([]);
  const [gameRoutes, setGameRoutes] = useState({});
  const [games, setGames] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [slides, setSlides] = useState([]);
  const [flashSales, setFlashSales] = useState([]);
  const [giftCards, setGiftCards] = useState([]);
  const [appSubscriptions, setAppSubscriptions] = useState([]);
  const [quickCategories, setQuickCategories] = useState([]);
  const [siteSettings, setSiteSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Live Chat Management
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatReplyText, setChatReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [liveChatUnread, setLiveChatUnread] = useState(0);

  // Deposit Slips Management (Slip Approval Workflow)
  const [deposits, setDeposits] = useState([]);
  const [pendingDepositsCount, setPendingDepositsCount] = useState(0);
  const [slipFilter, setSlipFilter] = useState('all'); // 'all' | 'pending' | 'completed' | 'rejected'
  const [slipSearch, setSlipSearch] = useState('');
  const [selectedSlipModal, setSelectedSlipModal] = useState(null);
  const [rejectReasonModal, setRejectReasonModal] = useState(null);
  const [rejectReasonText, setRejectReasonText] = useState('สลิปไม่ถูกต้อง หรือยอดเงินไม่ตรง');
  const [isProcessingSlip, setIsProcessingSlip] = useState(false);

  // CMS Sub tab
  const [cmsSubTab, setCmsSubTab] = useState('slides'); // 'slides' | 'categories' | 'trust'

  // Filters
  const [orderFilterStatus, setOrderFilterStatus] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [retryingId, setRetryingId] = useState(null);

  // Modals
  const [gameEditorModal, setGameEditorModal] = useState({ open: false, game: null });
  const [rbacModal, setRbacModal] = useState({ open: false, admin: null });
  const [flashSaleModal, setFlashSaleModal] = useState({ open: false, item: null });
  const [giftCardModal, setGiftCardModal] = useState({ open: false, item: null });
  const [appSubModal, setAppSubModal] = useState({ open: false, item: null });

  const [newCouponModal, setNewCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discountType: 'percent',
    discountValue: 10,
    minSpend: 0,
    maxDiscount: 100
  });

  // Slide Form Modal
  const [newSlideModal, setNewSlideModal] = useState(false);
  const [slideForm, setSlideForm] = useState({
    title: '',
    subtitle: '',
    badge: '⚡ ดีลพิเศษ',
    badgeColor: 'bg-red-600 text-white',
    image: '',
    ctaText: 'ช้อปดีลทันที',
    ctaTarget: 'popular-games'
  });

  // Multi-Image Upload & Edit Slide States
  const [multiUploadFiles, setMultiUploadFiles] = useState([]); // [{ file, preview, name, size }]
  const [multiUploadProgress, setMultiUploadProgress] = useState({ isUploading: false, current: 0, total: 0, message: '' });
  const [editSlideModal, setEditSlideModal] = useState(null); // slide object or null

  // Database Persistence & Cloud DB States
  const [dbStatus, setDbStatus] = useState(null);
  const [pgUrlInput, setPgUrlInput] = useState('');
  const [isConnectingPg, setIsConnectingPg] = useState(false);
  const [pgConnectMsg, setPgConnectMsg] = useState({ type: '', text: '' });
  const [showPgGuide, setShowPgGuide] = useState(true);

  // Bank Account Modal
  const [newBankModal, setNewBankModal] = useState(false);
  const [bankForm, setBankForm] = useState({
    bankName: 'ธนาคารกสิกรไทย (KBANK)',
    accountNo: '',
    accountName: '',
    promptpayLinked: false,
    isActive: true
  });

  // Customer wallet adjustment modal state
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState('100');

  // Customer Edit Modal & Search
  const [customerEditModal, setCustomerEditModal] = useState({
    open: false,
    customer: null,
    form: {
      name: '',
      phone: '',
      email: '',
      password: '',
      tier: 'Bronze',
      walletBalance: 0
    }
  });
  const [customerSearch, setCustomerSearch] = useState('');
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);

  // Modern SweetAlert2-Style Action Confirmation Modal (Matches User Design)
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: 'ยืนยันการทำรายการ',
    message: 'คุณแน่ใจใช่ไหมที่จะดำเนินการนี้ ?',
    confirmText: 'ตกลง',
    cancelText: 'ยกเลิก',
    type: 'warning',
    onConfirm: null,
    onCancel: null
  });

  // Modern Alert Notification Modal (Success / Error / Info)
  const [alertModal, setAlertModal] = useState({
    open: false,
    title: '',
    message: '',
    type: 'success'
  });

  const showConfirm = ({
    title = 'ยืนยันการทำรายการ',
    message = 'คุณแน่ใจใช่ไหมที่จะดำเนินการนี้ ?',
    confirmText = 'ตกลง',
    cancelText = 'ยกเลิก',
    type = 'warning',
    onConfirm,
    onCancel
  }) => {
    setConfirmDialog({
      open: true,
      title,
      message,
      confirmText,
      cancelText,
      type,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, open: false }));
        if (onConfirm) await onConfirm();
      },
      onCancel: () => {
        setConfirmDialog(prev => ({ ...prev, open: false }));
        if (onCancel) onCancel();
      }
    });
  };

  const showAlert = (options) => {
    if (typeof options === 'string') {
      const text = options;
      let type = 'info';
      let title = 'แจ้งเตือน';

      if (text.includes('สำเร็จ') || text.includes('เรียบร้อย') || text.includes('✓')) {
        type = 'success';
        title = 'ทำรายการสำเร็จ';
      } else if (text.includes('ไม่สำเร็จ') || text.includes('ผิดพลาด') || text.includes('ล้มเหลว') || text.includes('ไม่ใช่') || text.includes('เกิน')) {
        type = 'error';
        title = 'เกิดข้อผิดพลาด';
      } else if (text.includes('กรุณา') || text.includes('คำเตือน') || text.includes('เตือน') || text.includes('ระวัง')) {
        type = 'warning';
        title = 'แจ้งเตือน';
      }

      setAlertModal({ open: true, title, message: text, type });
      return;
    }

    const { title = 'แจ้งเตือน', message = '', type = 'success' } = options || {};
    setAlertModal({ open: true, title, message, type });
  };

  // Override window.alert inside Admin Dashboard so ALL alerts match SweetAlert design
  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (msg) => {
      showAlert(msg);
    };
    return () => {
      window.alert = originalAlert;
    };
  }, []);

  // Admin Audit Logs Management
  const [auditLogs, setAuditLogs] = useState([]);
  const [logSearch, setLogSearch] = useState('');
  const [logActionFilter, setLogActionFilter] = useState('all');
  const [logDateFilter, setLogDateFilter] = useState('all');

  // Emergency LocalStorage Rescue Cache (Protects customers if server container is reset)
  const [rescueData, setRescueData] = useState(() => {
    try {
      const saved = localStorage.getItem('tw_admin_rescue_snapshot');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const handleRestoreRescueData = async () => {
    if (!rescueData || !rescueData.customers || rescueData.customers.length === 0) return;
    try {
      const res = await fetch('/api/admin/database/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          backupData: {
            users: rescueData.customers || [],
            orders: rescueData.orders || [],
            carouselSlides: rescueData.slides || [],
            settings: rescueData.settings || siteSettings || null,
            games: games || []
          },
          adminName: adminUser?.name || 'Admin'
        })
      });
      const data = await res.json();
      if (data.success) {
        showAlert({
          title: 'กู้คืนข้อมูลสำเร็จ!',
          message: `กู้คืนข้อมูลลูกค้าสำเร็จแล้ว (${data.usersCount || rescueData.customers.length} คน) ข้อมูลบันทึกลง Cloud Database ถาวรเรียบร้อย`,
          type: 'success'
        });
        setRescueData(null);
        try {
          localStorage.removeItem('tw_admin_rescue_snapshot');
        } catch (e) {}
        loadData(false);
      } else {
        showAlert({ title: 'เกิดข้อผิดพลาด', message: data.message || 'กู้คืนไม่สำเร็จ', type: 'error' });
      }
    } catch (err) {
      showAlert({ title: 'เกิดข้อผิดพลาด', message: 'กู้คืนไม่สำเร็จ: ' + err.message, type: 'error' });
    }
  };

  // Load Admin Data
  const loadData = async (isBackgroundPoll = false) => {
    try {
      if (isBackgroundPoll) {
        // Fast background poll: refresh live stats, orders, customers, chats, slip deposits, audit logs, and db status
        const [statsRes, ordersRes, custRes, chatsRes, depRes, logRes, dbRes] = await Promise.all([
          fetch('/api/admin/stats').then(r => r.json()).catch(() => ({})),
          fetch('/api/admin/orders').then(r => r.json()).catch(() => ({})),
          fetch('/api/admin/customers').then(r => r.json()).catch(() => ({})),
          fetch('/api/admin/chats').then(r => r.json()).catch(() => ({ chats: [], totalUnread: 0 })),
          fetch('/api/admin/deposits').then(r => r.json()).catch(() => ({ deposits: [], pendingCount: 0 })),
          fetch('/api/admin/audit-logs').then(r => r.json()).catch(() => ({ logs: [] })),
          fetch('/api/admin/database/status').then(r => r.json()).catch(() => ({}))
        ]);
        if (statsRes?.success) setStats(statsRes);
        if (ordersRes?.success) setOrders(ordersRes.orders);
        if (custRes?.success && !customerEditModal.open) {
          setCustomers(custRes.customers || []);
          if (custRes.customers && custRes.customers.length > 0) {
            try {
              const snap = {
                customers: custRes.customers,
                orders: ordersRes?.orders || [],
                timestamp: Date.now()
              };
              localStorage.setItem('tw_admin_rescue_snapshot', JSON.stringify(snap));
              setRescueData(snap);
            } catch (e) {}
          }
        }
        if (chatsRes?.success) {
          setChats(chatsRes.chats);
          setLiveChatUnread(chatsRes.totalUnread || 0);
        }
        if (depRes?.success) {
          setDeposits(depRes.deposits || []);
          setPendingDepositsCount(depRes.pendingCount || 0);
        }
        if (logRes?.success) {
          setAuditLogs(logRes.logs || []);
        }
        if (dbRes?.success) {
          setDbStatus(dbRes.status);
        }
        return;
      }

      // Initial or explicit full load
      const [statsRes, ordersRes, provRes, gamesRes, cpnRes, custRes, setRes, admRes, sldRes, flashRes, cardRes, appRes, catRes, chatsRes, depRes, logRes, dbRes] = await Promise.all([
        fetch('/api/admin/stats').then(r => r.json()).catch(() => ({})),
        fetch('/api/admin/orders').then(r => r.json()).catch(() => ({})),
        fetch('/api/admin/providers').then(r => r.json()).catch(() => ({})),
        fetch('/api/admin/games').then(r => r.json()).catch(() => ({})),
        fetch('/api/admin/coupons').then(r => r.json()).catch(() => ({})),
        fetch('/api/admin/customers').then(r => r.json()).catch(() => ({})),
        fetch('/api/settings').then(r => r.json()).catch(() => ({})),
        fetch('/api/admin/admins').then(r => r.json()).catch(() => ({ admins: [] })),
        fetch('/api/admin/slides').then(r => r.json()).catch(() => ({ slides: [] })),
        fetch('/api/admin/flash-sales').then(r => r.json()).catch(() => ({ flashSales: [] })),
        fetch('/api/admin/gift-cards').then(r => r.json()).catch(() => ({ giftCards: [] })),
        fetch('/api/admin/app-subscriptions').then(r => r.json()).catch(() => ({ appSubscriptions: [] })),
        fetch('/api/admin/quick-categories').then(r => r.json()).catch(() => ({ categories: [] })),
        fetch('/api/admin/chats').then(r => r.json()).catch(() => ({ chats: [], totalUnread: 0 })),
        fetch('/api/admin/deposits').then(r => r.json()).catch(() => ({ deposits: [], pendingCount: 0 })),
        fetch('/api/admin/audit-logs').then(r => r.json()).catch(() => ({ logs: [] })),
        fetch('/api/admin/database/status').then(r => r.json()).catch(() => ({}))
      ]);

      if (statsRes?.success) setStats(statsRes);
      if (ordersRes?.success) setOrders(ordersRes.orders);
      if (provRes?.success) {
        setProviders(provRes.providers);
        setGameRoutes(provRes.routes || {});
      }
      if (gamesRes?.success) setGames(gamesRes.games);
      if (cpnRes?.success) setCoupons(cpnRes.coupons);
      if (setRes?.success) setSiteSettings(setRes.settings);
      if (custRes?.success && !customerEditModal.open) {
        setCustomers(custRes.customers || []);
        if (custRes.customers && custRes.customers.length > 0) {
          try {
            const snap = {
              customers: custRes.customers,
              orders: ordersRes?.orders || [],
              slides: sldRes?.slides || [],
              settings: setRes?.settings || null,
              timestamp: Date.now()
            };
            localStorage.setItem('tw_admin_rescue_snapshot', JSON.stringify(snap));
            setRescueData(snap);
          } catch (e) {}
        }
      }
      if (admRes?.success) setAdmins(admRes.admins);
      if (sldRes?.success) setSlides(sldRes.slides);
      if (flashRes?.success) setFlashSales(flashRes.flashSales);
      if (cardRes?.success) setGiftCards(cardRes.giftCards);
      if (appRes?.success) setAppSubscriptions(appRes.appSubscriptions);
      if (catRes?.success) setQuickCategories(catRes.categories);
      if (chatsRes?.success) {
        setChats(chatsRes.chats);
        setLiveChatUnread(chatsRes.totalUnread || 0);
        if (chatsRes.chats.length > 0) {
          setActiveChatId(prev => prev || chatsRes.chats[0].id);
        }
      }
      if (depRes?.success) {
        setDeposits(depRes.deposits || []);
        setPendingDepositsCount(depRes.pendingCount || 0);
      }
      if (logRes?.success) {
        setAuditLogs(logRes.logs || []);
      }
      if (dbRes?.success) {
        setDbStatus(dbRes.status);
      }
    } catch (err) {
      console.error("Admin data load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(false);
    const interval = setInterval(() => loadData(true), 10000); // Only poll orders/stats in background
    return () => clearInterval(interval);
  }, []);

  // Handle Retry Auto Top-up
  const handleRetryOrder = async (orderId) => {
    setRetryingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/retry`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showAlert({ title: 'เติมเงินสำเร็จ!', message: 'คำสั่งซื้อได้รับการเติมเงินใหม่อัตโนมัติสำเร็จแล้ว', type: 'success' });
        loadData();
      } else {
        showAlert({ title: 'เติมเงินไม่สำเร็จ', message: `การเติมเงินซ้ำล้มเหลว: ${data.error || 'ข้อผิดพลาดจาก API'}`, type: 'error' });
      }
    } catch (e) {
      showAlert({ title: 'เกิดข้อผิดพลาด', message: 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', type: 'error' });
    } finally {
      setRetryingId(null);
    }
  };

  // Handle Save Game Provider Route
  const handleSaveRoute = async (gameId, primary, fallback) => {
    try {
      const res = await fetch('/api/admin/routes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, primary, fallback })
      });
      const data = await res.json();
      if (data.success) {
        setGameRoutes(data.routes);
        showAlert({ title: 'บันทึกสำเร็จ!', message: `บันทึกเส้นทาง API สำหรับเกม ${gameId} สำเร็จเรียบร้อย`, type: 'success' });
      }
    } catch (e) {
      showAlert({ title: 'เกิดข้อผิดพลาด', message: 'ไม่สามารถบันทึกเส้นทาง API ได้', type: 'error' });
    }
  };

  // Handle Create Coupon
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(couponForm)
      });
      const data = await res.json();
      if (data.success) {
        setNewCouponModal(false);
        setCouponForm({ code: '', description: '', discountType: 'percent', discountValue: 10, minSpend: 0, maxDiscount: 100 });
        loadData();
        showAlert({ title: 'สร้างคูปองสำเร็จ!', message: `สร้างคูปอง ${couponForm.code} เรียบร้อยแล้ว`, type: 'success' });
      }
    } catch (e) {
      showAlert({ title: 'เกิดข้อผิดพลาด', message: 'สร้างคูปองไม่สำเร็จ', type: 'error' });
    }
  };

  // Handle Delete Game
  const handleDeleteGame = (gameId) => {
    showConfirm({
      title: 'ยืนยันการลบเกม',
      message: 'คุณแน่ใจใช่ไหมที่จะลบเกมนี้ออกจากระบบ ? ข้อมูลแพ็กเกจและราคาทั้งหมดของเกมนี้จะถูกลบออก',
      confirmText: 'ตกลง',
      cancelText: 'ยกเลิก',
      type: 'warning',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/games/${gameId}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.success) {
            showAlert({ title: 'ลบเกมสำเร็จ', message: 'ลบเกมออกจากระบบเรียบร้อยแล้ว' });
            loadData();
          } else {
            showAlert({ title: 'เกิดข้อผิดพลาด', message: data.message || 'ไม่สามารถลบเกมได้', type: 'error' });
          }
        } catch (e) {
          showAlert({ title: 'เกิดข้อผิดพลาด', message: 'เชื่อมต่อเซิร์ฟเวอร์ล้มเหลว', type: 'error' });
        }
      }
    });
  };

  // Handle Create / Delete Slide
  const handleCreateSlide = async (e) => {
    e.preventDefault();
    if (!slideForm.image) {
      showAlert({ title: 'แจ้งเตือน', message: 'กรุณาอัปโหลดรูปภาพแบนเนอร์', type: 'error' });
      return;
    }
    try {
      const res = await fetch('/api/admin/slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slideForm)
      });
      const data = await res.json();
      if (data.success) {
        setNewSlideModal(false);
        setSlideForm({ title: '', subtitle: '', badge: '⚡ ดีลพิเศษ', badgeColor: 'bg-red-600 text-white', image: '', ctaText: 'ช้อปดีลทันที', ctaTarget: 'popular-games' });
        loadData();
        showAlert({ title: 'สร้างแบนเนอร์สำเร็จ', message: 'เพิ่มแบนเนอร์ใหม่เข้าระบบเรียบร้อยแล้ว' });
      }
    } catch (e) {
      showAlert({ title: 'เกิดข้อผิดพลาด', message: 'สร้างแบนเนอร์ไม่สำเร็จ', type: 'error' });
    }
  };

  const handleDeleteSlide = (slideId) => {
    showConfirm({
      title: 'ยืนยันการลบแบนเนอร์',
      message: 'คุณแน่ใจใช่ไหมที่จะลบแบนเนอร์สไลด์นี้ออกจากหน้าแรก ?',
      confirmText: 'ตกลง',
      cancelText: 'ยกเลิก',
      type: 'warning',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/slides/${slideId}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.success) {
            loadData();
            showAlert({ title: 'ลบสำเร็จ', message: 'ลบแบนเนอร์เรียบร้อยแล้ว' });
          }
        } catch (e) {
          showAlert({ title: 'เกิดข้อผิดพลาด', message: 'เชื่อมต่อเซิร์ฟเวอร์ล้มเหลว', type: 'error' });
        }
      }
    });
  };

  // Handle Multiple File Selection for Banner Carousel
  const handleSelectMultiFiles = (files) => {
    if (!files || files.length === 0) return;
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml'];
    
    Array.from(files).forEach((file) => {
      if (!validTypes.includes(file.type)) {
        showAlert({
          title: 'ไฟล์ไม่รองรับ',
          message: `ไฟล์ "${file.name}" ไม่ใช่ไฟล์รูปภาพที่รองรับ (รองรับเฉพาะ PNG, JPG, WEBP, GIF, SVG)`,
          type: 'warning'
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showAlert({
          title: 'ขนาดไฟล์เกินกำหนด',
          message: `ไฟล์ "${file.name}" มีขนาดเกิน 5MB กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 5MB`,
          type: 'warning'
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setMultiUploadFiles((prev) => [
          ...prev,
          {
            file,
            preview: e.target.result,
            name: file.name,
            sizeKb: (file.size / 1024).toFixed(1)
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveSelectedMultiFile = (idx) => {
    setMultiUploadFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUploadMultipleSlides = async () => {
    if (multiUploadFiles.length === 0) return;
    setMultiUploadProgress({ isUploading: true, current: 0, total: multiUploadFiles.length, message: 'กำลังเริ่มอัปโหลด...' });

    const uploadedUrls = [];
    try {
      for (let i = 0; i < multiUploadFiles.length; i++) {
        const item = multiUploadFiles[i];
        setMultiUploadProgress({
          isUploading: true,
          current: i + 1,
          total: multiUploadFiles.length,
          message: `กำลังอัปโหลดรูปภาพที่ ${i + 1}/${multiUploadFiles.length}: ${item.name}`
        });

        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: item.preview,
            filename: item.name
          })
        });
        const data = await res.json();
        if (data.success && data.url) {
          uploadedUrls.push(data.url);
        }
      }

      if (uploadedUrls.length > 0) {
        setMultiUploadProgress({
          isUploading: true,
          current: multiUploadFiles.length,
          total: multiUploadFiles.length,
          message: 'กำลังบันทึกแบนเนอร์เข้าสู่ระบบ...'
        });

        const batchRes = await fetch('/api/admin/slides/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slides: uploadedUrls.map((url) => ({
              image: url,
              title: '',
              subtitle: '',
              badge: '',
              ctaTarget: 'popular-games',
              isPureGraphic: true,
              isActive: true
            }))
          })
        });
        const batchData = await batchRes.json();
        if (batchData.success) {
          setMultiUploadFiles([]);
          loadData();
          showAlert({
            title: 'อัปโหลดสำเร็จ!',
            message: `อัปโหลดและเพิ่มแบนเนอร์ใหม่สำเร็จ ${batchData.count} ภาพเรียบร้อยแล้ว!`,
            type: 'success'
          });
        } else {
          showAlert({
            title: 'เกิดข้อผิดพลาด',
            message: batchData.message || 'บันทึกแบนเนอร์ไม่สำเร็จ',
            type: 'error'
          });
        }
      } else {
        showAlert({
          title: 'อัปโหลดรูปภาพไม่สำเร็จ',
          message: 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์รูปภาพไปยังเซิร์ฟเวอร์',
          type: 'error'
        });
      }
    } catch (err) {
      showAlert({
        title: 'เกิดข้อผิดพลาด',
        message: 'เกิดข้อผิดพลาดในการอัปโหลดหลายภาพ: ' + err.message,
        type: 'error'
      });
    } finally {
      setMultiUploadProgress({ isUploading: false, current: 0, total: 0, message: '' });
    }
  };

  // Reorder Slide (Move Up / Down)
  const handleMoveSlide = async (slideId, direction) => {
    const idx = slides.findIndex((s) => s.id === slideId);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === slides.length - 1) return;

    const newSlides = [...slides];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const temp = newSlides[idx];
    newSlides[idx] = newSlides[targetIdx];
    newSlides[targetIdx] = temp;

    setSlides(newSlides);

    try {
      await fetch('/api/admin/slides/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slideIds: newSlides.map((s) => s.id) })
      });
      loadData();
    } catch (e) {
      loadData();
    }
  };

  // Toggle Slide Active / Inactive
  const handleToggleSlideActive = async (slide) => {
    try {
      const res = await fetch(`/api/admin/slides/${slide.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !slide.isActive })
      });
      const data = await res.json();
      if (data.success) loadData();
    } catch (e) {}
  };

  // Restore Default Demo Banners
  const handleRestoreDefaultSlides = () => {
    showConfirm({
      title: 'ยืนยันการคืนค่าแบนเนอร์',
      message: 'ต้องการคืนค่าแบนเนอร์เกมตัวอย่าง (ROV, Free Fire, Valorant, Genshin) หรือไม่ ?',
      confirmText: 'ตกลง',
      cancelText: 'ยกเลิก',
      type: 'warning',
      onConfirm: async () => {
        try {
          const res = await fetch('/api/admin/slides/reset-defaults', { method: 'POST' });
          const data = await res.json();
          if (data.success) {
            loadData();
            showAlert({ title: 'คืนค่าสำเร็จ', message: 'คืนค่าแบนเนอร์เกมตัวอย่างสำเร็จเรียบร้อย!' });
          }
        } catch (e) {
          showAlert({ title: 'เกิดข้อผิดพลาด', message: 'เกิดข้อผิดพลาดในการคืนค่า', type: 'error' });
        }
      }
    });
  };

  // Clear All Slides
  const handleClearAllSlides = () => {
    showConfirm({
      title: 'คำเตือน: ลบแบนเนอร์ทั้งหมด',
      message: 'คุณแน่ใจใช่ไหมว่าต้องการลบแบนเนอร์ทั้งหมดในระบบ ? หน้าร้านจะไม่มีสไลด์แสดงผล',
      confirmText: 'ตกลง',
      cancelText: 'ยกเลิก',
      type: 'warning',
      onConfirm: async () => {
        try {
          const res = await fetch('/api/admin/slides/all', { method: 'DELETE' });
          const data = await res.json();
          if (data.success) {
            loadData();
            showAlert({ title: 'ลบสำเร็จ', message: 'ลบแบนเนอร์ทั้งหมดเรียบร้อยแล้ว' });
          }
        } catch (e) {
          showAlert({ title: 'เกิดข้อผิดพลาด', message: 'เกิดข้อผิดพลาดในการลบแบนเนอร์', type: 'error' });
        }
      }
    });
  };

  // Save Edit Slide
  const handleSaveEditSlide = async (e) => {
    e.preventDefault();
    if (!editSlideModal) return;
    try {
      const res = await fetch(`/api/admin/slides/${editSlideModal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editSlideModal)
      });
      const data = await res.json();
      if (data.success) {
        setEditSlideModal(null);
        loadData();
        showAlert({ title: 'บันทึกสำเร็จ', message: 'บันทึกการแก้ไขแบนเนอร์สำเร็จเรียบร้อย' });
      }
    } catch (e) {
      showAlert({ title: 'เกิดข้อผิดพลาด', message: 'แก้ไขแบนเนอร์ไม่สำเร็จ', type: 'error' });
    }
  };

  // Handle Delete Admin
  const handleDeleteAdmin = (adminId) => {
    showConfirm({
      title: 'ยืนยันการลบผู้ดูแลระบบ',
      message: 'ต้องการลบบัญชีผู้ดูแลระบบนี้หรือไม่ ? การกระทำนี้ไม่สามารถยกเลิกได้',
      confirmText: 'ตกลง',
      cancelText: 'ยกเลิก',
      type: 'warning',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/admins/${adminId}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.success) {
            showAlert({ title: 'ลบสำเร็จ', message: 'ลบบัญชีผู้ดูแลเรียบร้อยแล้ว' });
            loadData();
          } else {
            showAlert({ title: 'เกิดข้อผิดพลาด', message: data.message || 'ลบไม่สำเร็จ', type: 'error' });
          }
        } catch (e) {
          showAlert({ title: 'เกิดข้อผิดพลาด', message: 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', type: 'error' });
        }
      }
    });
  };

  // Handle Reset Stats & Orders to 0
  const handleResetStats = () => {
    showConfirm({
      title: 'ยืนยันการรีเซ็ตข้อมูล',
      message: 'ยืนยันการรีเซ็ตข้อมูลคำสั่งซื้อและสถิติหลังบ้านทั้งหมดให้เป็น 0 หรือไม่ ?',
      confirmText: 'ตกลง',
      cancelText: 'ยกเลิก',
      type: 'warning',
      onConfirm: async () => {
        try {
          const res = await fetch('/api/admin/reset-stats', { method: 'POST' });
          const data = await res.json();
          if (data.success) {
            showAlert({ title: 'รีเซ็ตสำเร็จ', message: data.message || 'รีเซ็ตข้อมูลเรียบร้อยแล้ว' });
            loadData();
          }
        } catch (e) {
          showAlert({ title: 'เกิดข้อผิดพลาด', message: 'เกิดข้อผิดพลาดในการรีเซ็ต', type: 'error' });
        }
      }
    });
  };

  // Handle Adjust Customer Wallet
  const handleAdjustWallet = async (action) => {
    if (!selectedCustomer) return;
    try {
      const res = await fetch(`/api/admin/customers/${selectedCustomer.id}/wallet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(adjustAmount),
          action,
          adminName: adminUser?.name || adminUser?.username || 'Admin'
        })
      });
      const data = await res.json();
      if (data.success) {
        showAlert({
          title: 'ปรับยอดเงินสำเร็จ!',
          message: `ปรับยอดเงินกระเป๋าเรียบร้อย ยอดใหม่: ฿${data.user.walletBalance.toFixed(2)}`
        });
        setSelectedCustomer(null);
        loadData(false);
      }
    } catch (e) {
      showAlert({ title: 'เกิดข้อผิดพลาด', message: 'ไม่สามารถปรับยอดเงินได้', type: 'error' });
    }
  };

  // Handle Edit Customer Profile (Name, Phone, Email, Password, Tier, Wallet)
  const handleOpenEditCustomer = (cust) => {
    setCustomerEditModal({
      open: true,
      customer: cust,
      form: {
        name: cust.name || '',
        phone: cust.phone || '',
        email: cust.email || '',
        password: '',
        tier: cust.tier || 'Bronze',
        walletBalance: cust.walletBalance || 0
      }
    });
  };

  const handleSaveCustomer = (e) => {
    if (e) e.preventDefault();
    if (!customerEditModal.customer) return;

    showConfirm({
      title: 'ยืนยันการอัปเดตสมาชิก',
      message: 'คุณแน่ใจใช่ไหมที่จะแก้ไขสมาชิกนี้ ?',
      confirmText: 'ตกลง',
      cancelText: 'ยกเลิก',
      type: 'warning',
      onConfirm: async () => {
        setIsSavingCustomer(true);
        try {
          const res = await fetch(`/api/admin/customers/${customerEditModal.customer.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...customerEditModal.form,
              adminName: adminUser?.name || adminUser?.username || 'Admin'
            })
          });
          const data = await res.json();
          if (data.success) {
            setCustomerEditModal({ open: false, customer: null, form: {} });
            loadData(false);
            showAlert({
              title: 'อัปเดตสมาชิกสำเร็จ!',
              message: `บันทึกข้อมูลของ ${customerEditModal.form.name || customerEditModal.customer.username} เรียบร้อยแล้ว`,
              type: 'success'
            });
          } else {
            showAlert({
              title: 'เกิดข้อผิดพลาด',
              message: data.message || 'ไม่สามารถบันทึกข้อมูลลูกค้าได้',
              type: 'error'
            });
          }
        } catch (err) {
          showAlert({
            title: 'เกิดข้อผิดพลาด',
            message: 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์',
            type: 'error'
          });
        } finally {
          setIsSavingCustomer(false);
        }
      }
    });
  };

  // Export Audit Logs to CSV
  const handleExportAuditLogsCSV = () => {
    if (!auditLogs || auditLogs.length === 0) {
      showAlert({
        title: 'ไม่มีข้อมูล',
        message: 'ยังไม่มีข้อมูลประวัติกิจกรรมของแอดมินให้ส่งออกเป็น CSV',
        type: 'warning'
      });
      return;
    }
    const headers = ['รหัสอ้างอิง (Log ID)', 'วันที่และเวลา (Timestamp)', 'ผู้ดำเนินการ (Admin)', 'ประเภทกิจกรรม (Action)', 'รายละเอียด (Details)'];
    const rows = auditLogs.map(log => [
      `"${log.id || ''}"`,
      `"${new Date(log.createdAt).toLocaleString('th-TH')}"`,
      `"${log.adminName || log.adminId || ''}"`,
      `"${log.action || ''}"`,
      `"${(log.details || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `boostup_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ----------------------------------------------------
  // Flash Sale Handlers
  // ----------------------------------------------------
  const handleSaveFlashSale = async (formData) => {
    try {
      const isEdit = Boolean(formData.id);
      const url = isEdit ? `/api/admin/flash-sales/${formData.id}` : '/api/admin/flash-sales';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setFlashSaleModal({ open: false, item: null });
        loadData();
        showAlert({
          title: 'บันทึกสำเร็จ!',
          message: isEdit ? 'แก้ไขข้อมูล Flash Sale เรียบร้อยแล้ว' : 'เพิ่มดีล Flash Sale ใหม่เรียบร้อยแล้ว',
          type: 'success'
        });
      } else {
        showAlert({
          title: 'บันทึกไม่สำเร็จ',
          message: data.message || 'บันทึกดีลฟ้าผ่าไม่สำเร็จ',
          type: 'error'
        });
      }
    } catch (e) {
      showAlert({
        title: 'เกิดข้อผิดพลาด',
        message: 'เกิดข้อผิดพลาดในการเชื่อมต่อเพื่อบันทึกข้อมูล',
        type: 'error'
      });
    }
  };

  const handleDeleteFlashSale = (id) => {
    showConfirm({
      title: 'ยืนยันการลบดีล Flash Sale',
      message: 'คุณแน่ใจใช่ไหมที่จะลบดีล Flash Sale นี้ออกจากระบบ ?',
      confirmText: 'ตกลง',
      cancelText: 'ยกเลิก',
      type: 'warning',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/flash-sales/${id}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.success) {
            loadData();
            showAlert({ title: 'ลบสำเร็จ', message: 'ลบดีล Flash Sale เรียบร้อยแล้ว' });
          }
        } catch (e) {
          showAlert({ title: 'เกิดข้อผิดพลาด', message: 'เกิดข้อผิดพลาดในการลบดีล', type: 'error' });
        }
      }
    });
  };

  // ----------------------------------------------------
  // Gift Card Handlers
  // ----------------------------------------------------
  const handleSaveGiftCard = async (formData) => {
    try {
      const isEdit = Boolean(formData.id);
      const url = isEdit ? `/api/admin/gift-cards/${formData.id}` : '/api/admin/gift-cards';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setGiftCardModal({ open: false, item: null });
        loadData();
        showAlert({ title: 'บันทึกสำเร็จ', message: 'บันทึกบัตรเติมเงินเรียบร้อยแล้ว' });
      } else {
        showAlert({ title: 'เกิดข้อผิดพลาด', message: data.message || 'บันทึกบัตรเติมเงินไม่สำเร็จ', type: 'error' });
      }
    } catch (e) {
      showAlert({ title: 'เกิดข้อผิดพลาด', message: 'เกิดข้อผิดพลาดในการบันทึก', type: 'error' });
    }
  };

  const handleDeleteGiftCard = (id) => {
    showConfirm({
      title: 'ยืนยันการลบบัตรเติมเงิน',
      message: 'คุณแน่ใจใช่ไหมที่จะลบบัตรเติมเงินนี้ออกจากระบบ ?',
      confirmText: 'ตกลง',
      cancelText: 'ยกเลิก',
      type: 'warning',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/gift-cards/${id}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.success) {
            loadData();
            showAlert({ title: 'ลบสำเร็จ', message: 'ลบบัตรเติมเงินเรียบร้อยแล้ว' });
          }
        } catch (e) {
          showAlert({ title: 'เกิดข้อผิดพลาด', message: 'เกิดข้อผิดพลาดในการลบ', type: 'error' });
        }
      }
    });
  };

  // ----------------------------------------------------
  // App Subscription Handlers
  // ----------------------------------------------------
  const handleSaveAppSub = async (formData) => {
    try {
      const isEdit = Boolean(formData.id);
      const url = isEdit ? `/api/admin/app-subscriptions/${formData.id}` : '/api/admin/app-subscriptions';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setAppSubModal({ open: false, item: null });
        loadData();
        showAlert({ title: 'บันทึกสำเร็จ', message: 'บันทึกบริการแอปเรียบร้อยแล้ว' });
      } else {
        showAlert({ title: 'เกิดข้อผิดพลาด', message: data.message || 'บันทึกบริการแอปไม่สำเร็จ', type: 'error' });
      }
    } catch (e) {
      showAlert({ title: 'เกิดข้อผิดพลาด', message: 'เกิดข้อผิดพลาดในการบันทึก', type: 'error' });
    }
  };

  const handleDeleteAppSub = (id) => {
    showConfirm({
      title: 'ยืนยันการลบบริการแอป',
      message: 'คุณแน่ใจใช่ไหมที่จะลบบริการแอปนี้ออกจากระบบ ?',
      confirmText: 'ตกลง',
      cancelText: 'ยกเลิก',
      type: 'warning',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/app-subscriptions/${id}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.success) {
            loadData();
            showAlert({ title: 'ลบสำเร็จ', message: 'ลบบริการแอปเรียบร้อยแล้ว' });
          }
        } catch (e) {
          showAlert({ title: 'เกิดข้อผิดพลาด', message: 'เกิดข้อผิดพลาดในการลบ', type: 'error' });
        }
      }
    });
  };

  // ----------------------------------------------------
  // Quick Category & Bank Account Handlers
  // ----------------------------------------------------
  const handleUpdateCategory = async (catId, updates) => {
    const updated = quickCategories.map(c => c.id === catId ? { ...c, ...updates } : c);
    setQuickCategories(updated);
    try {
      await fetch('/api/admin/quick-categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: updated })
      });
    } catch (e) {}
  };

  const handleAddBankAccount = async () => {
    if (!bankForm.accountNo || !bankForm.accountName) {
      showAlert({
        title: 'ข้อมูลไม่ครบถ้วน',
        message: 'กรุณากรอกเลขที่บัญชีและชื่อบัญชีให้ครบถ้วน',
        type: 'warning'
      });
      return;
    }
    const newBank = {
      id: `bank_${Date.now()}`,
      ...bankForm
    };
    const currentBanks = siteSettings?.bankAccounts || [];
    const updatedBanks = [...currentBanks, newBank];
    const updatedSettings = {
      ...siteSettings,
      bankAccounts: updatedBanks
    };

    setSiteSettings(updatedSettings);
    setNewBankModal(false);
    setBankForm({
      bankName: 'ธนาคารกสิกรไทย (KBANK)',
      accountNo: '',
      accountName: '',
      promptpayLinked: false,
      isActive: true
    });

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings)
      });
      const data = await res.json();
      if (data.success) {
        setSiteSettings(data.settings);
      }
    } catch (e) {
      console.error("Failed to auto-save bank account:", e);
    }
  };

  const handleDeleteBankAccount = async (bankId) => {
    const updatedBanks = (siteSettings?.bankAccounts || []).filter(b => b.id !== bankId);
    const updatedSettings = {
      ...siteSettings,
      bankAccounts: updatedBanks
    };
    setSiteSettings(updatedSettings);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings)
      });
      const data = await res.json();
      if (data.success) {
        setSiteSettings(data.settings);
      }
    } catch (e) {
      console.error("Failed to auto-save after bank deletion:", e);
    }
  };

  // Payment Methods Visibility & Toggle Handlers
  const handleTogglePaymentMethod = async (methodKey) => {
    const currentMethods = siteSettings?.paymentMethods || {
      promptpay: { enabled: true },
      truemoney: { enabled: true },
      bank_transfer: { enabled: true },
      wallet: { enabled: true },
      credit_card: { enabled: false }
    };
    const isCurrentlyEnabled = currentMethods[methodKey]?.enabled !== false;
    const updatedMethods = {
      ...currentMethods,
      [methodKey]: {
        ...(currentMethods[methodKey] || {}),
        enabled: !isCurrentlyEnabled
      }
    };
    const updatedSettings = {
      ...siteSettings,
      paymentMethods: updatedMethods
    };
    setSiteSettings(updatedSettings);

    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings)
      });
    } catch (e) {
      console.error("Failed to auto-save payment method toggle:", e);
    }
  };

  const handleSetAllPaymentMethods = async (enable) => {
    const currentMethods = siteSettings?.paymentMethods || {
      promptpay: { enabled: true },
      truemoney: { enabled: true },
      bank_transfer: { enabled: true },
      wallet: { enabled: true },
      credit_card: { enabled: false }
    };
    const updatedMethods = { ...currentMethods };
    ['promptpay', 'truemoney', 'bank_transfer', 'wallet'].forEach(k => {
      updatedMethods[k] = { ...(updatedMethods[k] || {}), enabled: enable };
    });
    if (!enable) {
      updatedMethods.promptpay = { ...(updatedMethods.promptpay || {}), enabled: true };
    }
    const updatedSettings = {
      ...siteSettings,
      paymentMethods: updatedMethods
    };
    setSiteSettings(updatedSettings);

    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings)
      });
      showAlert({
        title: 'บันทึกสถานะเรียบร้อย',
        message: enable ? 'เปิดใช้งานทุกช่องทางการชำระเงินเรียบร้อยแล้ว' : 'เปิดเฉพาะพร้อมเพย์ และปิดช่องทางอื่นเรียบร้อยแล้ว',
        type: 'success'
      });
    } catch (e) {
      console.error("Failed to set all payment methods:", e);
    }
  };

  // Database Backup, Restore & PostgreSQL Handlers
  const handleDownloadBackup = () => {
    window.open('/api/admin/database/backup', '_blank');
  };

  const handleRestoreBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    showConfirm({
      title: 'ยืนยันการกู้คืนฐานข้อมูล',
      message: `คุณต้องการกู้คืนข้อมูลระบบจากไฟล์ "${file.name}" ใช่หรือไม่ ? ข้อมูลปัจจุบันจะถูกแทนที่ด้วยข้อมูลจากไฟล์สำรองนี้ทั้งหมด`,
      confirmText: 'ตกลง',
      cancelText: 'ยกเลิก',
      type: 'warning',
      onConfirm: () => {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const json = JSON.parse(event.target.result);
            const res = await fetch('/api/admin/database/restore', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ backupData: json, adminName: adminUser?.name || 'Admin' })
            });
            const data = await res.json();
            if (data.success) {
              showAlert({
                title: 'กู้คืนฐานข้อมูลสำเร็จ!',
                message: `กู้คืนข้อมูลเรียบร้อย (สมาชิก ${data.usersCount} คน, ออเดอร์ ${data.ordersCount} รายการ)`,
                type: 'success'
              });
              loadData(false);
            } else {
              showAlert({ title: 'เกิดข้อผิดพลาด', message: data.message || 'กู้คืนฐานข้อมูลไม่สำเร็จ', type: 'error' });
            }
          } catch (err) {
            showAlert({ title: 'เกิดข้อผิดพลาด', message: 'ไฟล์สำรองไม่ถูกต้อง: ' + err.message, type: 'error' });
          } finally {
            e.target.value = '';
          }
        };
        reader.readAsText(file);
      },
      onCancel: () => {
        e.target.value = '';
      }
    });
  };

  const handleConnectPostgres = async (e) => {
    if (e) e.preventDefault();
    if (!pgUrlInput.trim()) {
      setPgConnectMsg({ type: 'error', text: 'กรุณากรอก DATABASE_URL' });
      return;
    }

    setIsConnectingPg(true);
    setPgConnectMsg({ type: '', text: '' });

    try {
      const res = await fetch('/api/admin/database/connect-pg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          databaseUrl: pgUrlInput.trim(),
          adminName: adminUser?.name || 'Admin'
        })
      });
      const data = await res.json();
      if (data.success) {
        setPgConnectMsg({ type: 'success', text: data.message });
        loadData(false);
      } else {
        setPgConnectMsg({ type: 'error', text: data.message || 'เชื่อมต่อไม่สำเร็จ' });
      }
    } catch (err) {
      setPgConnectMsg({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + err.message });
    } finally {
      setIsConnectingPg(false);
    }
  };

  // Live Chat Handlers
  const handleSelectChat = async (chatId) => {
    setActiveChatId(chatId);
    try {
      await fetch(`/api/admin/chats/${chatId}/read`, { method: 'PUT' });
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, unreadAdmin: 0 } : c));
      setLiveChatUnread(prev => Math.max(0, prev - (chats.find(c => c.id === chatId)?.unreadAdmin || 0)));
    } catch (e) {}
  };

  const handleSendAdminReply = async (quickText = null) => {
    const text = (quickText || chatReplyText).trim();
    if (!text || !activeChatId || isSendingReply) return;

    setIsSendingReply(true);
    if (!quickText) setChatReplyText('');

    try {
      const res = await fetch(`/api/admin/chats/${activeChatId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          adminName: 'แอดมิน BOOSTUP'
        })
      });
      const data = await res.json();
      if (data.success && data.chat) {
        setChats(prev => prev.map(c => c.id === activeChatId ? data.chat : c));
      }
    } catch (err) {
      console.error("Failed to send admin reply:", err);
    } finally {
      setIsSendingReply(false);
    }
  };

  // Filtered orders list
  const filteredOrders = orders.filter(o => {
    if (orderFilterStatus !== 'all' && o.topupStatus !== orderFilterStatus) return false;
    if (orderSearch) {
      const q = orderSearch.toLowerCase();
      return o.orderNumber.toLowerCase().includes(q) ||
        o.playerId.toLowerCase().includes(q) ||
        (o.playerNickname && o.playerNickname.toLowerCase().includes(q)) ||
        o.gameName.toLowerCase().includes(q);
    }
    return true;
  });

  // Deposit Slip Approval Handlers
  const handleApproveDeposit = (id) => {
    showConfirm({
      title: 'ยืนยันการอนุมัติสลิป',
      message: 'คุณแน่ใจใช่ไหมที่จะอนุมัติสลิปนี้ และเติมเงินเข้ากระเป๋าลูกค้าทันที ?',
      confirmText: 'ตกลง',
      cancelText: 'ยกเลิก',
      type: 'warning',
      onConfirm: async () => {
        setIsProcessingSlip(true);
        try {
          const res = await fetch(`/api/admin/deposits/${id}/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminName: adminUser?.name || 'Admin' })
          });
          const data = await res.json();
          if (data.success) {
            setSelectedSlipModal(null);
            loadData(false);
            showAlert({
              title: 'อนุมัติสลิปสำเร็จ!',
              message: 'อนุมัติสลิปและเติมเงินเข้ากระเป๋าลูกค้าเรียบร้อยแล้ว',
              type: 'success'
            });
          } else {
            showAlert({ title: 'เกิดข้อผิดพลาด', message: `ไม่สามารถอนุมัติได้: ${data.message}`, type: 'error' });
          }
        } catch (err) {
          showAlert({ title: 'เกิดข้อผิดพลาด', message: 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', type: 'error' });
        } finally {
          setIsProcessingSlip(false);
        }
      }
    });
  };

  const handleRejectDeposit = () => {
    if (!rejectReasonModal) return;
    showConfirm({
      title: 'ยืนยันการปฏิเสธสลิป',
      message: 'คุณแน่ใจใช่ไหมที่จะปฏิเสธรายการสลิปนี้ ? ยอดเงินจะไม่เข้ากระเป๋าลูกค้า',
      confirmText: 'ตกลง',
      cancelText: 'ยกเลิก',
      type: 'warning',
      onConfirm: async () => {
        setIsProcessingSlip(true);
        try {
          const res = await fetch(`/api/admin/deposits/${rejectReasonModal.id}/reject`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              reason: rejectReasonText.trim() || 'สลิปไม่ถูกต้อง หรือยอดเงินไม่ตรง',
              adminName: adminUser?.name || 'Admin'
            })
          });
          const data = await res.json();
          if (data.success) {
            setRejectReasonModal(null);
            setSelectedSlipModal(null);
            loadData(false);
            showAlert({
              title: 'ปฏิเสธสลิปเรียบร้อย',
              message: 'ปฏิเสธรายการสลิปและแจ้งให้ลูกค้าทราบแล้ว',
              type: 'info'
            });
          } else {
            showAlert({ title: 'เกิดข้อผิดพลาด', message: `ไม่สามารถปฏิเสธได้: ${data.message}`, type: 'error' });
          }
        } catch (err) {
          showAlert({ title: 'เกิดข้อผิดพลาด', message: 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', type: 'error' });
        } finally {
          setIsProcessingSlip(false);
        }
      }
    });
  };

  // Filtered deposits list
  const filteredDeposits = deposits.filter(d => {
    if (slipFilter !== 'all' && d.status !== slipFilter) return false;
    if (slipSearch) {
      const q = slipSearch.toLowerCase();
      return (d.id && d.id.toLowerCase().includes(q)) ||
        (d.userName && d.userName.toLowerCase().includes(q)) ||
        (d.userEmail && d.userEmail.toLowerCase().includes(q)) ||
        (d.userId && d.userId.toLowerCase().includes(q));
    }
    return true;
  });

  // Filtered customers list
  const filteredCustomers = customers.filter(c => {
    if (!customerSearch) return true;
    const q = customerSearch.toLowerCase();
    return (c.name && c.name.toLowerCase().includes(q)) ||
      (c.username && c.username.toLowerCase().includes(q)) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q));
  });

  // Filtered audit logs list
  const filteredAuditLogs = auditLogs.filter(log => {
    // Action filter
    if (logActionFilter === 'admin_only' && log.adminId === 'user') return false;
    if (logActionFilter !== 'all' && logActionFilter !== 'admin_only') {
      if (logActionFilter === 'APPROVE_SLIP' && log.action !== 'APPROVE_SLIP') return false;
      if (logActionFilter === 'REJECT_SLIP' && log.action !== 'REJECT_SLIP') return false;
      if (logActionFilter === 'UPDATE_CUSTOMER' && log.action !== 'UPDATE_CUSTOMER') return false;
      if (logActionFilter === 'ADJUST_WALLET' && log.action !== 'ADJUST_WALLET') return false;
      if (logActionFilter === 'SETTINGS' && !['UPDATE_SETTINGS', 'SAVE_GAME', 'DELETE_GAME', 'SAVE_SLIDE', 'DELETE_SLIDE', 'CREATE_COUPON', 'DELETE_COUPON', 'SAVE_FLASH_SALE', 'DELETE_FLASH_SALE'].includes(log.action)) return false;
      if (logActionFilter === 'AUTH' && !['ADMIN_LOGIN_SUCCESS', 'ADMIN_LOGIN_FAILED', 'PASSWORD_RESET_SUCCESS', 'OTP_REQUESTED'].includes(log.action)) return false;
    }

    // Date filter
    if (logDateFilter === 'today') {
      const today = new Date().toISOString().slice(0, 10);
      if (!log.createdAt || !log.createdAt.startsWith(today)) return false;
    } else if (logDateFilter === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      if (new Date(log.createdAt) < weekAgo) return false;
    }

    // Search query
    if (logSearch) {
      const q = logSearch.toLowerCase();
      return (log.id && log.id.toLowerCase().includes(q)) ||
        (log.adminName && log.adminName.toLowerCase().includes(q)) ||
        (log.action && log.action.toLowerCase().includes(q)) ||
        (log.details && log.details.toLowerCase().includes(q));
    }
    return true;
  });

  const navItems = [
    { id: 'overview', label: 'แผงควบคุม', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'slips', label: 'อนุมัติสลิปเติมเงิน', icon: <FileCheck className="w-4 h-4 text-emerald-400" />, count: pendingDepositsCount },
    { id: 'orders', label: 'คำสั่งซื้อ', icon: <ShoppingCart className="w-4 h-4" />, count: orders.length },
    { id: 'live_chat', label: 'แชทสดลูกค้า (Live Chat)', icon: <MessageSquare className="w-4 h-4 text-emerald-400" />, count: liveChatUnread },
    { id: 'autotopup', label: 'เติมเงินอัตโนมัติ', icon: <Zap className="w-4 h-4" /> },
    { id: 'games', label: 'จัดการเกม & แพ็กเกจ', icon: <Gamepad2 className="w-4 h-4" />, count: games.length },
    { id: 'flash_sales', label: 'จัดการดีล Flash Sale', icon: <Zap className="w-4 h-4 text-amber-400" />, count: flashSales.length },
    { id: 'gift_cards', label: 'จัดการบัตรเติมเงิน', icon: <CreditCard className="w-4 h-4 text-blue-400" />, count: giftCards.length },
    { id: 'app_subs', label: 'จัดการต่ออายุแอป', icon: <Film className="w-4 h-4 text-purple-400" />, count: appSubscriptions.length },
    { id: 'cms', label: 'แบนเนอร์ & หน้าร้าน (CMS)', icon: <LayoutGrid className="w-4 h-4 text-emerald-400" /> },
    { id: 'providers', label: 'ผู้ให้บริการ API', icon: <GitFork className="w-4 h-4" /> },
    { id: 'coupons', label: 'โปรโมชั่น & คูปอง', icon: <Tag className="w-4 h-4" /> },
    { id: 'customers', label: 'ลูกค้า & กระเป๋าเงิน', icon: <Users className="w-4 h-4" />, count: customers.length },
    { id: 'admins', label: 'ผู้ดูแล & สิทธิ์ (RBAC)', icon: <Shield className="w-4 h-4" />, count: admins.length },
    { id: 'audit_logs', label: 'ประวัติกิจกรรมแอดมิน', icon: <History className="w-4 h-4 text-amber-400" />, count: auditLogs.length },
    { id: 'settings', label: 'ตั้งค่าเว็บไซต์ & ชำระเงิน', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex font-['Prompt',sans-serif]">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0d14] border-r border-red-950/40 flex flex-col shrink-0">
        
        {/* Brand Header */}
        <div className="p-5 border-b border-red-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/boostup_logo.jpg"
              alt="BOOSTUP"
              className="w-10 h-10 rounded-xl object-contain border border-red-500/50 glow-red-sm shadow-md"
            />
            <div>
              <div className="text-sm font-black tracking-wider text-white font-['Kanit']">
                BOOST<span className="text-red-500">UP</span>
              </div>
              <div className="text-[9px] text-zinc-400 tracking-wider">ADMIN DASHBOARD</div>
            </div>
          </div>
        </div>

        {/* Back to Storefront Link */}
        <div className="px-4 py-3 border-b border-zinc-900">
          <button
            onClick={onBackToStore}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับสู่หน้าร้านค้าลูกค้า</span>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-600/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-white' : 'text-red-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    item.id === 'slips' && pendingDepositsCount > 0
                      ? 'bg-amber-500 text-black animate-pulse ring-2 ring-amber-400 font-extrabold'
                      : item.id === 'live_chat' && liveChatUnread > 0
                      ? 'bg-red-600 text-white animate-pulse ring-2 ring-red-400'
                      : isActive ? 'bg-black/30 text-white' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* System Health / 24h Auto Status */}
        <div className="p-4 border-t border-zinc-900 bg-black/40">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
            <span>สถานะระบบเติมเงิน:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              ออนไลน์ 24 ชม.
            </span>
          </div>
          <div className="text-[10px] text-zinc-500">Auto Topup Engine v1.0</div>
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header Bar */}
        <header className="h-16 px-8 border-b border-zinc-800 bg-[#0a0d14]/70 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-black text-white font-['Kanit']">
              {navItems.find(n => n.id === activeTab)?.label || 'แผงควบคุม'}
            </h1>
            <span className="text-xs bg-red-950 text-red-400 px-2 py-0.5 rounded border border-red-800/40 font-medium">
              สด (Live Realtime)
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleResetStats}
              title="รีเซ็ตสถิติและคำสั่งซื้อทั้งหมดเป็น 0"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-red-950/80 text-zinc-400 hover:text-red-400 border border-zinc-800 text-xs font-semibold transition-all"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>รีเซ็ตสถิติเป็น 0</span>
            </button>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <span>API Providers <strong>4</strong> ค่ายพร้อมใช้งาน</span>
            </div>
            <div className="flex items-center gap-3 pl-4 border-l border-zinc-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-red-600/30">
                {(adminUser?.name || 'Admin')[0].toUpperCase()}
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-white leading-tight">
                  {adminUser?.name || 'ผู้ดูแลระบบ'}
                </div>
                <div className="text-[10px] text-zinc-400 font-medium leading-tight">
                  {adminUser?.role === 'super_admin' ? 'Super Admin' : (adminUser?.role || 'Admin')}
                </div>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  title="ออกจากระบบแอดมิน"
                  className="ml-2 p-1.5 rounded-lg bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-400 border border-zinc-800 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Tab Content Router */}
        <div className="p-8 space-y-8">

          {/* 1. Emergency Rescue Banner (If server container reset but client has cached users) */}
          {rescueData && (rescueData.customers?.length || 0) > 0 && customers.length === 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/80 via-orange-950/70 to-red-950/80 border-2 border-amber-500 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl animate-pulse">
              <div className="flex items-center gap-3.5">
                <span className="text-3xl select-none">🛡️</span>
                <div>
                  <h4 className="text-sm font-bold text-amber-300 font-['Kanit'] flex items-center gap-2">
                    <span>พบข้อมูลสำรองสมาชิกในเครื่องของคุณ ({rescueData.customers?.length || 0} คน)!</span>
                  </h4>
                  <p className="text-xs text-zinc-200 mt-0.5 leading-relaxed">
                    เซิร์ฟเวอร์เพิ่งถูก Render รีสตาร์ท/Deploy ใหม่ คุณสามารถกดปุ่มเพื่อกู้คืนข้อมูลสมาชิกขึ้นเซิร์ฟเวอร์ทันที
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRestoreRescueData}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs shadow-lg shadow-amber-400/30 flex items-center gap-1.5 whitespace-nowrap cursor-pointer active:scale-95 transition-all"
              >
                <span>⚡ กู้คืนข้อมูลลูกค้าทันที (1 คลิก)</span>
              </button>
            </div>
          )}

          {/* 2. Cloud PostgreSQL Alert Banner (If using temporary ephemeral storage) */}
          {dbStatus && !dbStatus.isPgConnected && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/60 via-zinc-900 to-amber-950/60 border border-red-500/50 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-400 shrink-0">
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-red-300 font-['Kanit'] flex items-center gap-2">
                    <span>⚠️ ระบบยังใช้พื้นที่ชั่วคราว (ข้อมูลอาจรีเซ็ตเมื่อ Render มีการ Deploy โค้ดใหม่)</span>
                  </h4>
                  <p className="text-[11px] text-zinc-300 mt-0.5">
                    โปรดเชื่อมต่อ <strong>Render PostgreSQL (ฟรี 100%)</strong> เพื่อให้ข้อมูลสมาชิก ยอดเงิน และออเดอร์ทั้งหมดบันทึกถาวรตลอดไป
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('settings');
                  setShowPgGuide(true);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:brightness-110 text-white font-bold text-xs shadow-md shadow-red-600/30 whitespace-nowrap cursor-pointer transition-all"
              >
                ดูวิธีเชื่อมต่อให้ถาวร 100% (ฟรี)
              </button>
            </div>
          )}
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">

              {/* Urgent Pending Slip Notification */}
              {pendingDepositsCount > 0 && (
                <div 
                  onClick={() => setActiveTab('slips')}
                  className="p-4 rounded-2xl bg-amber-950/40 border-2 border-amber-500/60 hover:border-amber-400 flex items-center justify-between cursor-pointer hover:bg-amber-950/60 transition-all group shadow-xl shadow-amber-950/30 animate-in fade-in"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0">
                      <FileCheck className="w-6 h-6 animate-bounce" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>มีสลิปแจ้งโอนเงินรอดำเนินการ {pendingDepositsCount} รายการ!</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-black animate-pulse">
                          รออนุมัติ
                        </span>
                      </div>
                      <p className="text-xs text-amber-200/80 mt-0.5">
                        ลูกค้าได้แนบสลิปโอนเงินเข้ามา กรุณาตรวจสอบยอดเงินและอนุมัติการเติมเงินเข้ากระเป๋า
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-all pr-2">
                    <span>ตรวจสอบสลิปทันที</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="p-5 rounded-2xl bg-cyber-card border border-zinc-800">
                  <div className="text-xs font-medium text-zinc-400 mb-1">ยอดขายวันนี้</div>
                  <div className="text-3xl font-black text-white font-['Kanit'] tracking-tight">
                    ฿{Number(stats?.stats?.todaySales ?? 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                    <span>{orders.filter(o => o.createdAt && o.createdAt.startsWith(new Date().toISOString().slice(0, 10))).length} รายการวันนี้</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-cyber-card border border-zinc-800">
                  <div className="text-xs font-medium text-zinc-400 mb-1">คำสั่งซื้อทั้งหมด</div>
                  <div className="text-3xl font-black text-white font-['Kanit'] tracking-tight">
                    {Number(stats?.stats?.totalOrders ?? 0).toLocaleString()} <span className="text-sm font-normal text-zinc-400">รายการ</span>
                  </div>
                  <div className="mt-2 text-xs text-zinc-400">
                    สำเร็จแล้ว {orders.filter(o => o.topupStatus === 'completed').length} รายการ
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-cyber-card border border-zinc-800">
                  <div className="text-xs font-medium text-zinc-400 mb-1">ลูกค้าทั้งหมด</div>
                  <div className="text-3xl font-black text-white font-['Kanit'] tracking-tight">
                    {Number(stats?.stats?.totalCustomers ?? 0).toLocaleString()} <span className="text-sm font-normal text-zinc-400">คน</span>
                  </div>
                  <div className="mt-2 text-xs text-zinc-400">
                    สมาชิกในระบบ {customers.length} คน
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-cyber-card border border-zinc-800">
                  <div className="text-xs font-medium text-zinc-400 mb-1">เติมสำเร็จ (อัตโนมัติ)</div>
                  <div className="text-3xl font-black text-emerald-400 font-['Kanit'] tracking-tight">
                    {Number(stats?.stats?.successRate ?? 0).toFixed(2)}%
                  </div>
                  <div className="mt-2 text-xs text-emerald-400/80">
                    อัตราความเร็วเฉลี่ย {stats?.engineMetrics?.averageLatencyMs ?? 0}ms
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 p-6 rounded-2xl bg-cyber-card border border-zinc-800">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-sm font-bold text-white font-['Kanit']">สถิติยอดขาย (Sales Revenue)</h3>
                      <p className="text-xs text-zinc-400">แนวโน้มยอดขายสัปดาห์ปัจจุบัน</p>
                    </div>
                    <span className="text-xs bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-lg text-zinc-300">
                      7 วันล่าสุด
                    </span>
                  </div>

                  <div className="h-64 w-full relative flex items-end justify-between pt-6 pb-2 px-2">
                    {stats?.salesChartData?.map((item, idx) => {
                      const maxVal = Math.max(1000, ...((stats?.salesChartData || []).map(i => i.sales || 0)));
                      const heightPercent = item.sales > 0 ? Math.min(100, Math.max(10, (item.sales / maxVal) * 100)) : 0;
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-red-400 font-['Kanit']">
                            ฿{item.sales.toLocaleString()}
                          </div>
                          <div 
                            style={{ height: heightPercent > 0 ? `${heightPercent}%` : '3px' }}
                            className={`w-8 sm:w-12 rounded-t-lg transition-all shadow-md ${
                              heightPercent > 0 
                                ? 'bg-gradient-to-t from-red-950 via-red-700 to-red-500 group-hover:brightness-125' 
                                : 'bg-zinc-800/80'
                            }`}
                          ></div>
                          <div className="text-[11px] text-zinc-400 font-medium">{item.date}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="lg:col-span-4 p-6 rounded-2xl bg-cyber-card border border-zinc-800 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white font-['Kanit']">ช่องทางการชำระเงิน</h3>
                    <p className="text-xs text-zinc-400 mb-6">สัดส่วนช่องทางที่ลูกค้าเลือกใช้</p>

                    <div className="space-y-3.5">
                      {stats?.paymentChannelData?.map((channel, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-300 font-medium flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: channel.color }}></span>
                              {channel.name}
                            </span>
                            <strong className="text-white font-['Kanit']">{channel.percentage}%</strong>
                          </div>
                          <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500" 
                              style={{ width: `${channel.percentage}%`, backgroundColor: channel.color }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-800/80 text-[11px] text-zinc-400 flex items-center justify-between">
                    <span>สถานะช่องทางชำระเงิน</span>
                    <span className="text-zinc-400 font-medium">
                      {orders.filter(o => o.paymentStatus === 'paid').length > 0
                        ? `${orders.filter(o => o.paymentStatus === 'paid').length} รายการสำเร็จ`
                        : 'ยังไม่มีรายการชำระเงิน'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SLIPS APPROVAL */}
          {activeTab === 'slips' && (
            <div className="space-y-6">
              
              {/* Top Banner / Summary */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-red-950/60 via-zinc-900 to-black border border-red-900/40">
                <div>
                  <h3 className="text-lg font-black text-white font-['Kanit'] flex items-center gap-2.5">
                    <FileCheck className="w-6 h-6 text-emerald-400" />
                    <span>ระบบอนุมัติสลิปโอนเงิน (Deposit Slip Verification)</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    ตรวจสอบหลักฐานการโอนเงินของลูกค้า ป้องกันรูปสลิปปลอม/รูปมั่ว ก่อนอนุมัติเติมเงินเข้ากระเป๋าจริง
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => loadData(false)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>รีเฟรชข้อมูล</span>
                  </button>
                </div>
              </div>

              {/* Status Counters */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-zinc-900/80 border border-amber-500/40">
                  <div className="text-xs text-amber-400 font-bold flex items-center justify-between">
                    <span>รอการตรวจสอบ</span>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-white font-['Kanit'] mt-1">
                    {deposits.filter(d => d.status === 'pending').length} <span className="text-xs font-normal text-zinc-400">รายการ</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/80 border border-emerald-500/40">
                  <div className="text-xs text-emerald-400 font-bold flex items-center justify-between">
                    <span>อนุมัติสำเร็จแล้ว</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-emerald-400 font-['Kanit'] mt-1">
                    {deposits.filter(d => d.status === 'completed').length} <span className="text-xs font-normal text-zinc-400">รายการ</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/80 border border-red-500/40">
                  <div className="text-xs text-red-400 font-bold flex items-center justify-between">
                    <span>ปฏิเสธสลิป</span>
                    <XCircle className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-red-400 font-['Kanit'] mt-1">
                    {deposits.filter(d => d.status === 'rejected').length} <span className="text-xs font-normal text-zinc-400">รายการ</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <div className="text-xs text-zinc-400 font-medium flex items-center justify-between">
                    <span>ยอดเงินเติมสำเร็จรวม</span>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-white font-['Kanit'] mt-1">
                    ฿{deposits.filter(d => d.status === 'completed').reduce((sum, d) => sum + (Number(d.amount) || 0), 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-cyber-card border border-zinc-800">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={slipSearch}
                    onChange={(e) => setSlipSearch(e.target.value)}
                    placeholder="ค้นหาชื่อลูกค้า, อีเมล, รหัสรายการ..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {[
                    { id: 'all', label: 'ทั้งหมด' },
                    { id: 'pending', label: 'รอตรวจสอบ' },
                    { id: 'completed', label: 'อนุมัติแล้ว' },
                    { id: 'rejected', label: 'ปฏิเสธ' }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setSlipFilter(filter.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        slipFilter === filter.id
                          ? 'bg-red-600 text-white'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      {filter.label} {filter.id === 'pending' && deposits.filter(d => d.status === 'pending').length > 0 ? `(${deposits.filter(d => d.status === 'pending').length})` : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table / List */}
              <div className="rounded-2xl bg-cyber-card border border-zinc-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-900/90 text-zinc-400 font-semibold uppercase tracking-wider border-b border-zinc-800">
                      <tr>
                        <th className="px-4 py-3.5">วันที่ & เวลา</th>
                        <th className="px-4 py-3.5">ลูกค้า</th>
                        <th className="px-4 py-3.5">ช่องทาง</th>
                        <th className="px-4 py-3.5">ยอดเงิน</th>
                        <th className="px-4 py-3.5">สลิปหลักฐาน</th>
                        <th className="px-4 py-3.5">สถานะ</th>
                        <th className="px-4 py-3.5 text-right">ดำเนินการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {filteredDeposits.map((item) => (
                        <tr key={item.id} className="hover:bg-zinc-900/40 transition-colors">
                          <td className="px-4 py-3.5 text-zinc-400 whitespace-nowrap">
                            <div className="font-mono text-[11px] text-zinc-300">
                              {item.createdAt ? new Date(item.createdAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                            </div>
                            <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{item.id}</div>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="font-bold text-white">{item.userName || 'ไม่ระบุชื่อ'}</div>
                            <div className="text-[11px] text-zinc-400">{item.userEmail || item.userId}</div>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                              {item.method === 'promptpay' ? 'พร้อมเพย์ QR' : item.method === 'bank_transfer' ? 'โอนธนาคาร' : item.method}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="font-black text-white font-['Kanit'] text-sm">
                              ฿{Number(item.amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {item.slipImage ? (
                              <button
                                onClick={() => setSelectedSlipModal(item)}
                                className="group relative w-12 h-12 rounded-lg overflow-hidden border border-zinc-700 hover:border-red-500 transition-all bg-zinc-950 flex items-center justify-center cursor-pointer shadow-sm"
                                title="คลิกเพื่อดูสลิปขนาดเต็ม"
                              >
                                <img
                                  src={item.slipImage}
                                  alt="สลิป"
                                  className="w-full h-full object-cover group-hover:scale-110 transition-all"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                  <Eye className="w-4 h-4 text-white" />
                                </div>
                              </button>
                            ) : (
                              <span className="text-zinc-500 text-[11px]">ไม่มีรูปสลิป</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {item.status === 'pending' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                <Clock className="w-3 h-3 animate-spin" /> รอตรวจสอบ
                              </span>
                            )}
                            {item.status === 'completed' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                <CheckCircle2 className="w-3 h-3" /> อนุมัติแล้ว
                              </span>
                            )}
                            {item.status === 'rejected' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                                <XCircle className="w-3 h-3" /> ปฏิเสธ
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap text-right">
                            {item.status === 'pending' ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setSelectedSlipModal(item)}
                                  className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[11px] font-semibold border border-zinc-700 transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>ตรวจสลิป</span>
                                </button>
                                <button
                                  onClick={() => handleApproveDeposit(item.id)}
                                  disabled={isProcessingSlip}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>อนุมัติ</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setRejectReasonModal(item);
                                    setRejectReasonText('สลิปไม่ถูกต้อง หรือยอดเงินไม่ตรง');
                                  }}
                                  disabled={isProcessingSlip}
                                  className="px-2.5 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-800/80 text-red-300 text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>ปฏิเสธ</span>
                                </button>
                              </div>
                            ) : (
                              <div className="text-[11px] text-zinc-500">
                                {item.status === 'completed' ? (
                                  <span>โดย {item.approvedBy || 'Admin'}</span>
                                ) : (
                                  <span className="text-red-400/80 truncate max-w-[150px] inline-block">{item.rejectedReason}</span>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredDeposits.length === 0 && (
                        <tr>
                          <td colSpan="7" className="text-center py-12 text-zinc-500">
                            <FileCheck className="w-10 h-10 mx-auto mb-2 text-zinc-700" />
                            <p className="text-xs">ไม่พบรายการสลิปเติมเงินตามเงื่อนไขที่เลือก</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-cyber-card border border-zinc-800">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="ค้นหาเลขที่คำสั่งซื้อ, UID, ชื่อตัวละคร..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {['all', 'completed', 'processing', 'failed'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderFilterStatus(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                        orderFilterStatus === st
                          ? 'bg-red-600 text-white'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      {st === 'all' ? 'ทั้งหมด' : st === 'completed' ? 'สำเร็จ' : st === 'processing' ? 'รอดำเนินการ' : 'ล้มเหลว'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-cyber-card border border-zinc-800 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 uppercase text-[10px]">
                      <th className="py-3 px-3">Order Number</th>
                      <th className="py-3 px-3">เกม & แพ็กเกจ</th>
                      <th className="py-3 px-3">ผู้เล่น (UID)</th>
                      <th className="py-3 px-3">ยอดชำระ</th>
                      <th className="py-3 px-3">ช่องทาง</th>
                      <th className="py-3 px-3">API Provider</th>
                      <th className="py-3 px-3">สถานะ</th>
                      <th className="py-3 px-3 text-right">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="py-12 text-center text-zinc-500 text-xs">
                          ยังไม่มีรายการคำสั่งซื้อในระบบ (พร้อมรับออเดอร์ใหม่ 24 ชม.)
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-zinc-900/40">
                          <td className="py-3.5 px-3 font-mono font-bold text-red-400">
                            {order.orderNumber}
                            <span className="block text-[10px] text-zinc-500 font-normal">
                              {new Date(order.createdAt).toLocaleString('th-TH')}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="font-bold text-white">{order.gameName}</div>
                            <div className="text-zinc-400 text-[11px]">{order.packageName}</div>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="text-zinc-300 font-medium">{order.playerId}</span>
                            {order.playerNickname && (
                              <span className="block text-[10px] text-emerald-400 font-semibold">{order.playerNickname}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-3 font-bold font-['Kanit'] text-white">
                            ฿{Number(order.finalAmount).toFixed(2)}
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-zinc-800 text-zinc-300">
                              {order.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="text-zinc-300">{order.providerName || 'Smile One API'}</span>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              order.topupStatus === 'completed'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                                : 'bg-red-950 text-red-400 border border-red-800/60'
                            }`}>
                              {order.topupStatus === 'completed' ? 'สำเร็จ' : 'ล้มเหลว'}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedOrderDetails(order)}
                                className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-200"
                              >
                                ดูข้อมูล
                              </button>
                              {order.topupStatus !== 'completed' && (
                                <button
                                  onClick={() => handleRetryOrder(order.id)}
                                  disabled={retryingId === order.id}
                                  className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-[10px] font-bold text-white shadow-sm"
                                >
                                  {retryingId === order.id ? 'กำลังส่ง...' : 'เติมซ้ำ'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: LIVE CHAT (Customer Support) */}
          {activeTab === 'live_chat' && (
            <div className="space-y-4">
              
              {/* Header Bar */}
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <div>
                  <h2 className="text-lg font-bold text-white font-['Kanit'] flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-400" />
                    <span>ระบบแชทสดกับลูกค้า (Customer Live Chat)</span>
                    {liveChatUnread > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-red-600 text-white font-bold animate-pulse">
                        {liveChatUnread} ข้อความใหม่
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-zinc-400">
                    ตอบคำถาม ให้ความช่วยเหลือ และแก้ปัญหาให้ลูกค้าผ่านหน้าเว็บได้แบบเรียลไทม์ 24 ชม.
                  </p>
                </div>
                <button
                  onClick={() => loadData(false)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>รีเฟรชแชท</span>
                </button>
              </div>

              {/* Two Pane Chat Layout */}
              <div className="grid grid-cols-12 gap-4 h-[680px]">
                
                {/* Left Pane: Chat Rooms List (Col 4) */}
                <div className="col-span-12 md:col-span-4 bg-cyber-card border border-zinc-800 rounded-2xl flex flex-col overflow-hidden">
                  <div className="p-3.5 border-b border-zinc-800 bg-zinc-950/60 flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300">ห้องแชททั้งหมด ({chats.length})</span>
                    {liveChatUnread > 0 && (
                      <span className="text-[10px] text-red-400 font-medium">รอตอบ {liveChatUnread} รายการ</span>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/60">
                    {chats.length === 0 ? (
                      <div className="p-8 text-center text-zinc-500 text-xs">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30 text-zinc-400" />
                        ยังไม่มีลูกค้าเปิดแชทในขณะนี้
                      </div>
                    ) : (
                      chats.map((chat) => {
                        const isSelected = activeChatId === chat.id;
                        const lastMsg = chat.messages && chat.messages.length > 0
                          ? chat.messages[chat.messages.length - 1]
                          : null;
                        const hasUnread = chat.unreadAdmin > 0;

                        return (
                          <div
                            key={chat.id}
                            onClick={() => handleSelectChat(chat.id)}
                            className={`p-3.5 transition-all cursor-pointer flex items-start gap-3 ${
                              isSelected
                                ? 'bg-zinc-800/90 border-l-4 border-emerald-500'
                                : 'hover:bg-zinc-900/80'
                            }`}
                          >
                            <div className="relative shrink-0">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${
                                hasUnread
                                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                                  : isSelected
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-zinc-800 text-zinc-300'
                              }`}>
                                {chat.customerName ? chat.customerName[0].toUpperCase() : 'U'}
                              </div>
                              {hasUnread && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full ring-2 ring-zinc-900"></span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className={`text-xs font-bold truncate ${
                                  hasUnread ? 'text-white' : 'text-zinc-300'
                                }`}>
                                  {chat.customerName || 'ลูกค้า (Guest)'}
                                </h4>
                                <span className="text-[10px] text-zinc-500 shrink-0 ml-1">
                                  {new Date(chat.updatedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>

                              <p className={`text-[11px] truncate ${
                                hasUnread ? 'text-emerald-400 font-semibold' : 'text-zinc-400'
                              }`}>
                                {lastMsg ? lastMsg.text : 'เริ่มการสนทนา'}
                              </p>

                              <div className="mt-1.5 flex items-center justify-between">
                                <span className="text-[9px] text-zinc-500 font-mono">
                                  {chat.userId ? `ID: ${chat.userId.slice(-6)}` : 'Guest'}
                                </span>
                                {hasUnread && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-red-950 text-red-300 border border-red-800 font-bold">
                                    ใหม่ {chat.unreadAdmin}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right Pane: Active Chat Window (Col 8) */}
                <div className="col-span-12 md:col-span-8 bg-cyber-card border border-zinc-800 rounded-2xl flex flex-col overflow-hidden">
                  {(() => {
                    const currentChat = chats.find(c => c.id === activeChatId);

                    if (!currentChat) {
                      return (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500">
                          <MessageSquare className="w-12 h-12 mb-3 text-zinc-700 animate-pulse" />
                          <div className="text-sm font-bold text-zinc-400">เลือกห้องแชทของลูกค้าเพื่อเริ่มการสนทนา</div>
                          <p className="text-xs text-zinc-600 mt-1">คลิกเลือกรายชื่อลูกค้าจากแถบทางด้านซ้าย</p>
                        </div>
                      );
                    }

                    return (
                      <>
                        {/* Chat Header */}
                        <div className="p-4 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between shrink-0">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center text-emerald-400 font-bold">
                              {currentChat.customerName ? currentChat.customerName[0].toUpperCase() : 'U'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-white font-['Kanit']">{currentChat.customerName}</h3>
                                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800">
                                  {currentChat.userId ? 'สมาชิกเว็บไซต์' : 'ลูกค้าทั่วไป'}
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                                รหัสห้อง: {currentChat.id} • อัปเดตล่าสุด: {new Date(currentChat.updatedAt).toLocaleTimeString('th-TH')}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-xs">
                            <span className="flex items-center gap-1 text-emerald-400">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                              <span>กำลังสนทนา</span>
                            </span>
                          </div>
                        </div>

                        {/* Messages Thread */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#080b10] scrollbar-thin scrollbar-thumb-zinc-800">
                          {(currentChat.messages || []).map((m, idx) => {
                            const isAdmin = m.sender === 'admin';
                            const isBot = m.sender === 'bot';

                            if (isBot) {
                              return (
                                <div key={m.id || idx} className="p-3 mx-auto max-w-lg rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center text-xs space-y-1">
                                  <div className="text-emerald-400 font-bold text-[11px] flex items-center justify-center gap-1">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    <span>{m.senderName}</span>
                                  </div>
                                  <p className="text-zinc-300 leading-relaxed">{m.text}</p>
                                  <div className="text-[9px] text-zinc-500">
                                    {new Date(m.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div
                                key={m.id || idx}
                                className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'} space-y-1`}
                              >
                                <div className="text-[10px] text-zinc-400 px-1">
                                  {isAdmin ? 'คุณ (แอดมิน)' : m.senderName || 'ลูกค้า'}
                                </div>
                                <div
                                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-lg ${
                                    isAdmin
                                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-sm'
                                      : 'bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-bl-sm'
                                  }`}
                                >
                                  {m.text}
                                </div>
                                <div className="text-[9px] text-zinc-500 px-1">
                                  {new Date(m.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Quick Replies Bar */}
                        <div className="p-2.5 bg-zinc-950 border-t border-zinc-800/80 flex flex-wrap gap-1.5 shrink-0">
                          <span className="text-[10px] text-zinc-500 flex items-center gap-1 mr-1">
                            <span>ตอบด่วน:</span>
                          </span>
                          {[
                            'สวัสดีครับ แอดมินพร้อมดูแลแล้วครับ มีอะไรให้ช่วยเหลือแจ้งได้เลยครับ',
                            'ขอทราบเลขออเดอร์สักครู่ครับ แอดมินกำลังตรวจสอบให้ทันทีครับ',
                            'ระบบทำการเติมเงินเข้าเกมให้เรียบร้อยแล้วครับ ลองรีเกมเช็กดูได้เลยครับ',
                            'หากติดปัญหาเพิ่มเติม สามารถทักสอบถามแอดมินได้ตลอด 24 ชม. นะครับ'
                          ].map((qr, qidx) => (
                            <button
                              key={qidx}
                              type="button"
                              onClick={() => handleSendAdminReply(qr)}
                              className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-emerald-950 hover:border-emerald-500/50 border border-zinc-800 text-zinc-300 hover:text-emerald-300 text-[10px] transition-all cursor-pointer text-left"
                            >
                              {qr.slice(0, 32)}...
                            </button>
                          ))}
                        </div>

                        {/* Reply Input Form */}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleSendAdminReply();
                          }}
                          className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center gap-2 shrink-0"
                        >
                          <input
                            type="text"
                            value={chatReplyText}
                            onChange={(e) => setChatReplyText(e.target.value)}
                            placeholder="พิมพ์ข้อความตอบกลับลูกค้าที่นี่... (Enter เพื่อส่ง)"
                            className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-all font-sans"
                          />
                          <button
                            type="submit"
                            disabled={!chatReplyText.trim() || isSendingReply}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{isSendingReply ? 'กำลังส่ง...' : 'ส่งตอบกลับ'}</span>
                          </button>
                        </form>
                      </>
                    );
                  })()}
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: AUTO TOPUP ENGINE */}
          {activeTab === 'autotopup' && (
            <div className="p-6 rounded-2xl bg-cyber-card border border-red-900/60 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-red-500" />
                    Auto Top-up Engine Controller
                  </h3>
                  <p className="text-xs text-zinc-400">ควบคุมและตรวจสอบการทำงานของคิวเติมเกมอัตโนมัติ 24 ชั่วโมง</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-600 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  ระบบกำลังทำงานปกติ 24/7
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-800">
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <div className="text-zinc-400 text-xs">ความเร็วเฉลี่ย (Latency)</div>
                  <div className="text-2xl font-black text-white mt-1 font-['Kanit']">
                    {stats?.engineMetrics?.averageLatencyMs ? `${stats.engineMetrics.averageLatencyMs} ms` : '0 ms'}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <div className="text-zinc-400 text-xs">คิวคงค้าง (Queue Backlog)</div>
                  <div className="text-2xl font-black text-white mt-1 font-['Kanit']">0 งาน</div>
                </div>
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <div className="text-zinc-400 text-xs">Smart Failover Router</div>
                  <div className="text-2xl font-black text-emerald-400 mt-1 font-['Kanit']">พร้อมทำงาน</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GAMES & PACKAGES CRUD (เพิ่มเกม / แพ็กเกจ / อัปโหลดรูป) */}
          {activeTab === 'games' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-['Kanit']">
                    จัดการรายการเกมและแพ็กเกจ ({games.length} เกม)
                  </h3>
                  <p className="text-xs text-zinc-400">เพิ่มเกมใหม่ แก้ไขราคา หรืออัปโหลดรูปภาพไอคอนจากเครื่อง</p>
                </div>
                <button
                  onClick={() => setGameEditorModal({ open: true, game: null })}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-md shadow-red-600/30"
                >
                  <Plus className="w-4 h-4" /> เพิ่มเกมใหม่
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {games.map((g) => (
                  <div key={g.id} className="p-5 rounded-2xl bg-cyber-card border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={g.icon} alt={g.name} className="w-12 h-12 rounded-xl object-cover border border-zinc-700" />
                        <div>
                          <div className="text-sm font-bold text-white">{g.name}</div>
                          <div className="text-xs text-zinc-400">{g.publisher} • {g.category}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setGameEditorModal({ open: true, game: g })}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
                          title="แก้ไขเกม"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGame(g.id)}
                          className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/50"
                          title="ลบเกม"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-800">
                      <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                        <span>แพ็กเกจ ({g.packages?.length || 0} รายการ)</span>
                        <span className="text-red-400 font-bold">สกุล: {g.currencyName}</span>
                      </div>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {g.packages?.map(pkg => (
                          <div key={pkg.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-zinc-900/60">
                            <span className="text-zinc-300">{pkg.name}</span>
                            <span className="font-bold text-red-400 font-['Kanit']">฿{pkg.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: FLASH SALES (ดีลฟ้าผ่า) */}
          {activeTab === 'flash_sales' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-['Kanit'] flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                    จัดการดีลฟ้าผ่า (Flash Sale Manager)
                  </h3>
                  <p className="text-xs text-zinc-400">ควบคุมสินค้าและแพ็กเกจลดราคาจำกัดเวลาที่แสดงบนหน้าร้าน</p>
                </div>
                <button
                  onClick={() => setFlashSaleModal({ open: true, item: null })}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:brightness-110 text-xs font-bold text-white shadow-md shadow-amber-500/20"
                >
                  <Plus className="w-4 h-4" /> เพิ่มดีล Flash Sale ใหม่
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {flashSales.map((fs) => {
                  const percentSold = Math.min(100, Math.round(((fs.soldStock || 0) / (fs.totalStock || 50)) * 100));
                  return (
                    <div key={fs.id} className="p-4 rounded-2xl bg-cyber-card border border-amber-500/30 relative space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={fs.icon} alt={fs.packageName} className="w-12 h-12 rounded-xl object-cover border border-zinc-700" />
                          <div>
                            <span className="text-[10px] text-amber-400 font-bold uppercase">{fs.gameName}</span>
                            <h4 className="text-xs font-bold text-white line-clamp-1">{fs.packageName}</h4>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white">
                          -{fs.discountPercent || 25}%
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2 pt-1 border-t border-zinc-800">
                        <span className="text-base font-black text-amber-400 font-['Kanit']">฿{fs.flashPrice}</span>
                        <span className="text-xs text-zinc-500 line-through">฿{fs.originalPrice}</span>
                        <span className="text-[10px] text-zinc-400 ml-auto">({fs.currencyAmount} {fs.currencyName})</span>
                      </div>

                      {/* Stock Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-zinc-400">
                          <span>ขายแล้ว {percentSold}%</span>
                          <span>เหลือ {Math.max(0, (fs.totalStock || 50) - (fs.soldStock || 0))} สิทธิ์</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-amber-500 to-red-600 rounded-full" style={{ width: `${percentSold}%` }}></div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-800 flex items-center justify-end gap-2">
                        <button
                          onClick={() => setFlashSaleModal({ open: true, item: fs })}
                          className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDeleteFlashSale(fs.id)}
                          className="px-2.5 py-1 rounded bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/50 text-[10px] font-bold"
                        >
                          ลบ
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: GIFT CARDS (บัตรเติมเงิน) */}
          {activeTab === 'gift_cards' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-['Kanit'] flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-400" />
                    จัดการบัตรเติมเงิน (Gift Cards Manager)
                  </h3>
                  <p className="text-xs text-zinc-400">เพิ่มบัตร Steam, Razer Gold, Roblox, Riot หรือบัตรใหม่ๆ พร้อมกำหนดราคา</p>
                </div>
                <button
                  onClick={() => setGiftCardModal({ open: true, item: null })}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md shadow-blue-600/30"
                >
                  <Plus className="w-4 h-4" /> เพิ่มบัตรเติมเงินใหม่
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {giftCards.map((gc) => (
                  <div key={gc.id} className="p-4 rounded-2xl bg-cyber-card border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={gc.icon} alt={gc.name} className="w-12 h-12 rounded-xl object-cover border border-zinc-700" />
                        <div>
                          <span className="text-[10px] text-blue-400 font-bold uppercase">{gc.publisher || 'Card'}</span>
                          <h4 className="text-xs font-bold text-white line-clamp-1">{gc.name}</h4>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-950 text-blue-300 border border-blue-800/60">
                        {gc.badge || 'รหัสทันที'}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-zinc-800">
                      <div className="text-[11px] text-zinc-400 mb-2">รายการราคา ({gc.denominations?.length || 0} หน่วย)</div>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                        {gc.denominations?.map((d) => (
                          <div key={d.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-zinc-900/60">
                            <span className="text-zinc-300">{d.name}</span>
                            <span className="font-bold text-blue-400 font-['Kanit']">฿{d.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-800 flex items-center justify-end gap-2">
                      <button
                        onClick={() => setGiftCardModal({ open: true, item: gc })}
                        className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDeleteGiftCard(gc.id)}
                        className="px-2.5 py-1 rounded bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/50 text-[10px] font-bold"
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: APP SUBSCRIPTIONS (ต่ออายุแอป) */}
          {activeTab === 'app_subs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-['Kanit'] flex items-center gap-2">
                    <Film className="w-4 h-4 text-purple-400" />
                    จัดการต่ออายุแอป (App Subscriptions Manager)
                  </h3>
                  <p className="text-xs text-zinc-400">เพิ่มแอปสตรีมมิ่งและเครื่องมือ เช่น YouTube, Netflix, Discord, Canva, ChatGPT</p>
                </div>
                <button
                  onClick={() => setAppSubModal({ open: true, item: null })}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-md shadow-purple-600/30"
                >
                  <Plus className="w-4 h-4" /> เพิ่มบริการแอปใหม่
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {appSubscriptions.map((app) => (
                  <div key={app.id} className="p-4 rounded-2xl bg-cyber-card border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={app.icon} alt={app.name} className="w-12 h-12 rounded-xl object-cover border border-zinc-700" />
                        <div>
                          <span className="text-[10px] text-purple-400 font-bold uppercase">{app.publisher || 'App'}</span>
                          <h4 className="text-xs font-bold text-white line-clamp-1">{app.name}</h4>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-950 text-purple-300 border border-purple-800/60">
                        {app.badge || 'พรีเมียม'}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-zinc-800">
                      <div className="text-[11px] text-zinc-400 mb-2">แพ็กเกจระยะเวลา ({app.plans?.length || 0} แพ็กเกจ)</div>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                        {app.plans?.map((p) => (
                          <div key={p.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-zinc-900/60">
                            <span className="text-zinc-300">{p.name}</span>
                            <span className="font-bold text-purple-400 font-['Kanit']">฿{p.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-800 flex items-center justify-end gap-2">
                      <button
                        onClick={() => setAppSubModal({ open: true, item: app })}
                        className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDeleteAppSub(app.id)}
                        className="px-2.5 py-1 rounded bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/50 text-[10px] font-bold"
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CMS STOREFRONT & BANNERS */}
          {activeTab === 'cms' && (
            <div className="space-y-6">
              
              {/* CMS Sub-navigation */}
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
                <button
                  onClick={() => setCmsSubTab('slides')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    cmsSubTab === 'slides'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  แบนเนอร์ Hero Carousel ({slides.length})
                </button>
                <button
                  onClick={() => setCmsSubTab('categories')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    cmsSubTab === 'categories'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  6 ปุ่มลัด Quick Category Bar ({quickCategories.length})
                </button>
                <button
                  onClick={() => setCmsSubTab('trust')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    cmsSubTab === 'trust'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  4 กล่องความน่าเชื่อถือ Trust Badges
                </button>
              </div>

              {/* Subtab 1: Carousel Slides */}
              {cmsSubTab === 'slides' && (
                <div className="space-y-6">
                  {/* Action Bar Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <Images className="w-5 h-5 text-red-500" />
                        <h3 className="text-base font-bold text-white font-['Kanit']">
                          จัดการแบนเนอร์สไลด์หน้าร้าน (Hero Carousel)
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-800/50 text-[11px] font-bold">
                          {slides.length} ภาพ
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">
                        เลือกใส่รูปภาพแบนเนอร์โปรโมชั่นได้หลายภาพพร้อมกัน ระบบจะสไลด์อัตโนมัติที่หน้าแรกของร้านค้า
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRestoreDefaultSlides()}
                        className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all flex items-center gap-1.5"
                        title="โหลดแบนเนอร์เกมยอดนิยม 4 เกมกลับมา"
                      >
                        <RotateCw className="w-3.5 h-3.5" /> คืนค่าแบนเนอร์เกมตัวอย่าง
                      </button>

                      {slides.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleClearAllSlides()}
                          className="px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/50 text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> ลบทั้งหมด
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setNewSlideModal(true)}
                        className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> สร้างแบบใส่ข้อความ
                      </button>
                    </div>
                  </div>

                  {/* Multi-Image Upload Dropzone Area */}
                  <div className="p-5 rounded-2xl border-2 border-dashed border-red-600/40 bg-gradient-to-b from-red-950/10 to-zinc-900/40 hover:border-red-500 transition-all space-y-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-600/40 flex items-center justify-center text-red-400">
                          <Images className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white font-['Kanit']">
                            📸 อัปโหลดรูปภาพแบนเนอร์หลายๆ ภาพพร้อมกัน (Multi-Image Upload)
                          </h4>
                          <p className="text-xs text-zinc-400">
                            คลิกเลือกหรือลากไฟล์ภาพ (PNG, JPG, WEBP, GIF, SVG) เข้ามาได้ครั้งละหลายๆ ภาพ
                          </p>
                        </div>
                      </div>

                      <label className="cursor-pointer px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95">
                        <Upload className="w-4 h-4" />
                        <span>เลือกรูปภาพจากเครื่อง (เลือกได้หลายไฟล์)</span>
                        <input
                          type="file"
                          multiple
                          accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/svg+xml"
                          onChange={(e) => {
                            if (e.target.files) handleSelectMultiFiles(e.target.files);
                            e.target.value = '';
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Previews of Selected Multi-Upload Files */}
                    {multiUploadFiles.length > 0 && (
                      <div className="pt-3 border-t border-zinc-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            เลือกแล้ว {multiUploadFiles.length} ภาพ (พร้อมอัปโหลด)
                          </span>
                          <button
                            type="button"
                            onClick={() => setMultiUploadFiles([])}
                            className="text-[11px] text-zinc-400 hover:text-red-400"
                          >
                            ยกเลิกทั้งหมด
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                          {multiUploadFiles.map((item, idx) => (
                            <div key={idx} className="relative group rounded-xl overflow-hidden border border-zinc-700 bg-black aspect-[21/9]">
                              <img src={item.preview} alt={item.name} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSelectedMultiFile(idx)}
                                  className="p-1 rounded-lg bg-red-600 text-white hover:bg-red-500"
                                  title="ลบภาพนี้"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="absolute bottom-0 inset-x-0 bg-black/80 px-1.5 py-0.5 text-[9px] text-zinc-300 truncate">
                                {item.name} ({item.sizeKb} KB)
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Upload Button with Progress */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                          {multiUploadProgress.isUploading ? (
                            <div className="flex items-center gap-2 text-xs text-red-400">
                              <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                              <span>{multiUploadProgress.message}</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={handleUploadMultipleSlides}
                              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>บันทึกและแสดงแบนเนอร์ {multiUploadFiles.length} ภาพนี้ทันที</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Current Active Slides Grid */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                        ลำดับการแสดงผลแบนเนอร์บนหน้าร้าน ({slides.length})
                      </h4>
                      <span className="text-[11px] text-zinc-400">
                        กดปุ่ม ▲ / ▼ เพื่อเลื่อนสลับลำดับการแสดงผล
                      </span>
                    </div>

                    {slides.length === 0 ? (
                      <div className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center space-y-3">
                        <Images className="w-10 h-10 text-zinc-600 mx-auto" />
                        <div className="text-sm font-bold text-zinc-300">ยังไม่มีแบนเนอร์ในระบบ</div>
                        <p className="text-xs text-zinc-500">
                          กดเลือกภาพด้านบนเพื่ออัปโหลดหลายภาพพร้อมกัน หรือกดปุ่ม "คืนค่าแบนเนอร์เกมตัวอย่าง"
                        </p>
                        <button
                          type="button"
                          onClick={() => handleRestoreDefaultSlides()}
                          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
                        >
                          คืนค่าแบนเนอร์เกมตัวอย่างทันที
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {slides.map((s, idx) => (
                          <div
                            key={s.id || idx}
                            className={`rounded-2xl border overflow-hidden transition-all space-y-3 bg-cyber-card ${
                              s.isActive !== false ? 'border-zinc-800' : 'border-zinc-800/40 opacity-60'
                            }`}
                          >
                            {/* Banner Thumbnail */}
                            <div className="aspect-[21/9] w-full relative bg-zinc-950 overflow-hidden">
                              <img
                                src={s.image}
                                alt={s.title || 'Slide'}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/banners/banner_rov.svg';
                                }}
                                className="w-full h-full object-cover"
                              />

                              {/* Order Badge */}
                              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/80 text-white border border-white/10 backdrop-blur-sm">
                                #{idx + 1}
                              </div>

                              {/* Active Status Badge */}
                              <div className="absolute top-2 right-2">
                                <button
                                  type="button"
                                  onClick={() => handleToggleSlideActive(s)}
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all ${
                                    s.isActive !== false
                                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/40'
                                      : 'bg-zinc-800 text-zinc-400'
                                  }`}
                                  title="คลิกเพื่อเปิด/ปิดการแสดงผล"
                                >
                                  {s.isActive !== false ? (
                                    <>
                                      <Eye className="w-3 h-3" /> เปิดใช้งาน
                                    </>
                                  ) : (
                                    <>
                                      <EyeOff className="w-3 h-3" /> ปิดซ่อน
                                    </>
                                  )}
                                </button>
                              </div>

                              {s.badge && (
                                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold bg-red-600 text-white shadow">
                                  {s.badge}
                                </div>
                              )}
                            </div>

                            {/* Details & Actions */}
                            <div className="p-4 pt-1 space-y-2.5">
                              <div>
                                <h5 className="text-xs font-bold text-white line-clamp-1">
                                  {s.title || 'ภาพแบนเนอร์กราฟิก (Graphic Banner)'}
                                </h5>
                                <p className="text-[11px] text-zinc-400 line-clamp-1">
                                  {s.subtitle || `ลิงก์ปลายทาง: #${s.ctaTarget || 'popular-games'}`}
                                </p>
                              </div>

                              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                                {/* Move Up / Down Buttons */}
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => handleMoveSlide(s.id, 'up')}
                                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-zinc-800 text-zinc-300 text-xs"
                                    title="เลื่อนขึ้นหน้า"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === slides.length - 1}
                                    onClick={() => handleMoveSlide(s.id, 'down')}
                                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-zinc-800 text-zinc-300 text-xs"
                                    title="เลื่อนลงหลัง"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* Edit & Delete Buttons */}
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setEditSlideModal(s)}
                                    className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-bold flex items-center gap-1"
                                  >
                                    <Edit3 className="w-3 h-3" /> แก้ไข
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSlide(s.id)}
                                    className="px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/60 text-[11px] font-bold flex items-center gap-1"
                                  >
                                    <Trash2 className="w-3 h-3" /> ลบ
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Subtab 2: Quick Categories Bar */}
              {cmsSubTab === 'categories' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white font-['Kanit']">
                      ปรับแต่ง 6 ปุ่มลัดบริการด่วน (Quick Category Service Bar)
                    </h3>
                    <p className="text-xs text-zinc-400">แก้ไขชื่อปุ่ม คำบรรยาย ป้าย Badge และลิงก์ปลายทางบนหน้าร้าน</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quickCategories.map((cat, idx) => (
                      <div key={cat.id || idx} className="p-4 rounded-2xl bg-cyber-card border border-zinc-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-400">ปุ่มบริการที่ #{idx + 1} ({cat.id})</span>
                          <span className="text-[10px] font-mono text-zinc-500">Target: #{cat.targetId}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="text-zinc-400 block mb-1">ชื่อปุ่มหลัก</label>
                            <input
                              type="text"
                              value={cat.label}
                              onChange={(e) => handleUpdateCategory(cat.id, { label: e.target.value })}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white"
                            />
                          </div>
                          <div>
                            <label className="text-zinc-400 block mb-1">คำบรรยายย่อย</label>
                            <input
                              type="text"
                              value={cat.sublabel}
                              onChange={(e) => handleUpdateCategory(cat.id, { sublabel: e.target.value })}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="text-zinc-400 block mb-1">ป้ายกำกับ Badge</label>
                            <input
                              type="text"
                              placeholder="เช่น HOT 🔥 หรือ 2X COINS"
                              value={cat.badge || ''}
                              onChange={(e) => handleUpdateCategory(cat.id, { badge: e.target.value })}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white"
                            />
                          </div>
                          <div>
                            <label className="text-zinc-400 block mb-1">ลิงก์เลื่อน (Target ID)</label>
                            <input
                              type="text"
                              value={cat.targetId}
                              onChange={(e) => handleUpdateCategory(cat.id, { targetId: e.target.value })}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtab 3: Trust Badges */}
              {cmsSubTab === 'trust' && siteSettings && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white font-['Kanit']">
                        ปรับแต่ง 4 กล่องการันตีความน่าเชื่อถือ (Trust & Security Badges)
                      </h3>
                      <p className="text-xs text-zinc-400">แก้ไขข้อความและจุดเด่น 4 การ์ดที่แสดงบนหน้าแรก</p>
                    </div>
                    <button
                      onClick={async () => {
                        await fetch('/api/admin/settings', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(siteSettings)
                        });
                        showAlert({
                          title: 'บันทึกสำเร็จ!',
                          message: 'บันทึกข้อมูลกล่องการันตีความน่าเชื่อถือเรียบร้อยแล้ว มีผลหน้าร้านทันที',
                          type: 'success'
                        });
                      }}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-md shadow-red-600/30"
                    >
                      บันทึกกล่องความน่าเชื่อถือ
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(siteSettings.trustPoints || []).map((tp, idx) => (
                      <div key={tp.id || idx} className="p-4 rounded-2xl bg-cyber-card border border-zinc-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-300">กล่องที่ #{idx + 1} ({tp.icon})</span>
                        </div>
                        <div>
                          <label className="text-zinc-400 text-xs block mb-1">หัวข้อหลัก</label>
                          <input
                            type="text"
                            value={tp.title}
                            onChange={(e) => {
                              const updated = [...siteSettings.trustPoints];
                              updated[idx].title = e.target.value;
                              setSiteSettings({ ...siteSettings, trustPoints: updated });
                            }}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-700 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-zinc-400 text-xs block mb-1">คำบรรยาย</label>
                          <textarea
                            rows="2"
                            value={tp.desc}
                            onChange={(e) => {
                              const updated = [...siteSettings.trustPoints];
                              updated[idx].desc = e.target.value;
                              setSiteSettings({ ...siteSettings, trustPoints: updated });
                            }}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-700 text-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 6: PROVIDERS & FAILOVER */}
          {activeTab === 'providers' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-bold text-white font-['Kanit'] mb-3">ผู้ให้บริการ API ที่เชื่อมต่ออยู่</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {providers.map((prov) => (
                    <div key={prov.id} className="p-5 rounded-2xl bg-cyber-card border border-zinc-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{prov.name}</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-400">ยอดเงินคงเหลือใน API</div>
                        <div className="text-xl font-black text-emerald-400 font-['Kanit']">
                          ฿{Number(prov.balance).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-cyber-card border border-zinc-800 space-y-4">
                <h3 className="text-sm font-bold text-white font-['Kanit']">
                  การกำหนดเส้นทาง API ผู้ให้บริการ (API Routing & Smart Failover)
                </h3>
                <div className="space-y-3">
                  {games.map((game) => {
                    const route = gameRoutes[game.id] || { primary: 'prov_smileone', fallback: 'prov_unipin' };
                    return (
                      <div key={game.id} className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <img src={game.icon} alt={game.name} className="w-10 h-10 rounded-lg object-cover" />
                          <div>
                            <div className="text-xs font-bold text-white">{game.name}</div>
                            <div className="text-[10px] text-zinc-400">{game.publisher}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <div>
                            <label className="text-[10px] text-zinc-400 block mb-1">ผู้ให้บริการหลัก</label>
                            <select
                              value={route.primary}
                              onChange={(e) => handleSaveRoute(game.id, e.target.value, route.fallback)}
                              className="px-3 py-1.5 rounded-lg bg-black border border-zinc-700 text-xs text-white"
                            >
                              {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-zinc-400 block mb-1">ผู้ให้บริการสำรอง</label>
                            <select
                              value={route.fallback}
                              onChange={(e) => handleSaveRoute(game.id, route.primary, e.target.value)}
                              className="px-3 py-1.5 rounded-lg bg-black border border-zinc-700 text-xs text-white"
                            >
                              {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: COUPONS */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-['Kanit']">โปรโมชั่นและโค้ดส่วนลด</h3>
                  <p className="text-xs text-zinc-400">สร้างโค้ดคูปองเพื่อกระตุ้นยอดขาย</p>
                </div>
                <button
                  onClick={() => setNewCouponModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-md shadow-red-600/30"
                >
                  <Plus className="w-4 h-4" /> สร้างโค้ดส่วนลดใหม่
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {coupons.map((c) => (
                  <div key={c.id} className="p-5 rounded-2xl bg-cyber-card border border-red-950/60 relative space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-black text-red-400 font-mono tracking-wider">{c.code}</span>
                      <span className="text-[10px] bg-red-950 text-red-300 px-2 py-0.5 rounded font-bold">
                        {c.discountType === 'percent' ? `ลด ${c.discountValue}%` : `ลด ฿${c.discountValue}`}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300">{c.description}</p>
                    <div className="pt-2 border-t border-zinc-800 text-[10px] text-zinc-400 flex justify-between">
                      <span>ขั้นต่ำ: ฿{c.minSpend || 0}</span>
                      <span>ใช้แล้ว: {c.usedCount || 0} ครั้ง</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: CUSTOMERS */}
          {activeTab === 'customers' && (
            <div className="p-6 rounded-2xl bg-cyber-card border border-zinc-800 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white font-['Kanit'] flex items-center gap-2">
                    <Users className="w-4 h-4 text-red-500" />
                    รายชื่อสมาชิกและลูกค้าในระบบ ({customers.length} บัญชี)
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    ตรวจสอบยอดเงินในกระเป๋า แก้ไขข้อมูลติดต่อ (เบอร์โทร, ชื่อ, อีเมล, รีเซ็ตรหัสผ่าน) และปรับยอดเงิน
                  </p>
                </div>
                
                {/* Search Bar */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-72">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="ค้นหาชื่อ, @username, เบอร์โทร, อีเมล..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>
                  {customerSearch && (
                    <button
                      onClick={() => setCustomerSearch('')}
                      className="px-2.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-xs whitespace-nowrap"
                    >
                      ล้างค้นหา
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 uppercase text-[10px]">
                      <th className="py-3 px-3">ชื่อ / Username</th>
                      <th className="py-3 px-3">เบอร์โทรศัพท์</th>
                      <th className="py-3 px-3">อีเมล</th>
                      <th className="py-3 px-3">ระดับ (Tier)</th>
                      <th className="py-3 px-3">ยอดเงินกระเป๋า</th>
                      <th className="py-3 px-3">แต้มสะสม</th>
                      <th className="py-3 px-3 text-right">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-12 text-center text-zinc-500 text-xs">
                          {customerSearch ? `ไม่พบข้อมูลลูกค้าที่ตรงกับ "${customerSearch}"` : 'ยังไม่มีสมาชิกลงทะเบียนในระบบ (ระบบพร้อมรับผู้ใช้งานใหม่)'}
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((cust) => (
                        <tr key={cust.id} className="hover:bg-zinc-900/40">
                          <td className="py-3.5 px-3">
                            <span className="font-bold text-white block">{cust.name}</span>
                            <span className="text-[10px] text-zinc-500">@{cust.username}</span>
                          </td>
                          <td className="py-3.5 px-3">
                            {cust.phone ? (
                              <span className="inline-flex items-center gap-1 font-mono text-zinc-200 bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-800 text-[11px]">
                                <Phone className="w-2.5 h-2.5 text-emerald-400" />
                                {cust.phone}
                              </span>
                            ) : (
                              <span className="text-zinc-600 text-[11px] italic">ยังไม่ระบุ</span>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-zinc-400 font-mono text-[11px]">{cust.email}</td>
                          <td className="py-3.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800/50">
                              {cust.tier || 'Bronze'}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 font-bold font-['Kanit'] text-emerald-400 text-sm">
                            ฿{Number(cust.walletBalance || 0).toFixed(2)}
                          </td>
                          <td className="py-3.5 px-3 text-zinc-300">{cust.points || 0} Coins</td>
                          <td className="py-3.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditCustomer(cust)}
                                className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-amber-600 hover:text-white text-zinc-300 text-[11px] font-semibold transition-all flex items-center gap-1 border border-zinc-700"
                                title="แก้ไขข้อมูลลูกค้า เช่น เบอร์, ชื่อ, อีเมล, รหัสผ่าน"
                              >
                                <Edit3 className="w-3 h-3 text-amber-400" />
                                <span>แก้ไข</span>
                              </button>
                              <button
                                onClick={() => setSelectedCustomer(cust)}
                                className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-red-600 text-white text-[11px] font-semibold transition-all flex items-center gap-1 border border-zinc-700"
                                title="ปรับยอดเงินในกระเป๋า"
                              >
                                <Wallet className="w-3 h-3 text-emerald-400" />
                                <span>ปรับเงิน</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 9: ADMINS & RBAC PERMISSIONS */}
          {activeTab === 'admins' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-['Kanit']">
                    ผู้ดูแลระบบและสิทธิ์การเข้าถึง (Admins & RBAC)
                  </h3>
                  <p className="text-xs text-zinc-400">จัดการบัญชีทีมงาน กำหนดสิทธิ์ Super Admin, Operator, Content Editor</p>
                </div>
                <button
                  onClick={() => setRbacModal({ open: true, admin: null })}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-md shadow-red-600/30"
                >
                  <UserPlus className="w-4 h-4" /> เพิ่มผู้ดูแลใหม่
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {admins.map((adm) => {
                  const isSuper = adm.role === 'super_admin';
                  const isOp = adm.role === 'operator';

                  return (
                    <div key={adm.id} className="p-5 rounded-2xl bg-cyber-card border border-zinc-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isSuper ? (
                            <ShieldCheck className="w-5 h-5 text-red-500" />
                          ) : isOp ? (
                            <UserCheck className="w-5 h-5 text-blue-400" />
                          ) : (
                            <Key className="w-5 h-5 text-amber-400" />
                          )}
                          <span className="font-bold text-white text-xs">{adm.name}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isSuper 
                            ? 'bg-red-950 text-red-400 border border-red-800' 
                            : isOp 
                            ? 'bg-blue-950 text-blue-400 border border-blue-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {adm.role.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="text-xs text-zinc-400 space-y-1">
                        <div>Username: <strong className="text-white">@{adm.username}</strong></div>
                        <div>Email: <span className="text-zinc-300">{adm.email}</span></div>
                        <div>แผนก: <span className="text-zinc-300">{adm.department || 'Operations'}</span></div>
                      </div>

                      <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
                        <button
                          onClick={() => setRbacModal({ open: true, admin: adm })}
                          className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold"
                        >
                          แก้ไขสิทธิ์
                        </button>
                        {!isSuper && (
                          <button
                            onClick={() => handleDeleteAdmin(adm.id)}
                            className="px-2.5 py-1 rounded bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900 text-[10px] font-bold"
                          >
                            ลบ
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 10: SETTINGS (CMS STOREFRONT TEXT & PAYMENT) */}
          {activeTab === 'settings' && siteSettings && (
            <div className="max-w-3xl space-y-6">
              
              {/* 1. Brand Identity & Logo */}
              <div className="p-6 rounded-2xl bg-cyber-card border border-zinc-800 space-y-4">
                <h3 className="text-sm font-bold text-white font-['Kanit'] flex items-center gap-2">
                  <Building className="w-4 h-4 text-red-500" />
                  แบรนด์และโลโก้เว็บไซต์ (Brand & Logo)
                </h3>
                
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="text-zinc-400 block mb-1">โลโก้ร้านค้า (อัปโหลดจากเครื่องคอมพิวเตอร์)</label>
                    <ImageUploader
                      value={siteSettings.logoUrl || ''}
                      onChange={(url) => setSiteSettings({ ...siteSettings, logoUrl: url })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-zinc-400 block mb-1">ชื่อเว็บไซต์ / ชื่อร้านค้า *</label>
                      <input
                        type="text"
                        value={siteSettings.siteName}
                        onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 block mb-1">สโลแกนร้านค้า</label>
                      <input
                        type="text"
                        value={siteSettings.siteSlogan || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, siteSlogan: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">ข้อความประกาศวิ่งแถบด้านบน (Marquee Announcement)</label>
                    <input
                      type="text"
                      value={siteSettings.announcement}
                      onChange={(e) => setSiteSettings({ ...siteSettings, announcement: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* 1.5 เปิด/ปิดการแสดงผลช่องทางการชำระเงินทั้งหมด (Payment Methods Visibility) */}
              <div className="p-6 rounded-2xl bg-cyber-card border border-zinc-800 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white font-['Kanit'] flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-cyan-400" />
                      เปิด/ปิดการแสดงผลช่องทางการชำระเงิน (Payment Methods Visibility)
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      เปิดหรือปิดช่องทางชำระเงินที่ต้องการให้แสดงผลที่หน้าชำระเงิน (Topup Modal) และหน้าเติมเงินกระเป๋า (Wallet)
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleSetAllPaymentMethods(true)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-medium transition-all"
                    >
                      เปิดทั้งหมด
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetAllPaymentMethods(false)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-xs font-medium transition-all"
                    >
                      เปิดเฉพาะพร้อมเพย์
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    {
                      id: 'promptpay',
                      name: 'พร้อมเพย์ QR Code (PromptPay)',
                      sub: 'สแกน QR Code พร้อมเพย์ ชำระเงินสะดวก ตรวจสลิป AI',
                      icon: QrCode,
                      badge: 'แนะนำ',
                      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                      iconColor: 'text-emerald-400',
                      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
                    },
                    {
                      id: 'truemoney',
                      name: 'ซองของขวัญ ทรูมันนี่ (TrueMoney Wallet)',
                      sub: 'ส่งลิงก์ซองของขวัญทรูมันนี่ เติมเงินอัตโนมัติ 24 ชม.',
                      icon: Gift,
                      badge: 'ยอดนิยม',
                      badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
                      iconColor: 'text-orange-400',
                      iconBg: 'bg-orange-500/10 border-orange-500/20',
                    },
                    {
                      id: 'bank_transfer',
                      name: 'โอนผ่านบัญชีธนาคาร (Bank Transfer)',
                      sub: 'โอนเงินเข้าบัญชีธนาคารของร้าน พร้อมระบบแนบสลิปตรวจสอบ',
                      icon: Building2,
                      badge: 'แนบสลิป',
                      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                      iconColor: 'text-blue-400',
                      iconBg: 'bg-blue-500/10 border-blue-500/20',
                    },
                    {
                      id: 'wallet',
                      name: 'กระเป๋าเงินสมาชิก BOOSTUP (User Wallet)',
                      sub: 'หักเงินจากยอดคงเหลือในบัญชีสมาชิก เติมเกมได้ทันที',
                      icon: Wallet,
                      badge: 'สะดวกสุด',
                      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                      iconColor: 'text-purple-400',
                      iconBg: 'bg-purple-500/10 border-purple-500/20',
                    },
                    {
                      id: 'credit_card',
                      name: 'บัตรเครดิต / เดบิต (Credit / Debit Card)',
                      sub: 'รองรับการชำระผ่าน Visa, Mastercard, JCB (ระบบเกตเวย์)',
                      icon: CreditCard,
                      badge: 'เร็วๆ นี้',
                      badgeColor: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
                      iconColor: 'text-pink-400',
                      iconBg: 'bg-pink-500/10 border-pink-500/20',
                    },
                  ].map((ch) => {
                    const isEnabled = ch.id === 'credit_card'
                      ? Boolean(siteSettings.paymentMethods?.credit_card?.enabled)
                      : siteSettings.paymentMethods?.[ch.id]?.enabled !== false;
                    const IconComp = ch.icon;

                    return (
                      <div
                        key={ch.id}
                        className={`p-4 rounded-xl border transition-all duration-200 flex items-center justify-between gap-4 ${
                          isEnabled
                            ? 'bg-zinc-900/90 border-zinc-700/80 shadow-sm'
                            : 'bg-zinc-950/40 border-zinc-800/60 opacity-60'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${ch.iconBg}`}>
                            <IconComp className={`w-5 h-5 ${ch.iconColor}`} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-white truncate">{ch.name}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${ch.badgeColor}`}>
                                {ch.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                              {ch.sub}
                            </p>
                            <div className="mt-2 flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${isEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
                              <span className={`text-[10px] font-medium ${isEnabled ? 'text-emerald-400' : 'text-zinc-500'}`}>
                                {isEnabled ? 'เปิดแสดงผล (Active)' : 'ปิดการแสดงผล (Disabled)'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-2">
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={() => handleTogglePaymentMethod(ch.id)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Multiple Bank Accounts for Bank Transfer */}
              <div className="p-6 rounded-2xl bg-cyber-card border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white font-['Kanit'] flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      บัญชีธนาคารสำหรับโอนเงิน (Bank Accounts)
                    </h3>
                    <p className="text-xs text-zinc-400">เพิ่มหรือลบบัญชีธนาคารสำหรับลูกค้าโอนเงินเข้าหน้าร้าน</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewBankModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white"
                  >
                    <Plus className="w-3.5 h-3.5" /> เพิ่มบัญชีธนาคาร
                  </button>
                </div>

                <div className="space-y-2">
                  {(siteSettings.bankAccounts || []).map((b) => (
                    <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{b.bankName}</span>
                          {b.promptpayLinked && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-950 text-blue-300 border border-blue-800/50">
                              พร้อมเพย์
                            </span>
                          )}
                        </div>
                        <div className="text-zinc-400 mt-0.5">
                          เลขบัญชี: <strong className="text-emerald-400 font-mono text-sm">{b.accountNo}</strong> • {b.accountName}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteBankAccount(b.id)}
                        className="text-red-400 hover:text-red-300 p-1.5 rounded-lg bg-red-950/40 border border-red-900/50 text-[10px] font-bold"
                      >
                        ลบบัญชี
                      </button>
                    </div>
                  ))}
                  {(!siteSettings.bankAccounts || siteSettings.bankAccounts.length === 0) && (
                    <p className="text-center text-xs text-zinc-500 py-3">ยังไม่มีบัญชีธนาคารในระบบ</p>
                  )}
                </div>
              </div>

              {/* 3. PromptPay EMVCo Settings */}
              <div className="p-6 rounded-2xl bg-cyber-card border border-zinc-800 space-y-4">
                <h3 className="text-sm font-bold text-white font-['Kanit'] flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  การชำระเงินด้วยพร้อมเพย์ QR Code (PromptPay EMVCo)
                </h3>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-zinc-400 block mb-1">เบอร์โทรศัพท์ / เลขประจำตัวผู้เสียภาษี *</label>
                    <input
                      type="text"
                      value={siteSettings.promptpayNumber}
                      onChange={(e) => setSiteSettings({ ...siteSettings, promptpayNumber: e.target.value })}
                      placeholder="เช่น 0891234567 หรือ 0105566000000"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">ชื่อบัญชีผู้รับเงิน *</label>
                    <input
                      type="text"
                      value={siteSettings.promptpayName}
                      onChange={(e) => setSiteSettings({ ...siteSettings, promptpayName: e.target.value })}
                      placeholder="เช่น บจก. บูสต์อัพ (BOOSTUP)"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* 3.1 Slip Verification Policy Settings */}
              <div className="p-6 rounded-2xl bg-cyber-card border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white font-['Kanit'] flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-400" />
                      นโยบายการตรวจสอบสลิปโอนเงิน (Slip Verification Policy)
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      กำหนดว่าจะให้ระบบอนุมัติเงินเข้ากระเป๋าทันที หรือต้องให้แอดมินตรวจสอบสลิปก่อน
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>โหมดการตรวจสอบสลิป:</span>
                        {!siteSettings.autoSlipApproval ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                            🛡️ ปลอดภัยสูงสุด (แอดมินตรวจสลิปก่อน)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800/60">
                            ⚡ อนุมัติอัตโนมัติ (โหมดทดสอบ)
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                        {!siteSettings.autoSlipApproval
                          ? 'เมื่อลูกค้าแจ้งโอนเงิน รายการจะอยู่ในสถานะ "รอตรวจสอบ" ยอดเงินจะเข้ากระเป๋าเมื่อแอดมินกดอนุมัติในแท็บ "อนุมัติสลิปเติมเงิน" เท่านั้น ป้องกันการแนบรูปมั่ว/รูปสลิปปลอมได้ 100%'
                          : 'คำเตือน: โหมดนี้จะเพิ่มยอดเงินเข้ากระเป๋าลูกค้าทันทีเมื่อแนบรูป เหมาะสำหรับทดสอบระบบเท่านั้น'}
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={siteSettings.autoSlipApproval === true}
                        onChange={(e) => setSiteSettings({ ...siteSettings, autoSlipApproval: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* 3.2 Email SMTP Settings (For Password Reset OTP) */}
              <div className="p-6 rounded-2xl bg-cyber-card border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white font-['Kanit'] flex items-center gap-2">
                      <Mail className="w-4 h-4 text-red-500" />
                      ตั้งค่าระบบส่งอีเมลยืนยัน OTP (Email SMTP Settings)
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      กำหนดค่าอีเมลสำหรับส่งรหัส OTP กู้คืนรหัสผ่านไปยังกล่องข้อความของลูกค้าจริง
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-zinc-400 block mb-1">SMTP Server Host</label>
                    <input
                      type="text"
                      value={siteSettings.smtp?.host || ''}
                      onChange={(e) => setSiteSettings({ 
                        ...siteSettings, 
                        smtp: { ...(siteSettings.smtp || {}), host: e.target.value } 
                      })}
                      placeholder="เช่น smtp.gmail.com"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">SMTP Port</label>
                    <input
                      type="number"
                      value={siteSettings.smtp?.port || 465}
                      onChange={(e) => setSiteSettings({ 
                        ...siteSettings, 
                        smtp: { ...(siteSettings.smtp || {}), port: Number(e.target.value) } 
                      })}
                      placeholder="465 หรือ 587"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">อีเมลผู้ส่ง (Username / Email)</label>
                    <input
                      type="text"
                      value={siteSettings.smtp?.user || ''}
                      onChange={(e) => setSiteSettings({ 
                        ...siteSettings, 
                        smtp: { ...(siteSettings.smtp || {}), user: e.target.value } 
                      })}
                      placeholder="เช่น yourstore@gmail.com"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">รหัสผ่านแอป (App Password)</label>
                    <input
                      type="password"
                      value={siteSettings.smtp?.pass || ''}
                      onChange={(e) => setSiteSettings({ 
                        ...siteSettings, 
                        smtp: { ...(siteSettings.smtp || {}), pass: e.target.value } 
                      })}
                      placeholder="รหัสผ่านแอป Gmail 16 หลัก"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 leading-relaxed">
                  💡 <strong>หมายเหตุ:</strong> หากยังไม่ได้กรอกข้อมูล SMTP ระบบจะทำงานในโหมดจำลอง (Simulation Mode) โดยจะแสดงรหัส OTP ให้เห็นบนหน้าเว็บเพื่อความสะดวกในการทดสอบทันที
                </div>
              </div>

              {/* 4. Boost Coins Loyalty Settings */}
              <div className="p-6 rounded-2xl bg-cyber-card border border-zinc-800 space-y-4">
                <h3 className="text-sm font-bold text-white font-['Kanit'] flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-400" />
                  ระบบสะสมเหรียญ Boost Coins
                </h3>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-zinc-400 block mb-1">อัตราแจกเหรียญ (เหรียญ ต่อ ทุกๆ 100 บาท)</label>
                    <input
                      type="number"
                      value={siteSettings.coinsRewardRate || 10}
                      onChange={(e) => setSiteSettings({ ...siteSettings, coinsRewardRate: Number(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">ป้ายกำกับโบนัสเหรียญ (Multiplier Badge)</label>
                    <input
                      type="text"
                      value={siteSettings.coinsMultiplierText || '2X COINS'}
                      onChange={(e) => setSiteSettings({ ...siteSettings, coinsMultiplierText: e.target.value })}
                      placeholder="เช่น 2X COINS"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Support & Contacts */}
              <div className="p-6 rounded-2xl bg-cyber-card border border-zinc-800 space-y-4">
                <h3 className="text-sm font-bold text-white font-['Kanit'] flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-pink-400" />
                  ช่องทางติดต่อและการให้บริการลูกค้า
                </h3>
                
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-zinc-400 block mb-1">LINE Official ID</label>
                    <input
                      type="text"
                      value={siteSettings.contactLine || '@boostup'}
                      onChange={(e) => setSiteSettings({ ...siteSettings, contactLine: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">Facebook Fanpage</label>
                    <input
                      type="text"
                      value={siteSettings.contactFacebook || 'BoostUpGameStore'}
                      onChange={(e) => setSiteSettings({ ...siteSettings, contactFacebook: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">Discord Community</label>
                    <input
                      type="text"
                      value={siteSettings.contactDiscord || 'discord.gg/boostup'}
                      onChange={(e) => setSiteSettings({ ...siteSettings, contactDiscord: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* 6. Footer Content */}
              <div className="p-6 rounded-2xl bg-cyber-card border border-zinc-800 space-y-4">
                <h3 className="text-sm font-bold text-white font-['Kanit'] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-zinc-400" />
                  ข้อความท้ายเว็บไซต์ (Footer Information)
                </h3>
                
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-zinc-400 block mb-1">เกี่ยวกับเรา (About Description)</label>
                    <textarea
                      rows="2"
                      value={siteSettings.footerAbout || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, footerAbout: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">ข้อความทะเบียนนิติบุคคล / ความปลอดภัย</label>
                    <input
                      type="text"
                      value={siteSettings.footerLegal || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, footerLegal: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">ข้อความลิขสิทธิ์ (Copyright Text)</label>
                    <input
                      type="text"
                      value={siteSettings.footerCopyright || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, footerCopyright: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* 5. DATABASE PERSISTENCE, BACKUP & CLOUD POSTGRESQL */}
              <div className="p-6 rounded-2xl bg-cyber-card border border-amber-600/40 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <Database className="w-5 h-5 text-amber-500" />
                    <div>
                      <h3 className="text-sm font-bold text-white font-['Kanit']">
                        ความปลอดภัยฐานข้อมูล & ป้องกันข้อมูลรีเซ็ต (Data Persistence)
                      </h3>
                      <p className="text-xs text-zinc-400">
                        จัดเก็บข้อมูลสมาชิก, ยอดเงิน, ประวัติคำสั่งซื้อ และสลิป ให้คงอยู่ถาวรไม่สูญหายเมื่ออัปเดตโค้ด
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md">
                    {dbStatus?.isPgConnected ? (
                      <span className="text-emerald-400 border-emerald-800/60 bg-emerald-950/60 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        🟢 Cloud PostgreSQL (ถาวร 100%)
                      </span>
                    ) : (
                      <span className="text-amber-400 border-amber-800/60 bg-amber-950/60 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        💾 Local Storage + Rolling Auto-Backup
                      </span>
                    )}
                  </div>
                </div>

                {/* Database Metrics Overview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                    <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-blue-400" /> สมาชิกในระบบ
                    </div>
                    <div className="text-lg font-black text-white font-mono">
                      {dbStatus?.counts?.users ?? customers.length} คน
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                    <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" /> คำสั่งซื้อทั้งหมด
                    </div>
                    <div className="text-lg font-black text-white font-mono">
                      {dbStatus?.counts?.orders ?? orders.length} รายการ
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                    <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-amber-400" /> บัญชีธนาคาร
                    </div>
                    <div className="text-lg font-black text-white font-mono">
                      {siteSettings.bankAccounts?.length || 0} บัญชี
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                    <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5 text-purple-400" /> รายการสลิปโอน
                    </div>
                    <div className="text-lg font-black text-white font-mono">
                      {deposits.length} รายการ
                    </div>
                  </div>
                </div>

                {/* Backup & Restore Action Buttons */}
                <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-zinc-300">
                    <strong className="text-white block">สำรองและกู้คืนฐานข้อมูล (One-Click Backup & Restore)</strong>
                    ดาวน์โหลดข้อมูลสำรองเก็บไว้ในคอมพิวเตอร์ของคุณ หรือนำไฟล์มาอัปโหลดเพื่อกู้คืนได้ทุกเมื่อ
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleDownloadBackup}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow"
                      title="ดาวน์โหลดไฟล์สำรองข้อมูล JSON ลงเครื่อง"
                    >
                      <Download className="w-4 h-4 text-emerald-400" />
                      <span>ดาวน์โหลดไฟล์สำรอง</span>
                    </button>

                    <label className="flex-1 sm:flex-initial cursor-pointer px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow">
                      <Upload className="w-4 h-4 text-amber-400" />
                      <span>กู้คืนจากไฟล์</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleRestoreBackup}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Cloud PostgreSQL Connect Box */}
                <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Cloud className="w-4 h-4 text-cyan-400" />
                      <span>เชื่อมต่อ Cloud Database (PostgreSQL) เพื่อให้ข้อมูลอยู่ถาวร 100%</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPgGuide(!showPgGuide)}
                      className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                    >
                      {showPgGuide ? 'ซ่อนคำแนะนำ' : '📖 วิธีสร้าง Render Postgres ฟรีใน 2 นาที'}
                    </button>
                  </div>

                  {/* Collapsible Step-by-step Guide */}
                  {showPgGuide && (
                    <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-700/80 text-[11px] text-zinc-300 space-y-2 leading-relaxed">
                      <div className="font-bold text-amber-400">ขั้นตอนสร้าง PostgreSQL ฟรีบน Render:</div>
                      <ol className="list-decimal list-inside space-y-1 text-zinc-300">
                        <li>เข้าสู่ระบบที่ <a href="https://dashboard.render.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline">dashboard.render.com</a></li>
                        <li>กดปุ่ม <strong>"New +"</strong> ที่มุมขวาบน แล้วเลือก <strong>"PostgreSQL"</strong></li>
                        <li>ตั้งชื่อฐานข้อมูล เช่น <code>boostup-db</code> แล้วกดปุ่ม <strong>"Create Database"</strong> (ฟรี 100%)</li>
                        <li>เมื่อสร้างเสร็จ ในหน้าฐานข้อมูล เลื่อนลงมาที่หัวข้อ <strong>"Connections"</strong></li>
                        <li>กด Copy ที่ <strong>"Internal Database URL"</strong> (หากเว็บรันบน Render) หรือ <strong>"External Database URL"</strong></li>
                        <li>นำ URL มาวางในช่องด้านล่างนี้ แล้วกดปุ่ม <strong>"ทดสอบและเชื่อมต่อทันที"</strong></li>
                      </ol>
                      <div className="text-emerald-400 text-[10px] pt-1">
                        ✓ เมื่อเชื่อมต่อสำเร็จ ข้อมูลสมาชิก, เงินในกระเป๋า, และออเดอร์ทั้งหมดจะถูกเก็บใน PostgreSQL ข้อมูลจะไม่มีวันสูญหายหรือรีเซ็ตเมื่ออัปเดตโค้ดอีกต่อไป!
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleConnectPostgres} className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="เช่น postgresql://postgres:password@ep-sample.render.com/boostup_db"
                      value={pgUrlInput}
                      onChange={(e) => setPgUrlInput(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-zinc-700 text-white text-xs font-mono"
                    />
                    <button
                      type="submit"
                      disabled={isConnectingPg}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white text-xs font-bold shadow transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {isConnectingPg ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>กำลังเชื่อมต่อ...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>ทดสอบและเชื่อมต่อทันที</span>
                        </>
                      )}
                    </button>
                  </form>

                  {pgConnectMsg.text && (
                    <div className={`text-xs p-2.5 rounded-xl border flex items-center gap-2 ${
                      pgConnectMsg.type === 'success' 
                        ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' 
                        : 'bg-red-950/60 border-red-800 text-red-300'
                    }`}>
                      {pgConnectMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
                      <span>{pgConnectMsg.text}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Save All Settings Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    await fetch('/api/admin/settings', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(siteSettings)
                    });
                    showAlert({
                      title: 'บันทึกสำเร็จ!',
                      message: 'บันทึกการตั้งค่าหน้าร้านเรียบร้อยแล้ว มีผลต่อหน้าเว็บทันที 100%',
                      type: 'success'
                    });
                  }}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:brightness-110 text-white font-bold text-sm shadow-xl shadow-red-600/30 transition-all font-['Kanit']"
                >
                  บันทึกการตั้งค่าหน้าร้านและระบบชำระเงินทั้งหมด
                </button>
              </div>

            </div>
          )}

          {/* TAB 11: ADMIN AUDIT LOGS & ACTIVITY HISTORY */}
          {activeTab === 'audit_logs' && (
            <div className="space-y-6">
              
              {/* Top Banner / Summary */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-amber-950/50 via-zinc-900 to-black border border-amber-900/40">
                <div>
                  <h3 className="text-lg font-black text-white font-['Kanit'] flex items-center gap-2.5">
                    <History className="w-6 h-6 text-amber-400" />
                    <span>บันทึกและประวัติกิจกรรมแอดมิน (Admin Audit Logs & Activity History)</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    เก็บบันทึกประวัติการทำรายการทุกขั้นตอนของผู้ดูแลระบบอย่างละเอียด เช่น อนุมัติสลิป, ปฏิเสธสลิป, แก้ไขข้อมูลลูกค้า, ปรับเงิน, แก้ไขเกม/โปรโมชั่น และตั้งค่าร้านค้า
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={handleExportAuditLogsCSV}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-amber-500/40 text-xs font-semibold text-amber-300 hover:text-white transition-all cursor-pointer shadow-sm"
                    title="ดาวน์โหลดประวัติเป็นไฟล์ CSV"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>ส่งออก CSV</span>
                  </button>
                  <button
                    onClick={() => loadData(false)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>รีเฟรช</span>
                  </button>
                </div>
              </div>

              {/* Status Counters */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-zinc-900/80 border border-amber-500/40">
                  <div className="text-xs text-amber-400 font-bold flex items-center justify-between">
                    <span>กิจกรรมทั้งหมด</span>
                    <History className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-white font-['Kanit'] mt-1">
                    {auditLogs.length} <span className="text-xs font-normal text-zinc-400">รายการ</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/80 border border-emerald-500/40">
                  <div className="text-xs text-emerald-400 font-bold flex items-center justify-between">
                    <span>อนุมัติสลิปเติมเงิน</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-emerald-400 font-['Kanit'] mt-1">
                    {auditLogs.filter(l => l.action === 'APPROVE_SLIP').length} <span className="text-xs font-normal text-zinc-400">ครั้ง</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/80 border border-red-500/40">
                  <div className="text-xs text-red-400 font-bold flex items-center justify-between">
                    <span>ปฏิเสธสลิปโอนเงิน</span>
                    <XCircle className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-red-400 font-['Kanit'] mt-1">
                    {auditLogs.filter(l => l.action === 'REJECT_SLIP').length} <span className="text-xs font-normal text-zinc-400">ครั้ง</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/80 border border-purple-500/40">
                  <div className="text-xs text-purple-400 font-bold flex items-center justify-between">
                    <span>แก้ไขลูกค้า & ปรับเงิน</span>
                    <UserCog className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-purple-400 font-['Kanit'] mt-1">
                    {auditLogs.filter(l => l.action === 'UPDATE_CUSTOMER' || l.action === 'ADJUST_WALLET').length} <span className="text-xs font-normal text-zinc-400">ครั้ง</span>
                  </div>
                </div>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  
                  {/* Search Input */}
                  <div className="relative flex-1 w-full sm:w-auto">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="ค้นหาชื่อแอดมิน, รายการกิจกรรม, หรือข้อความรายละเอียด..."
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/50 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Date Filter */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0 text-xs">
                    <span className="text-zinc-400 text-[11px]">ช่วงเวลา:</span>
                    {[
                      { id: 'all', label: 'ทั้งหมด' },
                      { id: 'today', label: 'วันนี้' },
                      { id: 'week', label: '7 วันล่าสุด' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setLogDateFilter(tab.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                          logDateFilter === tab.id
                            ? 'bg-amber-600 text-white font-bold'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                </div>

                {/* Category Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-zinc-800/60 text-xs">
                  <span className="text-zinc-400 text-[11px] mr-1 flex items-center gap-1">
                    <Filter className="w-3 h-3 text-amber-400" />
                    กรองประเภท:
                  </span>
                  {[
                    { id: 'all', label: 'ทั้งหมด', count: auditLogs.length },
                    { id: 'admin_only', label: 'เฉพาะแอดมิน', count: auditLogs.filter(l => l.adminId !== 'user').length },
                    { id: 'APPROVE_SLIP', label: 'อนุมัติสลิป', count: auditLogs.filter(l => l.action === 'APPROVE_SLIP').length },
                    { id: 'REJECT_SLIP', label: 'ปฏิเสธสลิป', count: auditLogs.filter(l => l.action === 'REJECT_SLIP').length },
                    { id: 'UPDATE_CUSTOMER', label: 'แก้ไขข้อมูลลูกค้า', count: auditLogs.filter(l => l.action === 'UPDATE_CUSTOMER').length },
                    { id: 'ADJUST_WALLET', label: 'ปรับเงินกระเป๋า', count: auditLogs.filter(l => l.action === 'ADJUST_WALLET').length },
                    { id: 'SETTINGS', label: 'จัดการร้าน & เกม', count: auditLogs.filter(l => ['UPDATE_SETTINGS', 'SAVE_GAME', 'DELETE_GAME', 'SAVE_SLIDE', 'DELETE_SLIDE', 'CREATE_COUPON', 'DELETE_COUPON', 'SAVE_FLASH_SALE', 'DELETE_FLASH_SALE'].includes(l.action)).length },
                    { id: 'AUTH', label: 'ความปลอดภัย/ล็อกอิน', count: auditLogs.filter(l => ['ADMIN_LOGIN_SUCCESS', 'ADMIN_LOGIN_FAILED', 'PASSWORD_RESET_SUCCESS', 'OTP_REQUESTED'].includes(l.action)).length }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setLogActionFilter(cat.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
                        logActionFilter === cat.id
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 font-bold'
                          : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border border-transparent'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span className={`px-1 py-0.2 rounded text-[10px] ${
                        logActionFilter === cat.id ? 'bg-amber-500 text-black font-bold' : 'bg-zinc-700 text-zinc-300'
                      }`}>
                        {cat.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Logs List Table */}
              <div className="p-6 rounded-2xl bg-cyber-card border border-zinc-800 overflow-x-auto">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs text-zinc-400">
                    แสดง <strong>{filteredAuditLogs.length}</strong> รายการ จากทั้งหมด {auditLogs.length} รายการ
                  </div>
                  {logSearch && (
                    <button
                      onClick={() => setLogSearch('')}
                      className="text-xs text-amber-400 hover:underline"
                    >
                      ล้างคำค้นหา
                    </button>
                  )}
                </div>

                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 uppercase text-[10px]">
                      <th className="py-3 px-3">วันที่ & เวลา</th>
                      <th className="py-3 px-3">ผู้ดำเนินการ</th>
                      <th className="py-3 px-3">ประเภทกิจกรรม</th>
                      <th className="py-3 px-3">รายละเอียดการทำรายการ</th>
                      <th className="py-3 px-3 text-right">รหัสอ้างอิง</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredAuditLogs.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-16 text-center text-zinc-500">
                          <History className="w-8 h-8 mx-auto mb-2 text-zinc-600 opacity-60" />
                          <div className="text-xs">ไม่พบรายการประวัติกิจกรรมตามเงื่อนไขที่เลือก</div>
                        </td>
                      </tr>
                    ) : (
                      filteredAuditLogs.map((log) => {
                        // Action Badge styling
                        let badgeColor = 'bg-zinc-800 text-zinc-300 border-zinc-700';
                        let actionLabel = log.action;
                        let actionIcon = <History className="w-3 h-3" />;

                        if (log.action === 'APPROVE_SLIP') {
                          badgeColor = 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60';
                          actionLabel = 'อนุมัติสลิปเงินเข้า';
                          actionIcon = <CheckCircle2 className="w-3 h-3 text-emerald-400" />;
                        } else if (log.action === 'REJECT_SLIP') {
                          badgeColor = 'bg-red-950/80 text-red-300 border-red-800/60';
                          actionLabel = 'ปฏิเสธสลิปโอนเงิน';
                          actionIcon = <XCircle className="w-3 h-3 text-red-400" />;
                        } else if (log.action === 'UPDATE_CUSTOMER') {
                          badgeColor = 'bg-amber-950/80 text-amber-300 border-amber-800/60';
                          actionLabel = 'แก้ไขข้อมูลลูกค้า';
                          actionIcon = <UserCog className="w-3 h-3 text-amber-400" />;
                        } else if (log.action === 'ADJUST_WALLET') {
                          badgeColor = 'bg-purple-950/80 text-purple-300 border-purple-800/60';
                          actionLabel = 'ปรับยอดเงินกระเป๋า';
                          actionIcon = <Wallet className="w-3 h-3 text-purple-400" />;
                        } else if (log.action === 'UPDATE_SETTINGS') {
                          badgeColor = 'bg-sky-950/80 text-sky-300 border-sky-800/60';
                          actionLabel = 'ตั้งค่าร้าน & ชำระเงิน';
                          actionIcon = <Settings className="w-3 h-3 text-sky-400" />;
                        } else if (log.action === 'SAVE_GAME' || log.action === 'DELETE_GAME') {
                          badgeColor = 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60';
                          actionLabel = log.action === 'SAVE_GAME' ? 'บันทึกข้อมูลเกม' : 'ลบเกม';
                          actionIcon = <Gamepad2 className="w-3 h-3 text-indigo-400" />;
                        } else if (log.action === 'CREATE_COUPON' || log.action === 'DELETE_COUPON') {
                          badgeColor = 'bg-orange-950/80 text-orange-300 border-orange-800/60';
                          actionLabel = log.action === 'CREATE_COUPON' ? 'สร้างคูปองส่วนลด' : 'ลบคูปอง';
                          actionIcon = <Tag className="w-3 h-3 text-orange-400" />;
                        } else if (log.action === 'ADMIN_LOGIN_SUCCESS') {
                          badgeColor = 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60';
                          actionLabel = 'แอดมินเข้าสู่ระบบ';
                          actionIcon = <ShieldCheck className="w-3 h-3 text-cyan-400" />;
                        } else if (log.action === 'ADMIN_LOGIN_FAILED') {
                          badgeColor = 'bg-rose-950/80 text-rose-300 border-rose-800/60';
                          actionLabel = 'ล็อกอินไม่สำเร็จ';
                          actionIcon = <AlertTriangle className="w-3 h-3 text-rose-400" />;
                        } else if (log.action === 'PASSWORD_RESET_SUCCESS') {
                          badgeColor = 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60';
                          actionLabel = 'รีเซ็ตรหัสผ่านสำเร็จ';
                          actionIcon = <Key className="w-3 h-3 text-emerald-400" />;
                        } else if (log.action === 'CHAT_REPLY') {
                          badgeColor = 'bg-teal-950/80 text-teal-300 border-teal-800/60';
                          actionLabel = 'ตอบแชทลูกค้า';
                          actionIcon = <MessageSquare className="w-3 h-3 text-teal-400" />;
                        } else if (log.action === 'RESET_STATS') {
                          badgeColor = 'bg-yellow-950/80 text-yellow-300 border-yellow-800/60';
                          actionLabel = 'รีเซ็ตสถิติระบบ';
                          actionIcon = <RotateCw className="w-3 h-3 text-yellow-400" />;
                        } else if (log.action === 'SLIP_SUBMITTED') {
                          badgeColor = 'bg-blue-950/80 text-blue-300 border-blue-800/60';
                          actionLabel = 'ลูกค้าส่งสลิปโอน';
                          actionIcon = <Clock className="w-3 h-3 text-blue-400" />;
                        }

                        // Time formatting
                        const logDate = log.createdAt ? new Date(log.createdAt) : new Date();
                        const timeThai = logDate.toLocaleString('th-TH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        });

                        return (
                          <tr key={log.id} className="hover:bg-zinc-900/40 transition-colors">
                            
                            {/* Date & Time */}
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <span className="font-mono text-white text-[11px] block">{timeThai}</span>
                              <span className="text-[10px] text-zinc-500">
                                {Math.floor((Date.now() - logDate.getTime()) / 60000) < 60
                                  ? `${Math.max(1, Math.floor((Date.now() - logDate.getTime()) / 60000))} นาทีที่แล้ว`
                                  : Math.floor((Date.now() - logDate.getTime()) / 3600000) < 24
                                  ? `${Math.floor((Date.now() - logDate.getTime()) / 3600000)} ชั่วโมงที่แล้ว`
                                  : `${Math.floor((Date.now() - logDate.getTime()) / 86400000)} วันที่แล้ว`}
                              </span>
                            </td>

                            {/* Operator / Admin */}
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${
                                  log.adminId === 'user'
                                    ? 'bg-zinc-900 text-zinc-400 border-zinc-800'
                                    : 'bg-red-950/80 text-red-300 border-red-800/60'
                                }`}>
                                  <Shield className="w-2.5 h-2.5 text-red-400" />
                                  {log.adminName || log.adminId || 'Admin'}
                                </span>
                              </div>
                            </td>

                            {/* Action Type */}
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${badgeColor}`}>
                                {actionIcon}
                                <span>{actionLabel}</span>
                              </span>
                            </td>

                            {/* Details */}
                            <td className="py-3.5 px-3 text-zinc-200">
                              <span className="font-medium text-xs leading-relaxed">{log.details}</span>
                            </td>

                            {/* Log ID */}
                            <td className="py-3.5 px-3 text-right whitespace-nowrap">
                              <span className="font-mono text-[10px] text-zinc-500 bg-zinc-900/60 px-2 py-0.5 rounded border border-zinc-800">
                                {log.id ? `#${log.id.replace('log_', '').slice(0, 12)}` : '-'}
                              </span>
                            </td>

                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

        </div>

      </main>

      {/* Game Editor Modal (Add/Edit Games & Packages with Image Upload) */}
      {gameEditorModal.open && (
        <GameEditorModal
          game={gameEditorModal.game}
          onClose={() => setGameEditorModal({ open: false, game: null })}
          onSaveSuccess={loadData}
        />
      )}

      {/* Admin RBAC Modal (Manage Staff & Roles) */}
      {rbacModal.open && (
        <AdminRBACModal
          admin={rbacModal.admin}
          onClose={() => setRbacModal({ open: false, admin: null })}
          onSaveSuccess={loadData}
        />
      )}

      {/* New Slide Modal (CMS Banner Uploader) */}
      {newSlideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0e121a] border border-red-800/60 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white font-['Kanit']">เพิ่มแบนเนอร์สไลด์โปรโมชั่น</h3>
              <button onClick={() => setNewSlideModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateSlide} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">หัวข้อแบนเนอร์ (เว้นว่างได้ หากเป็นภาพกราฟิกล้วน)</label>
                <input
                  type="text"
                  placeholder="เช่น FLASH SALE ดีลเดือดลด 30% (หรือเว้นว่าง)"
                  value={slideForm.title}
                  onChange={(e) => setSlideForm({ ...slideForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">คำบรรยาย (เว้นว่างได้)</label>
                <input
                  type="text"
                  placeholder="เช่น เติม ROV คูปองเข้าเกมทันที 24 ชม."
                  value={slideForm.subtitle}
                  onChange={(e) => setSlideForm({ ...slideForm, subtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">ป้าย Badge</label>
                  <input
                    type="text"
                    placeholder="เช่น ⚡ FLASH SALE"
                    value={slideForm.badge}
                    onChange={(e) => setSlideForm({ ...slideForm, badge: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">ปลายทางเมื่อคลิก</label>
                  <input
                    type="text"
                    placeholder="popular-games หรือ https://..."
                    value={slideForm.ctaTarget}
                    onChange={(e) => setSlideForm({ ...slideForm, ctaTarget: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                  />
                </div>
              </div>

              {/* Upload Banner from Machine */}
              <ImageUploader
                currentImageUrl={slideForm.image}
                onImageUploaded={(url) => setSlideForm({ ...slideForm, image: url })}
                label="อัปโหลดรูปภาพแบนเนอร์จากเครื่องคอมพิวเตอร์"
                aspectRatio="banner"
              />

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-md shadow-red-600/30"
              >
                บันทึกและเผยแพร่แบนเนอร์
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Slide Modal */}
      {editSlideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0e121a] border border-zinc-700 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white font-['Kanit']">แก้ไขแบนเนอร์สไลด์</h3>
              <button onClick={() => setEditSlideModal(null)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSaveEditSlide} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">หัวข้อแบนเนอร์ (เว้นว่างได้)</label>
                <input
                  type="text"
                  placeholder="เว้นว่างหากต้องการแสดงเฉพาะภาพกราฟิก"
                  value={editSlideModal.title || ''}
                  onChange={(e) => setEditSlideModal({ ...editSlideModal, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">คำบรรยาย (เว้นว่างได้)</label>
                <input
                  type="text"
                  placeholder="คำบรรยายย่อย"
                  value={editSlideModal.subtitle || ''}
                  onChange={(e) => setEditSlideModal({ ...editSlideModal, subtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">ป้าย Badge</label>
                  <input
                    type="text"
                    placeholder="เช่น ⚡ PROMO"
                    value={editSlideModal.badge || ''}
                    onChange={(e) => setEditSlideModal({ ...editSlideModal, badge: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">ปลายทางเมื่อคลิก</label>
                  <input
                    type="text"
                    placeholder="popular-games หรือ https://..."
                    value={editSlideModal.ctaTarget || 'popular-games'}
                    onChange={(e) => setEditSlideModal({ ...editSlideModal, ctaTarget: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                  />
                </div>
              </div>

              {/* Upload or Change Image */}
              <ImageUploader
                currentImageUrl={editSlideModal.image}
                onImageUploaded={(url) => setEditSlideModal({ ...editSlideModal, image: url })}
                label="เปลี่ยนรูปภาพแบนเนอร์"
                aspectRatio="banner"
              />

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="editSlideActive"
                  checked={editSlideModal.isActive !== false}
                  onChange={(e) => setEditSlideModal({ ...editSlideModal, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-red-600 bg-zinc-900 border-zinc-700 focus:ring-red-500"
                />
                <label htmlFor="editSlideActive" className="text-xs text-zinc-300 cursor-pointer">
                  เปิดให้แสดงผลบนหน้าร้าน (Active)
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditSlideModal(null)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-md shadow-red-600/30"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Wallet Adjustment Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#0e121a] border border-red-800/60 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white">ปรับยอดเงินกระเป๋า ({selectedCustomer.name})</h3>
              <button onClick={() => setSelectedCustomer(null)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            <div className="text-xs text-zinc-400">
              ยอดคงเหลือปัจจุบัน: <strong className="text-emerald-400">฿{(selectedCustomer.walletBalance || 0).toFixed(2)}</strong>
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">จำนวนเงิน (บาท)</label>
              <input
                type="number"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleAdjustWallet('add')}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
              >
                + เพิ่มเงิน
              </button>
              <button
                onClick={() => handleAdjustWallet('subtract')}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold"
              >
                - ลดเงิน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Edit Modal (Edit Name, Phone, Email, Password, Tier, Wallet) */}
      {customerEditModal.open && customerEditModal.customer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#0e121a] border border-amber-600/50 rounded-3xl p-6 space-y-4 shadow-2xl text-slate-100 font-['Prompt',sans-serif]">
            
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                  <UserCog className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-['Kanit']">
                    แก้ไขข้อมูลลูกค้า (@{customerEditModal.customer.username})
                  </h3>
                  <div className="text-[10px] text-zinc-400">
                    รหัสลูกค้า: {customerEditModal.customer.id}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setCustomerEditModal({ open: false, customer: null, form: {} })} 
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">ชื่อ-นามสกุล / ชื่อแสดง *</label>
                  <input
                    type="text"
                    required
                    value={customerEditModal.form.name || ''}
                    onChange={(e) => setCustomerEditModal({
                      ...customerEditModal,
                      form: { ...customerEditModal.form, name: e.target.value }
                    })}
                    placeholder="เช่น สมชาย ใจดี"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">เบอร์โทรศัพท์ (Phone)</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="tel"
                      value={customerEditModal.form.phone || ''}
                      onChange={(e) => setCustomerEditModal({
                        ...customerEditModal,
                        form: { ...customerEditModal.form, phone: e.target.value }
                      })}
                      placeholder="เช่น 0812345678"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">อีเมลติดต่อ (Email) *</label>
                  <input
                    type="email"
                    required
                    value={customerEditModal.form.email || ''}
                    onChange={(e) => setCustomerEditModal({
                      ...customerEditModal,
                      form: { ...customerEditModal.form, email: e.target.value }
                    })}
                    placeholder="customer@example.com"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">
                    รีเซ็ตรหัสผ่านใหม่ <span className="text-zinc-500 font-normal">(เว้นว่างหากไม่เปลี่ยน)</span>
                  </label>
                  <input
                    type="text"
                    value={customerEditModal.form.password || ''}
                    onChange={(e) => setCustomerEditModal({
                      ...customerEditModal,
                      form: { ...customerEditModal.form, password: e.target.value }
                    })}
                    placeholder="ตั้งรหัสผ่านใหม่ให้ลูกค้า"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-zinc-800/80">
                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">ระดับสมาชิก (Tier)</label>
                  <select
                    value={customerEditModal.form.tier || 'Bronze'}
                    onChange={(e) => setCustomerEditModal({
                      ...customerEditModal,
                      form: { ...customerEditModal.form, tier: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Bronze">Bronze (สมาชิกทั่วไป)</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                    <option value="VIP">VIP (สิทธิพิเศษสูงสุด)</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">ยอดเงินในกระเป๋า (บาท)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">฿</span>
                    <input
                      type="number"
                      step="0.01"
                      value={customerEditModal.form.walletBalance}
                      onChange={(e) => setCustomerEditModal({
                        ...customerEditModal,
                        form: { ...customerEditModal.form, walletBalance: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-emerald-400 font-bold font-['Kanit'] text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-300/90 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>การแก้ไขนี้จะมีผลต่อบัญชีลูกค้าทันที และจะถูกบันทึกประวัติลงใน Audit Logs อัตโนมัติ</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCustomerEditModal({ open: false, customer: null, form: {} })}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSavingCustomer}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:brightness-110 text-white font-bold shadow-lg shadow-red-600/30 disabled:opacity-50 font-['Kanit']"
                >
                  {isSavingCustomer ? 'กำลังบันทึก...' : 'บันทึกข้อมูลลูกค้า'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0e121a] border border-red-800/60 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white">รายละเอียดคำสั่งซื้อ</h3>
              <button onClick={() => setSelectedOrderDetails(null)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-2 text-xs">
              <div><strong>Order:</strong> {selectedOrderDetails.orderNumber}</div>
              <div><strong>Game:</strong> {selectedOrderDetails.gameName} ({selectedOrderDetails.packageName})</div>
              <div><strong>UID:</strong> {selectedOrderDetails.playerId}</div>
              <div><strong>Nickname:</strong> {selectedOrderDetails.playerNickname}</div>
              <div><strong>Amount:</strong> ฿{selectedOrderDetails.finalAmount}</div>
              <div><strong>Provider:</strong> {selectedOrderDetails.providerName}</div>
              <div><strong>Latency:</strong> {selectedOrderDetails.providerLatencyMs} ms</div>
            </div>
            <button
              onClick={() => setSelectedOrderDetails(null)}
              className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold"
            >
              ปิด
            </button>
          </div>
        </div>
      )}

      {/* New Coupon Modal */}
      {newCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0e121a] border border-red-800/60 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white">สร้างโค้ดโปรโมชั่นใหม่</h3>
              <button onClick={() => setNewCouponModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">รหัสโค้ด (Code)</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น GAMER20"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono uppercase"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">คำอธิบาย</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ลด 20 บาท สำหรับลูกค้าใหม่"
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">ประเภทส่วนลด</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                  >
                    <option value="percent">ลดเป็น %</option>
                    <option value="fixed">ลดเป็นบาท (Fixed)</option>
                  </select>
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">มูลค่าส่วนลด</label>
                  <input
                    type="number"
                    required
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">ยอดสั่งซื้อขั้นต่ำ (บาท)</label>
                <input
                  type="number"
                  value={couponForm.minSpend}
                  onChange={(e) => setCouponForm({ ...couponForm, minSpend: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-600/30"
              >
                บันทึกและเปิดใช้งานโค้ด
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Flash Sale Modal */}
      {flashSaleModal.open && (
        <FlashSaleModal
          isOpen={flashSaleModal.open}
          onClose={() => setFlashSaleModal({ open: false, item: null })}
          onSave={handleSaveFlashSale}
          flashSale={flashSaleModal.item}
          games={games}
        />
      )}

      {/* Gift Card Modal */}
      {giftCardModal.open && (
        <GiftCardModal
          isOpen={giftCardModal.open}
          onClose={() => setGiftCardModal({ open: false, item: null })}
          onSave={handleSaveGiftCard}
          giftCard={giftCardModal.item}
        />
      )}

      {/* App Subscription Modal */}
      {appSubModal.open && (
        <AppSubscriptionModal
          isOpen={appSubModal.open}
          onClose={() => setAppSubModal({ open: false, item: null })}
          onSave={handleSaveAppSub}
          appSubscription={appSubModal.item}
        />
      )}

      {/* New Bank Account Modal */}
      {newBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0e121a] border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white font-['Kanit'] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                เพิ่มบัญชีธนาคารสำหรับรับโอนเงิน
              </h3>
              <button onClick={() => setNewBankModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">ชื่อธนาคาร *</label>
                <select
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                >
                  <option value="ธนาคารกสิกรไทย (KBANK)">ธนาคารกสิกรไทย (KBANK)</option>
                  <option value="ธนาคารไทยพาณิชย์ (SCB)">ธนาคารไทยพาณิชย์ (SCB)</option>
                  <option value="ธนาคารกรุงเทพ (BBL)">ธนาคารกรุงเทพ (BBL)</option>
                  <option value="ธนาคารกรุงไทย (KTB)">ธนาคารกรุงไทย (KTB)</option>
                  <option value="ธนาคารทหารไทยธนชาต (TTB)">ธนาคารทหารไทยธนชาต (TTB)</option>
                  <option value="ธนาคารกรุงศรีอยุธยา (BAY)">ธนาคารกรุงศรีอยุธยา (BAY)</option>
                  <option value="ธนาคารออมสิน (GSB)">ธนาคารออมสิน (GSB)</option>
                </select>
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">เลขที่บัญชีธนาคาร *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น 123-2-34567-8"
                  value={bankForm.accountNo}
                  onChange={(e) => setBankForm({ ...bankForm, accountNo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">ชื่อเจ้าของบัญชี *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น บจก. บูสต์อัพ (BOOSTUP THAILAND)"
                  value={bankForm.accountName}
                  onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk_pp"
                  checked={bankForm.promptpayLinked}
                  onChange={(e) => setBankForm({ ...bankForm, promptpayLinked: e.target.checked })}
                  className="rounded border-zinc-700 text-emerald-500 focus:ring-0"
                />
                <label htmlFor="chk_pp" className="text-zinc-300 cursor-pointer">
                  บัญชีนี้ผูกกับพร้อมเพย์ของร้านด้วย
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setNewBankModal(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleAddBankAccount}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30"
                >
                  บันทึกบัญชีธนาคาร
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slip Preview & Action Modal */}
      {selectedSlipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0e121a] border border-red-800/60 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-red-950 to-zinc-900 border-b border-red-900/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white font-['Kanit']">
                  ตรวจสอบสลิปโอนเงิน — {selectedSlipModal.userName || 'ลูกค้า'}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedSlipModal(null)} 
                className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left: Slip Image */}
              <div className="flex flex-col items-center justify-center bg-black/60 rounded-2xl p-2 border border-zinc-800 max-h-[480px] overflow-hidden">
                {selectedSlipModal.slipImage ? (
                  <img
                    src={selectedSlipModal.slipImage}
                    alt="สลิปหลักฐาน"
                    className="max-h-[460px] w-auto object-contain rounded-xl shadow-lg"
                  />
                ) : (
                  <div className="py-20 text-zinc-500 text-xs text-center">ไม่มีรูปภาพสลิป</div>
                )}
              </div>

              {/* Right: Transaction Details & Actions */}
              <div className="flex flex-col justify-between space-y-4">
                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2.5">
                    <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-bold">ข้อมูลการโอนเงิน</div>
                    
                    <div className="flex justify-between">
                      <span className="text-zinc-400">ยอดเงินที่ต้องเข้า:</span>
                      <span className="text-emerald-400 font-bold font-['Kanit'] text-lg">
                        ฿{Number(selectedSlipModal.amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-zinc-400">ชื่อลูกค้า:</span>
                      <span className="text-white font-semibold">{selectedSlipModal.userName || '-'}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-zinc-400">User ID:</span>
                      <span className="text-zinc-300 font-mono text-[11px]">{selectedSlipModal.userId}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-zinc-400">ช่องทางการโอน:</span>
                      <span className="text-white font-medium">
                        {selectedSlipModal.method === 'promptpay' ? 'QR พร้อมเพย์' : 'โอนผ่านธนาคาร'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-zinc-400">เวลาที่แจ้งโอน:</span>
                      <span className="text-white font-mono text-[11px]">
                        {selectedSlipModal.createdAt ? new Date(selectedSlipModal.createdAt).toLocaleString('th-TH') : '-'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-zinc-800">
                      <span className="text-zinc-400">สถานะปัจจุบัน:</span>
                      {selectedSlipModal.status === 'pending' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          รอตรวจสอบ
                        </span>
                      ) : selectedSlipModal.status === 'completed' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          อนุมัติแล้ว
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                          ปฏิเสธแล้ว
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/40 text-[11px] text-blue-300 leading-relaxed">
                    💡 <strong>คำแนะนำ:</strong> กรุณาตรวจสอบยอดเงินและเวลาในสลิปกับแอปธนาคารของคุณ ว่ามียอดเงินเข้าจริงก่อนกดปุ่มอนุมัติ
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedSlipModal.status === 'pending' ? (
                  <div className="space-y-2 pt-2 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => handleApproveDeposit(selectedSlipModal.id)}
                      disabled={isProcessingSlip}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      <span>อนุมัติและเติมเงิน ฿{Number(selectedSlipModal.amount).toFixed(2)} ทันที</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setRejectReasonModal(selectedSlipModal);
                        setRejectReasonText('สลิปไม่ถูกต้อง หรือยอดเงินไม่ตรง');
                      }}
                      disabled={isProcessingSlip}
                      className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-red-950/60 border border-zinc-700 hover:border-red-700 text-red-400 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>ปฏิเสธสลิปรายการนี้</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setSelectedSlipModal(null)}
                      className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold cursor-pointer"
                    >
                      ปิดหน้าต่าง
                    </button>
                  </div>
                )}

              </div>

            </div>

          </div>
        </div>
      )}

      {/* Reject Slip Modal */}
      {rejectReasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#0e121a] border border-red-800/80 rounded-3xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2.5 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white font-['Kanit']">ปฏิเสธสลิปการเติมเงิน</h3>
            </div>

            <p className="text-xs text-zinc-400">
              ระบุเหตุผลในการปฏิเสธสลิปของลูกค้า <strong>{rejectReasonModal.userName}</strong> (ยอด ฿{Number(rejectReasonModal.amount).toFixed(2)})
            </p>

            <div className="space-y-2">
              <label className="text-xs text-zinc-300 font-medium">เหตุผลการปฏิเสธ:</label>
              <textarea
                rows="3"
                value={rejectReasonText}
                onChange={(e) => setRejectReasonText(e.target.value)}
                placeholder="เช่น สลิปซ้ำ, ยอดเงินไม่เข้าบัญชีจริง, ภาพไม่ชัดเจน..."
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white focus:border-red-500 focus:outline-none"
              />
              <div className="flex flex-wrap gap-1.5">
                {['สลิปซ้ำ/เคยใช้แล้ว', 'ยอดเงินไม่ตรง', 'ไม่พบยอดโอนในธนาคาร', 'ภาพสลิปไม่ชัดเจน'].map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => setRejectReasonText(quick)}
                    className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-300 cursor-pointer"
                  >
                    {quick}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectReasonModal(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleRejectDeposit}
                disabled={isProcessingSlip}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-lg shadow-red-600/30 cursor-pointer disabled:opacity-50"
              >
                ยืนยันปฏิเสธสลิป
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Universal Action Confirmation Modal (Matches User Design) */}
      {confirmDialog.open && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl p-7 pt-9 pb-8 shadow-2xl text-center font-['Prompt',sans-serif] border border-zinc-100">
            {/* Warning Icon */}
            <div className="w-24 h-24 rounded-full border-[3px] border-[#ffedd5] bg-white flex items-center justify-center mx-auto mb-6 shadow-sm">
              <span className="text-5xl font-light text-[#f97316] font-serif select-none leading-none -mt-1">
                !
              </span>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-[#374151] font-['Kanit',sans-serif] tracking-tight">
              {confirmDialog.title}
            </h3>

            {/* Subtitle / Question */}
            <p className="text-sm text-[#4b5563] mt-2 font-normal leading-relaxed px-2">
              {confirmDialog.message}
            </p>

            {/* Buttons */}
            <div className="flex items-center gap-3 mt-7 w-full">
              <button
                type="button"
                onClick={confirmDialog.onCancel}
                className="flex-1 py-2.5 px-4 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-700 font-bold text-sm transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                {confirmDialog.cancelText || 'ยกเลิก'}
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#3b5bfd] hover:bg-[#2b4be8] text-white font-bold text-sm transition-all shadow-md shadow-blue-500/25 active:scale-95 cursor-pointer"
              >
                {confirmDialog.confirmText || 'ตกลง'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert / Notification Modal (Success / Error / Warning / Info) */}
      {alertModal.open && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl p-7 pt-9 pb-8 shadow-2xl text-center font-['Prompt',sans-serif] border border-zinc-100">
            {alertModal.type === 'error' ? (
              <div className="w-24 h-24 rounded-full border-[3px] border-[#fecaca] bg-[#fef2f2] flex items-center justify-center mx-auto mb-6 shadow-sm">
                <X className="w-12 h-12 text-[#ef4444] stroke-[3]" />
              </div>
            ) : alertModal.type === 'warning' ? (
              <div className="w-24 h-24 rounded-full border-[3px] border-[#ffedd5] bg-[#fff7ed] flex items-center justify-center mx-auto mb-6 shadow-sm">
                <span className="text-5xl font-light text-[#f97316] font-serif select-none leading-none -mt-1">!</span>
              </div>
            ) : alertModal.type === 'info' ? (
              <div className="w-24 h-24 rounded-full border-[3px] border-[#bfdbfe] bg-[#eff6ff] flex items-center justify-center mx-auto mb-6 shadow-sm">
                <span className="text-5xl font-bold text-[#3b82f6] font-serif select-none leading-none">i</span>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full border-[3px] border-[#bbf7d0] bg-[#f0fdf4] flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Check className="w-12 h-12 text-[#22c55e] stroke-[3]" />
              </div>
            )}
            <h3 className="text-2xl font-bold text-[#374151] font-['Kanit',sans-serif] tracking-tight">
              {alertModal.title}
            </h3>
            <p className="text-sm text-[#4b5563] mt-2 font-normal leading-relaxed px-2">
              {alertModal.message}
            </p>
            <div className="mt-7 w-full">
              <button
                type="button"
                onClick={() => setAlertModal({ open: false, title: '', message: '', type: 'success' })}
                className="w-full py-2.5 px-4 rounded-xl bg-[#3b5bfd] hover:bg-[#2b4be8] text-white font-bold text-sm transition-all shadow-md shadow-blue-500/25 active:scale-95 cursor-pointer"
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
