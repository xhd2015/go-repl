const repl = require("repl");
const child_process = require("child_process");

function evalSh(cmd, context, filename, callback) {
  if (cmd.startsWith("js ")) {
    callback(null, eval(cmd.slice("js ".length)));
    return;
  }
  const res = child_process.execSync(cmd);
  callback(null, res.toString());
}

const replSvr = repl.start({ prompt: "> ", eval: evalSh });
