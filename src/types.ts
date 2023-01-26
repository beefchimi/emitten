export type EmittenListener<TValue> = (value?: TValue) => void;

export type EmittenLibrary<TEventMap> = {
  [event in keyof TEventMap]?: Set<EmittenListener<TEventMap[event]>>;
};
