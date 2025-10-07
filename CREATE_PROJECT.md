# JSphere Projects

A **JSphere project** is made up of two or more Git repositories:  
- A **project configuration repository**  
- One or more **project repositories**  

In JSphere, each repository is called a **package**. Therefore, every JSphere project is comprised of at least two packages.

## Creating a JSphere Project

Before creating a JSphere project, you will need to obtain a **GitHub access token** with the following privileges:  
- Creating repositories  
- Modifying repository contents  

Once you have the token, run the following CLI command:

```
js create-project
```

You will be prompted to provide:  
1. **Project name** – the name of your new project  
2. **Project namespace** – your GitHub account name  
3. **Project auth token** – the GitHub access token you created earlier  

After entering the required information, JSphere will create your project in the specified GitHub account. Two repositories will be generated:  

- **Project config package** – named with a `.` prefix before the project name (e.g., `.myproject`)  
- **Project package** – named with the project name you provided (e.g., `myproject`)  

The newly created project will also include some sample code that displays the current date and time in the browser.

## Loading and Running Your Project

To run your newly created project use the following CLI command:

```
js load <project_name>
```
or select the newly created project configuration from the list of existing project configurations:
```
js load --list
```

After executing the `js load` command, open your browser and navigate to:

```
http://localhost[:port]
```

You should now see your project application running.

Please note:
**Your project files are being acessed remotely. If you would like to edit your project files you will need to checkout your project packages**.  

## Checking out a Project Package

To checkout all of the packages of the currently loaded project use the following CLI command:
```
js checkout
```

To checkout a specific package of the currently loaded project use the following CLI command:
```
js checkout <package_name>
```

Please note:
**Checking out packages is equivalent to doing a git clone of a repository. You will be able to edit and work with your package repo using git commands.**

## Understanding a JSphere Project Structure

As mentioned previously, a JSphere project is comprised of two or more packages (repos): A project config package, a main application package and any additional application support packages.

```
ROOT_PROJECT_FOLDER
  :- .myproject
       :- app.json
  :- myproject
       :- client
       :- server
       :- shared
       :- tests
  :- package3
       :- client
       :- server
       :- shared
       :- tests
  :-
  :-
```

### The app.json File
The app.json file contains your project's application configuration and is a collection of properties like this:
```
{
	"packages": {
		"myproject": {
			"alias": "main"
            "reference:: ""
		}
	},
	"routes": [
		{
			"route": "/api/datetime",
			"path": "/myproject/server/datetime.js"
		},
		{
			"route": "/*",
			"path": "/myproject/client/index.html"
		}
	],
	"extensions": {},
	"directives": [],
	"settings": {},
	"featureFlags": []
}
```
The **packages** property is a collection package objects that define the project's application. Each package object has an **alias** and **reference** property. 

