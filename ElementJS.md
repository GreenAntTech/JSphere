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

## How to Add an elementJS Component to a Website ##
