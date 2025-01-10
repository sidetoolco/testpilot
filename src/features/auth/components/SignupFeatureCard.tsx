import React from 'react';
import { CheckCircle } from 'lucide-react';
import AuthFeatureCard from './AuthFeatureCard';

export default function SignupFeatureCard() {
  return (
    <AuthFeatureCard
      title="Why choose TestPilot?"
      subtitle="The smart way to test your products"
      features={[
        {
          title: "A/B/C Testing",
          description: "Power your big decisions with data",
          icon: <div className="text-white">🔬</div>
        },
        {
          title: "Transaction-Based",
          description: "Simulate real retail outcomes",
          icon: <div className="text-white">💰</div>
        },
        {
          title: "Detailed Analytics",
          description: "Powered by ACE, our expert AI",
          icon: <div className="text-white">📊</div>
        },
        {
          title: "Affordable & Fast",
          description: ">50% savings vs. traditional methods",
          icon: <div className="text-white">⚡</div>
        }
      ]}
    />
  );
}