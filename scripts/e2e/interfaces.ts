export interface PollOptions {
  timeout?: number;
  interval?: number;
  label?: string;
}

export interface SuiteDefinition {
  name: string;
  file: string;
}

export interface SuiteResult {
  test: string;
  pass: boolean;
}
