import {
  Anchor,
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  Group,
  Modal,
  NumberFormatter,
  NumberInput,
  Select,
  Stepper,
  Text,
} from '@mantine/core';
import { DateInput, DatePickerInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import {
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
import { nanoid } from 'nanoid';
import { useContext, useState } from 'react';

import { GlobalContext } from '../../App';
import { getUser } from '../../utils/user';
import ServiceCard from '../ServiceCard/ServiceCard';
import ComponentError from '../utils/ComponentError';
import ComponentLoader from '../utils/ComponentLoader';
import NoRecords from '../utils/NoRecords';
import { UserMenuTab } from './UserMenu';

const dataTimes = [
  { value: '0', label: '12:00 am' },
  { value: '1', label: '1:00 am' },
  { value: '2', label: '2:00 am' },
  { value: '3', label: '3:00 am' },
  { value: '4', label: '4:00 am' },
  { value: '5', label: '5:00 am' },
  { value: '6', label: '6:00 am' },
  { value: '7', label: '7:00 am' },
  { value: '8', label: '8:00 am' },
  { value: '9', label: '9:00 am' },
  { value: '10', label: '10:00 am' },
  { value: '11', label: '11:00 am' },
  { value: '12', label: '12:00 pm' },
  { value: '13', label: '1:00 pm' },
  { value: '14', label: '2:00 pm' },
  { value: '15', label: '3:00 pm' },
  { value: '16', label: '4:00 pm' },
  { value: '17', label: '5:00 pm' },
  { value: '18', label: '6:00 pm' },
  { value: '19', label: '7:00 pm' },
  { value: '20', label: '8:00 pm' },
  { value: '21', label: '9:00 pm' },
  { value: '22', label: '10:00 pm' },
  { value: '23', label: '11:00 pm' },
];

const swimmingTimes = [
  { value: 'morning', label: 'Morning (9am-5pm)' },
  { value: 'night', label: 'Night (up to 11pm)' },
];

function UserReservation() {
  //context
  const { setCurrentTab } = useContext(UserMenuTab);
  const {
    getAllReservations,
    allReservations,
    allServices,
    allServicesError,
    allServicesLoading,
  } = useContext(GlobalContext);

  const [selectedService, setSelectedService] = useState(null);
  const [sortingCriteria, setSortingCriteria] = useState('Room');
  const [addons, setAddons] = useState([]);

  const [activeStepper, setActiveStepper] = useState(0);
  const [isBooking, setIsBooking] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  //booking room
  const [bookingDates, setBookingDates] = useState([null, null]);
  const [totalNights, setTotalNights] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  //booking pav & pool
  const [bookingDate, setBookingDate] = useState(null);
  const [bookingTime, setBookingTime] = useState(null);
  const [totalHours, setTotalHours] = useState(null);
  const [filteredDataTimes, setFilteredDataTimes] = useState(dataTimes);
  const [filteredSwimmingTimes, setFilteredSwimmingTimes] =
    useState(swimmingTimes);
  const [swimTime, setSwimTime] = useState(null);
  const [totalPax, setTotalPax] = useState(1);

  //modal
  const [
    isBookingModalOpen,
    { open: openBookingModal, close: closeBookingModal },
  ] = useDisclosure(false);

  //functions

  const getAllReservationDays = () => {
    const reservationDays = new Set();

    allReservations.forEach((reservation) => {
      if (selectedService?.ID === reservation?.SERVICE_ID) {
        const startDate = new Date(reservation.START_DATE);
        const endDate = new Date(reservation.END_DATE);

        const startDay = startDate.getDate();
        const startMonth = startDate.getMonth() + 1;
        const startYear = startDate.getFullYear();

        const endDay = endDate.getDate();
        const endMonth = endDate.getMonth() + 1;
        const endYear = endDate.getFullYear();

        reservationDays.add(`${startDay}-${startMonth}-${startYear}`);
        reservationDays.add(`${endDay}-${endMonth}-${endYear}`);
      }
    });

    return Array.from(reservationDays).map((formattedDate) => {
      const [day, month, year] = formattedDate.split('-').map(Number);
      return { day, month, year, formattedDate };
    });
  };

  const dayRenderer = (date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();

    const reservationDays = getAllReservationDays().filter(
      (reservation) =>
        reservation.month === month &&
        reservation.day === day &&
        reservation.year === year,
    );

    const shouldRenderIndicator = reservationDays.length > 0;

    return (
      <>
        {selectedService?.TYPE !== 'Pool' && shouldRenderIndicator ? (
          <div
            style={{
              zIndex: 999,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <p
              style={{
                textDecoration: 'line-through',
              }}
            >
              {day}
            </p>
          </div>
        ) : (
          <div>{day}</div>
        )}
      </>
    );
  };

  const handleOpenModal = (service) => {
    setAddons([]);
    setSelectedService(service);
    openBookingModal();
  };

  const handleDateChange = (values) => {
    setAddons([]);

    if (selectedService?.TYPE === 'Room') {
      setBookingDates(values);

      if (values[0] && values[1]) {
        const startDate = moment(values[0]);
        const endDate = moment(values[1]);

        const totalNights = endDate.diff(startDate, 'days');
        const totalAmount = totalNights * selectedService?.PRICE;

        const isOverlap = getAllReservationDays().some((day) => {
          const reservationDate = moment(
            `${day.year}-${day.month}-${day.day}`,
            'YYYY-MM-DD',
          );
          return (
            reservationDate.isSameOrAfter(startDate) &&
            reservationDate.isSameOrBefore(endDate)
          );
        });

        if (isOverlap) {
          setBookingDates([null, null]);
          setTotalNights(0);
          setTotalAmount(0);
        } else {
          setBookingDates(values);
          setTotalNights(totalNights);
          setTotalAmount(totalAmount);
        }
      }
    } else {
      const dateVal =
        values.getDate() +
        '-' +
        (values.getMonth() + 1) +
        '-' +
        values.getFullYear();
      const reservationDays = getAllReservationDays();

      if (
        selectedService?.TYPE === 'Pavilion' &&
        reservationDays.some((day) => day.formattedDate === dateVal)
      ) {
        setBookingDate(null);
      } else {
        setBookingDate(values);
      }

      setBookingTime(null);
      setTotalAmount(0);
      setTotalHours(0);
      setSwimTime(null);
      setTotalPax(1);

      const selectedDate = moment(values);
      const currentTime = moment().format('HH');

      if (selectedDate.isSame(moment(), 'day')) {
        const filteredTimes = dataTimes.filter(
          ({ value }) => parseInt(value) > currentTime,
        );

        setFilteredDataTimes(filteredTimes);

        if (currentTime > 17) {
          setFilteredSwimmingTimes([
            { value: 'night', label: 'Night (up to 11pm)' },
          ]);
        } else {
          setFilteredSwimmingTimes([
            { value: 'morning', label: 'Morning (9am-5pm)' },
            { value: 'night', label: 'Night (up to 11pm)' },
          ]);
        }
      } else {
        setFilteredDataTimes(dataTimes);
        setFilteredSwimmingTimes([
          { value: 'morning', label: 'Morning (9am-5pm)' },
          { value: 'night', label: 'Night (up to 11pm)' },
        ]);
      }
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
        START_DATE:
          selectedService?.TYPE === 'Room'
            ? moment(bookingDates[0]).format('ll')
            : moment(bookingDate)
                .set({
                  hour: parseInt(bookingTime, 10),
                })
                .format('MMMM D, YYYY @ h:mm a'),
        END_DATE:
          selectedService?.TYPE === 'Room'
            ? moment(bookingDates[1]).format('ll')
            : moment(bookingDate)
                .set({
                  hour:
                    selectedService?.TYPE === 'Pavilion'
                      ? parseInt(bookingTime, 10) + 6 + totalHours
                      : parseInt(bookingTime, 10) + 24 + totalHours,
                })
                .format('MMMM D, YYYY @ h:mm a'),
        AMOUNT: totalAmount,
        BALANCE: totalAmount,
        PAYMENT_HISTORY: [],
        ADDONS: [],
        PAX: totalPax,
      },
    })
      .then(() => {
        getAllReservations();
        nextStep();
        setIsBooked(true);
      })
      .catch((err) => {
        setBookingError('An error occurred. Please try again later');
      })
      .finally(() => setIsBooking(false));
  };

  const handleCloseModal = () => {
    closeBookingModal();

    if (isBooked) {
      setCurrentTab('dashboard');
    }

    setActiveStepper(0);
    setBookingDates([null, null]);
    setTotalNights(0);
    setTotalAmount(0);
    setBookingDate(null);
    setBookingTime(null);
    setTotalHours(null);
    setIsBooked(false);
    setTotalPax(1);
    setSwimTime(null);
  };

  const handleSetStartTime = (value) => {
    setBookingTime(value);
    setAddons([]);
    setTotalHours(0);

    if (value) setTotalAmount(selectedService?.PRICE);
    else setTotalAmount(0);
  };

  const handleAddAdditionalHours = (value) => {
    setAddons([]);
    setTotalHours(value);
    if (value <= 0) {
      setTotalAmount(selectedService?.PRICE);
    } else {
      setTotalAmount(
        selectedService?.PRICE + selectedService?.PRICE_EXCEED * value,
      );
    }
  };

  const handleSetStartTimeForSwimming = (value) => {
    setAddons([]);
    setSwimTime(value);
    if (!!value) {
      if (value === 'morning')
        setTotalAmount(selectedService?.PRICE * (totalPax || 1));
      else setTotalAmount(selectedService?.PRICE_EXCEED * (totalPax || 1));
    } else {
      setTotalAmount(0);
      setTotalPax(1);
    }
  };

  const handleCalculateTotalPaxForSwimming = (value) => {
    setAddons([]);
    setTotalPax(value);

    if (swimTime === 'morning') {
      setTotalAmount(Math.floor(value * selectedService?.PRICE));
    } else {
      setTotalAmount(Math.floor(value * selectedService?.PRICE_EXCEED));
    }
  };

  const handleChangeAddOns = (values) => {
    setAddons(values);

    if (selectedService?.TYPE === 'Room') {
      let addonsTotal = 0;

      values.forEach((addon) => {
        const addonIndex = selectedService?.ADDONS.findIndex(
          (a) => a.name === addon,
        );
        if (addonIndex !== -1) {
          addonsTotal += selectedService?.ADDONS[addonIndex].price;
        }
      });

      const totals = totalNights * selectedService?.PRICE + addonsTotal;

      setTotalAmount(totals);
    } else {
      let addonsTotal = 0;

      values.forEach((addon) => {
        const addonIndex = selectedService?.ADDONS.findIndex(
          (a) => a.name === addon,
        );
        if (addonIndex !== -1) {
          addonsTotal += selectedService?.ADDONS[addonIndex].price;
        }
      });

      if (selectedService?.TYPE === 'Pavilion') {
        setTotalAmount(
          selectedService?.PRICE +
            totalHours * selectedService?.PRICE_EXCEED +
            addonsTotal,
        );
      } else {
        if (swimTime === 'morning') {
          setTotalAmount(
            Math.floor(totalPax * selectedService?.PRICE) + addonsTotal,
          );
        } else {
          setTotalAmount(
            Math.floor(totalPax * selectedService?.PRICE_EXCEED) + addonsTotal,
          );
        }
      }
    }
  };

  //render
  const renderServices = () => {
    const services = allServices?.filter(
      (service) => service?.TYPE === sortingCriteria && !service?.IS_DELETED,
    );

    services?.sort((a, b) => a.ID - b.ID);

    if (services?.length > 0) {
      return services
        ?.filter((service) => service.TYPE === sortingCriteria)
        ?.map((service) => (
          <ServiceCard
            key={service.ID}
            amenities={service.AMENITIES}
            image={service.IMAGE}
            name={service.NAME}
            persons={service.PERSONS}
            price={service.PRICE}
            type={service.TYPE}
            addons={service.ADDONS}
            price_exceed={service.PRICE_EXCEED}
          >
            <Flex align="center" gap="xs">
              <Button
                fullWidth
                fw="normal"
                color="#006400"
                onClick={() => handleOpenModal(service)}
              >
                Book Now
              </Button>
            </Flex>
          </ServiceCard>
        ));
    } else {
      return (
        <NoRecords
          message={'No available ' + sortingCriteria.toLocaleLowerCase()}
        />
      );
    }
  };

  const render1stStepper = () => {
    return (
      <Flex direction="column">
        {selectedService?.TYPE === 'Room' ? (
          <>
            <DatePickerInput
              withAsterisk
              minDate={new Date()}
              mb="sm"
              type="range"
              label="Choose dates"
              placeholder="Please choose date range"
              value={bookingDates}
              onChange={(values) => handleDateChange(values)}
              renderDay={dayRenderer}
            />

            <NumberInput
              min={1}
              max={selectedService?.PERSONS}
              label="Pax attendees"
              placeholder="1"
              disabled={!bookingDates[0] || !bookingDates[1]}
              value={totalPax}
              onChange={setTotalPax}
            />
          </>
        ) : (
          <>
            <DateInput
              withAsterisk
              label="Choose date"
              placeholder="Please choose date"
              minDate={
                new Date().getHours() >= 23
                  ? new Date(new Date().setDate(new Date().getDate() + 1))
                  : new Date()
              }
              value={bookingDate}
              onChange={(value) => handleDateChange(value)}
              renderDay={dayRenderer}
            />

            {selectedService?.TYPE === 'Pavilion' && (
              <>
                <Flex mt="xs" mb="xs" justify="center" gap="md">
                  <Select
                    flex={1}
                    withAsterisk
                    clearable
                    disabled={!bookingDate}
                    label="Start time"
                    placeholder="Select start time"
                    data={filteredDataTimes}
                    value={bookingTime}
                    onChange={(value) => handleSetStartTime(value)}
                  />

                  <NumberInput
                    flex={1}
                    min={0}
                    label="Additional hour/s?"
                    placeholder="0"
                    disabled={!bookingTime}
                    value={totalHours}
                    onChange={(value) => handleAddAdditionalHours(value)}
                  />
                </Flex>

                <NumberInput
                  min={1}
                  max={selectedService?.PERSONS}
                  label="Pax attendees"
                  placeholder="1"
                  disabled={!bookingDate}
                  value={totalPax}
                  onChange={setTotalPax}
                />
              </>
            )}

            {selectedService?.TYPE === 'Pool' && (
              <Flex mt="xs" mb="xs" justify="center" gap="md">
                <Select
                  flex={1}
                  withAsterisk
                  clearable
                  disabled={!bookingDate}
                  label="Swimming time"
                  placeholder="Select swimming time"
                  data={filteredSwimmingTimes}
                  value={swimTime}
                  onChange={(value) => handleSetStartTimeForSwimming(value)}
                />

                <NumberInput
                  flex={1}
                  min={1}
                  label="Total pax"
                  disabled={!swimTime}
                  value={totalPax}
                  onChange={(value) =>
                    handleCalculateTotalPaxForSwimming(value)
                  }
                />
              </Flex>
            )}
          </>
        )}

        {selectedService?.TYPE === 'Pavilion' && (
          <Text mb="sm" mt="sm" fw={700} c="#006400" align="center">
            The minimum duration for renting this service is 6 hours.
          </Text>
        )}

        <Group mt="md" mb="xs" justify="space-between">
          <Text>Price</Text>
          <Flex direction="column">
            <div>
              <NumberFormatter
                thousandSeparator
                value={selectedService?.PRICE}
                prefix="₱"
              />
              {selectedService?.TYPE === 'Room' && '/night'}
              {selectedService?.TYPE === 'Pavilion' && '/6hours'}
              {selectedService?.TYPE === 'Pool' && '/9am-5pm'}
            </div>

            {selectedService?.TYPE === 'Pool' && (
              <div>
                <NumberFormatter
                  thousandSeparator
                  value={selectedService?.PRICE_EXCEED}
                  prefix="₱"
                />
                /up to 11pm
              </div>
            )}
          </Flex>
        </Group>

        {selectedService?.TYPE === 'Pavilion' && (
          <Group mb="xs" justify="space-between">
            <Text>Additional hour pricing</Text>
            <div>
              <NumberFormatter
                thousandSeparator
                value={selectedService?.PRICE_EXCEED}
                prefix="₱"
              />
              /hour
            </div>
          </Group>
        )}

        <Group mb="xs" justify="space-between" align="start">
          <Text>Duration</Text>
          <Flex direction="column" align="end">
            <Text mb="xs">
              {selectedService?.TYPE === 'Room' &&
                totalNights !== 0 &&
                `${totalNights + 1} ${
                  totalNights + 1 > 1 ? 'days' : 'day'
                }, ${totalNights} ${totalNights > 1 ? 'nights' : 'night'}`}

              {selectedService?.TYPE === 'Pavilion' &&
                !!bookingTime &&
                `${6 + totalHours} hours`}

              {selectedService?.TYPE === 'Pool' &&
                (swimTime === 'night' ? 'up to 11pm' : '9am-5pm')}
            </Text>

            {selectedService?.TYPE !== 'Room' && !!bookingTime && (
              <Group align="center" gap={4}>
                <Text size="sm">{`${moment(bookingDate)
                  .set({
                    hour: parseInt(bookingTime, 10),
                  })
                  .format('MMMM D, YYYY @ h:mm a')}
                   `}</Text>
                <Text size="xs" c="dimmed">
                  to
                </Text>
                <Text size="sm">{`${moment(bookingDate)
                  .set({
                    hour:
                      selectedService?.TYPE === 'Pavilion'
                        ? parseInt(bookingTime, 10) + 6 + totalHours
                        : parseInt(bookingTime, 10) + 24 + totalHours,
                  })
                  .format('MMMM D, YYYY @ h:mm a')}
                   `}</Text>
              </Group>
            )}
          </Flex>
        </Group>

        {selectedService?.ADDONS?.length > 0 && (
          <Flex
            direction="column"
            mb="xs"
            justify="space-between"
            align="start"
          >
            <Text>Add-ons</Text>
            <Checkbox.Group
              value={addons}
              onChange={(values) => handleChangeAddOns(values)}
            >
              {selectedService.ADDONS.map((a) => (
                <Checkbox
                  mb="xs"
                  key={nanoid()}
                  disabled={
                    selectedService?.TYPE === 'Room'
                      ? !bookingDates[0] && !bookingDates[1]
                      : selectedService?.TYPE === 'Pavilion'
                      ? !bookingTime
                      : !swimTime
                  }
                  value={a?.name}
                  label={`${a?.name} - ₱${a?.price}`}
                />
              ))}
            </Checkbox.Group>
          </Flex>
        )}

        <Divider mb="xs" />

        <Group fw={700} mb="xs" justify="space-between">
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
        <Group mb="xs" justify="space-between">
          <Text>Service</Text>
          <Text>{`${selectedService?.TYPE} - ${selectedService?.NAME}`}</Text>
        </Group>

        <Group mb="xs" justify="space-between">
          <Text>Total Pax</Text>
          <Text>{totalPax}</Text>
        </Group>

        <Group mb="xs" justify="space-between">
          <Text>Start Date</Text>
          <Text>
            {selectedService?.TYPE === 'Room'
              ? moment(bookingDates[0]).format('ll')
              : moment(bookingDate)
                  .set({
                    hour: parseInt(bookingTime, 10),
                  })
                  .format('MMMM D, YYYY @ h:00 a')}
          </Text>
        </Group>

        <Group mb="xs" justify="space-between">
          <Text>End Date</Text>
          <Text>
            {selectedService?.TYPE === 'Room'
              ? moment(bookingDates[1]).format('ll')
              : moment(bookingDate)
                  .set({
                    hour: parseInt(bookingTime, 10) + 6 + totalHours,
                  })
                  .format('MMMM D, YYYY @ h:00 a')}
          </Text>
        </Group>

        <Divider mb="xs" />

        <Group mb="xs" justify="space-between">
          <Text>Duration</Text>
          <Flex direction="column" align="end">
            <Text mb="xs">
              {selectedService?.TYPE === 'Room' &&
                totalNights !== 0 &&
                `${totalNights + 1} ${
                  totalNights + 1 > 1 ? 'days' : 'day'
                }, ${totalNights} ${totalNights > 1 ? 'nights' : 'night'}`}

              {selectedService?.TYPE === 'Pavilion' &&
                !!bookingTime &&
                `${6 + totalHours} hours`}

              {swimTime === 'night' ? 'up to 11pm' : '9am-5pm'}
            </Text>

            {selectedService?.TYPE !== 'Room' && !!bookingTime && (
              <Group align="center" gap={4}>
                <Text size="sm">{`${moment(bookingDate)
                  .set({
                    hour: parseInt(bookingTime, 10),
                  })
                  .format('MMMM D, YYYY @ h:mm a')}
                   `}</Text>
                <Text size="xs" c="dimmed">
                  to
                </Text>
                <Text size="sm">{`${moment(bookingDate)
                  .set({
                    hour:
                      selectedService?.TYPE === 'Pavilion'
                        ? parseInt(bookingTime, 10) + 6 + totalHours
                        : parseInt(bookingTime, 10) + 24 + totalHours,
                  })
                  .format('MMMM D, YYYY @ h:mm a')}
                   `}</Text>
              </Group>
            )}
          </Flex>
        </Group>

        <Group mb="xs" justify="space-between" align="start">
          <Text>Service Price</Text>
          <Flex direction="column" justify="end">
            <div>
              <NumberFormatter
                thousandSeparator
                value={selectedService?.PRICE}
                prefix="₱"
              />
              {selectedService?.TYPE === 'Room' && '/night'}
              {selectedService?.TYPE === 'Pavilion' && '/6hours'}
              {selectedService?.TYPE === 'Pool' && '/9am-5pm'}
            </div>

            {selectedService?.TYPE === 'Pool' && (
              <div>
                <NumberFormatter
                  thousandSeparator
                  value={selectedService?.PRICE}
                  prefix="₱"
                />

                {selectedService?.TYPE === 'Pool' && '/up to 11pm'}
              </div>
            )}
          </Flex>
        </Group>

        {selectedService?.TYPE === 'Pavilion' && (
          <Group mb="xs" justify="space-between">
            <Text>Additional hour pricing</Text>
            <div>
              <NumberFormatter
                thousandSeparator
                value={selectedService?.PRICE_EXCEED}
                prefix="₱"
              />
              /hour
            </div>
          </Group>
        )}

        <Group mb="xs" justify="space-between" align="start">
          <Text>Add-ons</Text>
          <Flex direction="column" align="end">
            {addons?.length > 0
              ? addons.map((a) => {
                  const add = selectedService?.ADDONS.find(
                    (addon) => addon.name === a,
                  );
                  return (
                    <Text key={nanoid()} size="sm">
                      {add ? `${add.name} - ₱${add.price}` : ''}
                    </Text>
                  );
                })
              : '-'}
          </Flex>
        </Group>

        <Group fw={700} mb="xs" justify="space-between">
          <Text>Total Amount</Text>
          <NumberFormatter thousandSeparator value={totalAmount} prefix="₱" />
        </Group>

        <Divider mb="xs" />

        <Group fw={700} mb="xs" justify="space-between">
          <Text>Down Payment</Text>
          <Flex direction="row" align="center" gap="sm">
            <Text size="sm">(30% of ₱{totalAmount})</Text>
            <NumberFormatter
              thousandSeparator
              value={Math.floor(totalAmount * 0.3)}
              prefix="₱"
            />
          </Flex>
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
                {bookingError}
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
              <Text size="xl" align="center" fw={700}>
                You're almost there!
              </Text>
              <Text size="lg" align="center">
                Please pay the required down payment to confirm your booking.
              </Text>
            </>
          )}
        </Flex>
      </Box>
    );
  };

  const render360Iframe = () => {
    if (selectedService?.MAIN360) {
      const src = `https://cdn.pannellum.org/2.5/pannellum.htm#panorama=${encodeURIComponent(
        selectedService.MAIN360,
      )}&autoLoad=true&autoRotate=-2`;

      return (
        <iframe
          title={selectedService?.MAIN360}
          width="100%"
          height="100%"
          allowFullScreen
          src={src}
        ></iframe>
      );
    } else {
      return (
        <Flex w="100%" align="center" justify="center">
          {activeStepper < 3 && (
            <NoRecords message="No available 360 view for this service" />
          )}
        </Flex>
      );
    }
  };

  const nextStep = () =>
    setActiveStepper((current) => (current < 3 ? current + 1 : current));
  const prevStep = () =>
    setActiveStepper((current) => (current > 0 ? current - 1 : current));

  return (
    <Box pos="relative" mih={200}>
      {allServicesLoading && <ComponentLoader message="Fetching services" />}

      {!allServicesLoading && allServicesError && (
        <ComponentError message={allServicesError} />
      )}

      {!allServicesLoading && !allServicesError && (
        <>
          <Group mb="md" align="center" justify="center">
            {['Room', 'Pavilion', 'Pool'].map((f) => (
              <div key={f}>
                <Button
                  size="xs"
                  color="#2F6C2F"
                  disabled={allServicesLoading || allServicesError}
                  variant={sortingCriteria.includes(f) ? 'filled' : 'light'}
                  onClick={() => setSortingCriteria(f)}
                >
                  {f}
                </Button>
              </div>
            ))}
          </Group>

          <Flex justify="center" gap="md">
            {renderServices()}
          </Flex>
        </>
      )}

      <Modal
        centered
        size={selectedService?.MAIN360 ? '80%' : ''}
        title={'Booking - ' + selectedService?.NAME}
        shadow="xl"
        opened={isBookingModalOpen}
        onClose={() => handleCloseModal()}
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
        <Flex
          h={selectedService?.MAIN360 ? '70vh' : '100%'}
          direction={selectedService?.MAIN360 ? 'row' : 'column'}
          gap="lg"
        >
          <Flex direction="column" gap="sm" miw={550} maw={550}>
            <Stepper
              active={activeStepper}
              onStepClick={setActiveStepper}
              allowNextStepsSelect={false}
              color="#006400"
              size="sm"
              completedIcon={<IconCircleCheck />}
            >
              <Stepper.Step disabled={isBooked} icon={<IconReceipt />}>
                {render1stStepper()}
              </Stepper.Step>

              <Stepper.Step disabled={isBooked} icon={<IconListDetails />}>
                {render2ndStepper()}
              </Stepper.Step>

              <Stepper.Step
                disabled={isBooked}
                icon={bookingError ? <IconAlertCircle /> : <IconHomeCheck />}
                color={bookingError ? 'red' : ''}
              >
                {render3rdStepper()}
              </Stepper.Step>

              <Stepper.Completed>{renderCompleteStepper()}</Stepper.Completed>
            </Stepper>

            <Flex mt="xs" align="center" gap="md">
              {activeStepper === 0 && (
                <Button
                  fullWidth
                  disabled={
                    (selectedService?.TYPE === 'Room' &&
                      (!bookingDates[0] || !bookingDates[1])) ||
                    (selectedService?.TYPE === 'Pavilion' &&
                      (!bookingDate || !bookingTime)) ||
                    (selectedService?.TYPE === 'Pool' &&
                      (!bookingDate || !swimTime))
                  }
                  onClick={nextStep}
                  rightSection={<IconArrowRight />}
                  color="#006400"
                >
                  Next
                </Button>
              )}

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

              {activeStepper === 3 && (
                <Button
                  fullWidth
                  onClick={handleCloseModal}
                  variant="outline"
                  color="#006400"
                >
                  Close
                </Button>
              )}
            </Flex>
          </Flex>

          {render360Iframe()}
        </Flex>
      </Modal>
    </Box>
  );
}

export default UserReservation;
