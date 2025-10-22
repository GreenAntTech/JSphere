# Creating and Using Feature Flags in JSphere (Server-Side)

This section will guide you through implementing and utilizing Feature Flags in your JSphere application's server-side code. You'll learn how to dynamically enable or disable features without deploying new versions of your application, providing powerful control over your application's rollout and experimentation.

## Pre-requisite Knowledge

Before you begin, it's helpful to have a basic understanding of:

-   **JavaScript/TypeScript:** For writing your server-side logic.
-   **JSphere Project Structure:** Familiarity with `app.json` and the `server` package folder.
-   **Server Context (`ctx` object):** How to access request, response, and utility objects in JSphere server-side handlers.

## What are Feature Flags?

Feature flags (also known as feature toggles or feature switches) are a software development technique that allows you to turn features on or off during runtime, without deploying new code. This provides significant benefits for server-side applications:

-   **Controlled Rollouts:** Gradually release new API features or backend logic to a subset of users or environments.
-   **A/B Testing:** Experiment with different versions of an algorithm or data processing pipeline.
-   **Emergency Kill Switches:** Quickly disable a problematic backend service or data integration in production.
-   **Decoupled Deployment from Release:** Deploy incomplete features to production, then enable them when ready through configuration.

In JSphere, feature flags are defined in your `app.json` configuration and can be easily accessed in your server-side API endpoints and directives.

## How Feature Flags Work (Server-Side)

1.  **`app.json` Configuration:** You list the names of your enabled feature flags in the `featureFlags` array within your `app.json` file.
2.  **Server-Side Access:** In your server-side code, you use `ctx.feature.flag()` to conditionally execute code based on which flags are enabled.

## Steps to Create and Integrate Server-Side Feature Flags

Let's create an example where we use a feature flag to enable a "Beta API Endpoint" on the server, which might return different data or use a different processing logic.

### 1. Configure Feature Flags in `app.json`

First, open your project's `app.json` file and add the `featureFlags` property, listing the names of the features you want to enable.

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
        }
    ],
    "extensions": {},
    "directives": [],
    "settings": {},
    "featureFlags": [
        "BetaApiEndpoint"
    ]
}
```

**Explanation:**

-   **`"featureFlags": ["BetaApiEndpoint"]`**: This array lists the names of the feature flags that are currently **enabled** for this application configuration. If a feature name is present in this array, it is considered active.

### 2. Implement Server-Side Feature Flag Logic

Now, let's create a server-side API endpoint that behaves differently based on whether the `BetaApiEndpoint` flag is enabled.

Create a new file `myproject/server/data_api.ts`:

```typescript
// File: myproject/server/data_api.ts

import type { ServerContext } from "https://esm.sh/gh/greenanttech/jsphere/jsphere.d.ts";
import * as log from "https://deno.land/std@0.179.0/log/mod.ts";

/**
 * Handles GET requests for data, demonstrating server-side feature flagging.
 * @param ctx The server context object.
 * @returns A JSON response with data.
 */
export async function onGET(ctx: ServerContext): Promise<Response> {
    log.info("Data API: Request received.");

    // Use ctx.feature.flag to conditionally execute code
    const result = await ctx.feature.flag({
        // This code runs if 'BetaApiEndpoint' is enabled
        BetaApiEndpoint: async () => {
            log.info("Data API: Using Beta API endpoint logic.");
            // Simulate fetching data from a new, experimental source or format
            return {
                source: "Beta Service",
                message: "Data from Beta API!",
                version: "beta",
                timestamp: new Date().toISOString(),
                experimentalFeature: true
            };
        },
        // This code runs if 'BetaApiEndpoint' is NOT enabled
        default: async () => {
            log.info("Data API: Using standard API endpoint logic.");
            // Simulate fetching data from the established, stable source
            return {
                source: "Standard Service",
                message: "Data from Standard API.",
                version: "v1",
                timestamp: new Date().toISOString(),
                experimentalFeature: false
            };
        }
    });

    return ctx.response.json(result);
}
```

**Explanation:**

-   **`ctx.feature.flag({...})`**: This is the core mechanism for server-side feature flagging. It takes an object where keys are feature flag names (or comma-separated names for multiple flags) and values are `async` functions to execute.
-   **`BetaApiEndpoint: async () => { ... }`**: If the `BetaApiEndpoint` flag is present in `app.json`, this function will be executed. It simulates a "beta" version of the API, returning different data.
-   **`default: async () => { ... }`**: If none of the specified feature flags are enabled, the `default` function will be executed. This ensures there's always a fallback behavior, in this case, the "standard" API logic.

### 3. Running and Testing Your Server-Side Feature Flags

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

    -   **Access the API with `BetaApiEndpoint` enabled:**
        Open your browser to `http://localhost[:port]/api/data` or use cURL:
        ```bash
        curl http://localhost[:port]/api/data
        ```
        You should receive a JSON response indicating the "Beta Service" is active:
        ```json
        {
          "source": "Beta Service",
          "message": "Data from Beta API!",
          "version": "beta",
          "timestamp": "...",
          "experimentalFeature": true
        }
        ```
        Check your server console for the log message: `Data API: Using Beta API endpoint logic.`

