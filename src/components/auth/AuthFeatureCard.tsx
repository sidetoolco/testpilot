import React from 'react';
import { motion } from 'framer-motion';

interface AuthFeatureCardProps {
  logo: string;
  title: string;
  subtitle: string;
  features: {
    icon: React.ReactNode;
    title: string;
    description: string;
  }[];
}

export default function AuthFeatureCard({ logo, title, subtitle, features }: AuthFeatureCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm bg-opacity-90">
      <div className="flex items-center space-x-4 mb-8">
        <img 
          src={logo}
          alt="TestPilot"
          className="h-12"
        />
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>
      
      <div className="space-y-6">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * (index + 1) }}
            className="flex items-start space-x-3"
          >
            <div className="text-primary-400 mt-0.5">
              {feature.icon}
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{feature.title}</h4>
              <p className="text-sm text-gray-500">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}