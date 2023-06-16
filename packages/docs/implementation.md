# Implementation notes

See also: [product requirements](requirements.md)

## Core approach

Combine content with components that provide the core functionality. This will build to a compact web app with optional service worker support. Static rendering is preferred and the result can be packaged for SCORM or CMI-5.

1. Build a preprocessor for Markdown that handles page splitting and extracts metadata (for TOC, navigation, etc.).
2. Build a library of React components to handle display, navigation, etc.
3. Export to [MDX](https://mdxjs.com/) (may be in-memory files)
4. Compiles to pages w/ JS
4. Use a bundler to do [static rendering](https://blog.logrocket.com/static-site-generation-with-react-from-scratch/)

### Metadata and customization

Im plain Markdown: Use [generic directives](https://talk.commonmark.org/t/generic-directives-plugins-syntax/444). Prefix determines scope:
* `:::` used for whole document or section, depending on whether it appears before or after heading (or other split marker.) If first in doc, treat this as frontmatter.
* `::` used for page
* `:` used inline

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
