# JSphere Server Context - The Core of Server-Side Logic

The `ServerContext` object, commonly referred to as `ctx`, is an indispensable parameter passed to all server-side handlers in JSphere. Whether you're writing API endpoints, directives, or extension logic, `ctx` provides everything you need to interact with the request, construct responses, and leverage your application's configured services.

## Accessing the Context

You'll receive the `ServerContext` object in your API module functions (e.g., `onGET`, `onPOST`) and directive functions (`onRequest`, `onResponse`).

```typescript
// In an API module (e.g., myproject/server/users_api.ts)
import type { ServerContext } from "https://esm.sh/gh/greenanttech/jsphere/jsphere.d.ts";

export async function onGET(ctx: ServerContext): Promise<Response> {
    // Your code here to handle GET requests. No need to check ctx.request.method === 'GET'
    return ctx.response.json({ message: "Hello from GET!" });
}

export async function onPOST(ctx: ServerContext): Promise<Response> {
    // Your code here to handle POST requests. No need to check ctx.request.method === 'POST'
    const data = ctx.request.data;
    return ctx.response.json({ received: data, message: "Hello from POST!" });
}

// In a directive (e.g., myproject/server/auth_directive.ts)
export async function onRequest(ctx: ServerContext): Promise<Response | void> {
    // Here, you might need to check ctx.request.method if the directive
    // behaves differently for various HTTP methods.
    if (ctx.request.method === 'OPTIONS') {
        // Handle CORS preflight
        return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE', 'Access-Control-Allow-Headers': 'Content-Type' } });
    }
    // Continue processing
    return;
}

export async function onResponse(ctx: ServerContext): Promise<Response | void> {
    // Your code here to process outgoing responses
    return; // Use the current response
}
```

## Anatomy of the `ctx` Object

The `ServerContext` object encapsulates a wealth of information and functionality:

```typescript
ctx.request         // Details about the incoming HTTP request
ctx.response        // Utilities for creating and manipulating HTTP responses
ctx.utils           // General-purpose helper functions (e.g., ID generation, hashing)
ctx.user            // A mutable object for storing user-specific data during a request lifecycle
ctx.settings        // Access to your application's settings defined in app.json
ctx.getPackageItem  // Function to retrieve files from your project packages
ctx.cache           // (Optional) Cache extension for data storage
ctx.[extension]     // Any custom extensions configured in app.json (e.g., ctx.db, ctx.email)
ctx.feature         // (Optional) Feature flag extension for conditional logic
```

Let's explore each property in detail.

---

### `ctx.request` - Understanding the Incoming Request

The `ctx.request` object provides comprehensive access to all aspects of the client's HTTP request.

#### Request Information

```typescript
// URL and path details
const url: URL = ctx.request.url;           // The full URL object (standard Web API URL)
const pathname: string = url.pathname;         // e.g., "/api/users/123"
const hostname: string = url.hostname;         // e.g., "myapp.com"
const protocol: string = url.protocol;         // e.g., "http:", "https:"

// HTTP Method
const method: string = ctx.request.method; // e.g., "GET", "POST", "PUT", "DELETE"
// Inside an API module's onGET, onPOST, etc., you don't need to check this.
// For example, in onGET, `method` will always be 'GET'.

// Query parameters (from the URL, e.g., ?page=1&search=query)
const page: string | undefined = ctx.request.params.page;      // From ?page=1
const search: string | undefined = ctx.request.params.search;  // From ?search=query

// URL Path Parameters (from routes like /users/:id)
// If route is "/api/users/:id" and request is "/api/users/42"
const userId: string | undefined = ctx.request.params.id; // '42'

// Headers
const authHeader: string | null = ctx.request.headers.get('authorization');
const contentType: string | null = ctx.request.headers.get('content-type');

// Cookies
const sessionId: string | undefined = ctx.request.cookies.sessionId;
const userIdCookie: string | undefined = ctx.request.cookies.userId;
```

#### Request Body (`ctx.request.data`)

The `ctx.request.data` property contains the parsed body of the request. Its type depends on the `Content-Type` header of the incoming request.

```typescript
// For JSON requests (Content-Type: application/json)
// Example: POST /api/users with body: { "name": "Alice", "email": "alice@example.com" }
// Inside an onPOST function:
    // It's good practice to validate and type-assert the data
    const data = ctx.request.data as { name: string; email: string };
    if (data && typeof data.name === 'string' && typeof data.email === 'string') {
        console.log(`Received user: ${data.name}, ${data.email}`);
        // Process data...
    } else {
        // Handle invalid data
    }


// For form submissions (Content-Type: application/x-www-form-urlencoded or multipart/form-data)
// Inside an onPOST function handling form data:
    const contentTypeHeader = ctx.request.headers.get('content-type');
    if (contentTypeHeader?.includes('application/x-www-form-urlencoded') || contentTypeHeader?.includes('multipart/form-data')) {
        const formData = ctx.request.data as Record<string, string>;
        const username = formData.username;
        const password = formData.password;
        console.log(`Login attempt for: ${username}`);
    }
```

