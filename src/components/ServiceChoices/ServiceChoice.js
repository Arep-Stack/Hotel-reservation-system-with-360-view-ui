import './ServiceChoice.css';

import { Box, Image, Text } from '@mantine/core';

function ServiceChoice({ serviceName, bg, handleClick }) {
  return (
    <Box className="service-choice-box" mx="md" onClick={handleClick}>
      <Image className="service-choice-box-bg-img" src={bg} />
      <Text className="service-choice-box-label">{serviceName}</Text>
    </Box>
  );
}

export default ServiceChoice;
