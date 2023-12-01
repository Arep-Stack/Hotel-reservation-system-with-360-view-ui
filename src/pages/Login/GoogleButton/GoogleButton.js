import { Button } from '@mantine/core';

import { GoogleIcon } from './GoogleIcon';

export function GoogleButton(props) {
  return (
    <Button
      mih={36}
      leftSection={<GoogleIcon />}
      variant="default"
      {...props}
    />
  );
}
