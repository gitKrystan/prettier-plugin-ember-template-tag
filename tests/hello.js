import Component from '@glimmer/component';

[
  GLIMMER_TEMPLATE(`<MyComponent/>`, {
    scope() {
      return { MyComponent };
    }
  })
];

const temp = [
  GLIMMER_TEMPLATE(`<MyComponent/>`, {
    scope() {
      return { MyComponent };
    }
  })
];

// const temp = <template><MyComponent/></template>;

/**
 * FIXME: description
 */
export default class MyComponent extends Component {
  [GLIMMER_TEMPLATE(`<MyComponent/>`, {
    scope() {
      return { MyComponent };
    }
  })];
}
