export type EmittenKey = string | symbol;
export type EmittenListener<TValue = unknown[]> = (...values: TValue[]) => void;
export type EmittenMap = Record<EmittenKey, EmittenListener>;

export type EmittenLibrary<TEventMap> = Record<
  keyof TEventMap,
  Set<TEventMap[keyof TEventMap]>
>;

export type EmittenLibraryPartial<TEventMap> = Partial<
  EmittenLibrary<TEventMap>
>;
