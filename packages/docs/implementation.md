# Implementation notes

See also: [product requirements](requirements.md)

## Core approach

Combine content with components that provide the core functionality. This will build to a compact web app with optional service worker support. Static rendering is preferred and the result can be packaged for SCORM or CMI-5.

1. Build a preprocessor for Markdown that handles page splitting and extracts metadata (for TOC, navigation, etc.).
2. Build a library of components to handle display, navigation, etc.
3. Renger contents and merge with components to produce a static web app.

## Metadata

The easiest way to add metadata is via Frontmatter (which is allowed in any segment). This uses `---` as a delimiter and YAML for the content.

(Why YAML? See (this comparison)[https://gist.github.com/oconnor663/9aeb4ed56394cb013a20])

### Frontmatter options

* `title`
: The title for this section (displayed as the page title and in history).

`id`
: The page's identifier (used as a target for choices)

### Advanced metadata

Im plain Markdown: Use [generic directives](https://talk.commonmark.org/t/generic-directives-plugins-syntax/444). Prefix determines scope:
* `:::` used for whole document or section, depending on whether it appears before or after heading (or other split marker.) If first in doc, treat this as frontmatter.
* `::` used for page
* `:` used inline

## Release plan

### Alpha 1

* Deploy at least one "proof of concept" simulation.
* Simulations are built as source within the project.
* Include Getting Started documentation, a component reference, and a tutorial. 
* Styling is fixed (i.e. not customizable except by forking the source)

### Future

* Web-based editor?
* Parsing MDX to simplify authoring?
* VSCode plugin?

## Development tools

* [MDX integration](https://wmr.dev/) for the language work
* [Storybook](https://storybook.js.org/) for component and screen design/testing
