1. Run the pre-processor (converts `<template>` into valid JS)
1. Run normal JS Prettier against the valid JS
1. Grab template contents from `GLIMMER_TEMPLATE` AST node
1. Run the hbs Prettier against the template contents
1. Replace the `GLIMMER_TEMPLATE` AST node with the results from above, wrapped in `<template>`, like so:

```gts
<template>
  <Pasted />
</template>
```
