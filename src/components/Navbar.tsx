'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, ArrowLeft, ArrowUpLeft } from 'lucide-react';

interface NavbarProps {
  title: string;
}

export default function Navbar({ title }: NavbarProps) {
  const router = useRouter();

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            title="返回上一页"
          >
            <ArrowLeft className="w-5 h-5" />
            返回上一页
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            title="返回主页"
          >
            <ArrowUpLeft className="w-5 h-5" />
            返回主页
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Home className="w-5 h-5" />
          首页
        </Link>
      </div>
    </nav>
  );
}
