package main

import (
	"bufio"
	"fmt"
	"os"

	"github.com/dop251/goja"
	"github.com/dop251/goja_nodejs/require"
)

func main() {
	fmt.Fprintf(os.Stderr, "begin\n")
	registry := new(require.Registry) // this can be shared by multiple runtimes

	runtime := goja.New()

	registry.Enable(runtime)

	fmtObj := runtime.NewObject()
	fmtObj.Set("Sprintf", fmt.Sprintf)
	runtime.Set("fmt", fmtObj)

	gojaPkg := runtime.NewObject()
	gojaPkg.Set("Compile", goja.Compile)
	gojaPkg.Set("MustCompile", goja.MustCompile)
	runtime.Set("goja", gojaPkg)

	scanner := bufio.NewScanner(os.Stdin)
	for scanner.Scan() {
		// '\n' will be trimmed
		cmd := scanner.Text()
		if cmd == "" {
			// swallow this empty line
			// reply empty to help the REPL client refresh prompt
			fmt.Fprintln(os.Stdout)
			continue
		}
		val, err := runtime.RunString(cmd)
		if err != nil {
			fmt.Fprintf(os.Stderr, "%v\n", err)
			continue
		}
		fmt.Fprintf(os.Stdout, "%s\n", val.String())
	}
	if err := scanner.Err(); err != nil {
		fmt.Fprintln(os.Stderr, "reading standard input:", err)
	}
}
