import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { getAuth } from 'firebase/auth';

import { Context } from '../Context';

const fbAuth = getAuth();

// Returns whether the auth state is known or not.
export const useAuthState = () => {
  const { auth, setAuth } = useContext(Context);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = fbAuth.onAuthStateChanged((user) => {
      if (!user) {
        setAuth(null);
        navigate('/login', { replace: true });
        return;
      }

      // TODO: Fetch additional details from firestore      

      setAuth({
        uid: user.uid,
        profilePictureURL: user.photoURL || '',
      });

      if (document.location.pathname === '/login') {
        navigate('/', { replace: true });
      }
    });
    
    return () => {
      unsubscribe();
    }
  }, []);

  if (typeof auth === 'undefined') {
    return null;
  }

  return true;
}