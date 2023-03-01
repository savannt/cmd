let password;

const setPassword = (_password) => {
    password = _password;
}


const child_process = require("child_process");

// Example
// cmd(["start", "https://www.google.com"]"])

const isWindows = process.platform === "win32";

const cmd = (command, doLog) => {
    const parseCommand = (command) => {
        if(!Array.isArray(command)) command = command.split(" ");
        // if any command arg is "sudo" then replace with "sudoReplacement"
        const sudoReplacement = password ? `echo ${password} | sudo -S` : "sudo";
        command = command.map((arg) => {
            if(arg === "sudo") return sudoReplacement;
            return arg;
        });

        return command;
    }
    // if command is obj
    if(typeof command === "object") {
        if(command.linux && !isWindows) command = parseCommand(command.linux);
        else if(command.windows && isWindows) command = parseCommand(command.windows);
        else {
            console.log("Invalid command object");
            return;
        }
    } else {
        command = parseCommand(command);
    }

    return new Promise((resolve) => {
        function reject (...args) {
            console.log(...args);
            resolve(false);
        }
        
        const commandStr = command.join(" ");
        if(doLog) console.log("@cmd: executing", "\"" + commandStr + "\"");
        child_process.exec(commandStr, (error, stdout, stderr) => {
            if(error) reject("@cmd: An error occured whilst executing", `"${commandStr}"`, error);
            if(stderr) reject("@cmd: An stderr occured whilst executing", `"${commandStr}"`, stderr);
            if(!stdout) resolve(true);
            resolve(stdout);
        });
    });
}

module.exports = {
    cmd,
    setPassword
}