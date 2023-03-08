/// <reference types="react-scripts" />

type StateDispatcher<T> = React.Dispatch<React.SetStateAction<T>>;
type State<T> = [T, StateDispatcher<T>];
type Ref<T> = React.MutableRefObject<T>;