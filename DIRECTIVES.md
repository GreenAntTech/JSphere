# Creating Directives in JSphere

This section will guide you through creating and configuring directives in your JSphere application. You'll learn how to implement middleware-like functionality to intercept and modify requests and responses, providing powerful control over your application's behavior.

## Pre-requisite Knowledge

Before you begin, it's helpful to have a basic understanding of:

-   **JavaScript/TypeScript:** For writing your directive logic.
-   **HTTP Request/Response Cycle:** How web requests are processed from client to server and back.
-   **JSphere Project Structure:** Familiarity with `app.json` and package folders (`server`).
-   **Server Context (`ctx` object):** How to access request, response, and utility objects.

## What are Directives?

In JSphere, directives are your application's middleware. They are functions that execute at specific points in the request-response pipeline:

1.  **`onRequest`**: Executed *before* the main API endpoint handler or client-side resource is processed. This is ideal for tasks like authentication, logging, request validation, or modifying the incoming request.
2.  **`onResponse`**: Executed *after* the main handler has generated a response but *before* it's sent back to the client. This is useful for tasks like response logging, data transformation, adding security headers, or error handling.

Directives promote modularity by allowing you to centralize cross-cutting concerns that apply to multiple routes or your entire application.

## How Directives Work

1.  **Directive Module:** You create a TypeScript/JavaScript module (e.g., `auth_directive.ts`) that exports an `onRequest` and/or an `onResponse` function.
2.  **`app.json` Configuration:** You register your directive in the `directives` property of your `app.json` file, specifying its URI.
3.  **Execution Order:**
    -   `onRequest` functions are executed in the order they are listed in `app.json`.
    -   `onResponse` functions are executed in the *reverse* order they are listed in `app.json`.

## Steps to Create and Integrate a Directive

Let's create a simple authentication directive that checks for an API key in the request headers.

### 1. Create Your Server-Side Directive Module

Create a new file in your project's `server` folder, for example, `myproject/server/auth_directive.ts`.

```typescript
// File: myproject/server/auth_directive.ts

import type { ServerContext } from "https://esm.sh/gh/greenanttech/jsphere/jsphere.d.ts";
import * as log from "https://deno.land/std@0.179.0/log/mod.ts";

/**
 * Handles incoming requests before they reach the main route handler.
 * This directive checks for an 'X-API-KEY' header.
 * @param ctx The server context object.
 * @returns A Response object to halt processing, or nothing to continue.
 */
export async function onRequest(ctx: ServerContext): Promise<Response | void> {
    const apiKey = ctx.request.headers.get("X-API-KEY");
    log.info(`AuthDirective: Checking API Key for request to ${ctx.request.url}`);

    // Access settings defined in app.json for this directive
    const requiredApiKey = ctx.settings.apiAuthKey;

    if (!apiKey || apiKey !== requiredApiKey) {
        log.warning(`AuthDirective: Unauthorized access attempt to ${ctx.request.url}`);
        // If no API key or invalid, return an unauthorized response immediately
        return ctx.response.json(
            { error: "Unauthorized: Missing or invalid API Key." },
            { status: 401 }
        );
    }

    log.info("AuthDirective: API Key valid. Continuing request processing.");
    // If valid, do nothing to allow the request to proceed to the next directive or route handler
    return;
}

/**
 * Handles outgoing responses after the main route handler has executed.
 * This directive adds a custom header to all responses.
 * @param ctx The server context object.
 * @returns A new Response object to replace the current one, or nothing to use the current one.
 */
export async function onResponse(ctx: ServerContext): Promise<Response | void> {
    log.info(`AuthDirective: Modifying response for request to ${ctx.request.url}`);

    // Get the current response from the context
    const currentResponse = ctx.response.current;

    // Create a new Response object to add/modify headers
    const newResponse = new Response(currentResponse.body, {
        status: currentResponse.status,
        statusText: currentResponse.statusText,
        headers: currentResponse.headers,
    });

    // Add a custom header
    newResponse.headers.set("X-Processed-By", "JSphere-AuthDirective");

    log.info("AuthDirective: Added 'X-Processed-By' header.");
    // Return the new response to replace the original
    return newResponse;
}
```

**Explanation:**

-   **`onRequest(ctx)`**:
    -   Retrieves the `X-API-KEY` header from the incoming request.
    -   Compares it against a `requiredApiKey` that we'll define in `app.json` (via `ctx.settings`).
    -   If the API key is missing or invalid, it immediately returns an `Unauthorized` `Response` object. This stops the request processing pipeline, preventing the request from reaching the actual API endpoint.
    -   If valid, it returns `void` (or nothing), allowing the request to proceed.
-   **`onResponse(ctx)`**:
    -   Accesses the `currentResponse` generated by the API endpoint.
    -   Creates a *new* `Response` object, copying the body, status, and existing headers.
    -   Adds a custom header `X-Processed-By`.
    -   Returns this `newResponse`, which will then be sent to the client.

### 2. Register Your Directive in `app.json`