#### File Uploads (`ctx.request.files`)

When `Content-Type` is `multipart/form-data` and includes file fields, `ctx.request.files` will contain an array of `FileUpload` objects.

```typescript
// Example: POST /upload with a file attached
// Inside an onPOST function handling file uploads:
if (ctx.request.files.length > 0) {
    const file = ctx.request.files[0]; // Assuming a single file upload

    console.log('Filename:', file.filename);   // Original name, e.g., "document.pdf"
    console.log('Size:', file.size);           // Size in bytes
    console.log('Type:', file.type);           // MIME type, e.g., "application/pdf"
    console.log('Field Name:', file.name);     // The name of the form field, e.g., "myFile"

    // File content as a Uint8Array (binary data)
    const content: Uint8Array = file.content;

    // You can save this content to disk, upload to cloud storage, etc.
    // await Deno.writeFile(`./uploads/${file.filename}`, content);
    return ctx.response.json({ message: `File ${file.filename} uploaded successfully!` });
} else {
    return ctx.response.json({ error: 'No file uploaded' }, 400);
}
```

---

### `ctx.response` - Crafting Responses

The `ctx.response` object provides a fluent API for generating various types of HTTP responses.

#### JSON Response

Returns data as `application/json`.

```typescript
// Basic JSON response with default status 200 OK
return ctx.response.json({
    success: true,
    data: { id: 1, name: 'Example' },
    timestamp: new Date().toISOString()
});

// JSON response with a custom status code (e.g., 404 Not Found)
return ctx.response.json({ error: 'Resource not found' }, 404);

// JSON response with custom headers
return ctx.response.json(
    { message: 'Created successfully' },
    { status: 201, headers: { 'X-Custom-Header': 'New Resource' } }
);
```

#### HTML Response

Returns content as `text/html`.

```typescript
const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><title>Welcome</title></head>
    <body><h1>Hello, JSphere!</h1></body>
    </html>
`;
return ctx.response.html(new TextEncoder().encode(htmlContent));

// With custom status and headers
return ctx.response.html(
    new TextEncoder().encode('<h1>Moved</h1>'),
    { status: 302, headers: { 'Location': '/new-page' } }
);
```

#### Text Response

Returns plain text content as `text/plain`.

```typescript
return ctx.response.text(new TextEncoder().encode('This is a plain text message.'));

// With custom status and headers
return ctx.response.text(
    new TextEncoder().encode('Error occurred!'),
    { status: 500, headers: { 'X-Error-Code': 'E101' } }
);
```

#### Redirects

Sends a redirect response to the client.

```typescript
// Temporary redirect (302 Found - default if status not specified)
return ctx.response.redirect('/login');

// Permanent redirect (301 Moved Permanently)
return ctx.response.redirect('https://newdomain.com/dashboard', 301);

