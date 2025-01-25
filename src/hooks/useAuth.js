import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', { user });
      
      if (user) {
        try {
          // Получаем актуальный токен с claims
          const token = await user.getIdTokenResult();
          console.log('Token claims:', token.claims);
          
          setUser({
            ...user,
            token: {
              ...token.claims,
              admin: token.claims.admin || false
            }
          });
        } catch (error) {
          console.error('Error getting token:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const authState = {
    user,
    loading,
    isAdmin: user?.token?.admin || false,
    isAuthenticated: !!user
  };
  
  console.log('Auth state:', authState);
  
  return authState;
};

export default useAuth; 