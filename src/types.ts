export type EmittenKey = string | symbol;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EmittenListener<V extends readonly unknown[] = any[]> = (
  ...values: V
) => void;

export interface EmittenMap {
  [key: EmittenKey]: EmittenListener;
}

export type EmittenLibrary<T> = Map<keyof T, Set<T[keyof T]>>;