// SeeOther redirect (303 See Other) - often used after POST requests
return ctx.response.redirect('/success-page', 303);
```

#### Custom Response (`ctx.response.send`)

For full control over the response body, status, and headers.

```typescript
// Example: Returning XML content
const xmlContent = '<root><message>Hello XML!</message></root>';
return ctx.response.send(
    new TextEncoder().encode(xmlContent),
    {
        status: 200,
        headers: {
            'content-type': 'application/xml',
            'X-Generated-By': 'JSphere'
        }
    }
);
```

#### Streaming Response (`ctx.response.stream`)

Ideal for Server-Sent Events (SSE), real-time logs, or large data transfers.

```typescript
// Example: Server-Sent Events (SSE) for real-time updates
export function onGET(ctx: ServerContext): Response { // This function would be named onGET for an API module
    return ctx.response.stream(
        (push) => {
            let counter = 0;
            const interval = setInterval(() => {
                const data = `data: ${JSON.stringify({ event: 'update', value: ++counter, timestamp: Date.now() })}\n\n`;
                try {
                    // Push data to the client. The second argument is a cleanup function.
                    push(new TextEncoder().encode(data), () => {
                        console.log('Client disconnected, clearing interval.');
                        clearInterval(interval);
                    });
                } catch (e) {
                    console.error("Stream push failed, client likely disconnected:", e);
                    clearInterval(interval); // Stop interval on push failure
                }
            }, 1000); // Send an update every second

            // Return a cleanup function for when the stream is closed by the server
            return () => {
                console.log('Server closing stream, ensuring interval is cleared.');
                clearInterval(interval);
            };
        },
        {
            headers: {
                'content-type': 'text/event-stream',
                'cache-control': 'no-cache',
                'connection': 'keep-alive' // Essential for SSE
            }
        }
    );
}
```

#### `ctx.response.current` (in `onResponse` directives)

In `onResponse` directive functions, `ctx.response.current` provides access to the `Response` object that was generated by the main handler or a preceding `onResponse` directive. You can read its properties or use it to construct a new `Response`.

```typescript
// In an onResponse directive
export async function onResponse(ctx: ServerContext): Promise<Response | void> {
    const currentResponse = ctx.response.current;
    if (currentResponse) {
        console.log(`Response status: ${currentResponse.status}`);

        // Example: Add a custom header to the response
        const newHeaders = new Headers(currentResponse.headers);
        newHeaders.set('X-Processed-By-Directive', 'true');

        return new Response(currentResponse.body, {
            status: currentResponse.status,
            statusText: currentResponse.statusText,
            headers: newHeaders
        });
    }
    return; // No response to modify, or return void to use currentResponse
}
```

---

### `ctx.utils` - Handy Helper Functions

The `ctx.utils` object provides a collection of common utility functions for various server-side tasks.

#### `ctx.utils.createId()` - Generate Unique IDs

Creates a cryptographically strong, globally unique identifier.

```typescript
const newUserId: string = ctx.utils.createId();      // e.g., "clv61p94m00001l0892c1d2e"
const orderTrackingId: string = ctx.utils.createId();
console.log(`Generated ID: ${newUserId}`);
```

#### `ctx.utils.createHash(value: string)` - Hash Values

Generates a secure hash of a given string, suitable for password storage. Uses a strong, adaptive hashing algorithm.

```typescript
const userPassword = 'mySecurePassword123';
const hashedPassword = await ctx.utils.createHash(userPassword);
console.log(`Hashed password: ${hashedPassword}`);

// Store hashedPassword in your database
```

#### `ctx.utils.compareWithHash(value: string, hash: string)` - Compare with Hash

Compares a plain string with a previously generated hash. Returns `true` if they match, `false` otherwise.

```typescript
const inputPassword = 'mySecurePassword123';
// Retrieve storedHash from your database
const storedHash = '$2a$10$abcdefghijklmnopqrstuvw.xyz0123456789...'; // Example hash

const isValidPassword = await ctx.utils.compareWithHash(inputPassword, storedHash);
if (isValidPassword) {
    console.log('Password is correct!');
} else {
    console.log('Invalid password.');
}
```

#### `ctx.utils.encrypt(data: string, key: string)` - Encrypt Data

Encrypts a string using a symmetric encryption algorithm. Requires an encryption key.

```typescript
const sensitiveData = '1234-5678-9012-3456'; // e.g., credit card number
const encryptionKey = 'your-secret-32-byte-key-here-123'; // Must be a secure, fixed-length key

const encryptedData = await ctx.utils.encrypt(sensitiveData, encryptionKey);
console.log(`Encrypted data: ${encryptedData}`);
```

#### `ctx.utils.decrypt(encryptedData: string, key: string)` - Decrypt Data

Decrypts a previously encrypted string. Requires the same encryption key used for encryption.

```typescript
const encryptedDataFromDb = 'AES256:g/oN...'; // Example encrypted string
const encryptionKey = 'your-secret-32-byte-key-here-123';

const decryptedData = await ctx.utils.decrypt(encryptedDataFromDb, encryptionKey);
console.log(`Decrypted data: ${decryptedData}`);
```

#### `ctx.utils.generateKeyPair()` - Generate Key Pair

Generates an asymmetric cryptographic key pair (public and private keys). Useful for digital signatures or asymmetric encryption.

```typescript
const [publicKey, privateKey] = await ctx.utils.generateKeyPair();
console.log('Public Key:', publicKey);
console.log('Private Key:', privateKey);
// Store privateKey securely, share publicKey
```

---

### `ctx.user` - Managing User Data

The `ctx.user` object is a simple `Record<string, unknown>` that allows you to store and retrieve user-specific data throughout the lifecycle of a single request. It's particularly useful in authentication directives to attach user information that subsequent API handlers can then access.

```typescript
// In an authentication directive (e.g., myproject/server/auth_directive.ts)
export async function onRequest(ctx: ServerContext): Promise<Response | void> {
    const authToken = ctx.request.headers.get('Authorization');
    if (authToken) {
        // Simulate token verification
        const user = await verifyAuthToken(authToken); // Your function to verify token
        if (user) {
            // Store user data in ctx.user
            ctx.user.id = user.id;
            ctx.user.email = user.email;
            ctx.user.role = user.role;
            console.log(`User ${user.email} authenticated.`);
            return; // Continue processing
        }
    }
    // If authentication fails, return an unauthorized response
    return ctx.response.json({ error: 'Unauthorized' }, 401);
}

