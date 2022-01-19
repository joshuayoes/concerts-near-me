type Logger = (message: string) => void;

export const log: Logger = (message: string) => {
  console.log(message);
};

export const logWarn: Logger = (message: string) => {
  console.warn(message);
};

export const logError: Logger = (message: string) => {
  console.error(message);
};

export const logInfo: Logger = (message: string) => {
  console.info(message);
};

export const logDebug: Logger = (message: string) => {
  console.debug(message);
};
