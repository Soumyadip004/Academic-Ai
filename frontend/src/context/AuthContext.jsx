import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { deleteAccount as apiDeleteAccount } from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(0);
  const [usageHistory, setUsageHistory] = useState([]);

  // Initialize from localStorage (simulating persistent session)
  useEffect(() => {
    const storedUser = localStorage.getItem('academic_ai_user');
    const storedCredits = localStorage.getItem('academic_ai_credits');
    const storedHistory = localStorage.getItem('academic_ai_usage_history');
    
    if (storedHistory) {
      try {
        setUsageHistory(JSON.parse(storedHistory));
      } catch (e) {
        setUsageHistory([]);
      }
    }

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        
        // Clean up legacy/broken mock data where email might contain Client ID
        if (parsedUser.email && parsedUser.email.includes('.apps.googleusercontent.com')) {
          console.warn('Detected corrupted session data, clearing...');
          localStorage.removeItem('academic_ai_user');
          setUser(null);
        } else {
          setUser(parsedUser);
          setCredits(storedCredits ? parseInt(storedCredits, 10) : 100);
        }
      } catch (e) {
        localStorage.removeItem('academic_ai_user');
      }
    }
  }, []);

  const loginWithGoogle = (credentialResponse) => {
    try {
      // Decode the real JWT token received from Google
      const decodedToken = jwtDecode(credentialResponse.credential);
      
      // Create the session user object with real fields from Google JWT
      const realUser = {
        id: decodedToken.sub,
        name: decodedToken.name || decodedToken.given_name || 'User',
        email: decodedToken.email,
        avatar: decodedToken.picture || null
      };
      
      setUser(realUser);
      localStorage.setItem('academic_ai_user', JSON.stringify(realUser));
      
      // Sync credits
      const existingCredits = localStorage.getItem('academic_ai_credits');
      if (!existingCredits) {
        setCredits(1000); // 1000 free initial credits
        localStorage.setItem('academic_ai_credits', '1000');
      } else {
        setCredits(parseInt(existingCredits, 10));
      }
    } catch (error) {
      console.error('Error decoding Google token:', error);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('academic_ai_user');
    localStorage.removeItem('academic_ai_usage_history');
  };

  const deleteAccount = async () => {
    try {
      // Notify backend to delete all user-associated data
      const response = await apiDeleteAccount();
      console.log('Backend account data deleted:', response);
    } catch (error) {
      console.error('Failed to delete backend account data:', error);
      // We still proceed with local cleanup to ensure the user is logged out
    }
    
    setUser(null);
    setCredits(0);
    setUsageHistory([]);
    localStorage.removeItem('academic_ai_user');
    localStorage.removeItem('academic_ai_credits');
    localStorage.removeItem('academic_ai_usage_history');
  };

  const deductCredits = (amount, action = 'API Usage') => {
    const deduction = {
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action,
      deduction: amount
    };

    setCredits((prev) => {
      const newBalance = Math.max(0, prev - amount);
      localStorage.setItem('academic_ai_credits', newBalance.toString());
      return newBalance;
    });

    setUsageHistory((prev) => {
      const newHistory = [deduction, ...prev].slice(0, 50); // Keep last 50
      localStorage.setItem('academic_ai_usage_history', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  return (
    <AuthContext.Provider value={{ user, credits, usageHistory, loginWithGoogle, logout, deleteAccount, deductCredits }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
