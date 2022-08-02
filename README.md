# Usage
```bash
# clone
git clone https://github.com/xhd2015/go-repl
cd go-repl

# ensure you have nodejs(v12 and above) installed
# run
node goja_repl.js
```

Output:
```bash
$ node goja_repl.js 
gopa> 1+1
'2'
gopa> a=10
'10'
gopa> 20*a
'200'
gopa> require
'function github.com/dop251/goja_nodejs/require.(*RequireModule).require-fm() { [native code] }'
gopa> fmt.Sprintf("a:%d\n",100)
gopa> 'a:100\n'
gopa> .exit
```
All [goja](https://github.com/dop251/goja) commands can be evaluated, since this is just a stupid wrapper(CLI frontend) around the powerful [goja](https://github.com/dop251/goja) engine.

Normally most js statements can be evaluated.

Try yourself and find more in [goja](https://github.com/dop251/goja)'s doc.

# Integration `goja`(golang's popular JS engine) with `nodejs`'s REPL
So [goja](https://github.com/dop251/goja) is very useful, especially in some circumstances when we want to do quick verification to our running code, either because it is hard to get it restarted, or is hard to restruct the scene.

But sadly `goja` by default does not provide a REPL interpreter, and there is no other equal replacement(maybe [yaegi](https://github.com/traefik/yaegi) is one, but does not suite my needs in some cases).

So how do we get all these together? 
The node module `repl` is what powers node's interpreter in behind, and it allows customization.
Let's start by looking at examples given by nodejs's doc:
```js
// test.js
const repl = require("repl");
const replSvr = repl.start({ prompt: '> '});

replSvr.context.replSvr = replSvr;
replSvr.context.setTimeout = ()=>{
    console.log("haha, you are cheated!")
}
```

Run:
```bash
$ node test.js
> setTimeout(()=>{})
haha, you are cheated!
```

By providing a custom `eval` function, we can somehow intercept the `cmd` halfway and pass it somewhere and get result back, just like this:
```js
// go_repl.js
const repl = require("repl");
const child_process = require("child_process");

function evalGo(cmd, context, filename, callback) {
  if (cmd.startsWith("go ")) {
    // run 'go run ...' and get output
    const res = child_process.execSync(cmd);
    callback(null, res.toString());
    return;
  }
  callback(null, eval(cmd));
}

const replSvr = repl.start({ prompt: '> ', eval: evalGo });
```
Run:
```bash
$ node go_repl.js 
> go version
'go version go1.14.15 darwin/amd64\n'
> .exit
```

Even more crazily, we can add a `js` builtin to common `bash`:
```js
// sh_repl.js
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

const replSvr = repl.start({ prompt: '> ', eval: evalSh });
```


Output:
```bash
$ node sh_repl.js 
> pwd
'/Users/xhd2015/tmp/repl\n'
> ls
'REAMDE.md\ngo.mod\ngo.sum\ngo_repl.js\ngoja_repl.js\nmain.go\nsh_repl.js\n'
> echo hello|cat
'hello\n'
> js 1+23
24
> js a={name:'you'}
{ name: 'you' }
> js console.log(a.name,' and me')
you  and me
undefined
> .exit
```