// In a protected API endpoint (e.g., myproject/server/profile_api.ts)
export async function onGET(ctx: ServerContext): Promise<Response> {
    // Access user data set by the authentication directive
    if (ctx.user.id && ctx.user.role === 'admin') {
        return ctx.response.json({ message: `Welcome, Admin ${ctx.user.email}!`, userId: ctx.user.id });
    } else if (ctx.user.id) {
        return ctx.response.json({ message: `Welcome, User ${ctx.user.email}!`, userId: ctx.user.id });
    }
    // This case should ideally be caught by an auth directive earlier
    return ctx.response.json({ error: 'Forbidden' }, 403);
}
```

---

### `ctx.settings` - Application-Wide Configuration

The `ctx.settings` object provides access to the `settings` property defined in your `app.json` file. This is perfect for storing global configuration values that your server-side code needs.

```json
// File: .myproject/app.json (excerpt)
{
    "settings": {
        "apiKey": "@ENV:APP_API_KEY",
        "maxUploadSizeMB": 10,
        "debugMode": false,
        "defaultLocale": "en-US"
    }
}
```

```typescript
// In your server-side code (e.g., in an API module's onPOST or a directive)
const apiKey: string | undefined = ctx.settings?.apiKey as string; // Use optional chaining and type assertion
const maxUploadSize: number | undefined = ctx.settings?.maxUploadSizeMB as number;
const debugMode: boolean | undefined = ctx.settings?.debugMode as boolean;

if (debugMode) {
    console.log('Application is running in debug mode.');
}

// Example usage in a file upload handler (e.g., onPOST for /upload)
// This code would be inside an onPOST function, not checking method again.
if (maxUploadSize && ctx.request.files.length > 0 && ctx.request.files[0].size > maxUploadSize * 1024 * 1024) {
    return ctx.response.json({ error: `File too large, max size is ${maxUploadSize}MB` }, 400);
}
```

---

### `ctx.getPackageItem(path: string)` - Accessing Package Files

This function allows you to retrieve the content of any file within your project's packages. It's useful for loading templates, configuration files, or other assets that are part of your deployed packages.

```typescript
// Example: Loading an HTML email template (e.g., in an onPOST for sending emails)
const emailTemplateItem = await ctx.getPackageItem('/myproject/server/templates/welcome_email.html');

if (emailTemplateItem && emailTemplateItem.content) {
    const htmlTemplate: string = new TextDecoder().decode(emailTemplateItem.content);
    // Process template (e.g., replace placeholders)
    const personalizedHtml = htmlTemplate.replace('{{userName}}', ctx.user.name || 'User');
    // Send email...
} else {
    console.error('Welcome email template not found.');
}

