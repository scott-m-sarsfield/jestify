import jscodeshift from 'jscodeshift';
import { hasJSX } from 'src/transforms/jestifications/has_jsx';

it('detects when JSX is used', () => {
  expect(hasJSX(`
    it('tests something', () => {
      ReactDOM.render(<MyComponent />, root);
      expect(root).toHaveText('ka-ching');
    });
  `, jscodeshift)).toBe(true);
});

it('detects when JSX is not used', () => {
  expect(hasJSX(`
    it('tests something', () => {
      expect(root).toHaveText('ka-ching');
    });
  `, jscodeshift)).toBe(false);
});
