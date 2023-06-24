# JSphere
JSphere is a lightweight, flexible and extensible web application server designed to simplify the process of getting your JavaScript/TypeScript based applications from prototype to production with minimal effort.

JSphere decouples your application logic from the application's runtime environment, allowing you to foucs more time on application development and less time on managing your application infrastructure.

## Getting Started

### Install Deno
JSphere requires you to [install](https://deno.com/manual/getting_started/installation) the Deno JavaScript, TypeScript, and WebAssembly runtime. Deno works on macOS, Linux, and Windows. Deno is a single binary executable. It has no external dependencies.

### Install the JSphere CLI tool
The JSphere command line interface tool provides commands for working with JSphere.  To install the CLI tool open a command line console and enter the following:
```
deno install --allow-all -f -n js https://raw.githubusercontent.com/GreenAntTech/JSphereServer/main/tools/cli/cli.ts
```
To use the CLI tool commands you type:
```
js <command> [arguments]
```
For example, to see a list of available commands type:
```
js help
```

### Create a JSphere Project Directory ###
A JSphere project directory is your workspace for your JSphere application(s).

To create a project directory enter the following:
```
js create project <name_of_your_project>
```
If you would like to automatically initialize the folders as a git repo enter the following:
```
js create project <name_of_your_project> --git-init
```
You will now have a boiler plate project directory with a default app configuration.

### Starting and Stopping the JSphere Application Server

**Note:**
You must start the JSphere application server from within the root of a JSphere project directory.

To start the JSphere application server enter the following:
```
js start
```
or to run a specific version of the server enter the following:
```
js start -v=<version>
```
To stop the JSphere application server press the key combination required by your operating system for stopping a process.  For example, on a windows machine use the key combination <kbd>Ctrl</kbd> + <kbd>C</kbd>

### View Your Application in a Browser ###
To view your application enter the following in the address bar of your preferred browser:
```
http://localhost/app/client/index.html
```

## Learn More ##
- [The Basics](https://deno.com/manual/getting_started/installation)
- [Advance Stuff](https://deno.com/manual/getting_started/installation)
- [Blow Your Mind Stuff](https://deno.com/manual/getting_started/installation)
