import { LoginForm } from '@/components/auth/LoginForm';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { Baby, Heart, Shield, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col lg:flex-row">
      {/* Left side - Hero section */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="max-w-md text-center lg:text-left">
          <div className="mb-8">
            <div className="flex items-center justify-center lg:justify-start mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 mr-4">
                <Baby className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold">BabyAssist AI</h1>
            </div>
            <p className="text-xl lg:text-2xl text-blue-100 mb-6">
              Smart Health Tool for ASHA Workers
            </p>
            <p className="text-blue-200 text-lg leading-relaxed">
              Empowering healthcare workers with AI-powered tools to provide better maternal and child healthcare services.
            </p>
          </div>
          
          {/* Feature highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
            <div className="flex items-center space-x-3">
              <Heart className="h-5 w-5 text-pink-300" />
              <span className="text-sm">Maternal Care</span>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-green-300" />
              <span className="text-sm">Child Health</span>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-blue-300" />
              <span className="text-sm">Community</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <LanguageSelector />
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}