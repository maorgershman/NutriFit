import { CSSProperties } from 'react';

export const Logo = (props: {
  style?: CSSProperties,
  textStyle?: CSSProperties,
  scale?: number,
}) => {
  const { style, textStyle } = props;
  let scale = props.scale || 1;

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
        <img
          src='icon.png'
          style={{
            width: scale * 4 + 'rem',
            height: scale * 4 + 'rem',
          }}
        />

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