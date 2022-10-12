# The Plan

1. Run `preprocessEmbeddedTemplates` from ember-template-imports to convert gjs files with `<template>` tags into valid JS. The `<template>` tag gets converted into something like `[__GLIMMER_TEMPLATE('<h1> Hello </h1>', { strictMode: true })]`.
1. Run the `estree` Prettier printer, which formats the valid JS above.
1. Grab template contents from `GLIMMER_TEMPLATE` AST node described above.
1. Run the hbs Prettier printer against the template contents.
1. Replace the `GLIMMER_TEMPLATE` AST node with the results from above, wrapped in `<template>`, like so:

   ```gts
   <template>
     <h1>Hello</h1>
   </template>
   ```

Unfortunately, this will likely involve either monkey-patching or re-implementing the estree printer due to this issue: https://github.com/prettier/prettier/issues/10259
