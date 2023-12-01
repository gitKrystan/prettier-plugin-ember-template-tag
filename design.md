# The Plan

1. Run `Preprocessor.parse` from content-tag to get template locations. manually convert gjs files with `<template>` tags into valid JS, which doesn't change location. The `<template>` tag gets converted into empty strings.
2. convert empty string to a custom `Template` Ast node, which holds the template content.
3. Run the `estree` Prettier printer, which formats the valid JS above.
4. Grab template contents from `Template` AST node described above.
5. Run the hbs Prettier printer against the template contents.
6. Replace the `Template` AST node with the results from above, wrapped in `<template>`, like so:

   ```gts
   <template>
     <h1>Hello</h1>
   </template>
   ```
