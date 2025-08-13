import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { XMarkIcon, HomeIcon, ArrowPathIcon, BanknotesIcon } from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Transactions', href: '/transactions', icon: ArrowPathIcon },
  { name: 'Transfer', href: '/transfer', icon: BanknotesIcon },
];

export function Sidebar({ isOpen, onClose }: Readonly<SidebarProps>) {
  const router = useRouter();
  const { user } = useAuth();

  const handleNavigation = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <button className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden" onClick={onClose} />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 h-screen ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={onClose}
          className="lg:hidden px-4 py-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <span className="sr-only">Close sidebar</span>
          <XMarkIcon className="h-6 w-6" />
        </button>

        <div className="flex flex-col h-full">
          <nav className="flex-1 p-3">
            <ul className="space-y-3">
              {navigation.map((item) => {
                const isActive = router.pathname === item.href;
                return (
                  <li key={item.name}>
                    <button
                      onClick={() => handleNavigation(item.href)}
                      className={`w-full flex items-center p-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-interswitch-primary text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm'
                      }`}
                    >
                      <item.icon className="mr-3 h-3 w-3" />
                      {item.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-3 border-t border-gray-200 mb-20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-interswitch-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
