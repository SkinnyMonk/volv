const Logger = (...args) => {
  console.log('Octopus', ...args);
}

Logger.error = (...args) => {
  console.error('Octopus Error:', ...args);
}

Logger.warn = (...args) => {
  console.warn('Octopus Warning:', ...args);
}

Logger.info = (...args) => {
  console.info('Octopus Info:', ...args);
}

export default Logger; 