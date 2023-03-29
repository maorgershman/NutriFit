import { CSSProperties, ReactElement, ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';

interface GroupBoxProps {
  children: [ReactElement<GroupBoxHeaderProps>, ReactElement<GroupBoxContentProps>],

  dontUseSpacer?: boolean,
  padding?: CSSProperties['padding'],
  className?: string,
  style?: CSSProperties,
}

interface GroupBoxHeaderProps {
  dontAutoMarginTop?: boolean,

  children: ReactNode,
  className?: string,
  style?: CSSProperties,
}

interface GroupBoxContentProps {
  children: ReactNode,
  className?: string,
  style?: CSSProperties,
}

export const GroupBox = (props: GroupBoxProps) => {
  const { children, className, style, dontUseSpacer } = props;

  const padding = props.padding || '1rem';
  const [header, content] = children;

  return (
    <div
      className={className || 'card'}
      style={{
        ...style,
        paddingLeft: padding,
        paddingRight: padding,
        paddingBottom: padding,
        paddingTop: 0,
      }}
    >
      {header}
      
      {
        !dontUseSpacer &&
        <div 
          style={{
            height: `calc(${padding} / 2)`,
          }}
        />
      }
      
      {content}
    </div>
  );
}

const GroupBoxHeader = (props: GroupBoxHeaderProps) => {
  const { children, className, style, dontAutoMarginTop } = props;

  const ref = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState(0);

  // Listen to changes of the screen size since the child can be dependent on that
  useEffect(() => {
    if (dontAutoMarginTop) {
      return;
    }

    const onResize = () => {
      if (!ref.current) {
        return;
      }
  
      setHeight(ref.current.offsetHeight);
    }

    window.addEventListener('resize', onResize);
    return () => {
      if (dontAutoMarginTop) {
        return;
      }

      window.removeEventListener('resize', onResize);
    };
  }, []);

  useLayoutEffect(() => {
    if (dontAutoMarginTop) {
      return;
    }

    if (!ref.current) {
      return;
    }

    setHeight(ref.current.offsetHeight);
  }, [ref.current?.offsetHeight]);

  return (
    <div
      ref={(r) => ref.current = r}
      className={className}
      style={{
        marginTop: !dontAutoMarginTop ? -height / 2 : undefined,
        ...(style || {}),
      }}
    >
      {children}
    </div>
  );
}

const GroupBoxContent = (props: GroupBoxContentProps) => {
  const { children, className, style } = props;

  return (
    <div
      className={className}
      style={style}
    >
      {children}
    </div>
  );
}

GroupBox.Header = GroupBoxHeader;
GroupBox.Content = GroupBoxContent;