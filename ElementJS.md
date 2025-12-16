## What is primary goal of elementJS? ##

**The primary goal of `elementJS` is to empower web developers to build high-performance, maintainable, and highly interactive web applications by augmenting standard HTML, CSS, and JavaScript with a lightweight, intuitive, and flexible component-based reactivity system, all while minimizing abstraction from the core web platform.**

Let's break down each part of the above statement:

1.  **"To empower web developers..."**: We want developers to feel capable and productive, therefore, we prioritized `elementJS`'s focus on developer ergonomics, ease of understanding, and leveraging existing skills.

2.  **"...to build high-performance, maintainable, and highly interactive web applications..."**: This covers the desired outcomes for any modern web framework: applications that are fast, easy to update, and engaging for users. Use it to build single page applications or use it serverside with `JSphere` to build SSR applications or combine both together.

3.  **"...by augmenting standard HTML, CSS, and JavaScript..."**: This is a core differentiator. `elementJS` doesn't replace these fundamentals; it builds upon them. It uses `data-*` attributes, HTML templates, and direct DOM APIs, making it feel like a natural extension of web standards.

4.  **"...with a lightweight, intuitive, and flexible component-based reactivity system..."**:
    *   **Lightweight**: Achieved by avoiding a Virtual DOM and focusing on direct DOM updates.
    *   **Intuitive**: Through declarative `data-bind` and `data-on-*` attributes, and clear lifecycle methods.
    *   **Flexible**: Offering choices between declarative and imperative binding/event handling, and a three-tiered state management system (`el.state$`, `el.pageState$`, `el.appState$`) to address various scoping and persistence needs.
    *   **Component-based**: The `createComponent$` and `el-is` patterns enable modular and reusable UI.

5.  **"...all while minimizing abstraction from the core web platform."**: This is perhaps the most defining characteristic. `elementJS` consciously chooses to stay close to the browser's native capabilities. It doesn't introduce a new language (like JSX) or hide the DOM entirely. Instead, it provides powerful tools that operate directly on the elements, making the debugging experience more transparent and reducing the cognitive overhead for developers already familiar with web fundamentals.

In essence, `elementJS` aims to bridge the gap between the raw power and familiarity of vanilla web development and the structured, reactive benefits of modern frameworks, offering a pragmatic and performant alternative.

## What You Should Already Know ##

You will get the most value out of this tutorial if you are familiar with:
* JavaScript fundamentals (variables, functions, arrays, objects, ES modules)
* Basic CSS for styling
* HTML basics for structure

Let’s get started with the basics.

## Creating a Clock Application Demo ##

Create a clockapp.html file and add the following code:

```HTML
<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>elementJS - Clock App</title>
   <script type="module">
      import './clockapp.js';
      import { renderDocument$ } from 'https://esm.sh/gh/greenanttech/jsphere@v1.0.0-preview.227/shared/element.js';
      await renderDocument$();
   </script>
</head>
<body>
   <div el-is="clock-app" el-id="clockApp"></div>
</body>
</html>
```

Create a file named clockapp.js and add the following code:

```JavaScript
import { createComponent$ } from 'https://esm.sh/gh/greenanttech/jsphere@v1.0.0-preview.227/shared/element.js';

createComponent$('clock-app', (el) => {

    const [state] = el.state$;

    const colors = ['black', 'red', 'blue', 'green', 'purple', 'orange'];
    
    el.define$({
        
        onInit$: () => { 
            state.clock = {
                time: getFormattedTime(),
                color: 'black'
            }
        },

        onTemplate$: () => /*html*/`
            <div style="font-family: monospace;">
                <label style="margin-right: 0.5rem;">Choose Color:</label>
                <select el-id="colorPicker" value="black">
                    ${colors.map(value => `<option value="${value}">${value}</option>`).join("")}
                </select>
                <h1 el-is="clock" el-id="clock" data-bind="state.clock"></h1>
            </div>
        `,

        onRender$: () => {
            // const { colorPicker } = el.children$;
            // for (const color of colors) {
            //     const option = el.ownerDocument.createElement('option');
            //     option.setAttribute('value', color);
            //     option.textContent = color;
            //     colorPicker.append(option);
            // }
        },

        onHydrate$: () => {
            const { colorPicker } = el.children$;
            colorPicker.addEventListener('change', () => state.clock.color = colorPicker.value );
        },

        onReady$: () => {
            setInterval(() => { state.clock.time = getFormattedTime() }, 1000);
        }
    })

    function getFormattedTime() {
        const now = new Date();
        return now.toLocaleTimeString("en-CA", {
            hour12: true,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    }
})

createComponent$('clock', (el) => {
    el.define$({
        onReady$: () => {
            el.bind$((obj, property, _oldValue) => {
                const clock = (property == 'clock') ? obj[property] : obj;
                el.textContent = clock.time;
                el.style.color = clock.color;
            });
        }
    })
})
```

