# JSphere Projects

A **JSphere project** is made up of two or more Git repositories:  
- A **project configuration repository**  
- One or more **project repositories**  

In JSphere, each repository is called a **package**. Therefore, every JSphere project is comprised of at least two packages.

---

## Creating a JSphere Project

Before creating a JSphere project, you will need to obtain a **GitHub access token** with the following permisions:  
- Create repositories  
- Read and write access to repository contents

Once you have the token, run the following command:

```
js create project
```


# JSphere Projects
A JSphere project is comprised of two or more git repositories. A project configuration repo and a project repo. A JSphere repo is called a package. Therefore, every JSphere project is comprised of two or more packages.

## Create a JSphere Project
Creating a jsphere project
 before creating a jsphere project you will need to obtain a GitHub access token that provides the Privileges for creating a repo and modifying the contents of a repo
 The Next Step would be to enter the command js  create project
You will then be prompted to enter the project name, the project Host which defaults to GitHub , the project  namespace which is your GitHub account name and finally the project auth tokenFor which you would enter the GitHub access token that you previously created
After entering all of the required information a jsphere project will be created in the specified GitHub accountWhich will have two repositories created for your project the first Repository is referred the project config package  and is named with a period in front of the project name that was provided and a second repo that is referred to as the project package that will be named with the project name that was provided. The newly created project will contain some sample code that displays the current date and time in the browser when the project is navigated to.
 please note that your project is not automatically loaded into jsphere at the time that you created in order to load your project into Jay's fear you have to use the command Js load <project_name>. After executing just load command you can then navigate to http://localhost  to view  your project application. 

