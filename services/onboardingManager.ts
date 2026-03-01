
/**
 * Quản lý trạng thái Onboarding Thiết lập cá nhân
 */
const CONFIG = {
  // TRUE: Hiển thị lại mỗi khi chạy lại demo (refresh trang)
  // FALSE: Chỉ hiển thị 1 lần duy nhất trong toàn bộ vòng đời (Production)
  IS_DEMO_MODE: true 
};

const STORAGE_KEYS = {
  PERMANENT: 'luckydream_setup_completed',
  SESSION: 'luckydream_setup_shown_session'
};

export const onboardingManager = {
  /**
   * Kiểm tra xem có nên hiển thị màn hình thiết lập không
   */
  shouldShow: (): boolean => {
    // Nếu trong chế độ Demo, ta ưu tiên kiểm tra session trước
    if (CONFIG.IS_DEMO_MODE) {
      const shownThisSession = sessionStorage.getItem(STORAGE_KEYS.SESSION);
      return shownThisSession !== 'true';
    }

    // Nếu đã hoàn thành vĩnh viễn (lưu ở localStorage) -> Không bao giờ hiện lại
    if (localStorage.getItem(STORAGE_KEYS.PERMANENT) === 'true') {
      return false;
    }

    return true;
  },

  /**
   * Đánh dấu là đã xem trong phiên này (Dùng cho logic Demo)
   */
  markAsShownInSession: () => {
    sessionStorage.setItem(STORAGE_KEYS.SESSION, 'true');
  },

  /**
   * Hoàn thành vĩnh viễn (Lưu kết quả thiết lập)
   */
  complete: (data: any) => {
    console.log('Lưu thiết lập cá nhân hóa:', data);
    localStorage.setItem(STORAGE_KEYS.PERMANENT, 'true');
    // Đồng thời lưu vào session để chắc chắn không hiện lại trong phiên này
    sessionStorage.setItem(STORAGE_KEYS.SESSION, 'true');
  }
};
