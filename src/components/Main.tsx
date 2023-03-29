import { ReactNode } from 'react';

export const Main = (props: {
  children: ReactNode,
}) => {
  return (
    <main 
      className='container'
      style={{
        // display: 'flex',
        // flex: 1,
        // flexDirection: 'column',
        alignItems: 'center',
        margin: '2rem auto',
      }}
    >
      {props.children}
    </main>
  );
}