Now, you need to tell JSphere about your new directive. Open your project's `app.json` file and add an entry under the `directives` property.

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
            "route": "/api/secure-data",
            "path": "/myproject/server/secure_api.ts"
        },
        {
            "route": "/api/public-data",
            "path": "/myproject/server/public_api.ts"
        },
        {
            "route": "/*",
            "path": "/myproject/client/index.html"
        }
    ],
    "extensions": {},
    "directives": [
        "/myproject/server/auth_directive.ts"
    ],
    "settings": {
        "apiAuthKey": "my-secret-api-key-123"
    },
    "featureFlags": []
}
```

**Explanation of `directives` property:**

-   **`"directives": ["/myproject/server/auth_directive.ts"]`**: This array lists the paths to your directive modules. The order matters for execution.
-   **`"settings": { "apiAuthKey": "my-secret-api-key-123" }`**: This demonstrates how you can pass configuration settings to your directives via `ctx.settings`. In a real application, `apiAuthKey` would likely come from an environment variable (e.g., `@ENV:API_KEY`).

### 3. Create Sample API Endpoints to Test

Let's create two simple API endpoints to see the directive in action: one that should be protected and one that's public.

**`myproject/server/secure_api.ts`:**

```typescript
// File: myproject/server/secure_api.ts

import type { ServerContext } from "https://esm.sh/gh/greenanttech/jsphere/jsphere.d.ts";
import * as log from "https://deno.land/std@0.179.0/log/mod.ts";

/**
 * Handles GET requests for secure data. This should only be accessible with a valid API key.
 * @param ctx The server context object.
 * @returns A JSON response with secure data.
 */
export async function onGET(ctx: ServerContext): Promise<Response> {
    log.info("Secure API: Request successfully reached handler.");
    return ctx.response.json({ message: "Welcome to the secure zone!", data: { secret: "top_secret_info" } });
}
```

**`myproject/server/public_api.ts`:**

```typescript
// File: myproject/server/public_api.ts

import type { ServerContext } from "https://esm.sh/gh/greenanttech/jsphere/jsphere.d.ts";
import * as log from "https://deno.land/std@0.179.0/log/mod.ts";

/**
 * Handles GET requests for public data. This should be accessible without an API key.
 * @param ctx The server context object.
 * @returns A JSON response with public data.
 */
export async function onGET(ctx: ServerContext): Promise<Response> {
    log.info("Public API: Request successfully reached handler.");
    return ctx.response.json({ message: "Hello from the public API!", data: { info: "anyone can see this" } });
}
```

**Note:** For the `public_api.ts` to truly bypass the `auth_directive`, you would typically add a more granular routing system or conditional logic within the directive itself to skip certain paths. For this tutorial, all routes will pass through the directive.

### 4. Running and Testing Your Directive

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

    -   **Access Secure API (Unauthorized):**
        ```bash
        curl http://localhost[:port]/api/secure-data
        ```
        You should receive a `401 Unauthorized` response with `{"error": "Unauthorized: Missing or invalid API Key."}`.

    -   **Access Secure API (Authorized):**
        ```bash
        curl -H "X-API-KEY: my-secret-api-key-123" http://localhost[:port]/api/secure-data
        ```
        You should receive a `200 OK` response with `{"message": "Welcome to the secure zone!", "data": {"secret": "top_secret_info"}}` and the `X-Processed-By: JSphere-AuthDirective` header.

    -   **Access Public API (Unauthorized - Still processed by directive):**
        ```bash
        curl http://localhost[:port]/api/public-data
        ```
        You should receive a `401 Unauthorized` response. (As noted above, for a truly public API, you'd need to add logic within the directive to bypass specific paths or use more advanced routing.)

    -   **Access Public API (Authorized):**
        ```bash
        curl -H "X-API-KEY: my-secret-api-key-123" http://localhost[:port]/api/public-data
        ```
        You should receive a `200 OK` response with `{"message": "Hello from the public API!", "data": {"info": "anyone can see this"}}` and the `X-Processed-By: JSphere-AuthDirective` header.

    -   Check your server console for the log messages from `AuthDirective` confirming its execution.

### Advanced Directive Concepts

#### Execution Order

If you have multiple directives:

```json
"directives": [
    "/myproject/server/logging_directive.ts",
    "/myproject/server/auth_directive.ts",
    "/myproject/server/cors_directive.ts"
]
```

-   **`onRequest` Execution:**
    1.  `logging_directive.ts`'s `onRequest`
    2.  `auth_directive.ts`'s `onRequest`
    3.  `cors_directive.ts`'s `onRequest`
    4.  (Then the main route handler)

-   **`onResponse` Execution:**
    1.  `cors_directive.ts`'s `onResponse` (executed last, but declared last in `app.json`)
    2.  `auth_directive.ts`'s `onResponse`
    3.  `logging_directive.ts`'s `onResponse` (executed first, but declared first in `app.json`)

This reverse order for `onResponse` allows directives to wrap or modify responses in a logical sequence.

#### Stopping the Pipeline

-   If an `onRequest` function returns a `Response` object, the pipeline stops immediately, and that response is sent back to the client. No subsequent `onRequest` directives or the main route handler will execute. However, `onResponse` directives *will still execute* in reverse order, **starting from the directive immediately preceding the one that returned the response.** This allows preceding directives to potentially modify the error response before it is sent to the client.

#### Modifying the Request/Response

-   In `onRequest`, you can directly modify `ctx.request` properties (e.g., add a user object after authentication).
-   In `onResponse`, you can return a *new* `Response` object to completely replace the one generated by the route handler, or modify `ctx.response.current` (though creating a new `Response` is often safer and clearer for complex changes).

By mastering directives, you can build robust and maintainable JSphere applications with well-defined cross-cutting concerns.
