# JSphere Projects

A **JSphere project** is made up of two or more Git repositories:  
- A **project configuration repository**  
- One or more **project repositories**  

In JSphere, each repository is called a **package**. Therefore, every JSphere project is comprised of at least two packages.

---

## Creating a JSphere Project

Before creating a JSphere project, you will need to obtain a **GitHub access token** with the following privileges:  
- Creating repositories  
- Modifying repository contents  

Once you have the token, run the following command:

```bash
js create project
```

You will be prompted to provide:  
1. **Project name** – the name of your new project  
2. **Project host** – defaults to `GitHub`  
3. **Project namespace** – your GitHub account name  
4. **Project auth token** – the GitHub access token you created earlier  

After entering the required information, JSphere will create your project in the specified GitHub account. Two repositories will be generated:  

- **Project config package** – named with a `.` prefix before the project name (e.g., `.myproject`)  
- **Project package** – named with the project name you provided (e.g., `myproject`)  

The newly created project will also include some sample code that displays the current date and time in the browser.

---

## Loading and Running Your Project

Please note: **your project is not automatically loaded into JSphere after creation**.  

To load it, run:

```bash
js load <project_name>
```

After executing the `js load` command, open your browser and navigate to:

```
http://localhost
```

You should now see your project application running.
