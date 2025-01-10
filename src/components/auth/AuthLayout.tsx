import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  rightPanel: React.ReactNode;
}

export default function AuthLayout({ children, title, subtitle, rightPanel }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-8 py-12 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Link 
              to="/"
              className="inline-block mb-6 transform hover:scale-105 transition-transform duration-200"
            >
              <motion.img 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                src="https://api.products.aspose.app/words/conversion/api/Download?id=2345e3f9-9e45-4236-a911-de78c868b400%2FTestPilot%20Mocks%20Final.png"
                alt="TestPilot"
                className="h-12 mx-auto"
              />
            </Link>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-2xl font-semibold text-gray-900"
            >
              {title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-gray-600 mt-2"
            >
              {subtitle}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            {children}
          </motion.div>
        </motion.div>
      </div>

      {/* Right Panel */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-[#FFF8F8] to-white"
      >
        <div className="h-full flex items-center justify-center p-12">
          <div className="max-w-lg">
            {rightPanel}
          </div>
        </div>
      </motion.div>
    </div>
  );
}