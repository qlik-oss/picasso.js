declare module 'number-format.js' {
  export default function formatter(
    localeInfo: any,
    pattern: string,
    thousand?: string,
    decimal?: string,
    type?: string
  ): {
    formatValue: (value: any) => string;
    format: (value: any, pattern?: string, thousand?: string, decimal?: string) => string;
    pattern: string;
    prepare: () => void;
  };
}
