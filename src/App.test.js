import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('jspdf', () => ({
  jsPDF: jest.fn()
}));

test('renderiza el encabezado del cotizador', () => {
  render(<App />);
  const titleElement = screen.getByText(/cotizador rápido/i);
  expect(titleElement).toBeInTheDocument();
});
