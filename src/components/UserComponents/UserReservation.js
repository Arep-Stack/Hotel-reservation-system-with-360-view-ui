import {
  Anchor,
  Box,
  Button,
  Divider,
  Flex,
  Group,
  Modal,
  NumberFormatter,
  Stepper,
  Text,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import {
  Icon360View,
  IconArrowLeft,
  IconArrowRight,
  IconCircleCheck,
  IconHomeCheck,
  IconInfoCircle,
  IconReceipt,
  IconSquareCheck,
} from '@tabler/icons-react';
import { IconListDetails } from '@tabler/icons-react';
import { IconAlertCircle } from '@tabler/icons-react';
import axios from 'axios';
import moment from 'moment';
import { useEffect, useState } from 'react';

import { getUser } from '../../utils/user';
import ServiceCard from '../ServiceCard/ServiceCard';
import ComponentError from '../utils/ComponentError';
import ComponentLoader from '../utils/ComponentLoader';
import NoRecords from '../utils/NoRecords';

function UserReservation() {
  //fetching services
  const [services, setServices] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  //booking
  const [activeStepper, setActiveStepper] = useState(0);
  const [bookingDates, setBookingDates] = useState([null, null]);
  const [selectedService, setSelectedService] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [totalNights, setTotalNights] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  //modal
  const [
    isBookingModalOpen,
    { open: openBookingModal, close: closeBookingModal },
  ] = useDisclosure(false);

  //functions
  const handleOpenModal = (service) => {
    setSelectedService(service);
    openBookingModal();
  };

  const handleDateChange = (values) => {
    setBookingDates(values);

    if (values[0] && values[1]) {
      const startDate = moment(values[0]);
      const endDate = moment(values[1]);

      const totalNights = endDate.diff(startDate, 'days');
      const totalAmount = totalNights * selectedService?.PRICE;

      setTotalNights(totalNights);
      setTotalAmount(totalAmount);
    }
  };

  const handleBookReservation = () => {
    const user = JSON.parse(getUser());

    nextStep();
    setIsBooking(true);

    axios({
      method: 'POST',
      url: '/reservations',
      data: {
        USER_ID: user?.ID,
        SERVICE_ID: selectedService?.ID,
        STATUS: 'Unpaid',
        DESCRIPTION: null,
        START_DATE: bookingDates[0],
        END_DATE: bookingDates[1],
        AMOUNT: totalAmount,
        BALANCE: totalAmount,
        PAYMENT_HISTORY: [],
      },
    })
      .then(() => {
        nextStep();
      })
      .catch(() => {
        setBookingError('An error occurred. Please try again later');
      })
      .finally(() => setIsBooking(false));
  };

  const render1stStepper = () => {
    return (
      <Flex direction="column">
        <DatePickerInput
          withAsterisk
          minDate={new Date()}
          type="range"
          label="Choose dates"
          placeholder="Please choose date range"
          value={bookingDates}
          onChange={(values) => handleDateChange(values)}
        />

        <Group justify="space-between" mt="xs">
          <Text>Price</Text>
          <div>
            <NumberFormatter
              thousandSeparator
              value={selectedService?.PRICE}
              prefix="₱"
            />
            /night
          </div>
        </Group>

        <Group justify="space-between" mt="xs">
          <Text>Duration</Text>
          <Text>
            {totalNights !== 0
              ? `${totalNights + 1} ${
                  totalNights + 1 > 1 ? 'days' : 'day'
                }, ${totalNights} ${totalNights > 1 ? 'nights' : 'night'}`
              : '-'}
          </Text>
        </Group>

        <hr />

        <Group fw={700} justify="space-between" mt="xs" mb="xs">
          <Text>Total Amount</Text>
          <NumberFormatter
            thousandSeparator
            value={totalAmount !== 0 ? totalAmount : '-'}
            prefix="₱"
          />
        </Group>
      </Flex>
    );
  };

  const render2ndStepper = () => {
    return (
      <Flex direction="column">
        <Group justify="space-between">
          <Text>Service</Text>
          <Text>{`${selectedService?.TYPE} - ${selectedService?.NAME}`}</Text>
        </Group>

        <Group justify="space-between" mt="xs">
          <Text>Capacity</Text>
          <Text>up to {selectedService?.PERSONS} pax</Text>
        </Group>

        <Group justify="space-between" mt="xs">
          <Text>Start Date</Text>
          <Text>{moment(bookingDates[0]).format('ll')}</Text>
        </Group>

        <Group justify="space-between" mt="xs">
          <Text>End Date</Text>
          <Text>{moment(bookingDates[1]).format('ll')}</Text>
        </Group>

        <Divider mt="sm" />

        <Group justify="space-between" mt="xs">
          <Text>Duration</Text>
          <Text>
            {totalNights !== 0
              ? `${totalNights + 1} ${
                  totalNights + 1 > 1 ? 'days' : 'day'
                }, ${totalNights} ${totalNights > 1 ? 'nights' : 'night'}`
              : '-'}
          </Text>
        </Group>

        <Group justify="space-between" mt="xs">
          <Text>Service Price</Text>
          <div>
            <NumberFormatter
              thousandSeparator
              value={selectedService?.PRICE}
              prefix="₱"
            />
            /night
          </div>
        </Group>

        <Group fw={700} justify="space-between" mt="xs">
          <Text>Total Amount</Text>
          <NumberFormatter thousandSeparator value={totalAmount} prefix="₱" />
        </Group>

        <Flex direction="row" align="center" justify="center" mt="lg">
          <IconInfoCircle size={15} />
          <Text size="xs" ml={4} mr={4}>
            By booking, you have accepted our
            <Anchor> terms and conditions</Anchor>
          </Text>
          <IconInfoCircle size={15} />
        </Flex>
      </Flex>
    );
  };

  const render3rdStepper = () => {
    return (
      <Box mih={100} pos="relative" mt="md" mb="md">
        {isBooking && <ComponentLoader message="Booking your reservation" />}
        {!isBooking && bookingError && (
          <>
            <Flex direction="column" align="center">
              <IconAlertCircle color="crimson" size={100} />
              <Text size="lg" align="center">
                Your booking is unsuccesful, please try again later
              </Text>
            </Flex>
          </>
        )}
      </Box>
    );
  };

  const renderCompleteStepper = () => {
    return (
      <Box mih={100} pos="relative" mt="md" mb="md">
        <Flex direction="column" align="center" justify="center">
          {!isBooking && !bookingError && (
            <>
              <IconSquareCheck color="#006400" size={100} />
              <Text size="lg" align="center">
                Your booking is successful, See you!
              </Text>
            </>
          )}
        </Flex>
      </Box>
    );
  };

  const nextStep = () =>
    setActiveStepper((current) => (current < 3 ? current + 1 : current));
  const prevStep = () =>
    setActiveStepper((current) => (current > 0 ? current - 1 : current));

  useEffect(() => {
    setIsFetching(true);
    axios({
      method: 'GET',
      url: '/services',
    })
      .then(({ data }) => {
        !!data && setServices(data);
      })
      .catch(() => {
        setFetchError('An error occurred');
      })
      .finally(() => setIsFetching(false));
  }, []);

  return (
    <Box pos="relative" mih={200}>
      {isFetching && <ComponentLoader message="Fetching services" />}
      {!isFetching && fetchError && <ComponentError message={fetchError} />}
      {!isFetching && !fetchError && (
        <Flex justify="center">
          {services
            ?.filter((service) => service.TYPE === 'Room')
            ?.map((el) => (
              <ServiceCard
                key={el.ID}
                amenities={el.AMENITIES}
                image={el.IMAGE}
                name={el.NAME}
                persons={el.PERSONS}
                price={el.PRICE}
              >
                <Flex align="center" gap="xs">
                  <Button
                    fullWidth
                    fw="normal"
                    color="#006400"
                    onClick={() => handleOpenModal(el)}
                  >
                    Book Now
                  </Button>
                  <Button color="#006400" variant="outline">
                    <Icon360View />
                  </Button>
                </Flex>
              </ServiceCard>
            ))}
        </Flex>
      )}

      <Modal
        centered
        title={'Booking - ' + selectedService?.NAME}
        shadow="xl"
        opened={isBookingModalOpen}
        onClose={closeBookingModal}
        closeButtonProps={{
          bg: 'crimson',
          radius: '50%',
          c: 'white',
        }}
        styles={{
          title: { color: 'darkgreen', fontSize: '1.7rem' },
          inner: { padding: 5 },
        }}
        withCloseButton={!isBooking}
        closeOnClickOutside={!isBooking}
        closeOnEscape={!isBooking}
      >
        <Stepper
          active={activeStepper}
          onStepClick={setActiveStepper}
          allowNextStepsSelect={false}
          color="#006400"
          size="sm"
          completedIcon={<IconCircleCheck />}
        >
          <Stepper.Step icon={<IconReceipt />}>
            {render1stStepper()}
          </Stepper.Step>

          <Stepper.Step icon={<IconListDetails />}>
            {render2ndStepper()}
          </Stepper.Step>

          <Stepper.Step
            icon={bookingError ? <IconAlertCircle /> : <IconHomeCheck />}
            color={bookingError ? 'red' : ''}
          >
            {render3rdStepper()}
          </Stepper.Step>

          <Stepper.Completed>{renderCompleteStepper()}</Stepper.Completed>
        </Stepper>

        <Flex gap="md" align="center" mt="xs">
          {activeStepper === 1 && (
            <>
              <Button
                fullWidth
                onClick={prevStep}
                leftSection={<IconArrowLeft />}
                variant="outline"
                color="dark"
              >
                Previous
              </Button>

              <Button
                fullWidth
                onClick={handleBookReservation}
                rightSection={<IconArrowRight />}
                color="#006400"
              >
                Book reservation
              </Button>
            </>
          )}
          {activeStepper === 0 && (
            <Button
              fullWidth
              disabled={!bookingDates[0] || !bookingDates[1]}
              onClick={nextStep}
              rightSection={<IconArrowRight />}
              color="#006400"
            >
              Next
            </Button>
          )}

          {activeStepper === 3 && (
            <Button
              fullWidth
              onClick={closeBookingModal}
              variant="outline"
              color="#006400"
            >
              Close
            </Button>
          )}
        </Flex>
      </Modal>
    </Box>
  );
}

export default UserReservation;
