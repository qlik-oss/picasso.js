/** Represents a 2D point */
export interface Point {
  x: number;
  y: number;
}

/** Represents an axis-aligned bounding rectangle */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Represents a circle */
export interface Circle {
  cx: number;
  cy: number;
  r: number;
}

/** Represents a line segment */
export interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  tolerance?: number;
}

/** Log level values */
export type LogLevel = 0 | 1 | 2 | 3 | 4;

/** Logger instance interface */
export interface Logger {
  log(lev: LogLevel, ...args: unknown[]): void;
  error(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  info(...args: unknown[]): void;
  debug(...args: unknown[]): void;
  level(lev?: LogLevel): LogLevel;
  LOG_LEVEL: Record<string, LogLevel>;
}

/** Logger factory options */
export interface LoggerOptions {
  level?: LogLevel;
  pipe?: Pick<Console, 'error' | 'warn' | 'info' | 'log'>;
}

/** Registry function interface - maps keys to registered values */
export interface RegistryFn {
  (key: string, value?: unknown): unknown;
  add(key: string, value: unknown): boolean;
  get(key: string): unknown;
  has(key: string): boolean;
  remove(key: string): unknown;
  getKeys(): string[];
  getValues(): unknown[];
  default(d?: unknown): unknown;
  register(key: string, value: unknown): boolean;
  prio?: (p?: string[]) => string[];
  types?: () => string[];
}

/** Brush range configuration */
export interface BrushRangeConfig {
  key?: string;
  includeMin?: boolean;
  includeMax?: boolean;
}

/** Brush configuration */
export interface BrushConfig {
  ranges?: BrushRangeConfig[];
}

/** A brush value item */
export interface BrushItem {
  key: string;
  value?: string | number;
  values?: Array<string | number>;
}

/** A brush range item */
export interface BrushRangeItem {
  key: string;
  min: number;
  max: number;
}

/** Scale ratio */
export interface ScaleRatio {
  x: number;
  y: number;
}

/** Margin */
export interface Margin {
  left: number;
  top: number;
}

/** Edge bleed */
export interface EdgeBleed {
  left: number;
  right: number;
  top: number;
  bottom: number;
  bool: boolean;
}

/** Renderer box - the physical/logical dimensions */
export interface RendererBox {
  x: number;
  y: number;
  width: number;
  height: number;
  scaleRatio: ScaleRatio;
  margin: Margin;
  edgeBleed: EdgeBleed;
  computedPhysical: Rect;
}

/** A data cell value */
export type DataValue = string | number | null | undefined;

/** A data field accessor */
export interface DataField {
  key(): string;
  title(): string;
  type(): string;
  values(): DataValue[];
  formatter(): unknown;
  min(): number;
  max(): number;
  raw(): unknown;
}

/** Plugin function signature */
export type Plugin = (registries: unknown, options?: Record<string, unknown>) => void;
