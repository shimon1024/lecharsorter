import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('チェックボックスをクリックして有効にする', async () => {
  const user = userEvent.setup();
  render(<input type="checkbox" />);

  expect(screen.getByRole('checkbox')).not.toBeChecked();

  await user.click(screen.getByRole('checkbox'));

  expect(screen.getByRole('checkbox')).toBeChecked();
});
