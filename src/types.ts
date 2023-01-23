export type EmittenListener<T> = (value?: T) => void;

export type EmittenLibrary<T> = {
  [eventName in keyof T]?: Set<EmittenListener<T[eventName]>>;
};
