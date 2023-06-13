import { render } from '@testing-library/react';

import Root from './root';

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Root />);
    expect(baseElement).toBeTruthy();
  });

  // it('should have a greeting as the title', () => {
  //   const { getByText } = render(<Root />);
  //   expect(getByText(/Welcome sandbox-app/gi)).toBeTruthy();
  // });
});
