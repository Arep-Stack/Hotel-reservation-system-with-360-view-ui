import { Box, Card, Flex, Group, Paper, Text } from '@mantine/core';
import { IconBookmark, IconBuildingPavilion } from '@tabler/icons-react';
import { IconSwimming } from '@tabler/icons-react';
import axios from 'axios';
import { useEffect, useState } from 'react';

import { getUser } from '../../utils/user';

function UserDashboard() {
  //reservations
  const [userReservations, setUserReservations] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const [services, setServices] = useState([]);

  //dashboard
  const [dashboardTotals, setDashboardTotals] = useState([]);

  //functions
  const getAllReservations = () => {
    setIsFetching(true);
    const user = JSON.parse(getUser());

    axios({
      method: 'GET',
      url: '/services',
    })
      .then((dataServices) => {
        if (!!dataServices.data) setServices(dataServices.data);

        axios({
          method: 'GET',
          url: '/reservations',
        })
          .then((dataReservations) => {
            const userReservations = dataReservations?.data
              ?.filter((r) => r.USER_ID === user.ID)
              ?.map((el) => {
                const { NAME, TYPE } = dataServices?.data?.find(
                  (s) => s.ID === el.SERVICE_ID,
                );

                return {
                  ...el,
                  SERVICE_NAME: NAME,
                  SERVICE_TYPE: TYPE,
                };
              });

            const totals = ['Room', 'Pavilion', 'Pool'].map((service) => ({
              service,
              total: userReservations?.filter((r) => r.SERVICE_TYPE === service)
                ?.length,
            }));

            setDashboardTotals(totals);

            setUserReservations(userReservations);
          })
          .catch(() => setFetchError('An error occurred'))
          .finally(() => setIsFetching(false));
      })
      .catch(() => {
        setFetchError('An error occurred');
        setIsFetching(false);
      });
  };

  useEffect(() => {
    getAllReservations();
  }, []);

  return (
    <Box>
      <Flex justify="space-evenly">
        {dashboardTotals.map(({ service, total }) => (
          <Card
            key={service}
            withBorder
            shadow="md"
            display="flex"
            style={{ flexDirection: 'row' }}
          >
            {service === 'Room' && (
              <IconBookmark
                size={48}
                style={{
                  marginBlock: 'auto',
                  marginRight: 20,
                }}
              />
            )}

            {service === 'Pavilion' && (
              <IconBuildingPavilion
                size={48}
                style={{
                  marginBlock: 'auto',
                  marginRight: 20,
                }}
              />
            )}

            {service === 'Pool' && (
              <IconSwimming
                size={48}
                style={{
                  marginBlock: 'auto',
                  marginRight: 20,
                }}
              />
            )}

            <Flex direction="column">
              <Text c="dimmed" mb="md">
                Total {service} Reservations
              </Text>
              <Text fw={700} align="center" size="2.25rem">
                {total}
              </Text>
            </Flex>
          </Card>
        ))}
      </Flex>
    </Box>
  );
}

export default UserDashboard;
