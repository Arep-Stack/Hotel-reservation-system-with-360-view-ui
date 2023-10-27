import './Home.css';

import { Container, Image } from '@mantine/core';

function Home() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Image
        className="home-img"
        src="https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg"
      />
      <Container fluid h="100vh" pt={80} px="lg"></Container>
    </div>
  );
}

export default Home;

//https://images.unsplash.com/photo-1561501900-3701fa6a0864?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bHV4dXJ5JTIwaG90ZWx8ZW58MHx8MHx8fDA%3D
