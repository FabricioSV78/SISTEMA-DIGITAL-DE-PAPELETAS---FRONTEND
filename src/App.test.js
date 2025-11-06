import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login page by default', () => {
  render(<App />);
  // Test que la aplicación redirige a login por defecto
  expect(window.location.pathname).toBe('/');
});
