# Creating Your First elementJS Component

This tutorial will walk you through the fundamental steps of creating an elementJS component, focusing on the three most crucial lifecycle methods for defining its structure, populating its content, and adding interactivity.

 **Core Concepts You'll Learn:**

*   **`el-is`**: How elementJS identifies a component.
*   **`el-id`**: How to uniquely identify elements within a component's template for programmatic access.
*   **`createComponent$`**: The function to register your new component.
*   **`template$`**: Defining the HTML structure of your component.
*   **`onRender$`**: Populating the component's content (runs on both server and client).
*   **`onHydrate$`**: Adding interactivity (runs only on the client).

---

 **Step 1: Understanding `el-is` and `el-id`**

Before we write any JavaScript, let's understand how elementJS identifies and manages components in your HTML.

*   **`el-is="component-name"`**: This attribute tells elementJS that a particular HTML element should be treated as an instance of your registered component. For example, `<div el-is="my-greeting" el-id="mainGreeting"></div>` would instantiate a component named `my-greeting`.
*   **`el-id="uniqueId"`**: This attribute is used *within* your component's HTML template to give specific HTML elements a unique identifier. This allows you to easily access and manipulate these elements from your component's JavaScript code using `el.children$`.

    *   **Important Note**: If multiple HTML elements within a single component's template share the same `el-id`, `el.children$` will return an *array* of those elements. If only one element has that `el-id`, it will return the single HTML element.

---

 **Step 2: Component Structure and `createComponent$`**

All elementJS components are defined using the `createComponent$` function. This function registers your component with the elementJS runtime, making it available for use in your application.

Let's create a simple "Hello World" component.

**File:** `my-greeting.js` (e.g., in `my-project/client/components/controls/my-greeting/`)

```javascript
import { createComponent$ } from "/my-project/client/shared/element.js"; // Adjust path as needed

createComponent$('my-greeting', (el) => {
    // Component logic will go here
});
```

*   `createComponent$('my-greeting', ...)`: Registers a component named `my-greeting`. This is the name you'll use in the `el-is` attribute in your HTML.
*   `(el) => { ... }`: The `el` parameter is a reference to the HTML element that your component is attached to. It's your primary interface for interacting with the component's own DOM, its children, and elementJS's built-in functionalities.

---

 **Step 3: Defining the Component's Template with `template$`**

The `template$` lifecycle method is where you define the HTML structure of your component. This can be an inline string or a path to an external HTML file.

Let's add a basic structure for our greeting.

**File:** `my-greeting.js` (continued)

```javascript
import { createComponent$ } from "/my-project/client/shared/element.js";

createComponent$('my-greeting', (el) => {
    el.define$({
        template$: (props) => /*html*/`
            <style>
                .greeting-container {
                    font-family: sans-serif;
                    padding: 15px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    background-color: #f9f9f9;
                    text-align: center;
                }
                .greeting-text {
                    color: #333;
                    font-size: 24px;
                    margin-bottom: 10px;
                }
                .greeting-name {
                    color: #007bff;
                    font-weight: bold;
                }
            </style>
            <div class="greeting-container">
                <p class="greeting-text" el-id="message"></p>
                <button el-id="greetButton">Say Hello</button>
            </div>
        `
    });
});
```

*   `el.define$({...})`: This method is used to define the component's lifecycle methods and any custom properties or methods.
*   `template$: (props) => /*html*/`...`: This defines our component's HTML.
    *   The `/*html*/` comment is a common IDE hint for syntax highlighting.
    *   We've included inline `<style>` for simplicity in this example. In a real application, you might use the `onStyle$` method or link to an external CSS file.
    *   Notice the `el-id="message"` on the `<p>` tag and `el-id="greetButton"` on the `<button>`. These are crucial for accessing these specific elements from our JavaScript.

---

 **Step 4: Populating Content with `onRender$`**

The `onRender$` lifecycle method is responsible for populating the static content of your component's template. This method runs on **both the server and the client**.

*   **Purpose**: Set `textContent`, `innerHTML`, `innerText`, or attributes based on the `props` passed to the component.
*   **Key Rule**: Do NOT attach event listeners here. This is for static content only.

Let's use `onRender$` to display a dynamic message.

**File:** `my-greeting.js` (continued)

```javascript
import { createComponent$ } from "/my-project/client/shared/element.js";

createComponent$('my-greeting', (el) => {
    el.define$({
        template$: (props) => /*html*/`
            <style>
                .greeting-container {
                    font-family: sans-serif;
                    padding: 15px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    background-color: #f9f9f9;
                    text-align: center;
                }
                .greeting-text {
                    color: #333;
                    font-size: 24px;
                    margin-bottom: 10px;
                }
                .greeting-name {
                    color: #007bff;
                    font-weight: bold;
                }
            </style>
            <div class="greeting-container">
                <p class="greeting-text" el-id="message"></p>
                <button el-id="greetButton">Say Hello</button>
            </div>
        `,
        onRender$: async (props) => {
            // Access elements using el.children$
            const { message } = el.children$;

            // Set the initial text content based on props
            const name = props.name || 'World';
            message.textContent = `Hello, ${name}! Welcome to elementJS.`;
        }
    });
});
```

*   `props`: The `onRender$` method receives an object (`props`) containing any attributes passed to your component in the HTML. For example, `<div el-is="my-greeting" name="Yohan"></div>` would pass `{ name: "Yohan" }` to `props`.
*   `const { message } = el.children$;`: This is the recommended way to get references to your template's HTML elements. `el.children$` is an object where keys are `el-id` values and values are the corresponding HTML elements (or arrays of elements).

---

 **Step 5: Adding Interactivity with `onHydrate$`**

The `onHydrate$` lifecycle method is where you add all client-side interactivity to your component. This method runs **only on the client** after the `onRender$` method has completed.

*   **Purpose**: Attach event listeners, initialize third-party JavaScript libraries, or perform any DOM manipulations that require a fully interactive browser environment.
*   **Key Rule**: All event listeners MUST be attached here.

Let's make our button interactive.

**File:** `my-greeting.js` (continued)

```javascript
import { createComponent$ } from "/my-project/client/shared/element.js";

