import { render, screen } from '@testing-library/react';
import App from './App';

test('renders camera app', () => {
  render(<App />);
  const linkElement = screen.getByText(/Caméra en Direct/i);
  expect(linkElement).toBeInTheDocument();
});
