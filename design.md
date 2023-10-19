# The Plan

1. Run `Preprocessor.process` from content-tag to convert gjs files with `<template>` tags into valid JS. The `<template>` tag gets converted into something like `[__GLIMMER_TEMPLATE('<h1> Hello </h1>', { strictMode: true })]`.
1. Run the `estree` Prettier printer, which formats the valid JS above.
1. Grab template contents from `GLIMMER_TEMPLATE` AST node described above.
1. Run the hbs Prettier printer against the template contents.
1. Replace the `GLIMMER_TEMPLATE` AST node with the results from above, wrapped in `<template>`, like so:

   ```gts
   <template>
     <h1>Hello</h1>
   </template>
   ```
