import { describe } from 'vitest';

import { describeAmbiguitySuite } from '../../helpers/make-suite';

describe('ambiguous', () => {
  describeAmbiguitySuite({
    name: 'arrowParens: "avoid"',
    options: { arrowParens: 'avoid' },
  });
});