4.  **Modify `app.json` to disable the flag:**

    Edit your `app.json` file and remove the `BetaApiEndpoint` flag:

    ```json
    // File: .myproject/app.json (excerpt)
    {
        // ...
        "featureFlags": [
            // "BetaApiEndpoint" // Comment out or remove to disable
        ]
    }
    ```

    -   **Save `app.json`**. If `PROJECT_RELOAD_ON_CHANGES` is set to `true` in your `jsphere.json` or environment, JSphere will automatically reload. Otherwise, you might need to restart the `js start` command.
    -   Access the API again:
        ```bash
        curl http://localhost[:port]/api/data
        ```
        You should now receive a JSON response indicating the "Standard Service" is active:
        ```json
        {
          "source": "Standard Service",
          "message": "Data from Standard API.",
          "version": "v1",
          "timestamp": "...",
          "experimentalFeature": false
        }
        ```
        Check your server console for the log message: `Data API: Using standard API endpoint logic.`

### Advanced Feature Flag Concepts (Server-Side)

#### Multiple Flags in Server-Side `ctx.feature.flag`

You can specify multiple feature flags for a single server-side branch. The code will execute if *all* specified flags are enabled.

```typescript
// File: myproject/server/advanced_data_api.ts (example)
import type { ServerContext } from "https://esm.sh/gh/greenanttech/jsphere/jsphere.d.ts";
import * as log from "https://deno.land/std@0.179.0/log/mod.ts";

export async function onGET(ctx: ServerContext): Promise<Response> {
    log.info("Advanced Data API: Request received.");

    const result = await ctx.feature.flag({
        // This code runs ONLY if BOTH 'BetaApiEndpoint' AND 'NewAnalyticsEngine' are enabled
        'BetaApiEndpoint,NewAnalyticsEngine': async () => {
            log.info("Advanced Data API: Using Beta API with New Analytics Engine.");
            return { message: "Data from Beta API with New Analytics!", engine: "new" };
        },
        // This code runs if 'BetaApiEndpoint' is enabled, but 'NewAnalyticsEngine' is not
        BetaApiEndpoint: async () => {
            log.info("Advanced Data API: Using Beta API (without New Analytics Engine).");
            return { message: "Data from Beta API (without New Analytics).", engine: "old" };
        },
        // Fallback for when neither specific flag combination is met
        default: async () => {
            log.info("Advanced Data API: Using standard API data.");
            return { message: "Standard API data.", engine: "none" };
        }
    });

    return ctx.response.json(result);
}
```
```json
// To test the above example, you would add a route and update featureFlags in app.json:
// app.json (excerpt)
{
    // ...
    "routes": [
        // ...
        {
            "route": "/api/advanced-data",
            "path": "/myproject/server/advanced_data_api.ts"
        }
    ],
    "featureFlags": [
        "BetaApiEndpoint",
        "NewAnalyticsEngine" // Enable both to hit the first case
    ]
}
```

#### Best Practices for Server-Side Feature Flags

-   **Clean Up Old Flags:** Don't let old, unused feature flags accumulate. Once a feature is fully rolled out and stable, remove the flag and the conditional code. This keeps your codebase clean and reduces complexity.
-   **Granularity:** Choose the right level of granularity for your flags. Some flags might control an entire API version, while others might toggle a specific data transformation or database query.
-   **Naming Convention:** Use clear, descriptive names for your feature flags (e.g., `NewUserAuthFlow`, `OptimizeSearchAlgorithmV2`).
-   **Environment-Specific Flags:** Utilize JSphere's multiple `app.json` files (e.g., `app.dev.json`, `app.prod.json`) to manage different flag states across environments. This allows you to enable experimental features in development/staging without affecting production.
-   **Logging:** Always log when a feature flag branch is taken. This is invaluable for debugging and understanding your application's behaviour in different flag configurations.

By mastering server-side feature flags, you gain powerful control over your application's backend logic, enabling safer deployments, controlled experimentation, and dynamic feature management.
