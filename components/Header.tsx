'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-gray-950 border-b border-gray-800">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo and Project Name */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          {/* Logo Circle */}
          <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          {/* Project Name */}
          <span className="text-2xl font-bold text-white">volv</span>
        </Link>
      </div>
    </header>
  );
}
