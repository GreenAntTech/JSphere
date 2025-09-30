# JSphere
JSphere is a lightweight and versatile web application server for Deno.

JSphere decouples your application logic from the application's runtime environment, allowing for highly composable and scalable application architectures.

JSphere's element.js is a lightweight JavaScript library for building composable and easily navigable web interfaces. Web interfaces built using element.js can be rendered at the client or at the server allowing you flexible hydration options at the client.

## Getting Started

### Install Deno
JSphere requires you to [install](https://docs.deno.com/runtime/getting_started/installation) the Deno JavaScript, TypeScript, and WebAssembly runtime. Deno works on macOS, Linux, and Windows. Deno is a single binary executable. It has no external dependencies.

### Install the JSphere CLI tool
The JSphere command line interface tool provides commands for working with JSphere.  To install the CLI tool open a command line console and enter the following:
```
deno install --global --allow-all -f -n js https://esm.sh/gh/greenanttech/jsphere/cli.js
```
You can specify a specific version of the CLI tool to install by providing a version number as follows:
```
deno install --global --allow-all -f -n js https://esm.sh/gh/greenanttech/jsphere@v1.0.0/cli.js
```
To use the CLI tool commands you type:
```
js <command> [arguments]
```
To see a list of available commands type:
```
js
```

### Create a JSphere Workspace Folder ###
A JSphere workspace folder is where you will start the JSphere server and where your checkedout project(s) will reside.

The workspace folder will also contain the JSphere server configuration file jsphere.json.

### Starting and Stopping the JSphere Application Server

To start the JSphere application server
```
js start
```
To start the JSphere application server with a existing project configuration
```
js start my_project_config_name
```
To start the JSphere application server to listen on a specified HTTP port
```
js start --http-port=8080
```
To start the JSphere application server to listen on a specified debug port
```
js start --debug-port=9229
```
To start the JSphere application server and force it to reload cached files
```
js start --reload
```

Once you have started JSphere you can open a browser and navigate to:
```
http://localhost
```

**Note:**
The very first time you start JSphere in a workspace folder it will create a jsphere.json configuration file. This file will contain default entries for the server's HTTP port (80) and debug port (9229) if they are not specified as command arguments when starting the server.

To **stop** the JSphere application server press the key combination required by your operating system for stopping a process. For example, the key combination <kbd>Ctrl</kbd> + <kbd>C</kbd>

## Learn More ##
- [The Basics](CREATE_PROJECT.md)
- [Advance Stuff]()
- [Blow Your Mind Stuff]()
