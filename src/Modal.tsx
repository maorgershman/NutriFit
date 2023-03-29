import { CSSProperties, ReactNode, useEffect, useState } from 'react';

const DEFAULT_FADE_DURATION = 250;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type ModalState = 'hidden' | 'fade-in' | 'shown' | 'fade-out';
export type ModalStateHook = State<ModalState>;

export const useModal = (): ModalStateHook => {
  return useState<ModalState>('hidden');
}

export const Modal = (props: {
  modalState: ModalState,
  setModalState: StateDispatcher<ModalState>,
  onHide?: () => void | Promise<void>,
  children: ReactNode,
  overlayStyle?: CSSProperties,
  modalStyle?: CSSProperties,
  modalCSSClassName?: string,
  fadeDurationMS?: number,
}) => {
  const { modalState, setModalState, onHide, children, overlayStyle, modalStyle, modalCSSClassName } = props;
  let fadeDuration = props.fadeDurationMS || DEFAULT_FADE_DURATION;

  useEffect(() => {
    if (modalState !== 'fade-in' && modalState !== 'fade-out') {
      return;
    }

    sleep(fadeDuration).then(() => {
      setModalState(modalState === 'fade-in' ? 'shown' : 'hidden')
      if (modalState === 'fade-out' && onHide) {
        onHide();
      }
    });
  }, [modalState]);

  if (modalState === 'hidden') {
    return null;
  }

  const overlay = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: modalState === 'shown' ? 'rgba(0, 0, 0, 0.5)' : undefined,

        ...((modalState === 'fade-in' || modalState === 'fade-out') ? {
          animation: `${modalState}-overlay ${fadeDuration}ms ease-in-out`,
          animationFillMode: 'forwards',
        } : {}),

        ...(overlayStyle || {}),
      }}
      onClick={() => {
        if (modalState !== 'shown') {
          return;
        }

        setModalState('fade-out');
      }}
    />
  );

  const modal = (
    <div
      className={modalCSSClassName || 'container-sm'}
      style={{
        paddingBottom: '2rem',

        position: modalState === 'shown' ? 'absolute' : 'fixed',
        transform: modalState === 'shown' ? 'translateY(0)' : 'translateY(100vh)',

        ...((modalState === 'fade-in' || modalState === 'fade-out') ? {
          animation: `${modalState}-modal ${fadeDuration}ms ease-in-out`,
          animationFillMode: 'forwards',
        } : {}),

        ...(modalStyle || {}),
      }}
    >
      {children}
    </div>
  );

  return (
    <>
      {overlay}
      {modal}
    </>
  );
}