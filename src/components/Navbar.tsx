import { CSSProperties, ReactNode, useContext } from 'react';

import { getAuth } from 'firebase/auth';

import { Context } from '../Context';
import { Logo } from './Logo';

const fbAuth = getAuth();
export const Navbar = () => {
  const { auth } = useContext(Context);
  if (!auth) {
    return <nav style={styles.navbar} />;
  }

  return (
    <nav
      style={{
        ...styles.navbar,
        ...styles.navbarShadowNormal,
      }}
    >
      <NavbarContainer>
        <Logo link textStyle={{ marginTop: 0 }} />

        <div className='dropdown'>
          <ProfilePicture url={auth.profilePictureURL} />
          <DropdownMenu />
        </div>
      </NavbarContainer>
    </nav>
  );
}

const NavbarContainer = (props: {
  children: ReactNode,
}) => {
  return (
    <div
      className='container'
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: '1rem',
      }}
    >
      {props.children}
    </div>
  );
}

const ProfilePicture = (props: {
  url: string,
}) => {
  return (
    <img
      className='dropdown-toggle'
      data-bs-toggle='dropdown'
      src={props.url}
      alt=''
      style={styles.profilePicture}
    />
  );
}

const DropdownMenu = () => {
  return (
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
  );
}

const styles = {
  navbar: {
    height: '6rem',
  } as CSSProperties,

  navbarShadowNormal: {
    boxShadow: '0 0.5rem 1rem var(--bs-dark-bg-subtle)',
  } as CSSProperties,

  navbarShadowLarge: {
    boxShadow: '0 1rem 3rem var(--bs-dark-bg-subtle)',
  } as CSSProperties,

  profilePicture: {
    width: '4rem',
    height: '4rem',
    borderRadius: '50%',
    border: '2px solid rgba(255, 255, 255, 0.5)',
    cursor: 'pointer',
  } as CSSProperties,
};