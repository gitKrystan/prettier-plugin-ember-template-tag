# prettier-plugin-ember-template-tag

[![CI](https://github.com/gitKrystan/prettier-plugin-ember-template-tag/actions/workflows/ci.yml/badge.svg)](https://github.com/gitKrystan/prettier-plugin-ember-template-tag/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/prettier-plugin-ember-template-tag.svg)](https://www.npmjs.com/package/prettier-plugin-ember-template-tag)
[![license](https://img.shields.io/npm/l/prettier-plugin-ember-template-tag.svg)](https://github.com/gitKrystan/prettier-plugin-ember-template-tag/blob/main/LICENSE.md)

A [Prettier](https://prettier.io/) plugin for formatting [Ember template tags](https://rfcs.emberjs.com/id/0779-first-class-component-templates/).

## Usage

1. Install:

   NPM:

   ```bash
   npm install --save-dev prettier prettier-plugin-ember-template-tag
   ```

   Yarn:

   ```bash
   yarn add --save-dev prettier prettier-plugin-ember-template-tag
   ```

   PNPM:

   ```bash
   pnpm add --save-dev prettier prettier-plugin-ember-template-tag
   ```

1. Configure with [prettierrc](https://prettier.io/docs/en/configuration.html):

   ```js
   // .prettierrc.js
   module.exports = {
     // ...
     plugins: ['prettier-plugin-ember-template-tag'],
   };
   ```

1. Run `npm prettier --write .`

## Ignoring code

Because gts/gjs files include both JavaScript and Glimmer template code, you'll need to use the appropriate prettier-ignore comment for the code you are ignoring:

```js
export default class MyComponent extends Component {
  // prettier-ignore
  cells = matrix(
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
  )

  <template>
    {{! prettier-ignore }}
    {{#each cells as |cell|}}{{cell.contents}}{{/each}}
  </template>
}
```

To ignore the entire template, use a JavaScript `//prettier-ignore` comment before the opening `<template>` tag:

```js
export default class MyComponent extends Component {
  // prettier-ignore
  <template>
    This whole template is ignored
    <MyUglyComponent     "shall"     be="preserved">
      <ThisPart
        is  =  "also preserved as is"
      />
    </MyUglyComponent>
  </template>
}
```

## Bugs

If there are errors, please file a bug report so that they can be fixed.

TODO: Process

## Opinions

TODO: link to RFC

<!-- TODO: ### Configuration

These configuration options are available in addition to [Prettier's standard
config for JavaScript files](https://prettier.io/docs/en/configuration.html).

| Name                  | Default | Description                                                                                                  |
| --------------------- | ------- | ------------------------------------------------------------------------------------------------------------ |
| `templatePrintWidth`  | `80`    | [Same as in Prettier](https://prettier.io/docs/en/options.html#print-width) but affecting only template tags |
| `templateSingleQuote` | `false` | Same as in Prettier](https://prettier.io/docs/en/options.html#print-width) but affecting only template tags  | -->

<!-- ## Editor integration

### VScode

TODO -->