## How to Add an elementJS Component to a Web Page

One of the core strengths of `elementJS` is its ability to seamlessly integrate with standard HTML. Adding an `elementJS` component to your web page is straightforward, leveraging familiar HTML attributes and a simple JavaScript setup. This section will guide you through the process using our `Clock Application Demo` as a reference.

### Step 1: Prepare Your HTML Structure

To incorporate an `elementJS` component, you need a basic HTML file that includes:
1.  A standard HTML container element (e.g., a `<div>`) where your `elementJS` application will be mounted.
2.  A `<script type="module">` tag to load `elementJS` and your application's main JavaScript file.

Let's look at the `clockapp.html` file from our demo:

```html
<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>elementJS - Clock App</title>
   <script type="module">
      import './clockapp.js';
      import { renderDocument$ } from 'https://esm.sh/gh/greenanttech/jsphere@v1.0.0-preview.227/shared/element.js';
      await renderDocument$();
   </script>
</head>
<body>
   <div el-is="clock-app" el-id="clockApp"></div>
</body>
</html>
```

**Key Elements in the HTML:**

*   **`<div el-is="clock-app" el-id="clockApp"></div>`**:
    *   This `<div>` element serves as the entry point for our main `elementJS` component.
    *   **`el-is="clock-app"`**: This attribute tells `elementJS` that this HTML element should be treated as an instance of the component named `'clock-app'`. When `elementJS` scans the page, it will look for a component definition registered with this name.
    *   **`el-id="clockApp"`**: This attribute provides a unique identifier for this specific component instance within the `elementJS` application. It can be used to access this component programmatically (e.g., from a parent component's `el.children$`) or for debugging.
*   **`<script type="module">`**:
    *   This tag is crucial for loading your `elementJS` application.
    *   **`import './clockapp.js';`**: This line imports your main application logic (`clockapp.js`), which will contain the definitions for your `elementJS` components (like `'clock-app'` and `'clock'`).
    *   **`import { renderDocument$ } from 'https://esm.sh/gh/greenanttech/jsphere@v1.0.0-preview.227/shared/element.js';`**: This imports the essential `renderDocument$` function from the `elementJS` library.
    *   **`await renderDocument$();`**: This function call initiates the `elementJS` rendering process. It scans the entire HTML document for elements with `el-is` attributes, identifies their corresponding component definitions, and then executes their lifecycle methods to render and hydrate them. The `await` keyword ensures that the rendering process completes before any subsequent synchronous code runs.

### Step 2: Define Your Component in JavaScript

Next, you need to define the behavior of your `elementJS` components in a JavaScript file (e.g., `clockapp.js`). This involves using the `createComponent$` function and defining the component's lifecycle methods.

**Key Aspects in the JavaScript:**

*   **`createComponent$('clock-app', (el) => { ... })`**:
    *   This defines our main application component. The `el` parameter provides access to the component's API.
    *   **`el.state$`**: Used to manage the local reactive state of this component instance, here holding the `clock` object (time and color).
    *   **`onInit$`**: Initializes the `state.clock` object with the current time and a default color.
    *   **`onTemplate$`**: Provides the HTML structure for the `clock-app`. Notice how it uses JavaScript's `map().join("")` to declaratively generate the `<option>` elements for the color picker. It also declares a child component: `<h1 el-is="clock" el-id="clock" data-bind="state.clock"></h1>`.
    *   **`onHydrate$`**: Attaches an event listener to the `colorPicker`. When the selection changes, it updates `state.clock.color`, triggering reactivity.
    *   **`onReady$`**: Sets up a `setInterval` to update `state.clock.time` every second, demonstrating continuous reactivity.
*   **`createComponent$('clock', (el) => { ... })`**:
    *   This defines the child component responsible for displaying the time and color.
    *   **`onHydrate$`**:
        *   **`el.bind$(...)`**: This is where the magic of reactivity happens. The `clock` component declaratively binds to the `state.clock` property of its parent (`clock-app`) using the `data-bind="state.clock"` attribute on the `<h1>` element.
        *   The callback function provided to `el.bind$` is executed whenever `state.clock` (or properties within it like `time` or `color`) changes.
        *   Inside the callback, `el.textContent` and `el.style.color` are directly updated to reflect the current `time` and `color` from the bound state.

### Step 3: Serve Your Application

To see your `elementJS` application in action, you'll need a web server. You can use `JSphere` (as implied by the import path) or any other web server (e.g., `Live Server` for VS Code, `http-server` via npm, or Python's `http.server` module) to serve your `clockapp.html` and `clockapp.js` files.
