import Component from '@glimmer/component';

  <template>

  <h1>   Hello World 1 Hello World 1Hello World 1Hello World 1Hello World 1Hello World 1Hello World 1Hello World 1Hello World 1  </h1>
</template>

const multiline = <template>

  <h1>   Hello World 2 Hello World 2Hello World 2Hello World 2Hello World 2Hello World 2Hello World 2Hello World 2  </h1>
</template>

const oneline = <template>

  Hello World 4
</template>

/**
 * An example GJS file on which we can run the Prettier for GJS plugin.
 */
export default class MyComponent
  extends Component {
  <template>
    <h1>   Hello World 3 Hello World 3Hello World 3Hello World 3Hello World 3Hello World 3Hello World 3Hello World 3  </h1>
  </template>

  what = `template literal that is not a template`


        // just a lil comment
}
