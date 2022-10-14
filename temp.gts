
> ember-template-tag-prettier@0.0.0 example-ts /Users/krystanhuffmenne/Code/ember-template-tag-prettier
> vite build && ./node_modules/.bin/prettier --loglevel debug --plugin . example.gts

vite v3.1.6 building for production...
transforming...
✓ 463 modules transformed.
rendering chunks...
dist/ember-template-tag-prettier.cjs   1801.04 KiB / gzip: 390.54 KiB
preprocess 
import type { TOC, TemplateOnlyComponent } from '@ember/component/template-only';
import Component from '@glimmer/component';

export interface Signature {
  Args: {
    Named: {
        message: string;
      target?: string
    };
Positional: [extraSpecialPreamble: string];
  };
  Blocks: {
    default: [greeting: string];
  };
}

const num2: number = 1;

          // comment before file

  [__GLIMMER_TEMPLATE(`

  <h1>   {{@message}} Module top level template. Module top level template. Module top level template. Module top level template. Module top level template. Module top level template.   </h1>




`, { strictMode: true })] as TemplateOnlyComponent<Signature>

const Oneline: TOC<Signature> = [__GLIMMER_TEMPLATE(`      One line `, { strictMode: true })]

export const Exported: TemplateOnlyComponent<Signature> = [__GLIMMER_TEMPLATE(`       Exported variable template. Exported variable template.  Exported variable template.  Exported variable template.  Exported variable template. Exported variable template. Exported variable template. `, { strictMode: true })]

// Just testing some edge cases. This declaration should have a semicolon!

const ModVar1: TemplateOnlyComponent<Signature> = [__GLIMMER_TEMPLATE(`

  <h1>   Module variable template. Module variable template. Module variable template. Module variable template. Module variable template. Module variable template. Module variable template. Module variable template.   </h1>
`, { strictMode: true })],
ModVar2: TemplateOnlyComponent<Signature> = [__GLIMMER_TEMPLATE(`
  Second module variable template.
`, { strictMode: true })],
    num: number = 1;

// Just testing some edge cases. This declaration should NOT have a semicolon!

const bool: boolean = false, ModVar3: TemplateOnlyComponent<Signature>  =[__GLIMMER_TEMPLATE(`

  <h1>   Module variable template. Module variable template. Module variable template. Module variable template. Module variable template. Module variable template. Module variable template. Module variable template.   </h1>
`, { strictMode: true })],
ModVar4: TemplateOnlyComponent<Signature>  = [__GLIMMER_TEMPLATE(`
  Second module variable template.
`, { strictMode: true })];



/**
 * An example GJS file on which we can run the Prettier for GJS plugin.
 */
class MyComponent
  extends Component<Signature> {
  [__GLIMMER_TEMPLATE(`
    <h1>   Class top level template. Class top level template. Class top level template. Class top level template. Class top level template. </h1>
  `, { strictMode: true })]

  what = `template literal that is not a template`


        // comment in the class
}

export default [__GLIMMER_TEMPLATE(`     Explicit default export module top level component. Explicit default export module top level component. Explicit default export module top level component. Explicit default export module top level component. Explicit default export module top level component. `, { strictMode: true })] as TemplateOnlyComponent<Signature>


declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'MyComponent': typeof MyComponent;
  }
}

import type {
  TOC,
  TemplateOnlyComponent,
} from "@ember/component/template-only";
import Component from "@glimmer/component";

export interface Signature {
  Args: {
    Named: {
      message: string;
      target?: string;
    };
    Positional: [extraSpecialPreamble: string];
  };
  Blocks: {
    default: [greeting: string];
  };
}

const num2: number = 1;

// comment before file

<template>
  <h1>
    {{@message}}
    Module top level template. Module top level template. Module top level
    template. Module top level template. Module top level template. Module top
    level template.
  </h1>
</template> as TemplateOnlyComponent<Signature>;

const Oneline: TOC<Signature> = <template>One line</template>

export const Exported: TemplateOnlyComponent<Signature> = <template>
  Exported variable template. Exported variable template. Exported variable
  template. Exported variable template. Exported variable template. Exported
  variable template. Exported variable template.
</template>

// Just testing some edge cases. This declaration should have a semicolon!

const ModVar1: TemplateOnlyComponent<Signature> = <template>
    <h1>
      Module variable template. Module variable template. Module variable
      template. Module variable template. Module variable template. Module
      variable template. Module variable template. Module variable template.
    </h1>
  </template>,
  ModVar2: TemplateOnlyComponent<Signature> = <template>
    Second module variable template.
  </template>,
  num: number = 1;

// Just testing some edge cases. This declaration should NOT have a semicolon!

const bool: boolean = false,
  ModVar3: TemplateOnlyComponent<Signature> = <template>
    <h1>
      Module variable template. Module variable template. Module variable
      template. Module variable template. Module variable template. Module
      variable template. Module variable template. Module variable template.
    </h1>
  </template>,
  ModVar4: TemplateOnlyComponent<Signature> = <template>
    Second module variable template.
  </template>

/**
 * An example GJS file on which we can run the Prettier for GJS plugin.
 */
class MyComponent extends Component<Signature> {
  <template>
    <h1>
      Class top level template. Class top level template. Class top level
      template. Class top level template. Class top level template.
    </h1>
  </template>

  what = `template literal that is not a template`;

  // comment in the class
}

export default <template>
  Explicit default export module top level component. Explicit default export
  module top level component. Explicit default export module top level
  component. Explicit default export module top level component. Explicit
  default export module top level component.
</template> as TemplateOnlyComponent<Signature>;

declare module "@glint/environment-ember-loose/registry" {
  export default interface Registry {
    MyComponent: typeof MyComponent;
  }
}
