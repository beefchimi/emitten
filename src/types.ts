export type EmittenKey = string | symbol;
export type EmittenListener<V extends readonly unknown[] = any[]> = (
  ...values: V
) => void;

export interface EmittenMap {
  [key: EmittenKey]: EmittenListener;
}

export type EmittenLibrary<T> = Map<keyof T, Set<T[keyof T]>>;
