import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';

module('Render with template tag', function (hooks) {
	setupRenderingTest(hooks);

	  test('it has a template tag', async function (assert) {
			await render(<template>
              what
            </template>);
			assert.dom().hasText('what');
  });
});