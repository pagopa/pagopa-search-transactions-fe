import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import '@testing-library/jest-dom';

jest.mock('next/font/google', () => ({
  Inter: () => ({ className: 'inter-mock' }),
}));

jest.mock('../theme', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import RootLayout from '../layout';

describe('RootLayout', () => {
  it('renders children content', () => {
    // RootLayout returns <html> and <body>, so RTL render() would nest <html> inside a <div>.
    // SSR markup is enough to assert structure/content.
    const markup = renderToStaticMarkup(
      <RootLayout>
        <div>Child content</div>
      </RootLayout>
    );

    expect(markup).toContain('Child content');
    expect(markup).toContain('class="inter-mock"');
  });
});