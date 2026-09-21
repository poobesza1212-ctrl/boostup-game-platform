// Lightweight SweetAlert-compatible popup/toast utility without external packages
const Swal = {
  fire: async (options) => {
    if (typeof options === 'string') {
      alert(options);
      return { isConfirmed: true };
    }

    const {
      title = '',
      text = '',
      html = '',
      icon = 'info',
      timer = 0,
      showConfirmButton = true,
      confirmButtonText = 'ตกลง'
    } = options;

    const message = text || html || '';

    // If timer is specified, show an elegant toast notification
    if (timer > 0) {
      const existingToast = document.getElementById('boostup-custom-toast');
      if (existingToast) existingToast.remove();

      const toast = document.createElement('div');
      toast.id = 'boostup-custom-toast';
      toast.style.position = 'fixed';
      toast.style.top = '24px';
      toast.style.right = '24px';
      toast.style.zIndex = '999999';
      toast.style.minWidth = '260px';
      toast.style.maxWidth = '380px';
      toast.style.padding = '14px 18px';
      toast.style.borderRadius = '16px';
      toast.style.backgroundColor = '#18181b';
      toast.style.border = icon === 'success' ? '1px solid rgba(16,185,129,0.3)' : icon === 'error' ? '1px solid rgba(239,68,68,0.3)' : '1px solid #27272a';
      toast.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.5), 0 8px 10px -6px rgba(0,0,0,0.5)';
      toast.style.color = '#fff';
      toast.style.fontFamily = "'Kanit', 'Prompt', sans-serif";
      toast.style.display = 'flex';
      toast.style.alignItems = 'center';
      toast.style.gap = '12px';
      toast.style.animation = 'fadeIn 0.25s ease-out';

      const iconEmoji = icon === 'success' ? '🎉' : icon === 'error' ? '⚠️' : 'ℹ️';

      toast.innerHTML = `
        <div style="font-size: 22px; line-height: 1;">${iconEmoji}</div>
        <div style="flex: 1;">
          ${title ? `<div style="font-weight: 700; font-size: 13px; color: #fff;">${title}</div>` : ''}
          ${message ? `<div style="font-size: 11px; color: #a1a1aa; margin-top: 2px;">${message}</div>` : ''}
        </div>
      `;

      document.body.appendChild(toast);

      return new Promise((resolve) => {
        setTimeout(() => {
          toast.style.transition = 'opacity 0.3s, transform 0.3s';
          toast.style.opacity = '0';
          toast.style.transform = 'translateY(-8px)';
          setTimeout(() => {
            toast.remove();
            resolve({ isConfirmed: true });
          }, 300);
        }, timer);
      });
    }

    // Modal style alert
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.inset = '0';
      overlay.style.zIndex = '999999';
      overlay.style.display = 'flex';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.backgroundColor = 'rgba(0,0,0,0.7)';
      overlay.style.backdropFilter = 'blur(4px)';
      overlay.style.padding = '16px';

      const modal = document.createElement('div');
      modal.style.width = '100%';
      modal.style.maxWidth = '360px';
      modal.style.backgroundColor = '#18181b';
      modal.style.border = '1px solid #27272a';
      modal.style.borderRadius = '24px';
      modal.style.padding = '24px';
      modal.style.textAlign = 'center';
      modal.style.color = '#fff';
      modal.style.fontFamily = "'Kanit', 'Prompt', sans-serif";
      modal.style.boxShadow = '0 25px 50px -12px rgba(0,0,0,0.5)';

      const iconEmoji = icon === 'success' ? '🎉' : icon === 'error' ? '❌' : 'ℹ️';

      modal.innerHTML = `
        <div style="width: 56px; height: 56px; margin: 0 auto 16px; border-radius: 50%; background: ${icon === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}; display: flex; align-items: center; justify-content: center; font-size: 28px;">
          ${iconEmoji}
        </div>
        ${title ? `<h3 style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">${title}</h3>` : ''}
        ${message ? `<p style="font-size: 13px; color: #a1a1aa; line-height: 1.5; margin-bottom: 20px;">${message}</p>` : ''}
        <button id="swal-custom-btn" style="width: 100%; padding: 10px 16px; border-radius: 14px; background: linear-gradient(135deg, #06b6d4, #3b82f6); color: #fff; font-weight: bold; font-size: 14px; border: none; cursor: pointer;">
          ${confirmButtonText}
        </button>
      `;

      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      const btn = modal.querySelector('#swal-custom-btn');
      btn.onclick = () => {
        overlay.remove();
        resolve({ isConfirmed: true });
      };
      overlay.onclick = (e) => {
        if (e.target === overlay) {
          overlay.remove();
          resolve({ isConfirmed: false });
        }
      };
    });
  }
};

export default Swal;
