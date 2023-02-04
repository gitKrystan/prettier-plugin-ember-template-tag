import Component from '@glimmer/component';
import { ComponentLike } from '@glint/template';

interface Signature {
  Args: {
    component: ComponentLike<never>;
  };
}

const half = (x: number) => x / 2;

export default class Compiler extends Component<Signature> {
  <template>{{yield (hash component=this.component) half=half}}</template>

  get component() {
    return this.args.component;
  }
}
