import { useState, useEffect, useContext } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

import { Context, ContextProvider } from './Context';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Logo } from './Logo';

const fbAuth = getAuth();

export const App = () => {
  return (
    <ContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<AppWithContextAndRoutes />}>
            <Route index element={<Home />} />
            <Route path='login' element={<Login />} />
            
            <Route path='*' element={<Navigate replace to='/' />} />
          </Route>
        </Routes> 
      </BrowserRouter>
    </ContextProvider>
  );
}

const AppWithContextAndRoutes = () => {
  const [isReady, setReady] = useState(false);
  const { auth, setAuth } = useContext(Context);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('App mounted');
  }, []);

  useEffect(() => {
    const unsubscribe = fbAuth.onAuthStateChanged((user) => {
      if (!user) {
        setAuth(null);
        navigate('/login', { replace: true });
        return;
      }

      // Fetch additional details from firestore
      

      setAuth({
        uid: user.uid,
        profilePictureURL: user.photoURL || '',
      });
      navigate('/', { replace: true });
    });
    
    return () => {
      unsubscribe();
    }
  }, []);

  useEffect(() => {
    if (typeof auth === 'undefined') {
      return;
    }
    
    console.log('Auth loaded');
    setReady(true);
  }, [auth]);

  if (!isReady) {
    return null;
  }

  if (!auth) {
    return (
      <Outlet />
    );
  }

  return (
    <>
      <Navbar />

      <main className='flex'>
        <Outlet />
      </main>
    </>
  );
}

const Navbar = () => {
  const scale = 1;
  const imgSize = scale * 4 + 'rem';

  const { auth } = useContext(Context);
  if (!auth) {
    return null;
  }

  return (
    <nav
      style={{
        // Large:
        // boxShadow: '0 1rem 3rem var(--bs-dark-bg-subtle)',

        // Normal:
        boxShadow: '0 0.5rem 1rem var(--bs-dark-bg-subtle)',
      }}
    >
      <div
        className='container flex-row'
        style={{
          padding: '1rem',
        }}
      >
        <Logo scale={scale} textStyle={{ marginTop: 0 }} />
        <div className='flex-1' />
        
        <div className='dropdown'>
          <img
            className='dropdown-toggle'
            data-bs-toggle='dropdown'
            aria-expanded='false'
            src={auth.profilePictureURL}
            style={{
              width: imgSize,
              height: imgSize,
              borderRadius: '50%',
              border: '2px solid rgba(255, 255, 255, 0.5)',
              cursor: 'pointer',
            }}
          />
          <ul className='dropdown-menu dropdown-menu-end'>
            <li>
              <button 
                className='dropdown-item'
                onClick={() => fbAuth.signOut()}
              >
                Sign out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}