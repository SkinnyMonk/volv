const Logger = () => {
  // Logger disabled
}

Logger.error = () => {
  // Error logging disabled
}

Logger.warn = () => {
  // Warning logging disabled
}

Logger.info = (...args) => {
  console.info('Octopus Info:', ...args);
}

export default Logger; 