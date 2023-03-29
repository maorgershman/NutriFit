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

  const styles = {
    icon: {
      width: scale * 4 + 'rem',
      height: scale * 4 + 'rem',
    } as CSSProperties,

    container: {
      display: 'flex',
      flexDirection: 'row',
      direction: 'ltr',
      alignItems: 'center',
      ...(style || {}),
    } as CSSProperties,

    text: {
      fontWeight: 'bold',
      fontSize: 2 * scale + 'rem',
      padding: '0 0.5rem',
      marginTop: (-scale * 3 / 8) + 'rem',
      ...(textStyle || {}),
    } as CSSProperties,
  };

  const icon = (
    <img src='icon.png' style={styles.icon} />
  );

  return (
    <div style={styles.container}>
      {
        link ? (
          <Link to='/'>
            {icon}
          </Link>
        ) : icon
      }
      
      <span style={styles.text}>
        NutriFit
      </span>
    </div>
  );
}
