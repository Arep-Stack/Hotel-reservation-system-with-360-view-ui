import { Button, Container, Title } from '@mantine/core';
import {
  IconArrowRightBar,
  IconCircleCheck,
  IconCircleX,
} from '@tabler/icons-react';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function PaypalCallback() {
  const navigator = useNavigate();

  const { search } = useLocation();

  useEffect(() => {
    const paymentId = new URLSearchParams(search).get('paymentId');

    const message = paymentId ? 'PAYPAL_SUCCESS' : 'PAYPAL_CANCELLED';

    if (!search) navigator('/User');

    window.opener?.postMessage(message, '*');
    window.close();
  }, [search]);

  return (
    <Container
      size="xl"
      mih="100vh"
      pt={90}
      px="lg"
      display="flex"
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      {search.includes('paymentId') ? (
        <IconCircleCheck size={240} color="#006400" />
      ) : (
        <IconCircleX size={240} color="#FF0800" />
      )}

      <Title order={1} c={search.includes('paymentId') ? '#006400' : '#FF0800'}>
        Payment {search?.includes('paymentId') ? 'Success' : 'Failed'}
      </Title>
      <Button
        onClick={() => navigator('/User')}
        rightSection={<IconArrowRightBar />}
        mt="xl"
        size="xl"
        variant="light"
      >
        Back to main page
      </Button>
    </Container>
  );
}

export default PaypalCallback;
