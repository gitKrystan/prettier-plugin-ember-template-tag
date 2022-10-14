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

  <template>

  <h1>   {{@message}} Module top level template. Module top level template. Module top level template. Module top level template. Module top level template. Module top level template.   </h1>




</template> as TemplateOnlyComponent<Signature>

const Oneline: TOC<Signature> = <template>      One line </template>

export const Exported: TemplateOnlyComponent<Signature> = <template>       Exported variable template. Exported variable template.  Exported variable template.  Exported variable template.  Exported variable template. Exported variable template. Exported variable template. </template>

// Just testing some edge cases. This declaration should have a semicolon!

const ModVar1: TemplateOnlyComponent<Signature> = <template>

  <h1>   Module variable template. Module variable template. Module variable template. Module variable template. Module variable template. Module variable template. Module variable template. Module variable template.   </h1>
</template>,
ModVar2: TemplateOnlyComponent<Signature> = <template>
  Second module variable template.
</template>,
    num: number = 1;

// Just testing some edge cases. This declaration should NOT have a semicolon!

const bool: boolean = false, ModVar3: TemplateOnlyComponent<Signature>  =<template>

  <h1>   Module variable template. Module variable template. Module variable template. Module variable template. Module variable template. Module variable template. Module variable template. Module variable template.   </h1>
</template>,
ModVar4: TemplateOnlyComponent<Signature>  = <template>
  Second module variable template.
</template>;



/**
 * An example GJS file on which we can run the Prettier for GJS plugin.
 */
class MyComponent
  extends Component<Signature> {
  <template>
    <h1>   Class top level template. Class top level template. Class top level template. Class top level template. Class top level template. </h1>
  </template>

  what = `template literal that is not a template`


        // comment in the class
}

export default <template>     Explicit default export module top level component. Explicit default export module top level component. Explicit default export module top level component. Explicit default export module top level component. Explicit default export module top level component. </template> as TemplateOnlyComponent<Signature>


declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'MyComponent': typeof MyComponent;
  }
}
