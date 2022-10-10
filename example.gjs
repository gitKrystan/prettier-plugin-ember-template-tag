import Component from '@glimmer/component';

  <template>
  <h1>   Hello World 1   </h1>
</template>

const temp = <template>

  <h1>   Hello World 2   </h1>
</template>

/**
 * An example GJS file on which we can run the Prettier for GJS plugin.
 */
export default class MyComponent
  extends Component {
  <template>
    <h1>   Hello World 3   </h1>
  </template>

  what = `template literal that is not a template`


        // comment
}
