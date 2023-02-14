import { get } from '@ember/object';
import { get } from '@ember/helpers';
import Component from '@glimmer/component';

export default class MultipleImportsCollision extends Component {
    get foo() {
        return get(this.attrs, 'foo');
    }

    <template>
        {{this.foo}}
        {{get @moo '0'}}
    </template>
}