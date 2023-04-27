import Debug from 'debug';  
  
export const rootDebug = Debug('compiler-cli')  
  
export const printVerboseHook = (thisCommand) => {  
  
  const options = thisCommand.opts();  
  
  if (options.verbose) {  
    Debug.enable('compiler-cli*');  
    rootDebug(`CLI arguments`);  
    rootDebug(options);  
  }  
}