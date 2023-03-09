let password;

const setPassword = (_password) => {
    password = _password;
    savePassword(password);
}

const savePassword = (password) => {
    const fs = require("fs");
    const path = require("path");
    const p = path.join(__dirname, "password.txt");

    fs.writeFileSync(p, password);
}

const getPassword = () => {
    const fs = require("fs");
    const path = require("path");
    const p = path.join(__dirname, "password.txt");

    if(!fs.existsSync(p)) return false;
    const data = fs.readFileSync(p, "utf8");
    if(!data) return false;
    return data;
}


const child_process = require("child_process");

// Example
// cmd(["start", "https://www.google.com"]"])

const isWindows = process.platform === "win32";

const parseCommand = (command, doLog = false) => {

    const _parseCommand = (command) => {
        if(command.includes("sudo")) {
            if(!password) {
                const savedPassword = getPassword();
                if(!savedPassword) {
                    throw new Error("@cmd: Password not set");
                } else {
                    if(doLog) console.log("@cmd: Using saved password");
                    password = savedPassword;
                }
            }
            // replace first sudo occurence with `sudo -S <<< ${password}`
            // any other sudo occurences will be replaced with `sudo -S`
            const sudoReplacement = `echo ${password} | sudo -S`;
            const sudoReplacement2 = `sudo -S`;
            command = command.replace("sudo", sudoReplacement);
            // make sure we don't replace the first sudo occurence
            command = command.replace(/sudo(?!\s+-S)/g, sudoReplacement2);
        }
        return command;
    }

    // if command is obj
    if(typeof command === "object") {
        if(command.linux && !isWindows) command = _parseCommand(command.linux);
        else if(command.windows && isWindows) command = _parseCommand(command.windows);
        else {
            console.log("Invalid command object");
            return;
        }
    } else {
        command = _parseCommand(command);
    }
}


const cmdSync = (command, doLog = false) => {
    command = parseCommand(command, doLog);

    const commandStr = command;
    if(doLog) console.log("@cmd: executing cmd string", "\"" + commandStr + "\"");

    try {
        const stdout = child_process.execSync(commandStr);
        if(!stdout) return true;
        return stdout;
    } catch (err) {
        return false;
    }
}

const cmd = (command, doLog = false) => {
    command = parseCommand(command, doLog);

    return new Promise((resolve) => {
        function reject (...args) {
            if(doLog) console.log(...args);
            resolve(args[2].toString());
        }
        
        const commandStr = command;
        if(doLog) console.log("@cmd: executing cmd string", "\"" + commandStr + "\"");
        child_process.exec(commandStr, (error, stdout, stderr) => {
            if(error) reject("@cmd: An error occured whilst executing", `"${commandStr}"`, error);
            if(stderr) {
                if(doLog) console.log("@cmd: An stderr occured whilst executing", `"${commandStr}"`, stderr);
                return resolve(stderr);
            }
            if(!stdout) resolve(true);
            resolve(stdout);
        });
    });
}

module.exports = {
    cmd,
    cmdSync,
    setPassword
}