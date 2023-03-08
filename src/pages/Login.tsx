import { useEffect, useState } from 'react';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect } from 'firebase/auth';

import { Logo } from '../Logo';

const fbAuth = getAuth();
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('openid');

export const Login = () => {
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    console.log('Login mounted');
  }, []);

  return (
    <div
      className='flex'
      style={{
        justifyContent: 'center',
      }}
    >
      <div
        className='container container-sm card'
        style={{
          padding: '0.5rem',
        }}
      >
        <Logo 
          style={{
            marginTop: 'calc(-2.5rem)',
          }}
          textStyle={{
            background: 'var(--bs-body-bg)',
          }}
        />

        {/* Card content */}
        <div
          className='flex'
          style={{
            padding: '0.5rem',
            paddingTop: 0,
          }}
        >
          <div
            className='flex-row flex-0'
            style={{
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontSize: '1.25rem'
              }}
            >
              Sign in to continue...
            </span>
          </div>
          
          <br />

          <div
            className='flex-row'
            style={{
              justifyContent: 'center'
            }}
          >
            <button
              className='btn btn-primary'
              onClick={async () => {
                setLoading(true);
                try {
                  await signInWithPopup(fbAuth, googleProvider);
                } catch (error: any) {
                  alert(error.message);
                }
                setLoading(false);
              }}
              disabled={isLoading}
              style={{
                background: 'white',
                padding: '8px',
              }}
            >
              <div
                className='flex-row'
                style={{ alignItems: 'center' }}
              >
                <img
                  src='g-logo.png'
                  style={{
                    height: '1.5rem',
                    marginRight: '24px',
                  }}
                />
                <span
                  style={{
                    color: 'black',
                    fontWeight: 500,
                    // fontFamily: `'Roboto', sans-serif`,
                  }}
                >
                  Sign in with Google
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

