import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders chatty header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Chatty/i);
  expect(headerElement).toBeInTheDocument();
});
