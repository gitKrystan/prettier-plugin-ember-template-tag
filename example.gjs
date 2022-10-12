import Component from '@glimmer/component';

          // comment before file

  <template>

  <h1>   Module top level template. Module top level template. Module top level template. Module top level template. Module top level template. Module top level template.   </h1>




</template>

//        comment between templates

const Multiline = <template>

  <h1>   Module variable template. Module variable template. Module variable template. Module variable template. Module variable template. Module variable template. Module variable template. Module variable template.   </h1>
</template>

const Oneline = <template>      Module variable template (one line). </template>

export const Exported = <template>       Exported variable template. Exported variable template.  Exported variable template.  Exported variable template.  Exported variable template. Exported variable template. Exported variable template. </template>

/**
 * An example GJS file on which we can run the Prettier for GJS plugin.
 */
class MyComponent
  extends Component {
  <template>
    <h1>   Class top level template. Class top level template. Class top level template. Class top level template. Class top level template. </h1>
  </template>

  what = `template literal that is not a template`


        // comment in the class
}

export default <template>     Explicit default export module top level component. Explicit default export module top level component. Explicit default export module top level component. Explicit default export module top level component. Explicit default export module top level component. </template>
