import { FolderOpen, LayoutDashboard, MessagesSquare, ScanSearch } from 'lucide-vue-next'

// آیتم‌های منو؛ هم در نوار کناری (دسکتاپ/تبلت) و هم در منوی پایین (موبایل) استفاده می‌شوند.
export const NAV_ITEMS = [
  { to: '/', name: 'داشبورد', short: 'داشبورد', icon: LayoutDashboard, exact: true },
  { to: '/sources', name: 'اسناد PDF', short: 'اسناد', icon: FolderOpen, badge: 'ready' },
  { to: '/chat', name: 'پرسش از اسناد', short: 'گفتگو', icon: MessagesSquare },
  { to: '/search', name: 'جست‌وجوی معنایی', short: 'جست‌وجو', icon: ScanSearch },
]

export function isActivePath(item, path) {
  return item.exact ? path === item.to : path === item.to || path.startsWith(item.to + '/')
}
