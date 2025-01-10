import React from 'react';
import { motion } from 'framer-motion';

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface AuthFeatureCardProps {
  title: string;
  subtitle: string;
  features: Feature[];
}

export default function AuthFeatureCard({ title, subtitle, features }: AuthFeatureCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white">
      <div className="mb-8">
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-3xl font-semibold mb-3"
        >
          {title}
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-lg text-white/90"
        >
          {subtitle}
        </motion.p>
      </div>
      
      <div className="space-y-6">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + (index * 0.1) }}
            className="flex items-start space-x-4 bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors"
          >
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
              {feature.icon}
            </div>
            <div>
              <h3 className="text-lg font-medium mb-1">{feature.title}</h3>
              <p className="text-white/80 leading-relaxed">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}