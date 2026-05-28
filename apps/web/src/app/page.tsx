'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center text-white mb-12">
          <h1 className="text-5xl font-bold mb-4">Swipejobs OS</h1>
          <p className="text-xl opacity-90">AI-Native Workforce Marketplace</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <h3 className="text-xl font-bold mb-2">For Employers</h3>
            <p className="text-gray-600 mb-4">
              Find the perfect candidates with our AI matching engine
            </p>
            <Link href="/employer/dashboard">
              <Button variant="primary" className="w-full">
                Employer Portal
              </Button>
            </Link>
          </Card>

          <Card className="text-center">
            <h3 className="text-xl font-bold mb-2">For Candidates</h3>
            <p className="text-gray-600 mb-4">
              Discover jobs tailored to your skills and experience
            </p>
            <Link href="/candidate/dashboard">
              <Button variant="secondary" className="w-full">
                Candidate Platform
              </Button>
            </Link>
          </Card>

          <Card className="text-center">
            <h3 className="text-xl font-bold mb-2">Admin</h3>
            <p className="text-gray-600 mb-4">
              Manage platform, users, and compliance
            </p>
            <Link href="/admin/dashboard">
              <Button variant="outline" className="w-full">
                Admin Dashboard
              </Button>
            </Link>
          </Card>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Platform Features</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <li className="flex items-center">
              <span className="text-blue-600 mr-2">✓</span> AI-powered matching engine
            </li>
            <li className="flex items-center">
              <span className="text-blue-600 mr-2">✓</span> Multi-tenant architecture
            </li>
            <li className="flex items-center">
              <span className="text-blue-600 mr-2">✓</span> Real-time notifications
            </li>
            <li className="flex items-center">
              <span className="text-blue-600 mr-2">✓</span> Advanced analytics
            </li>
            <li className="flex items-center">
              <span className="text-blue-600 mr-2">✓</span> Shift management
            </li>
            <li className="flex items-center">
              <span className="text-blue-600 mr-2">✓</span> Compliance tracking
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
