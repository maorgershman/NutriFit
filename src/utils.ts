import { FormEvent } from 'react';

export const getFormValue = (name: string, e: FormEvent<HTMLFormElement>) => {
  const target = e.target as any;
  return target[name].value;
}

export const setFormValue = (name: string, value: any, e: FormEvent<HTMLFormElement>) => {
  const target = e.target as any;
  target[name].value = value;
}