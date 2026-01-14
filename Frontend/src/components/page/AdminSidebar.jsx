import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/drivers', label: 'Drivers', icon: '🚗' },
    { path: '/admin/buses', label: 'Buses', icon: '🚌' },
    { path: '/admin/payments', label: 'Payments', icon: '💰' },
    { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
  ];

  return (
    <div className="w-64 bg-gray-800 text-white h-full min-h-screen p-4 shadow-lg">
      <div className="mb-8">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span>🛡️</span>
          Admin Panel
        </h1>
      </div>
      
      <nav>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;