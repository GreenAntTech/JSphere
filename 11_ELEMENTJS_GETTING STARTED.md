## Creating Components and Understanding Their Lifecycle in elementJS

**elementJS** empowers you to build modular and reactive user interfaces by defining reusable components. These components are essentially augmented HTML elements that encapsulate their own behavior, styling, and structure, all while maintaining a close relationship with standard web technologies.

### 1. Creating a Component: `createComponent$`

The foundation of building with `elementJS` is the `createComponent$` function. This function registers your component definition with the framework, making it available for use in your HTML templates.

**Syntax:**

```javascript
createComponent$('component-name', (el) => {
  // Component definition goes here
});
```

*   **`'component-name'`**: This is a unique string that identifies your component. It will be used in your HTML via the `el-is` attribute (e.g., `<div el-is="component-name"></div>`).
*   **`(el) => { ... }`**: This is the **initialization function** for your component. It receives a single argument, `el`, which is a reference to the actual HTML element that this component instance is attached to. This `el` object is augmented with `elementJS`-specific properties and methods, providing the interface to define your component's behavior.

### 2. Defining Component Behavior: `el.define$`

Inside the component's initialization function, you use `el.define$` to configure its lifecycle methods, public properties and methods.

**Syntax:**

```javascript
createComponent$('my-component', (el) => {
  el.define$({
    // Lifecycle methods
    use$: () => [],
    onInit$: (props) => { /* ... */ },
    onStyle$: (props) => `/* css */`,
    onTemplate$: (props) => `<!-- html -->`,
    onRender$: (props) => { /* ... */ },
    onHydrate$: (props) => { /* ... */ },
    onReady$: (props) => { /* ... */ },

    // Public properties/methods (can be accessed from parent or other components)
    myPublicProperty$: { /* getter/setter */ },
    myPublicMethod$: (args) => { /* ... */ }
  });
});
```

### 3. Component Lifecycle Methods: The Flow of an elementJS Component

`elementJS` components progress through a series of well-defined lifecycle phases, each with a corresponding method you can implement. These methods are called automatically by the framework at specific points in a component's existence, allowing you to hook into its creation, rendering, and interaction.

The lifecycle methods are executed in a specific order, as dictated by the `el.init$` method (which is called by `renderDocument$` or a parent component).

#### a. `use$(props)`: Declaring External Dependencies

*   **When it runs**: Very early in the component's setup, before `onInit$`.
*   **Purpose**: To declare any external JavaScript modules (dependencies) that your component needs. `elementJS` will ensure these modules are loaded before the component proceeds to `onInit$`.
*   **Arguments**: `props` - an object containing properties passed to the component (e.g., from `data-*` attributes or `parent.child.init$(props)` calls).
*   **Return Value**: An array of strings, where each string is the name of a registered dependency (e.g., a module that subscribes to a set of events or registers  a set of captions).
*   **Example**:
    ```javascript
    use$: () => ['contact-service'], // Ensures the JS module that contains services related to contacts is loaded
    ```

#### b. `onInit$(props)`: Initializing Component Data

*   **When it runs**: After `use$` and before `onStyle$`.
*   **Purpose**: Ideal for setting up initial component state, fetching data (e.g., via `emitMessage$`), or performing any one-time setup that doesn't involve DOM manipulation.
*   **Arguments**: `props` - an object containing properties passed to the component (e.g., from `data-*` attributes or `parent.child.init$(props)` calls).
*   **Example**:
    ```javascript
    onInit$: async (props) => {
      const [state] = el.state$;
      state.counter = props.initialValue || 0;
      await emitMessage$('RetrieveData', {}); // Request initial data
    },
    ```

#### c. `onStyle$(props)`: Defining Component-Scoped Styles

*   **When it runs**: After `onInit$` and before `onTemplate$`.
*   **Purpose**: To provide CSS rules that are scoped to your component. This is a powerful feature for maintaining style encapsulation.
*   **Return Value**: A string containing CSS, or a relative path to a `.css` file.
    *   Use the `[el]` token in your CSS selectors; `elementJS` will replace it with the appropriate component selector (e.g., `[el-is="your-component"]` or `[el-is="your-component"][data-theme="blue"]`) to ensure styles are applied only to your component instances.
*   **Arguments**: `props` - an object containing properties passed to the component (e.g., from `data-*` attributes or `parent.child.init$(props)` calls).
*   **Example**:
    ```javascript
    onStyle$: (props) => `
      [el] {
        border: 1px solid ${ props.theme == 'light' ? 'black' : 'white' };
        padding: 10px;
      }
      [el] h1 {
        color: blue;
      }
    `,
    ```

