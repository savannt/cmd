let password;

const setPassword = (_password) => {
    password = _password;
}


const child_process = require("child_process");

// Example
// cmd(["start", "https://www.google.com"]"])

const isWindows = process.platform === "win32";

const cmd = (...setOfCommands) => {
    const parseCommands = (commands) => {
        if(!Array.isArray(commands) || typeof commands[0] === "string") commands = [commands];

        // if a command is a string, convert it to an array (split by spaces)
        commands = commands.map((command) => {
            if(typeof command === "string") {
                return command.split(" ");
            }
            return command;
        });

        // if any command arg is "sudo" then replace with "sudoReplacement"
        commands = commands.map((command) => {
            return command.map((arg) => {
                if(arg === "sudo") {
                    return sudoReplacement;
                }
                return arg;
            });
        });

        return commands;
    }
    const sudoReplacement = password ? `echo ${password} | sudo -S` : "sudo";

    const parsedSetOfCommands = setOfCommands.map((commands) => {
        return parseCommands(commands);
    });

    // if only linux commands are given, but we are on windows- throw error
    if(isWindows && parsedSetOfCommands.length === 1) throw new Error("@cmd: No windows commands given.");

    const targetCommand = isWindows ? parsedSetOfCommands[1] : parsedSetOfCommands[0];
    
    // targetCommand is an array of arrays which are commands, the inner arrays should join, and outer ararys join with &&
    const targetCommandString = targetCommand.map((command) => {
        return command.join(" ");
    }).join(" && ");


    return new Promise((resolve) => {
        function reject (...args) {
            console.log(...args);
            resolve(false);
        }
        
        child_process.exec(targetCommandString, (error, stdout, stderr) => {
            if(error) reject("@cmd: An error occured whilst executing", `"${targetCommand.join(" ")}"`, error);
            if(stderr) reject("@cmd: An error occured whilst executing", `"${targetCommand.join(" ")}"`, stderr);
            resolve(stdout);
        });
    });
}

module.exports = {
    cmd,
    setPassword
}