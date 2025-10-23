# Installing elementJS into an Existing JSphere Project

This guide assumes you are already familiar with JSphere concepts, including running the JSphere server, managing projects, and using the `js` CLI. This document focuses on the specific steps to integrate the `elementJS` client-side library and its TypeScript definitions into your existing JSphere project.

## Prerequisites

*   **Running JSphere Server:** Your JSphere server must be active and accessible.
*   **Loaded JSphere Project:** You must have an existing JSphere project configuration loaded on the server.
*   **Checked Out Project Packages:** For local development, your project packages should be checked out locally using `js checkout`. This ensures the `elementJS` files are installed directly into your local project folders.

## Step 1: Ensure Your JSphere Server is Running

Before proceeding, verify that your JSphere server is running. Most `js` CLI commands, including those for installing `elementJS`, require an active server connection.

If your server is not running, start it from your project's root directory:

```bash
js start
```

## Step 2: Load Your Project Configuration

Confirm that your desired JSphere project configuration is loaded on the running server. If you've recently started the server or switched projects, you might need to explicitly load it:

```bash
js load <your_project_name>
```

Replace `<your_project_name>` with the name of your JSphere project (e.g., `my-elementjs-app`).

## Step 3: Checkout Project Packages (If Not Already Done)

To ensure `elementJS` is installed into your local development environment, your project packages must be checked out. If you haven't already done so, run:

```bash
js checkout
```

This command will clone your project's repositories into your local working directory, allowing the `elementJS` files to be placed correctly.

## Step 4: Install the elementJS Library Files

This is the primary step to get the `elementJS` client-side runtime into your project.

1.  **Execute the Installation Command:**

    ```bash
    js install-element
    ```

The server then downloads the latest versions of `element.js` and `urlpattern.js` files and places them into the `/client/shared` folder of your main application package (e.g., `my-project/client/shared`). This makes the `elementJS` framework available for your client-side components.

## Step 5: Install TypeScript Definitions (Recommended)

If you are using TypeScript for your `elementJS` development (which is highly recommended for type safety and IDE support), install the necessary JSphere TypeScript definition files.

1.  **Execute the Types Installation Command:**

    ```bash
    js install-types
    ```

The server downloads the `jsphere.d.ts` file and places it into the `/server` folder of your main application package (e.g., `my-project/server`)., providing type definitions for the `ServerContext`.

## Verification

After completing these steps, you should find the `element.js` and `urlpattern.js` files within your main project package's `client/shared` directory, and the `jsphere.d.ts` file in your project root or a designated types folder.

You can now begin developing `elementJS` components within your JSphere project, importing `element.js` from its new location.
