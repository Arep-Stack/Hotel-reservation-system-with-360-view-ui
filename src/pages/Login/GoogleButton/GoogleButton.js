import { Button } from '@mantine/core';

import { GoogleIcon } from './GoogleIcon';

export function GoogleButton(props) {
  return <Button leftSection={<GoogleIcon />} variant="default" {...props} />;
}
