## Understanding JSphere Project Structure

Welcome back! Now that you've successfully created and run your first JSphere application, it's time to dive into how JSphere organizes your code. Understanding the project structure is crucial for efficient development, allowing you to quickly locate and manage your application's components.

This section will explain the fundamental building blocks of a JSphere project, including packages, configuration files, and the purpose of different directories.

### Pre-requisite Knowledge

Before we begin, it's helpful to have a basic understanding of:

-   **Git and GitHub:** Familiarity with how repositories work and how they are used for version control.
-   **File System Navigation:** Basic comfort with moving through directories and understanding file paths.
-   **Web Development Fundamentals:** A grasp of how client-side (HTML, CSS, JavaScript) and server-side code interact.

### The Core Concept: Packages (Git Repositories)

In JSphere, your entire project is built from one or more **packages**. Each package is essentially a separate Git repository. This modular approach allows for flexible development, where different parts of your application can be managed independently or shared across multiple projects.

Every JSphere project consists of at least two essential packages:

1.  **Project Configuration Repository:** This package, named with a leading dot (e.g., `.myproject`), holds your project's main configuration file, `app.json`.
2.  **Main Project Repository:** This package, named after your project (e.g., `myproject`), contains the actual source code for your application.

### The `app.json` Configuration File

The heart of your JSphere project's configuration lies within the `app.json` file, located in your project configuration repository. This JSON file defines how your application behaves, what packages it uses, how requests are routed, and much more.

Here's a breakdown of its key properties:

#### `packages`

This property defines all the Git repositories (packages) that make up your application.

-   **Structure:** An object where each key is the name of a package, and its value is an object containing `alias` and `reference` properties.
-   **`alias` (string):** An optional alternate name for the package, useful for referencing it within your code.
-   **`reference` (string):** Specifies the Git branch name or tag to use when retrieving content from the repository. An empty string usually means the default branch.

```json
{
  "packages": {
    "myproject": {
      "alias": "main",
      "reference": ""
    },
    "my_auth_package": {
      "alias": "auth",
      "reference": "v1.0"
    }
  }
}
```

#### `routes`

This is an array of objects that map incoming URL paths to specific resources within your packages. This is how JSphere knows which code to execute or which file to serve for a given request.

-   **Structure:** An array of objects, each with a `route` and a `path` property.
-   **`route` (string):** The URL pathname (e.g., `/api/users`, `/*`, `/product/:id`). It can include wildcards (`*`) or named segments (`:id`).
-   **`path` (string):** The internal path to the resource (e.g., `/myproject/server/users.js`, `/myproject/client/index.html`).
-   **Important:** Routes are processed from most specific to least specific.

```json
{
  "routes": [
    {
      "route": "/api/datetime",
      "path": "/myproject/server/datetime.js"
    },
    {
      "route": "/api/contact/:id",
      "path": "/myproject/server/contact.ts"
    },
    {
      "route": "/*",
      "path": "/myproject/client/index.html"
    }
  ]
}
```

#### `extensions`

This property allows you to define server context extensions, which are reusable modules that add functionality to the server's `ctx` (context) object. This is ideal for things like database connections, authentication clients, or external API integrations.

-   **Structure:** An object where each key is the name you'll use to reference the extension in your code (e.g., `db`), and its value is an object with `uri` and `settings`.
-   **`uri` (string):** The path to the extension module within a package's `server` folder, or even a remote HTTP URL.
-   **`settings` (object):** Configuration specific to that extension. Environment variables can be referenced using `@ENV:MY_VARIABLE_NAME`.

```json
{
  "extensions": {
    "db": {
      "uri": "/path/to/extension/neo4j_extension.ts",
      "settings": {
        "dbHostname": "neo4j+s://000000.databases.neo4j.io",
        "dbDatabase": "myDB",
        "dbUsername": "myusername",
        "dbPassword": "@ENV:MY_DB_PASSWORD"
      }
    }
  }
}
```

#### `directives`

Directives are JSphere's implementation of middleware. They allow you to execute code before (`onRequest`) and/or after (`onResponse`) the main route handler, enabling global request/response manipulation, logging, authentication checks, and more.

-   **Structure:** An array of strings. Each string is a path to a directive module.
-   **Execution Order:** Directives are processed in the order they appear in the array for incoming requests (`onRequest`). For responses (`onResponse`), they are processed in reverse order.

```json
{
  "directives": [
    "/path/to/directive/auth_check.ts",
    "/path/to/directive/logging.ts",
    "/path/to/directive/response_modifier.ts"
  ]
}
```

#### `settings`

A flexible object for storing any custom, user-defined settings for your application. These settings are accessible via `ctx.settings` in your server-side code.

```json
{
  "settings": {
    "theme": "midnight",
    "itemsPerPage": 20
  }
}
```

#### `featureFlags`

An array of strings representing feature flags. These allow you to enable or disable specific features in your client or server-side code without deploying new versions.

```json
{
  "featureFlags": ["newDashboardLayout", "experimentalSearch"]
}
```

### Understanding Package Subfolders

Within your application packages (like `myproject`), you'll typically find a consistent structure of subfolders, each serving a specific purpose:

```
ROOT_PROJECT_FOLDER
  :- .myproject (Project Configuration Package)
       :- app.json
  :- myproject (Main Application Package)
       :- client
       :- server
       :- shared
       :- tests
  :- package3 (Additional Application Package)
       :- client
       :- server
       :- shared
       :- tests
```

-   **`client`:**
    This folder contains all resources intended for the browser or client-side. This includes:
    -   HTML files (`index.html`)
    -   Client-side JavaScript code
    -   CSS stylesheets
    -   Images and other static assets

-   **`server`:**
    This folder holds resources meant for server-side execution. This is where you'll define your API endpoints, server-side logic, and any modules that should only run on the server.

-   **`shared`:**
    This folder is for code and resources that are common to both the client and the server. This is ideal for utility functions, type definitions, or data models that need to be consistent across your full-stack application.

-   **`tests`:**
    As the name suggests, this folder is where you'll store your unit, integration, and end-to-end test scripts for the package.

### Multiple Configuration Files

JSphere allows for different `app.json` configurations based on the environment (development, staging, production, etc.). You can have files like:

-   `app.json` (default)
-   `app.dev.json` (for development environments)
-   `app.developer_name.json` (for individual developer settings)

The specific configuration file used is determined by the `PROJECT_APP_CONFIG` environment variable. If not specified, `app.json` is used by default. This enables seamless switching between environment-specific settings without changing your code.

### How JSphere Serves Resources (Local vs. Remote)

When you run your JSphere project, it initially accesses files remotely from GitHub. However, if you've "checked out" a package using `js checkout`, JSphere prioritizes your local file system.

-   If a requested resource is found locally in a checked-out package, the local version is served.
-   If not found locally, JSphere then attempts to retrieve the resource from the remote GitHub repository.

This intelligent resource loading allows you to seamlessly mix local development with remote, version-controlled packages, making collaboration and modular development highly efficient.
