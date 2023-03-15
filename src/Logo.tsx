import { CSSProperties } from 'react';
import { Link } from 'react-router-dom';

export const Logo = (props: {
  style?: CSSProperties,
  textStyle?: CSSProperties,
  scale?: number,
  link?: boolean,
}) => {
  const { style, textStyle, link } = props;
  let scale = props.scale || 1;

  const icon = (
    <img
      src='icon.png'
      style={{
        width: scale * 4 + 'rem',
        height: scale * 4 + 'rem',
      }}
    />
  );

  return (
    <div
      className='flex-row flex-0'
      style={{
        direction: 'ltr',
        ...(style || {}),
      }}
    >
      <div
        className='flex-row flex-0'
        style={{
          alignItems: 'center',
        }}
      >
        {
          link ? (
            <Link to='/'>
              {icon}
            </Link>
          ) : icon
        }
        
        <span
          style={{
            fontWeight: 'bold',
            fontSize: 2 * scale + 'rem',
            paddingRight: '0.5rem',
            paddingLeft: '0.5rem',
            marginTop: (-scale * 3 / 8) + 'rem',
            ...(textStyle || {}),
          }}
        >
          NutriFit
        </span>
      </div>
    </div>
  );
}