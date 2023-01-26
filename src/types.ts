export type EmittenListener<TValue> = (value?: TValue) => void;

export type EmittenLibrary<TEventMap> = {
  [event in keyof TEventMap]?: Set<EmittenListener<TEventMap[event]>>;
};

/*
export type EmittenCommonFn<TEventMap, TReturn = void> = <
  TKey extends keyof TEventMap,
>(
  eventName: TKey,
  listener: EmittenListener<TEventMap[TKey]>,
) => TReturn;

export type EmittenDisposeFn<TEventMap> = EmittenCommonFn<
  TEventMap,
  () => void
>;

export type EmittenEmitFn<TEventMap> = <TKey extends keyof TEventMap>(
  eventName: TKey,
  value?: TEventMap[TKey],
) => void;
*/
