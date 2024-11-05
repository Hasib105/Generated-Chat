declare module "js-cookie" {
  interface Cookies {
    get(name: string): string | undefined;
    set(
      name: string,
      value: string,
      options?: {
        expires?: number | Date;
        path?: string;
        domain?: string;
        secure?: boolean;
      }
    ): void;
    remove(name: string, options?: { path?: string; domain?: string }): void;
  }

  const cookies: Cookies;
  export default cookies;
}
