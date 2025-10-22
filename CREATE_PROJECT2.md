# Creating a New Project

This section will guide you through the process of creating a new JSphere project, from obtaining a GitHub access token to understanding the initial project structure.

## Pre-requisite knowledge

Before creating a new project, it's helpful to have a basic understanding of:

-   **Git and GitHub:** Familiarity with version control concepts and how to use GitHub repositories.
-   **Command Line Interface (CLI):** Basic comfort with executing commands in a terminal.

## Steps to Create a New JSphere Project

### 1. Obtain a GitHub Access Token

JSphere projects are managed through Git repositories hosted on GitHub. To allow JSphere to create and modify these repositories on your behalf, you'll need a GitHub Personal Access Token with the necessary permissions.

-   **Permissions Required:** The token must have privileges to create new repositories and modify repository content.

### 2. Run the JSphere CLI `create-project` command

Once you have your GitHub access token, open your command line console and execute the following JSphere CLI command:

```bash
js create-project
```

The CLI will then prompt you for the following information:

-   **Project name:** This will be the name of your new project. It also sets the environment variable `PROJECT_NAME`.
-   **Project namespace:** This should be your GitHub account name. It sets the environment variable `PROJECT_NAMESPACE`.
-   **Project auth token:** This is the GitHub access token you obtained in the previous step. It sets the environment variable `PROJECT_AUTH_TOKEN`.

### 3. Project Generation

After you provide the required information, JSphere will create your project in your specified GitHub account. This process generates two key repositories (packages):

1.  **Project Configuration Repository:** Named with a leading dot (`.`) before your project name (e.g., `.myproject`). This repository holds your `app.json` configuration file.
2.  **Main Project Repository:** Named with the project name you provided (e.g., `myproject`). This repository will contain your application's source code.

The newly created project will also include some sample code that displays the current date and time in the browser, providing a ready-to-run example.

## Running Your Newly Created Project

### 1. Load the Project Configuration

To run your new project, you need to load its configuration into the JSphere server. Use one of the following CLI commands:

-   **Load by name:**
    ```bash
    js load <project_name>
    ```
    Replace `<project_name>` with the name you gave your project (e.g., `myproject`).

-   **Load from a list:** If you have multiple project configurations, you can choose from a list:
    ```bash
    js load --list
    ```

### 2. Access Your Application in the Browser

After executing the `js load` command, the JSphere server will start (if not already running) and serve your application. Open your web browser and navigate to:

```
http://localhost[:port]
```

(The default port is usually `80`, but it can vary based on your `jsphere.json` configuration.)

You should now see your project application running, displaying the sample code.

### 3. Understanding Remote Access vs. Local Checkout

Initially, your project files are accessed remotely from GitHub. If you wish to edit and work with your project files locally, you will need to "checkout" your project packages.

## Checking Out Project Packages for Local Development

"Checking out" a package is equivalent to performing a `git clone` operation. This allows you to edit the files using your preferred IDE and manage changes with Git commands.

-   **To checkout all packages of the currently loaded project:**
    ```bash
    js checkout
    ```

-   **To checkout a specific package of the currently loaded project:**
    ```bash
    js checkout <package_name>
    ```
    Replace `<package_name>` with the name of the specific repository you want to checkout (e.g., `myproject`).

**Important Note:** When a package is checked out, JSphere will serve any requested resources for that package from your local file system first. If a resource isn't found locally, JSphere will then check the remote GitHub repository. This means you can checkout just one package in a multi-package project, and your application will still function correctly, seamlessly blending local and remote resources.
