# Implementation notes

# Implementation plan

See also: [product requirements](requirements.md)

## Core approach

Use [MDX](https://mdxjs.com/) to combine content (markdown) with components that provide the core functionality. This 
will build to a compact web app with optional service worker support.

## Release plan

### Alpha 1

* Build with React/Preact and Vite with a MDX plugin.
* Deploy at least one "proof of concept" simulation.
* Simulations are built as source within the project.
* Include Getting Started documentation, a component reference, and a tutorial. 
* Styling is fixed (i.e. not customizable except by forking the source)

### Future

* Web-based editor?
* Parsing MDX to simplify authoring?
* VSCode plugin?

## Development tools

* [WMR](https://wmr.dev/) build engine by the Preact team
* [MDX integration](https://wmr.dev/) for the language work
* [Storybook](https://storybook.js.org/) for component and screen design/testing
