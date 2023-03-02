let password;

const setPassword = (_password) => {
    password = _password;
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

const cmd = (command, doLog = false) => {
    if(password) savePassword(password);
    const parseCommand = (command) => {
        // if(!Array.isArray(command)) command = command.split(" ");
        // // if any command arg is "sudo" then replace with "sudoReplacement"
        // command = command.map((arg) => {
            //     if(arg === "sudo") return sudoReplacement;
            //     return arg;
            // });
            // 
            // return command;
        // }

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
            const sudoReplacement = `echo ${password} | sudo -S`;
            command = command.replace(/sudo/g, sudoReplacement);
        }
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
            if(doLog) console.log(...args);
            resolve(false);
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
    setPassword
}