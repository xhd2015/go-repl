const repl = require("repl");
const child_process = require("child_process");

function trimLine(s){
  for(let i=0;i<2;i++){
    if(s.endsWith("\n")){
      s =s.slice(0,s.length-1)
    }
  }
  return s
}
function run() {
  const sub = child_process.spawn("go", ["run", "-v","./main.go"], {
    stdio: ["pipe" /*create stdin for write*/, "pipe", "pipe"],
  });

  let curCallback;
  sub.stdout.on("data", (data) => {
    if (curCallback) {
      curCallback(null, trimLine(data.toString()));
    } else {
      console.log('goja:',trimLine(data.toString()));
    }
  });

  sub.stderr.on("data", (data) => {
    if (curCallback) {
      curCallback(new Error(trimLine(data.toString())));
    } else {
      console.error('goja:',trimLine(data.toString()));
    }
  });

  // callback is different for each calling to evalGoja
  function evalGoja(cmd, context, filename, callback) {
    curCallback = callback;
    sub.stdin.write(cmd + "\n");
  }

  const replSvr = repl.start({ prompt: "gopa> ", eval: evalGoja });
  replSvr.on("exit", () => {
    // when we input .exit or Ctrl-D, we kill the goja process
    sub.kill();
  });
}
run();
