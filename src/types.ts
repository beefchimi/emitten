export type EmittenKey = string | symbol;
export type EmittenListener<V extends readonly unknown[] = any[]> = (
  ...values: V
) => void;

export type EmittenMap = Record<EmittenKey, EmittenListener>;

export type EmittenLibrary<T> = Record<keyof T, Set<T[keyof T]>>;
export type EmittenLibraryPartial<T> = Partial<EmittenLibrary<T>>;
