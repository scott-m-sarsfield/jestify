import j from 'jscodeshift';
import { hasJSX } from '../has_jsx';

it('detects when JSX is used', () => {
  const source = `
    it('tests something', () => {
      ReactDOM.render(<MyComponent />, root);
      expect(root).toHaveText('ka-ching');
    });
  `;
  expect(hasJSX(j(source), j)).toBe(true);
});

it('detects when JSX is not used', () => {
  const source = `
    it('tests something', () => {
      expect(root).toHaveText('ka-ching');
    });
  `;
  expect(hasJSX(j(source), j)).toBe(false);
});
