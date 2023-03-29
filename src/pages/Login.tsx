import { CSSProperties, useState } from 'react';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect } from 'firebase/auth';

import { Logo } from '../components/Logo';
import { GroupBox } from '../components/GroupBox';

const fbAuth = getAuth();
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('openid');

export const Login = () => {
  return (
    <GroupBox>
      <GroupBox.Header>
        <Logo textStyle={styles.logoText} />
      </GroupBox.Header>

      <GroupBox.Content style={styles.groupBoxContent}>
        <span style={styles.signInToContinue}>
          Sign in to continue...
        </span>
        <SignInWithGoogleButton />
      </GroupBox.Content>
    </GroupBox>
  );
}

const SignInWithGoogleButton = () => {
  const [isLoading, setLoading] = useState(false);

  const onClick = async () => {
    setLoading(true);
    try {
      await signInWithPopup(fbAuth, googleProvider);
    } catch (error: any) {
      alert(error.message);
    }
    setLoading(false);
  }

  return (
    <button
      className='btn btn-primary'
      onClick={onClick}
      disabled={isLoading}
      style={styles.signInWithGoogleButton}
    >
      <img
        src='g-logo.png'
        style={styles.googleLogo}
      />

      <span style={styles.signInWithGoogleText}>
        Sign in with Google
      </span>
    </button>
  );
}

const styles = {
  logoText: {
    background: 'var(--bs-body-bg)',
  } as CSSProperties,

  groupBoxContent: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
  } as CSSProperties,

  signInToContinue: {
    fontSize: '1.25rem',
    marginBottom: '1rem',
  } as CSSProperties,

  signInWithGoogleButton: {
    display: 'flex',
    margin: 'auto',
    background: 'white',
    padding: '0.375rem',
  } as CSSProperties,

  googleLogo: {
    height: '1.5rem',
    marginRight: '0.75rem',
  } as CSSProperties,

  signInWithGoogleText: {
    color: 'black',
    fontWeight: 500,
    // fontFamily: `'Roboto', sans-serif`,
  } as CSSProperties,
};