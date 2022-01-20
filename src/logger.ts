import clc from "cli-color";

type Logger = (message: string) => void;

const info: Logger = (message: string) => {
  console.log(`${clc.blue("INFO")} - ${message}`);
};

const warn: Logger = (message: string) => {
  console.warn(`${clc.yellow("WARN")} - ${message}`);
};

const error: Logger = (message: string) => {
  console.error(`${clc.red("ERROR")} - ${message}`);
};

const logger = {
  info,
  warn,
  error,
} as const;

export default logger;
