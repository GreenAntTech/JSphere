# Creating Server Context Extensions in JSphere

This section will guide you through creating and integrating Server Context Extensions into your JSphere application. You'll learn how to develop reusable modules that extend the server's `ctx` (context) object, providing enhanced functionality across your API endpoints and directives.

## Pre-requisite Knowledge

Before you begin, it's helpful to have a basic understanding of:

-   **JavaScript/TypeScript:** For writing your extension logic.
-   **JSphere Project Structure:** Familiarity with `app.json` and package folders (`server`).
-   **API Endpoints and Directives:** How they utilize the `ServerContext` object.

## What are Server Context Extensions?

In JSphere, a Server Context Extension (or simply "context extension") is a module that provides additional functionality to the `ServerContext` object. This `ctx` object is passed to all API endpoint handlers (`onGET`, `onPOST`, etc.) and directive functions (`onRequest`, `onResponse`).

By adding extensions, you can centralize common services like database connections, authentication clients, or external API wrappers, making them easily accessible throughout your server-side code. This promotes reusability and keeps your application logic clean.

## How Context Extensions Work

1.  **Extension Module:** You create a TypeScript/JavaScript module (e.g., `my_db_extension.ts`) that exports an `getInstance` function. This function is responsible for initializing your service and returning an object that will be attached to the `ctx` object.
2.  **`app.json` Configuration:** You register your extension in the `extensions` property of your `app.json` file, specifying its URI and any necessary settings.
3.  **Access via `ctx`:** Once configured, the initialized extension object becomes available on the `ctx` object, typically under the name you defined in `app.json` (e.g., `ctx.db`).

## Steps to Create and Integrate a Server Context Extension

Let's create an example extension for a hypothetical database service.

### 1. Create Your Server-Side Extension Module

Create a new file in your project's `server` folder, for example, `myproject/server/my_db_extension.ts`.

```typescript
// File: myproject/server/my_db_extension.ts

import * as log from "https://deno.land/std@0.179.0/log/mod.ts";

// Define the interface for your database client (optional, but good practice)
interface MyDatabaseClient {
    connect(): Promise<boolean>;
    query(sql: string, params?: Record<string, unknown>): Promise<any[]>;
    disconnect(): Promise<void>;
}

// A simple mock database client for demonstration
class MockDatabaseClient implements MyDatabaseClient {
    private isConnected: boolean = false;
    private config: Record<string, unknown>;

    constructor(config: Record<string, unknown>) {
        this.config = config;
        log.info(`MockDatabaseClient initialized with config: ${JSON.stringify(config)}`);
    }

    async connect(): Promise<boolean> {
        log.info(`Attempting to connect to database at ${this.config.dbHostname}...`);
        // Simulate an async connection
        await new Promise(resolve => setTimeout(resolve, 500));
        this.isConnected = true;
        log.info("MockDatabaseClient connected.");
        return true;
    }

    async query(sql: string, params?: Record<string, unknown>): Promise<any[]> {
        if (!this.isConnected) {
            log.error("MockDatabaseClient: Not connected to database.");
            throw new Error("Database not connected.");
        }
        log.info(`Executing query: "${sql}" with params: ${JSON.stringify(params)}`);
        // Simulate a database query
        await new Promise(resolve => setTimeout(resolve, 100));
        return [{ id: 1, result: "data_from_mock_db", query: sql, params }];
    }

    async disconnect(): Promise<void> {
        log.info("MockDatabaseClient disconnecting...");
        this.isConnected = false;
        await new Promise(resolve => setTimeout(resolve, 200));
        log.info("MockDatabaseClient disconnected.");
    }
}

/**
 * The main entry point for the extension.
 * This function is called by JSphere to get an instance of your extension.
 * @param config The configuration object from app.json, including settings.
 * @returns An instance of your database client.
 */
export async function getInstance(config: { settings: Record<string, unknown> }): Promise<MyDatabaseClient | undefined> {
    const dbHostname = config.settings.dbHostname;
    const dbUsername = config.settings.dbUsername;
    const dbPassword = config.settings.dbPassword;

    if (dbHostname && dbUsername && dbPassword) {
        try {
            const client = new MockDatabaseClient(config.settings);
            await client.connect(); // Connect when the instance is created
            log.info('MyDatabaseExtension: Client connection created.');
            return client;
        } catch (e) {
            log.error(`MyDatabaseExtension: Client connection failed.`, e.message);
            return undefined;
        }
    } else {
        log.error('MyDatabaseExtension: One or more required parameters (dbHostname, dbUsername, dbPassword) have not been set.');
        return undefined;
    }
}
```

**Explanation:**

-   **`getInstance(config)`**: This is the crucial exported function. JSphere calls this function during application startup, passing the extension's configuration (including `settings` from `app.json`).
-   **`config.settings`**: This object contains the custom settings you define in `app.json` for this specific extension.
-   **`MockDatabaseClient`**: A placeholder class demonstrating how your actual database client (e.g., a Neo4j driver, a PostgreSQL client) would be initialized and used. It includes `connect()`, `query()`, and `disconnect()` methods.
-   **Error Handling**: The `getInstance` function includes checks for required settings and logs errors if initialization fails.

### 2. Register Your Extension in `app.json`

Now, you need to tell JSphere about your new extension. Open your project's `app.json` file and add an entry under the `extensions` property.

```json
// File: .myproject/app.json (excerpt)
{
    "packages": {
        "myproject": {
            "alias": "main",
            "reference": ""
        }
    },
    "routes": [
        {
            "route": "/api/data",
            "path": "/myproject/server/data_api.ts"
        },
        {
            "route": "/*",
            "path": "/myproject/client/index.html"
        }
    ],
    "extensions": {
        "myDb": {
            "uri": "/myproject/server/my_db_extension.ts",
            "settings": {
                "dbHostname": "mock.database.io",
                "dbUsername": "admin",
                "dbPassword": "@ENV:MY_DB_PASSWORD"
            }
        }
    },
    "directives": [],
    "settings": {},
    "featureFlags": []
}
```

