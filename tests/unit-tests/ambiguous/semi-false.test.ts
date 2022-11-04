import { describe } from 'vitest';

import {
  ambiguousCases,
  ambiguousExpressionTest,
} from '../../helpers/ambiguous';
import { describeConfig } from '../../helpers/config';

describe('ambiguous', () => {
  describeConfig(
    {
      name: 'semi: false',
      options: { semi: false },
    },
    ambiguousExpressionTest,
    ambiguousCases
  );
});
