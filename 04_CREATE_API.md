# Creating API Endpoints in JSphere

This section will guide you through creating and exposing API endpoints in your JSphere application. You'll learn how to write server-side code, define routes, and understand how JSphere processes requests.

## Pre-requisite Knowledge

Before you begin, it's helpful to have a basic understanding of:

-   **JavaScript/TypeScript:** For writing your server-side logic.
-   **HTTP Methods:** GET, POST, PUT, DELETE, etc.
-   **JSON:** For data exchange.
-   **JSphere Project Structure:** Familiarity with `app.json` and package folders (`server`, `client`, `shared`).

## Understanding API Endpoints in JSphere

In JSphere, an API endpoint is a server-side module that contains functions designed to handle specific HTTP requests (like `onGET`, `onPOST`). These modules are located within the `server` folder of your project packages.

To make an API endpoint accessible to clients, you must define a corresponding route in your project's `app.json` configuration file.

## Steps to Create and Expose an API Endpoint

### 1. Create Your Server-Side API Module

First, you need to write the server-side logic that will handle requests.

Let's create an example API for managing contacts.

```typescript
// File: myproject/server/contact.ts

import type { ServerContext } from "https://esm.sh/gh/greenanttech/jsphere/jsphere.d.ts";

// Define the Contact type for better type safety
export type Contact = {
    id?: string;
    name: string;
};

// In-memory array to store contacts (for demonstration purposes)
const contacts = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Bob Jones' },
    { id: '3', name: 'Jane Doe' }
] as Array<Contact>;

/**
 * Handles POST requests to create a new contact.
 * @param ctx The server context object.
 * @returns A JSON response with the newly created contact.
 */
export async function onPOST(ctx: ServerContext): Promise<Response> {
    const contact = ctx.request.data as Contact;
    // Generate a unique ID for the new contact
    contact.id = ctx.utils.createId();
    contacts.push(contact);
    return ctx.response.json(contact);
}

/**
 * Handles GET requests to retrieve a contact by ID.
 * @param ctx The server context object.
 * @returns A JSON response with the found contact or null if not found.
 */
export async function onGET(ctx: ServerContext): Promise<Response> {
    // Extract the ID from the request parameters
    const id = ctx.request.params.id;
    const contact = contacts.find((c) => c.id === id); // Use strict equality
    return ctx.response.json(contact);
}
```

**Explanation:**

-   **`ServerContext`**: This type provides access to request details (`ctx.request`), response utilities (`ctx.response`), and other server utilities (`ctx.utils`).
-   **`onPOST` / `onGET`**: JSphere automatically maps HTTP methods (POST, GET, PUT, DELETE) to similarly named exported functions (`onPOST`, `onGET`, etc.) within your API module.
-   **`ctx.request.data`**: Contains the request body for methods like POST or PUT.
-   **`ctx.request.params.id`**: Accesses dynamic segments in the route (e.g., `:id`).
-   **`ctx.utils.createId()`**: A utility function provided by JSphere to generate unique IDs.
-   **`ctx.response.json()`**: A utility function to send a JSON response.

### 2. Make Your API Endpoint Accessible (Define Routes in `app.json`)

