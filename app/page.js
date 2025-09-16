'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';
import Image from "next/image";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard if authenticated, otherwise to login
    if (isAuthenticated()) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50 dark:bg-gray-900">
      <div className="text-center max-w-3xl mx-auto px-8 py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 card">
        <Image
          src="/globe.svg"
          alt="SaaS Logo"
          width={80}
          height={80}
          className="mx-auto mb-6 dark:invert"
        />
        <h1 className="text-5xl font-bold mb-6 text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Multi-Tenant SaaS Notes App</h1>
        <p className="text-xl mb-8 text-gray-600 dark:text-gray-300">A powerful note-taking platform for teams and organizations</p>
        <div className="animate-pulse flex items-center justify-center space-x-2 text-primary dark:text-primary-hover">
          <div className="w-3 h-3 rounded-full bg-primary dark:bg-primary-hover"></div>
          <p className="text-lg">Redirecting...</p>
        </div>
      </div>
    </main>
  );
}