**Explanation of `extensions` property:**

-   **`"myDb"`**: This is the name you choose to reference your extension within the `ctx` object. You'll access it as `ctx.myDb`.
-   **`"uri": "/myproject/server/my_db_extension.ts"`**: This is the path to your extension module within your project.
-   **`"settings"`**: An object containing configuration specific to your extension.
    -   **`"dbHostname"`, `"dbUsername"`**: Example settings for your mock database.
    -   **`"dbPassword": "@ENV:MY_DB_PASSWORD"`**: This demonstrates how to securely retrieve sensitive information from environment variables. JSphere will automatically substitute `@ENV:VAR_NAME` with the value of the `VAR_NAME` environment variable.

### 3. Use Your Extension in an API Endpoint

Now that your extension is registered, you can use it in any server-side API endpoint or directive. Let's create a simple API to demonstrate this.

Create a new file `myproject/server/data_api.ts`:

```typescript
// File: myproject/server/data_api.ts

import type { ServerContext } from "https://esm.sh/gh/greenanttech/jsphere/jsphere.d.ts";

/**
 * Handles GET requests to retrieve data using the custom database extension.
 * @param ctx The server context object, now including `ctx.myDb`.
 * @returns A JSON response with data from the database.
 */
export async function onGET(ctx: ServerContext): Promise<Response> {
    try {
        // Access your custom database extension via ctx.myDb
        const data = await ctx.myDb.query("SELECT * FROM users WHERE id = :id", { id: ctx.request.params.id || 'default' });
        return ctx.response.json({ message: "Data retrieved successfully!", data });
    } catch (error) {
        console.error("Error accessing database:", error);
        return ctx.response.json({ error: "Failed to retrieve data." }, { status: 500 });
    }
}
```

**Explanation:**

-   **`ctx.myDb`**: This is how you access the instance of `MockDatabaseClient` (or your actual database client) that was returned by your extension's `getInstance` function.
-   You can now call methods on `ctx.myDb` (like `query`) directly within your API endpoint logic.

### 4. Running and Testing Your Extension

1.  **Set Environment Variable:** Make sure you have the environment variable `MY_DB_PASSWORD` set in your environment (or replace `@ENV:MY_DB_PASSWORD` with a literal string for testing).
    ```bash
    export MY_DB_PASSWORD="mysecretpassword" # On Linux/macOS
    # $env:MY_DB_PASSWORD="mysecretpassword" # On PowerShell
    ```

2.  **Load Your Project:** Ensure your project configuration is loaded.
    ```bash
    js load myproject
    ```
    (Replace `myproject` with your actual project name).

3.  **Start the JSphere Server:**
    ```bash
    js start
    ```

### 4. Running and Testing Your Extension

To run and test your extension, you need to ensure JSphere is configured correctly and then access your API endpoint.

1.  **Configure Environment Variables (Recommended for Development):**

    For development and local testing, it's highly recommended to define your environment variables directly within the `jsphere.json` file. This centralizes your project's configuration and makes it easy to switch between different settings.

    Open your `jsphere.json` file (it's created the first time you run `js start` in your workspace folder) and add a configuration entry for your project. If you already have one, ensure it includes your environment variable.

    ```json
    // jsphere.json (excerpt)
    {
      "httpPort": 80,
      "defaultConfiguration": "myproject_dev",
      "configurations": [
        {
          "PROJECT_CONFIG_NAME": "myproject_dev",
          "PROJECT_HOST": "GitHub",
          "PROJECT_NAMESPACE": "YourGitHubAccount",
          "PROJECT_NAME": "myproject",
          "PROJECT_APP_CONFIG": "app",
          "PROJECT_REFERENCE": "",
          "PROJECT_AUTH_TOKEN": "your_github_token",
          "MY_DB_PASSWORD": "mysecretpassword_for_dev" // <--- Set your environment variable here
        }
      ]
    }
    ```
    **Note:** For production deployments, environment variables like `MY_DB_PASSWORD` are typically set directly in the operating environment where the JSphere server is hosted, rather than in `jsphere.json`. This is because `jsphere.json` might be part of your version control, and sensitive credentials should ideally be managed outside of it in production.

2.  **Load Your Project Configuration:**

    Ensure your project configuration is loaded. Use the `js load` command, specifying the `PROJECT_CONFIG_NAME` you defined in `jsphere.json` (e.g., `myproject_dev`).

    ```bash
    js load myproject_dev
    ```
    (Replace `myproject_dev` with the actual `PROJECT_CONFIG_NAME` you used).

3.  **Start the JSphere Server:**

    ```bash
    js start
    ```

4.  **Test with a Tool (e.g., cURL, Browser):**

    -   **GET Data:** Open your browser to `http://localhost[:port]/api/data` or `http://localhost[:port]/api/data/123` (the `:id` parameter isn't strictly used by our mock query but can be passed):
        ```bash
        curl http://localhost[:port]/api/data
        # or
        curl http://localhost[:port]/api/data/123
        ```
        You should get a JSON response like: `{"message":"Data retrieved successfully!","data":[{"id":1,"result":"data_from_mock_db","query":"SELECT * FROM users WHERE id = :id","params":{"id":"default"}}]}` (or with `id: 123` if you passed it).

    -   Check your server console for the log messages from `MockDatabaseClient` confirming initialization and query execution.

By following these steps, you can effectively create and manage powerful, reusable context extensions within your JSphere applications, centralizing common functionalities and keeping your server-side code modular and maintainable.