#### d. `onTemplate$(props)`: Defining Component Structure

*   **When it runs**: After `onStyle$` and before `onRender$`.
*   **Purpose**: To provide the HTML structure for your component. This is where you define the visual layout and any child components.
*   **Return Value**: A string containing HTML, or a relative path to an HTML file.
    *   **Crucially**: If `onTemplate$` is *not* provided and the component is attached to a <head or <body element, `elementJS` will use the component's existing `innerHTML` as its template. This allows the component to augment the existing static HTML of the <head or <body element.
*   **Arguments**: `props` - an object containing properties passed to the component (e.g., from `data-*` attributes or `parent.child.init$(props)` calls).
*   **Child Components**: You declare child components using `el-is="child-component-name"` attributes within your HTML template.
*   **Example**:
    ```javascript
    onTemplate$: (props) => `
      <div>
        <h2>Hello, ${props.name || 'Guest'}!</h2>
        <button el-is="my-button" el-id="actionButton"></button>
      </div>
    `,
    ```

#### e. `onRender$(props)`: Programmatic Rendering of Children and Final Touches

*   **When it runs**: After `onTemplate$` (meaning the component's HTML is now in the DOM) and before `onHydrate$`.
*   **Purpose**: To programmatically render or update child components, or perform any final DOM manipulations that don't involve adding interactivity.
*   **Arguments**: `props` - an object containing properties passed to the component (e.g., from `data-*` attributes or `parent.child.init$(props)` calls).
*   **Child Component Interaction**: This is typically where you would call `await childElement.init$(childProps)` to pass data to child components and ensure they are fully rendered based on that data.
*   **Example**:
    ```javascript
    onRender$: async (props) => {
      const { actionButton } = el.children$; // Access child components
      await actionButton.init$({ label: 'Click Me', type: 'primary' });
    },
    ```

#### f. `onHydrate$(props)`: Adding Interactivity

*   **When it runs**: After `onRender$`. This is the phase where the component becomes interactive.
*   **Purpose**: To attach event listeners, set up reactive bindings, or perform any actions that make the component responsive to user input or state changes. This phase is crucial for client-side interactivity, especially after server-side rendering.
*   **Arguments**: `props` - an object containing properties passed to the component (e.g., from `data-*` attributes or `parent.child.init$(props)` calls).
*   **Key Actions**:
    *   `el.addEventListener('event', handler)`: Attaching standard DOM event listeners.
    *   `el.on$('event', ...args)`: Using the `elementJS` abstraction for event handling, which implicitly calls parent methods or dynamically assigned handlers.
    *   `el.bind$(callback)`: Setting up two-way data bindings to reactive state objects (e.g., `el.state$`, `el.pageState$`, `el.appState$`).
    *   Calling `await childElement.init$()` for children that need to be hydrated (if they were server-rendered or their hydration was delayed).
*   **Example**:
    ```javascript
    onHydrate$: (props) => {
      const [state] = el.state$;
      el.addEventListener('click', () => state.counter++); // Local state update
      el.bind$((object, property, _oldValue) => { el.textContent = `Count: ${object[property]}`; }); // Bind to local state
      // For global events or parent methods:
      // el.on$('change'); // Assumes data-on-change or props['on-change'] is set
    },
    ```

#### g. `onReady$(props)`: Post-Hydration Finalization

*   **When it runs**: After `onHydrate$`. This is the final lifecycle method in the initial component setup sequence.
*   **Purpose**: To perform any actions that should occur only after the component and its children are fully rendered and interactive. This can be logging, final third-party library initializations, or dispatching an event indicating the component is fully ready.
*   **Arguments**: `props` - an object containing properties passed to the component (e.g., from `data-*` attributes or `parent.child.init$(props)` calls).
*   **Example**:
    ```javascript
    onReady$: (props) => {
      console.log(`Component '${el.is$}' is fully ready!`);
      // You could dispatch an event here:
      // emitMessage$('component-ready', { count: 1 });
    },
    ```

### Summary

`elementJS` provides a clear and powerful component lifecycle that gives you fine-grained control over every stage of a component's existence. By implementing these methods, you can effectively manage data, styles, structure, and interactivity, all while maintaining a close connection to the underlying web platform. This design aligns perfectly with your goal of empowering developers to leverage their existing HTML, CSS, and JavaScript knowledge.