createComponent$('my-greeting', (el) => {
    el.define$({
        template$: (props) => /*html*/`
            <style>
                .greeting-container {
                    font-family: sans-serif;
                    padding: 15px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    background-color: #f9f9f9;
                    text-align: center;
                }
                .greeting-text {
                    color: #333;
                    font-size: 24px;
                    margin-bottom: 10px;
                }
                .greeting-name {
                    color: #007bff;
                    font-weight: bold;
                }
            </style>
            <div class="greeting-container">
                <p class="greeting-text" el-id="message"></p>
                <button el-id="greetButton">Say Hello</button>
            </div>
        `,
        onRender$: async (props) => {
            const { message } = el.children$;
            const name = props.name || 'World';
            message.textContent = `Hello, ${name}! Welcome to elementJS.`;
        },
        onHydrate$: async (props) => {
            const { greetButton, message } = el.children$;
            const name = props.name || 'World';

            // Attach an event listener to the button
            greetButton.addEventListener('click', () => {
                message.textContent = `You clicked the button, ${name}!`;
                console.log(`Button clicked for ${name}`);
            });
        }
    });
});
```

---

# Step 6: Using Your New Component in HTML (with `renderDocument$`)

Now that your component is defined, you can use it in any HTML file served by JSphere. The key is to ensure that `renderDocument$` is called to kickstart the elementJS process.

**File:** `index.html` (e.g., in `my-project/client/`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My elementJS App</title>
</head>
<body>
    <h1>My elementJS Greetings</h1>

    <!-- Instance 1: Default greeting -->
    <div el-is="my-greeting" el-id="defaultGreeting"></div>

    <!-- Instance 2: Personalized greeting -->
    <div el-is="my-greeting" el-id="personalizedGreeting" name="Yohan"></div>

    <!--
        Include element.js and your component.
        The path to element.js might vary based on your JSphere project setup.
        Ensure element.js is loaded BEFORE your component definitions.
    -->
    <script type="module" src="/my-project/client/components/controls/my-greeting/my-greeting.js"></script>

    <!--
        CRITICAL: Call renderDocument$ to initialize elementJS and your components.
        This script should run after all component definitions are loaded.
    -->
    <script type="module">
        import { renderDocument$ } from "/my-project/client/shared/element.js";

        // Initialize elementJS on the client side
        renderDocument$();
    </script>
</body>
</html>
```

---

 **Explanation of `renderDocument$()`'s Role:**

The `renderDocument$` function is the entry point for elementJS on the client side. When you include it in your HTML:

1.  **It detects the environment:** `renderDocument$` determines that it's running in a client (browser) environment.
2.  **Initializes the root component:** It treats the entire `document.documentElement` (the `<html>` tag) as the root `document` component.
3.  **Scans for `el-is` attributes:** It then traverses the DOM, looking for all elements with an `el-is` attribute.
4.  **Initiates component lifecycles:** For each found component (like our `my-greeting` instances), it begins their lifecycle:
    *   It first checks if the document was server-rendered (via `el-server-rendered`). If so, it proceeds directly to hydration.
    *   If not server-rendered, or if it's a client-only component, it will call `onInit$`, `onStyle$`, `onTemplate$`, `onRender$`, and finally `onHydrate$`.
5.  **Attaches Interactivity:** Crucially, it ensures that the `onHydrate$` methods of all components are called, making them interactive.

By adding the `renderDocument$()` call, we explicitly tell elementJS to take control of the page and process all the components we've defined, bringing them to life in the browser.

---

 **Summary of Lifecycle Methods:**

| Method         | Purpose                                          | Runs On           | When Called                                                  | Key Usage                                              |
| :------------- | :----------------------------------------------- | :---------------- | :----------------------------------------------------------- | :----------------------------------------------------- |
| `template$`    | Defines the HTML structure of the component.     | Both Server & Client | Very early in the lifecycle, before content population.      | Static HTML layout, internal styles, `el-id` attributes. |
| `onRender$`    | Populates the component's static content.        | Both Server & Client | After `template$`, before `onHydrate$`.                      | Setting `textContent`, `innerHTML`, `attributes` based on `props`. |
| `onHydrate$`   | Adds client-side interactivity.                  | Client Only       | After `onRender$` has completed.                             | Attaching event listeners, initializing interactive JS.  |

---

By following these steps, you've created a functional elementJS component that demonstrates the basic flow of defining a template, rendering content, and adding client-side interactivity. This forms the foundation for building more complex and dynamic web applications with elementJS.

Let me know if you'd like to move on to the next lifecycle method (`onInit$`) or explore other aspects of component creation!