After creating your API module, you need to tell JSphere how to map incoming HTTP requests to this module. You do this by defining routes in the `routes` property of your `app.json` configuration file.

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
            "route": "/api/contact",
            "path": "/myproject/server/contact.ts"
        },
        {
            "route": "/api/contact/:id",
            "path": "/myproject/server/contact.ts"
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

**Explanation of Routes:**

-   **`"route": "/api/contact"`**: This route will handle requests to `/api/contact`. Since the `contact.ts` module has an `onPOST` function, a POST request to this route will trigger that function.
-   **`"route": "/api/contact/:id"`**: This route handles requests like `/api/contact/123`. The `:id` part is a *named segment*, which means its value (`123` in this example) will be available in `ctx.request.params.id`. A GET request to this route will trigger the `onGET` function in `contact.ts`.
-   **Important: Route Order**: Routes should be ordered from **most specific to least specific**. In our example, `/api/contact/:id` is more specific than `/api/contact`, so it should come first if there were potential conflicts. The `/*` wildcard route is typically placed last as a catch-all.

### 3. Creating an API Streaming Endpoint (Optional)

JSphere also supports streaming API endpoints, which are useful for sending continuous data, such as log updates or real-time events.

```typescript
// File: myproject/server/stream_logs.ts

import type { ServerContext } from "https://esm.sh/gh/greenanttech/jsphere/jsphere.d.ts";

/**
 * Handles GET requests for streaming logs.
 * @param ctx The server context object.
 * @returns A streaming response.
 */
export function onGET(ctx: ServerContext): Response {
    // The stream function takes a 'push' callback and an 'onClose' callback
    const stream = (push: (data: unknown, onClose: () => void) => void) => {
        let counter = 0;
        const interval = setInterval(() => {
            const logEntry = `Log entry #${++counter} at ${new Date().toISOString()}\n`;
            try {
                console.log('Streaming:', counter);
                if (counter === 5) {
                    throw 'Max log entries reached';
                }
                // Push data to the client. onClose is called if the client disconnects.
                push(new TextEncoder().encode(logEntry), () => clearInterval(interval));
            } catch (e) {
                console.error("Stream enqueue failed:", e);
                clearInterval(interval); // Stop the interval on error or max entries
            }
        }, 1000); // Send a log entry every second
    };

    // Return a streaming response with appropriate headers
    return ctx.response.stream(stream, {
        headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "no-cache",
            "connection": "keep-alive" // Keep the connection open for streaming
        }
    });
}
```

**Explanation:**

-   The `onGET` function returns `ctx.response.stream()`, which takes a `stream` function as its first argument.
-   The `stream` function receives a `push` callback and an `onClose` callback.
-   You use `push(data, onClose)` to send data to the client. The `onClose` callback should contain logic to clean up resources (like `clearInterval` for our `setInterval`).
-   Proper `headers` are crucial for streaming to ensure the browser handles the continuous data correctly.

### 4. Add Route for Streaming Endpoint (in `app.json`)

To make the streaming endpoint accessible, you'd add another route to your `app.json`:

```json
// File: .myproject/app.json (excerpt)
{
    "routes": [
        // ... existing routes ...
        {
            "route": "/api/logs/stream",
            "path": "/myproject/server/stream_logs.ts"
        },
        {
            "route": "/*",
            "path": "/myproject/client/index.html"
        }
    ],
    // ... rest of app.json ...
}
```

## Running and Testing Your API Endpoints

1.  **Load Your Project:** Ensure your project configuration is loaded.
    ```bash
    js load myproject
    ```
    (Replace `myproject` with your actual project name).

2.  **Start the JSphere Server:**
    ```bash
    js start
    ```

3.  **Test with a Tool (e.g., cURL, Postman, Browser):**

    -   **GET Contact (by ID):** Open your browser to `http://localhost[:port]/api/contact/1` or use cURL:
        ```bash
        curl http://localhost[:port]/api/contact/1
        ```
        You should get a JSON response like: `{"id":"1","name":"John Doe"}`

    -   **POST Contact (create new):** Use cURL or Postman:
        ```bash
        curl -X POST -H "Content-Type: application/json" -d '{"name": "Alice Smith"}' http://localhost[:port]/api/contact
        ```
        You should get a JSON response with the new contact, including its generated ID.

    -   **GET Streaming Logs:** Open your browser to `http://localhost[:port]/api/logs/stream` or use cURL:
        ```bash
        curl http://localhost[:port]/api/logs/stream
        ```
        You will see log entries appearing continuously in your browser or terminal until 5 entries are sent or you stop the request.

By following these steps, you can effectively create and manage powerful API endpoints within your JSphere applications. Remember to always define routes in `app.json` to make your server-side modules accessible!
