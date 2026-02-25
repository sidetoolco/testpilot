import { ShoppingBag, MoreHorizontal } from 'lucide-react';

interface TikTokShopSidebarProps {
  embedded?: boolean;
}

export default function TikTokShopSidebar({ embedded }: TikTokShopSidebarProps) {
  return (
    <aside className={`w-56 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col z-30 ${
      embedded ? 'pt-4' : 'fixed left-0 top-0 bottom-0 pt-24'
    }`}>
      <nav className="px-4 space-y-1">
        <button
          type="button"
          className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm font-medium text-gray-800 rounded-lg hover:bg-gray-50 cursor-not-allowed"
        >
          <ShoppingBag className="h-5 w-5 text-gray-600" />
          Sell
        </button>
        <button
          type="button"
          className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm font-medium text-gray-800 rounded-lg hover:bg-gray-50 cursor-not-allowed"
        >
          <MoreHorizontal className="h-5 w-5 text-gray-600" />
          More
        </button>
      </nav>

      <div className="mt-auto px-4 pb-8 border-t border-gray-100 pt-6 space-y-2">
        <a href="#" className="block text-sm text-gray-600 hover:text-black cursor-not-allowed">
          Buy
        </a>
        <a href="#" className="block text-sm text-gray-600 hover:text-black cursor-not-allowed">
          Sell
        </a>
        <a href="#" className="block text-sm text-gray-600 hover:text-black cursor-not-allowed">
          About
        </a>
        <a href="#" className="block text-sm text-gray-600 hover:text-black cursor-not-allowed">
          Customer support
        </a>
        <a href="#" className="block text-sm text-gray-600 hover:text-black cursor-not-allowed">
          Legal
        </a>
        <p className="text-xs text-gray-400 pt-4">©2026 TikTok</p>
      </div>
    </aside>
  );
}
