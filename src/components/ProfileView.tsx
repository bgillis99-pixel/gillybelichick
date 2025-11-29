import React, { useState } from 'react';
import { User, HistoryItem } from '../types';

interface ProfileViewProps {
  user: User | null;
  onLogin: (email: string) => void;
  onRegister: (email: string) => void;
  onLogout: () => void;
  onAdminAccess: () => void;
  isOnline: boolean;
}

const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onLogin,
  onRegister,
  onLogout,
  onAdminAccess,
  isOnline
}) => {
  const [email, setEmail] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = () => {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    if (isRegistering) {
      onRegister(email);
    } else {
      onLogin(email);
    }
    setEmail('');
  };

  if (!user) {
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-[#003366] to-[#004488] text-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-black mb-2">ACCOUNT</h2>
          <p className="text-sm text-gray-200">
            Save your search history and preferences
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-bold text-[#003366] mb-4">
            {isRegistering ? 'Create Account' : 'Sign In'}
          </h3>

          <div className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#00C853] focus:outline-none"
              required
            />

            <button
              onClick={handleSubmit}
              className="w-full py-4 bg-[#003366] text-white font-bold rounded-xl hover:bg-[#002244] active:scale-95 transition-transform"
            >
              {isRegistering ? 'Register' : 'Sign In'}
            </button>

            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="w-full text-[#00C853] font-bold"
            >
              {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Register'}
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <h4 className="font-bold text-sm text-[#003366] mb-2">Benefits:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Save VIN check history</li>
            <li>• Track compliance status</li>
            <li>• Bookmark testers</li>
            <li>• Sync across devices</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-[#003366] to-[#004488] text-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black mb-2">MY ACCOUNT</h2>
            <p className="text-sm text-gray-200 break-all">{user.email}</p>
          </div>
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl">
            👤
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-md text-center">
          <div className="text-2xl font-black text-[#00C853]">{user.history.length}</div>
          <div className="text-xs text-gray-600 font-semibold">Checks</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md text-center">
          <div className="text-2xl font-black text-[#003366]">
            {user.history.filter(h => h.type === 'VIN').length}
          </div>
          <div className="text-xs text-gray-600 font-semibold">VINs</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md text-center">
          <div className="text-2xl font-black text-yellow-600">0</div>
          <div className="text-xs text-gray-600 font-semibold">Alerts</div>
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-lg font-bold text-[#003366] mb-4">
          Recent Activity
        </h3>

        {user.history.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No activity yet. Start checking VINs!
          </p>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {user.history.slice(0, 10).map((item: HistoryItem) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="font-mono font-bold text-sm text-[#003366]">
                    {item.value}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  item.type === 'VIN' ? 'bg-green-100 text-green-800' :
                  item.type === 'TRUCRS' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {item.type}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Access */}
      {user.email.includes('admin') && (
        <button
          onClick={onAdminAccess}
          className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition-colors active:scale-95"
        >
          🔐 ADMIN ACCESS
        </button>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <a
          href="mailto:info@carbcleantruckcheck.app"
          className="block w-full bg-white border-2 border-[#003366] text-[#003366] font-bold py-3 rounded-xl text-center hover:bg-[#003366] hover:text-white transition-colors no-underline"
        >
          📧 Contact Support
        </a>

        <button
          onClick={onLogout}
          className="w-full bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-colors active:scale-95"
        >
          ← SIGN OUT
        </button>
      </div>

      {!isOnline && (
        <div className="bg-gray-800 text-white rounded-xl p-4 text-center">
          <p className="font-bold text-sm">📡 OFFLINE MODE</p>
          <p className="text-xs text-gray-300 mt-1">
            Some features may be limited
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfileView;
