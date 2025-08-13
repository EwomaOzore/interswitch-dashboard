import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bars3Icon, BellIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: Readonly<HeaderProps>) {
  const { logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-3">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-interswitch-primary lg:hidden"
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" />
            </button>

            <div className="ml-4 lg:ml-0">
              <Image
                src="/Interswitch_logo.svg"
                alt="Interswitch Banking"
                width={150}
                height={150}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-interswitch-primary">
              <span className="sr-only">View notifications</span>
              <BellIcon className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={logout}
                className="bg-interswitch-primary text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-interswitch-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-interswitch-primary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
