
> prettier-plugin-ember-template-tag@0.0.0 example /Users/krystanhuffmenne/Code/prettier-plugin-ember-template-tag
> vite build && ./node_modules/.bin/prettier --plugin . example.gjs

vite v3.1.8 building for production...
transforming...
✓ 200 modules transformed.
rendering chunks...
dist/prettier-plugin-ember-template-tag.cjs   1240.35 KiB / gzip: 274.98 KiB
import Component from "@glimmer/component";

/**
 * An example GJS file on which we can run the Prettier for GJS plugin.
 */
class MyComponent extends Component {
  <template>
    <h1>
      Class top level template. Class top level template. Class top level
      template. Class top level template. Class top level template.
    </h1>
  </template>
}
