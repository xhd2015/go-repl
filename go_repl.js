const repl = require("repl");
const child_process = require("child_process");

function evalGo(cmd, context, filename, callback) {
  // callback(null, 'hello my;');
  if (cmd.startsWith("go ")) {
    const res = child_process.execSync(cmd);
    callback(null, res.toString());
    return;
  }
  callback(null, eval(cmd));
}

const replSvr = repl.start({ prompt: '> ', eval: evalGo });