import { describe } from 'vitest';

import {
  getAmbiguousCases,
  makeAmbiguousExpressionTest,
} from '../../helpers/ambiguous';
import { makeSuite } from '../../helpers/make-suite';

describe('ambiguous', () => {
  makeSuite(
    getAmbiguousCases,
    makeAmbiguousExpressionTest(['(oops) => {}', '(oh, no) => {}'])
  )({
    name: 'arrowParens: "avoid"',
    options: { arrowParens: 'avoid' },
  });
});
