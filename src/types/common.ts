// Generic response envelope sederhana yang sering muncul di BE
export type BackendList<T> = { success: boolean; data: T[] };
export type BackendSingle<T> = { success: boolean; data: T };