// Example: Loading a JSON configuration file (e.g., in an onGET for app config)
const configItem = await ctx.getPackageItem('/myproject/shared/config/app_constants.json');
if (configItem && configItem.content) {
    const appConstants = JSON.parse(new TextDecoder().decode(configItem.content));
    console.log('Loaded app constants:', appConstants);
}
```

---

### `ctx.cache` - Caching Extension

If you have configured a cache extension in your `app.json`, it will be available as `ctx.cache`. This provides a simple key-value store for frequently accessed data, reducing database load or external API calls.

```json
// File: .myproject/app.json (excerpt)
{
    "extensions": {
        "cache": {
            "uri": "https://esm.sh/gh/greenanttech/jsphere/extensions/cache.ts",
            "settings": {
                "ttl": 3600 // Default time-to-live for cache entries in seconds
            }
        }
    }
}
```

```typescript
// In your server-side code (e.g., in an onGET for fetching user profile)
// This code would be inside an onGET function.
if (ctx.cache) { // Always check if the extension is available
    const cacheKey = `user:${ctx.user.id}:profile`;

    // Try to get data from cache
    let userProfile = await ctx.cache.get(cacheKey);

    if (!userProfile) {
        // Cache miss: fetch from source (e.g., database)
        userProfile = await fetchUserProfileFromDatabase(ctx.user.id);
        if (userProfile) {
            // Store in cache for 5 minutes (300 seconds)
            await ctx.cache.set(cacheKey, userProfile, 300);
        }
    }
    return ctx.response.json({ profile: userProfile });
} else {
    // Handle case where cache is not configured
    console.warn('Cache extension not available.');
    // Fallback to direct database fetch
    const userProfile = await fetchUserProfileFromDatabase(ctx.user.id);
    return ctx.response.json({ profile: userProfile });
}
```

---

### `ctx.feature` - Feature Flag Extension

The `ctx.feature` object, if configured, provides a powerful way to implement conditional logic based on feature flags defined in `app.json`.

```json
// File: .myproject/app.json (excerpt)
{
    "featureFlags": [
        "NewDashboardLayout",
        "ExperimentalSearchAlgorithm"
    ]
}
```

```typescript
// In your server-side code (e.g., in an onGET for dashboard data)
// This code would be inside an onGET function.
await ctx.feature.flag({
    // This function executes if 'NewDashboardLayout' is enabled
    NewDashboardLayout: async () => {
        console.log('Using new dashboard layout logic.');
        // Return data for new layout
        return ctx.response.json({ layout: 'new', data: getNewDashboardData() });
    },
    // This function executes if 'ExperimentalSearchAlgorithm' is enabled
    ExperimentalSearchAlgorithm: async () => {
        console.log('Using experimental search algorithm.');
        // Return data using experimental search
        return ctx.response.json({ search: 'experimental', results: runExperimentalSearch() });
    },
    // This function executes if none of the above are enabled
    default: async () => {
        console.log('Using default logic.');
        // Return default data
        return ctx.response.json({ layout: 'old', data: getDefaultDashboardData() });
    }
});

// You can also check individual flags directly (though `flag` is often more structured)
if (ctx.feature.isEnabled('NewDashboardLayout')) {
    console.log('New dashboard layout is active.');
}
```

---

### `ctx.[extension_name]` - Custom Extensions

Any custom server context extensions you define in your `app.json` will be attached to the `ctx` object under the name you specify.

```json
// File: .myproject/app.json (excerpt)
{
    "extensions": {
        "db": { // This extension will be available as ctx.db
            "uri": "/myproject/server/my_db_extension.ts",
            "settings": {
                "dbHostname": "my-database.com",
                "dbUsername": "admin",
                "dbPassword": "@ENV:DB_PASSWORD"
            }
        },
        "email": { // This extension will be available as ctx.email
            "uri": "/myproject/server/email_service.ts",
            "settings": {
                "apiKey": "@ENV:EMAIL_API_KEY"
            }
        }
    }
}
```

```typescript
// In your API module or directive (e.g., in an onPOST for user creation)
// This code would be inside an onPOST function.
export async function onPOST(ctx: ServerContext): Promise<Response> {
    const { name, email } = ctx.request.data as { name: string; email: string };

    if (ctx.db) { // Always check for extension existence
        await ctx.db.saveUser({ name, email });
        console.log(`User ${name} saved to database.`);
    }

    if (ctx.email) { // Always check for extension existence
        await ctx.email.sendWelcomeEmail(email, name);
        console.log(`Welcome email sent to ${email}.`);
    }

    return ctx.response.json({ message: 'User created and welcome email sent!' }, 201);
}
```

---

## Best Practices for Using `ServerContext`

1.  **Always Type Your Context:** Use `import type { ServerContext } from "https://esm.sh/gh/greenanttech/jsphere/jsphere.d.ts";` for better type checking and autocompletion.
2.  **Check for Optional Properties/Extensions:** Before using `ctx.cache`, `ctx.db`, `ctx.settings?.someProperty`, etc., always check if they exist or use optional chaining (`?.`) to prevent runtime errors if they are not configured.
3.  **Validate Input:** Always validate `ctx.request.data` and `ctx.request.params` to ensure data integrity and security.
4.  **Handle Errors Gracefully:** Wrap potentially failing operations (e.g., database calls, external API calls) in `try...catch` blocks and return appropriate error responses.
5.  **Return `Response` or `void` in Directives:**
    -   Return a `Response` object to immediately stop the request processing pipeline and send that response to the client.
    -   Return `void` (or nothing) to allow the request to proceed to the next handler in the pipeline.
6.  **Use `ctx.user` for Request-Scoped User Data:** Avoid passing user objects directly between functions; `ctx.user` is designed for this purpose.
7.  **No `ctx.request.method` Checks in API Modules:** Rely on JSphere's automatic routing to `onGET`, `onPOST`, etc., functions. Only check `ctx.request.method` within directives if their behavior needs to vary by HTTP verb.

By following these guidelines and leveraging the comprehensive features of the `ServerContext` object, you can build powerful, modular, and maintainable JSphere applications.
