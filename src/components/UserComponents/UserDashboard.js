import {
  ActionIcon,
  Box,
  Button,
  Code,
  Divider,
  FileButton,
  Flex,
  Group,
  Image,
  Modal,
  NumberFormatter,
  NumberInput,
  Rating,
  Select,
  Table,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core';
import { DateInput, DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import {
  IconBrandPaypal,
  IconCircleX,
  IconCoins,
  IconEdit,
  IconQrcode,
  IconTrash,
  IconWallet,
} from '@tabler/icons-react';
import { IconThumbUp } from '@tabler/icons-react';
import axios from 'axios';
import moment from 'moment';
import { nanoid } from 'nanoid';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { GlobalContext } from '../../App';
import {
  calculateDuration,
  getCountForDashboard,
  renderReservationDateStatus,
  renderReservationServiceType,
  renderTableDate,
  sortReservations,
  statusColorChanger,
} from '../../utils/renderTableHelper';
import { getUser } from '../../utils/user';
import DashboardCard from '../DashboardCard/DashboardCard';
import ComponentError from '../utils/ComponentError';
import ComponentLoader from '../utils/ComponentLoader';
import NoRecords from '../utils/NoRecords';

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

function UserDashboard() {
  //context
  const {
    getAllReservations,
    allReservations,
    allReservationsError,
    allReservationsLoading,
    allServices,
    allUsers,
  } = useContext(GlobalContext);

  const [selectedReservation, setSelectedReservation] = useState({});
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isCancellingReservation, setIsCancellingReservation] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [isEditingReservation, setIsEditingReservation] = useState(false);

  const [refNumber, setRefNumber] = useState('');
  const [gcashName, setGcashName] = useState('');
  const [gcashNumber, setGcashNumber] = useState(0);
  const [isUploadingTransaction, setIsUploadingTransaction] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const [roomDates, setRoomDates] = useState([null, null]);

  const [filteredDataTimes, setFilteredDataTimes] = useState(dataTimes);
  const [pavTime, setPavTime] = useState(null);
  const [pavAddTime, setPavAddTime] = useState(null);
  const [pavDate, setPavDate] = useState(null);
  const [duration, setDuration] = useState(null);

  const [filteredSwimmingTimes, setFilteredSwimmingTimes] =
    useState(swimmingTimes);
  const [poolDate, setPoolDate] = useState(null);
  const [poolTime, setPoolTime] = useState(null);
  const [poolPax, setPoolPax] = useState(null);

  const [newBalance, setNewBalance] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const [feedbackStars, setFeedbackStars] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackDate, setFeedbackDate] = useState(null);

  const user = JSON.parse(getUser());

  const syncedData = allReservations
    ?.map((reservation) => {
      const {
        NAME: SERVICE_NAME,
        PERSONS,
        PRICE,
        TYPE,
        IS_DELETED,
        PRICE_EXCEED,
      } = allServices?.find(
        (service) => service.ID === reservation?.SERVICE_ID,
      ) || {};

      return {
        ...reservation,
        SERVICE_NAME,
        PERSONS,
        PRICE,
        PRICE_EXCEED,
        TYPE,
        IS_DELETED,
      };
    })
    ?.filter((r) => r?.USER_ID === user?.ID);

  //modal
  const [
    isPayPalModalOpen,
    { open: openPayPalModal, close: closePayPalModal },
  ] = useDisclosure(false);

  const [
    isCancellationModalOpen,
    { open: openCancelModal, close: closeCancelModal },
  ] = useDisclosure(false);

  const [isGcashModalOpen, { open: openGcashModal, close: closeGcashModal }] =
    useDisclosure(false);

  const [
    isFeedbackModalOpen,
    { open: openFeedbackModal, close: closeFeedbackModal },
  ] = useDisclosure(false);

  const [isEditModalOpen, { open: openEditModal, close: closeEditModal }] =
    useDisclosure(false);

  const [
    isHistoryModalOpen,
    { open: openHistoryModal, close: closeHistoryModal },
  ] = useDisclosure(false);

  //form
  let form = useForm({
    initialValues: {
      amount: 0,
    },

    validate: {
      amount: (value) =>
        value > 0
          ? value > selectedReservation.BALANCE
            ? 'Amount is greater than balance'
            : null
          : 'Please enter a valid amount',
    },
  });

  //modal opens
  const handleOpenPaypalWindow = (amount) => {
    closePayPalModal();
    setIsProcessingPayment(true);

    const paypalWindow = window.open(
      `${process.env.REACT_APP_BE_BASE_URL}/pay?id=${selectedReservation?.ID}&amount=${amount}`,
      '_blank',
      'height=600 width=500 top=' +
        (window.outerHeight / 2 + window.screenY - 600 / 2) +
        ',left=' +
        (window.outerWidth / 2 + window.screenX - 500 / 2),
    );

    const checkPaypalWindow = setInterval(() => {
      if (paypalWindow.closed) {
        setIsProcessingPayment(false);
        clearInterval(checkPaypalWindow);
      }
    }, 500);

    return () => {
      clearInterval(checkPaypalWindow);
    };
  };

  const handleOpenPayPalModal = (reservation) => {
    form.reset();
    setSelectedReservation(reservation);
    openPayPalModal();
  };

  const handleOpenCancellationModal = (reservation) => {
    setSelectedReservation(reservation);
    openCancelModal();
  };

  const handleOpenFeedbackModal = (reservation) => {
    setSelectedReservation(reservation);

    if (reservation?.FEEDBACK) {
      const { comment, star, d } = reservation?.FEEDBACK[0];

      setFeedbackMessage(comment);
      setFeedbackStars(star);
      setFeedbackDate(d);
    } else {
      setFeedbackMessage('');
      setFeedbackStars(null);
      setFeedbackDate(null);
    }

    openFeedbackModal();
  };

  const handleOpenGcashModal = (reservation) => {
    setSelectedReservation(reservation);
    setRefNumber('');
    setGcashName('');
    setGcashNumber(0);
    setUploadedFile(null);
    openGcashModal();
  };

  const handleOpenEditModal = (reservation) => {
    setSelectedReservation(reservation);

    if (reservation?.TYPE === 'Room') {
      setRoomDates([
        new Date(reservation?.START_DATE),
        new Date(reservation?.END_DATE),
      ]);

      setNewBalance(reservation?.BALANCE);
      setTotalAmount(reservation?.AMOUNT);
    }

    if (reservation?.TYPE === 'Pavilion') {
      const reservationStartTime = moment.utc(reservation?.START_DATE).hour();

      const startTime = dataTimes.find(
        (d) => parseInt(d.value) === reservationStartTime,
      )?.value;

      const start = moment(reservation?.START_DATE);
      const end = moment(reservation?.END_DATE);

      const hourDifference = end.diff(start, 'hours');

      setPavDate(new Date(reservation?.START_DATE));
      setPavTime(startTime);
      setPavAddTime(hourDifference - 6);
      setTotalAmount(reservation?.AMOUNT);
      setNewBalance(reservation?.BALANCE);
      setDuration(hourDifference);
    }

    if (reservation?.TYPE === 'Pool') {
      const end = moment.utc(reservation?.END_DATE).hour();

      const poolTime = end === 17 ? 'morning' : 'night';

      setPoolDate(new Date(reservation?.START_DATE));
      setPoolTime(poolTime);
      setPoolPax(reservation?.PAX);
      setTotalAmount(reservation?.AMOUNT);
      setNewBalance(reservation?.BALANCE);
    }

    openEditModal();
  };

  const handleOpenPaymentHistoryModal = (reservation) => {
    setSelectedReservation(reservation);
    openHistoryModal();
  };

  //function
  const handleProcessPayment = () => {
    selectedReservation?.PAYMENT_HISTORY.push({
      amount: form.values.amount,
      dop: moment().format('ll'),
      method: 'PayPal',
    });

    const paymentHistory = selectedReservation?.PAYMENT_HISTORY;

    const balance = selectedReservation?.BALANCE - form.values?.amount;

    const status = balance <= 0 ? 'Fully Paid' : 'Paid - Partial';

    const requiredDP = Math.floor(selectedReservation?.AMOUNT * 0.3);
    const totalAmountPaid = selectedReservation?.AMOUNT - balance;

    axios({
      method: 'PUT',
      url: `/reservations/${selectedReservation?.ID}`,
      data: {
        ...selectedReservation,
        BALANCE: balance,
        IS_DOWNPAYMENT_PAID: totalAmountPaid >= requiredDP,
        PAYMENT_HISTORY: paymentHistory,
        STATUS: status,
      },
    })
      .then(() => {
        getAllReservations();

        toast.success('Successfully paid', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 1500,
        });
      })
      .catch(() =>
        toast.error('An error occurred', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 1500,
        }),
      )
      .finally(() => setIsProcessingPayment(false));
  };

  const handleCancelReservation = () => {
    setIsCancellingReservation(true);

    axios({
      method: 'PUT',
      url: `/reservations/${selectedReservation?.ID}`,
      data: {
        ...selectedReservation,
        STATUS: 'Cancelled',
      },
    })
      .then(() => {
        getAllReservations();

        closeCancelModal();

        toast.info('Reservation cancelled', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 1500,
        });
      })
      .catch(() =>
        toast.error('An error occurred', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 1500,
        }),
      )
      .finally(() => setIsCancellingReservation(false));
  };

  const handleSubmitFeedback = () => {
    setIsSubmittingFeedback(true);

    const FEEDBACK = [
      {
        star: feedbackStars,
        comment: feedbackMessage,
        d: moment(),
      },
    ];

    axios({
      method: 'PUT',
      url: `/reservations/${selectedReservation?.ID}`,
      data: { FEEDBACK },
    })
      .then(() => {
        closeFeedbackModal();
        getAllReservations();

        toast.success('Successfully added review', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 1500,
        });
      })
      .catch(() =>
        toast.error('An error occurred', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 1500,
        }),
      )
      .finally(() => setIsSubmittingFeedback(false));
  };

  const handleDateChange = (values) => {
    if (selectedReservation?.TYPE === 'Room') {
      setRoomDates(values);
      if (values[0] && values[1]) {
        const pricePerNight = allServices?.find(
          (d) => d.ID === selectedReservation?.SERVICE_ID,
        )?.PRICE;

        const totalPaid =
          selectedReservation?.AMOUNT - selectedReservation?.BALANCE;

        const startDate = moment(values[0]);
        const endDate = moment(values[1]);

        const totalNights = endDate.diff(startDate, 'days');
        const totalAmount = totalNights * pricePerNight;

        setTotalAmount(totalAmount);
        setNewBalance(totalAmount - totalPaid);
      }
    }

    if (selectedReservation?.TYPE === 'Pavilion') {
      setPavDate(values);
      setTotalAmount(0);
      setNewBalance(0);
      setPavTime(null);
      const selectedDate = moment(values);
      const currentTime = moment().format('HH');

      if (selectedDate.isSame(moment(), 'day')) {
        const filteredTimes = dataTimes.filter(
          ({ value }) => parseInt(value) > currentTime,
        );
        setFilteredDataTimes(filteredTimes);
      } else {
        setFilteredDataTimes(dataTimes);
      }
    }

    if (selectedReservation?.TYPE === 'Pool') {
      setPoolDate(values);
      setTotalAmount(0);
      setNewBalance(0);
      setPoolTime(null);

      const selectedDate = moment(values);
      const currentTime = moment().hour();

      if (selectedDate.isSame(moment(), 'day')) {
        if (currentTime <= 9) {
          setFilteredSwimmingTimes(swimmingTimes);
        } else {
          const swimTimeFilter = swimmingTimes.filter(
            (s) => s.value === 'night',
          );
          setFilteredSwimmingTimes(swimTimeFilter);
        }
      }
    }
  };

  const handleSetStartTime = (value) => {
    const totalPaid =
      selectedReservation?.AMOUNT - selectedReservation?.BALANCE;

    if (selectedReservation?.TYPE === 'Pavilion') {
      setPavTime(value);
      setPavAddTime(0);

      setTotalAmount(selectedReservation?.PRICE);
      setNewBalance(selectedReservation?.PRICE - totalPaid);
      setDuration(6);
    }

    if (selectedReservation?.TYPE === 'Pool') {
      setPoolTime(value);
      setPoolPax(1);

      if (value === 'morning') {
        setTotalAmount(selectedReservation?.PRICE);
        setNewBalance(selectedReservation?.PRICE - totalPaid);
      } else {
        setTotalAmount(selectedReservation?.PRICE_EXCEED);
        setNewBalance(selectedReservation?.PRICE_EXCEED - totalPaid);
      }
    }
  };

  const handleAddAdditionalHours = (value) => {
    const totalPaid =
      selectedReservation?.AMOUNT - selectedReservation?.BALANCE;

    const total =
      selectedReservation?.PRICE + selectedReservation?.PRICE_EXCEED * value;

    setPavAddTime(value);

    if (value <= 0) {
      setTotalAmount(selectedReservation?.PRICE);
      setDuration(6);
    } else {
      setTotalAmount(total);
      setDuration(6 + value);
    }

    setNewBalance(total - totalPaid);
  };

  const handleChangePax = (value) => {
    const totalPaid =
      selectedReservation?.AMOUNT - selectedReservation?.BALANCE;

    let total;

    if (poolTime === 'morning') {
      total = selectedReservation?.PRICE * value;
    } else {
      total = selectedReservation?.PRICE_EXCEED * value;
    }

    setPoolPax(value);
    setTotalAmount(total);
    setNewBalance(total - totalPaid);
  };

  const handleReschedule = () => {
    setIsEditingReservation(true);

    if (selectedReservation?.TYPE === 'Room') {
      const requiredDP = Math.floor(totalAmount * 0.3);
      const totalAmountPaid = totalAmount - newBalance;

      let STATUS;
      if (totalAmountPaid === 0) {
        STATUS = 'Unpaid';
      } else if (
        totalAmountPaid >= requiredDP &&
        totalAmountPaid < totalAmount
      ) {
        STATUS = 'Paid - Partial';
      } else if (totalAmountPaid === totalAmount) {
        STATUS = 'Fully Paid';
      }

      axios({
        method: 'PUT',
        url: `/reservations/${selectedReservation?.ID}`,
        data: {
          START_DATE: moment(roomDates[0]).format('ll'),
          END_DATE: moment(roomDates[1]).format('ll'),
          AMOUNT: totalAmount,
          BALANCE: newBalance,
          IS_DOWNPAYMENT_PAID: totalAmountPaid >= requiredDP,
          STATUS,
        },
      })
        .then(() => {
          getAllReservations();
          closeEditModal();

          toast.success('Successfully rescheduled', {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 1500,
          });
        })
        .catch((err) =>
          toast.error('An error occurred', {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 1500,
          }),
        )
        .finally(() => setIsEditingReservation(false));
    }

    if (selectedReservation?.TYPE === 'Pavilion') {
      const requiredDP = Math.floor(totalAmount * 0.3);
      const totalAmountPaid = totalAmount - newBalance;

      let STATUS;
      if (totalAmountPaid === 0) {
        STATUS = 'Unpaid';
      } else if (
        totalAmountPaid >= requiredDP &&
        totalAmountPaid < totalAmount
      ) {
        STATUS = 'Paid - Partial';
      } else if (totalAmountPaid === totalAmount) {
        STATUS = 'Fully Paid';
      }

      axios({
        method: 'PUT',
        url: `/reservations/${selectedReservation?.ID}`,
        data: {
          START_DATE: moment(pavDate)
            .set({ hour: parseInt(pavTime, 10) })
            .format('MMMM D, YYYY @ h:mm a'),
          END_DATE: moment(pavDate)
            .set({ hour: parseInt(pavTime, 10) + 6 + pavAddTime })
            .format('MMMM D, YYYY @ h:mm a'),
          AMOUNT: totalAmount,
          BALANCE: newBalance,
          IS_DOWNPAYMENT_PAID: totalAmountPaid >= requiredDP,
          STATUS,
        },
      })
        .then(() => {
          getAllReservations();
          closeEditModal();

          toast.success('Successfully rescheduled', {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 1500,
          });
        })
        .catch((err) =>
          toast.error('An error occurred', {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 1500,
          }),
        )
        .finally(() => setIsEditingReservation(false));
    }

    if (selectedReservation?.TYPE === 'Pool') {
      const requiredDP = Math.floor(totalAmount * 0.3);
      const totalAmountPaid = totalAmount - newBalance;

      let STATUS;
      if (totalAmountPaid === 0) {
        STATUS = 'Unpaid';
      } else if (
        totalAmountPaid >= requiredDP &&
        totalAmountPaid < totalAmount
      ) {
        STATUS = 'Paid - Partial';
      } else if (totalAmountPaid === totalAmount) {
        STATUS = 'Fully Paid';
      }

      let START_DATE;
      let END_DATE;

      if (poolTime === 'morning') {
        START_DATE = moment(poolDate)
          .set({ hour: 9 })
          .format('MMMM D, YYYY @ h:mm a');
        END_DATE = moment(poolDate)
          .set({ hour: 17 })
          .format('MMMM D, YYYY @ h:mm a');
      } else {
        START_DATE = moment(poolDate)
          .set({ hour: 17 })
          .format('MMMM D, YYYY @ h:mm a');
        END_DATE = moment(poolDate)
          .set({ hour: 23 })
          .format('MMMM D, YYYY @ h:mm a');
      }

      axios({
        method: 'PUT',
        url: `/reservations/${selectedReservation?.ID}`,
        data: {
          // START_DATE: moment(poolDate)
          //   .set({ hour: parseInt(pavTime, 10) })
          //   .format('MMMM D, YYYY @ h:mm a'),
          // END_DATE: moment(pavDate)
          //   .set({ hour: parseInt(pavTime, 10) + 6 + pavAddTime })
          //   .format('MMMM D, YYYY @ h:mm a'),
          START_DATE,
          END_DATE,
          AMOUNT: totalAmount,
          BALANCE: newBalance,
          IS_DOWNPAYMENT_PAID: totalAmountPaid >= requiredDP,
          STATUS,
        },
      })
        .then(() => {
          getAllReservations();
          closeEditModal();

          toast.success('Successfully rescheduled', {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 1500,
          });
        })
        .catch((err) =>
          toast.error('An error occurred', {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 1500,
          }),
        )
        .finally(() => setIsEditingReservation(false));
    }
  };

  const handleProcessGcashPayment = () => {
    setIsUploadingTransaction(true);

    const formData = new FormData();
    formData.append('image', uploadedFile);

    axios({
      method: 'POST',
      url: '/image/upload',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    })
      .then(({ data }) => {
        if (!!data?.PATH) {
          const GCASH_PENDING_PAYMENTS = [
            {
              transaction_photo: data.PATH,
              dop: moment().format('ll'),
              refNumber,
              gcashName,
              gcashNumber,
            },
          ];

          axios({
            method: 'PUT',
            url: `/reservations/${selectedReservation?.ID}`,
            data: { GCASH_PENDING_PAYMENTS },
          })
            .then(() => {
              getAllReservations();
              closeGcashModal();

              toast.success('Successfully uploaded transaction', {
                position: toast.POSITION.TOP_RIGHT,
                autoClose: 1500,
              });
            })
            .catch(() =>
              toast.error('An error occurred', {
                position: toast.POSITION.TOP_RIGHT,
                autoClose: 1500,
              }),
            )
            .finally(() => setIsUploadingTransaction(false));
        }
      })
      .catch(() => {
        toast.error('An error occurred', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 1500,
        });
        setIsUploadingTransaction(false);
      });
  };

  //render
  const renderDashboardTotals = () => {
    const dashboardTotals = [
      getCountForDashboard(syncedData, 'Room'),
      getCountForDashboard(syncedData, 'Pavilion'),
      getCountForDashboard(syncedData, 'Pool'),
    ];

    return dashboardTotals?.map(({ service, total, cancelled }) => (
      <DashboardCard
        key={service}
        service={service}
        total={total}
        cancelled={cancelled}
      />
    ));
  };

  const renderTable = () => {
    const sortedReservation = sortReservations(syncedData);

    if (sortedReservation?.length > 0) {
      return sortedReservation?.map((reservation) => (
        <Table.Tr
          key={reservation?.ID}
          bg={
            reservation?.STATUS !== 'Cancelled' &&
            !reservation?.IS_DOWNPAYMENT_PAID
              ? '#FFCDD2'
              : ''
          }
        >
          <Table.Td>{renderReservationDateStatus(reservation)}</Table.Td>

          <Table.Td>{renderReservationServiceType(reservation)}</Table.Td>

          <Table.Td>
            {renderTableDate(
              reservation?.START_DATE,
              reservation?.END_DATE,
              reservation?.TYPE,
            )}
          </Table.Td>

          <Table.Td>{reservation?.PAX}</Table.Td>

          <Table.Td>
            {calculateDuration(
              reservation?.START_DATE,
              reservation?.END_DATE,
              reservation?.TYPE,
            )}
          </Table.Td>

          <Table.Td>
            <Text c={statusColorChanger(reservation)}>
              {reservation?.STATUS}
            </Text>
          </Table.Td>

          <Table.Td>
            <NumberFormatter
              thousandSeparator
              value={reservation?.AMOUNT}
              prefix="₱"
            />
          </Table.Td>
          <Table.Td>
            <NumberFormatter
              thousandSeparator
              value={reservation?.BALANCE}
              prefix="₱"
            />
          </Table.Td>

          <Table.Td>
            <Flex direction="row" gap="xs">
              <ActionIcon
                color="#FF0800"
                disabled={
                  reservation?.STATUS === 'Cancelled' ||
                  moment().isAfter(reservation?.END_DATE)
                }
                onClick={() => handleOpenCancellationModal(reservation)}
              >
                <IconCircleX />
              </ActionIcon>

              <ActionIcon
                disabled={moment().isBefore(reservation?.END_DATE)}
                color="#006400"
                onClick={() => handleOpenFeedbackModal(reservation)}
              >
                <IconThumbUp />
              </ActionIcon>

              <ActionIcon
                disabled={
                  reservation?.STATUS === 'Cancelled' ||
                  moment().isAfter(reservation?.START_DATE)
                }
                color="#FFBF00"
                onClick={() => handleOpenEditModal(reservation)}
              >
                <IconEdit />
              </ActionIcon>
            </Flex>
          </Table.Td>

          <Table.Td>
            <Flex direction="row" gap="xs">
              <ActionIcon
                loading={
                  isProcessingPayment &&
                  selectedReservation?.ID === reservation?.ID
                }
                disabled={
                  isProcessingPayment &&
                  selectedReservation?.ID !== reservation?.ID
                }
                onClick={() => handleOpenPayPalModal(reservation)}
              >
                <IconBrandPaypal />
              </ActionIcon>

              <ActionIcon
                color="#800020"
                onClick={() => handleOpenGcashModal(reservation)}
              >
                <IconQrcode />
              </ActionIcon>

              <ActionIcon
                color="#72A0C1"
                onClick={() => handleOpenPaymentHistoryModal(reservation)}
              >
                <IconWallet />
              </ActionIcon>
            </Flex>
          </Table.Td>
        </Table.Tr>
      ));
    } else {
      return (
        <Table.Tr>
          <Table.Td colSpan={10}>
            <NoRecords />
          </Table.Td>
        </Table.Tr>
      );
    }
  };

  const renderTableLength = () => {
    return (
      syncedData?.length > 0 && (
        <Text
          mt="sm"
          mb="sm"
          c="gray"
          align="center"
        >{`${syncedData.length} Total Reservation`}</Text>
      )
    );
  };

  const renderPayPalModalAmountTab = () => {
    return (
      <>
        <Group mb="xs" justify="space-between">
          <Text>Service</Text>
          <div style={{ fontWeight: 700 }}>
            {renderReservationServiceType(selectedReservation)}
          </div>
        </Group>

        <Group fw={700} mb="xs" justify="space-between">
          <Text>Service Price</Text>
          <div>
            <NumberFormatter
              thousandSeparator
              prefix="₱"
              value={selectedReservation?.PRICE}
            />

            {selectedReservation?.TYPE === 'Room' ? '/night' : '/hour'}
          </div>
        </Group>

        <Group fw={700} mb="xs" justify="space-between">
          <Text>Total Amount</Text>
          <NumberFormatter
            thousandSeparator
            prefix="₱"
            value={selectedReservation?.AMOUNT}
          />
        </Group>

        <Group fw={700} mb="xs" justify="space-between">
          <Text>Balance</Text>
          <NumberFormatter
            thousandSeparator
            prefix="₱"
            value={selectedReservation?.BALANCE}
          />
        </Group>

        {selectedReservation?.STATUS !== 'Cancelled' &&
        selectedReservation?.IS_DOWNPAYMENT_PAID ? (
          selectedReservation?.BALANCE > 0 && (
            <Text c="#006400" align="center">
              Down payment is paid
            </Text>
          )
        ) : (
          <Group fw={700} mb="xs" justify="space-between">
            <Text style={{ alignSelf: 'start' }}>Required Downpayment</Text>
            <Flex direction="column" align="end">
              <NumberFormatter
                thousandSeparator
                prefix="₱"
                value={Math.floor(selectedReservation?.AMOUNT * 0.3)}
              />
              <Text size="xs" mb="xs" mt="xs">
                (30% of {selectedReservation?.AMOUNT})
              </Text>
              {renderReservationDateStatus(selectedReservation)}
            </Flex>
          </Group>
        )}
      </>
    );
  };

  const renderPaymentHistoryModal = () => {
    return (
      <Box mb="sm">
        {selectedReservation?.PAYMENT_HISTORY?.length > 0 ? (
          selectedReservation.PAYMENT_HISTORY.sort(
            (a, b) =>
              moment(a.dop, 'MMM DD, YYYY') - moment(b.dop, 'MMM DD, YYYY'),
          ).map((history) => (
            <Group
              fw={700}
              justify="space-between"
              key={nanoid()}
              p="xs"
              style={{}}
            >
              <NumberFormatter
                thousandSeparator
                prefix="₱"
                value={history.amount}
              />
              <Text>{history.method}</Text>
              <Text>{history.dop}</Text>
            </Group>
          ))
        ) : (
          <NoRecords message="No payment history" />
        )}
      </Box>
    );
  };

  const renderCancellationModalBody = () => {
    if (selectedReservation) {
      return (
        <>
          <Text align="center" my="md">
            Are you sure you want to cancel? All payments made are
            non-refundable.
          </Text>

          <Text size="xl" fw={900} align="center">
            {selectedReservation?.SERVICE_NAME}
          </Text>

          <Flex justify="center">
            {renderTableDate(
              selectedReservation?.START_DATE,
              selectedReservation?.END_DATE,
              selectedReservation?.TYPE,
            )}
          </Flex>

          <Button
            fullWidth
            mt="md"
            color="#FF0800"
            tt="uppercase"
            fw={400}
            leftSection={<IconTrash />}
            loading={isCancellingReservation}
            onClick={handleCancelReservation}
          >
            I understand
          </Button>
        </>
      );
    }
  };

  const renderGcashQRModalBody = () => {
    const qr = allUsers?.find(
      ({ EMAIL }) => EMAIL === 'admin@felrey.com',
    )?.QR_IMAGE;

    if (qr) {
      return selectedReservation?.GCASH_PENDING_PAYMENTS?.length > 0 ? (
        <>
          <Text w={440} size="1.5rem" align="center" mb="lg" mt="lg">
            You still have a pending payment
          </Text>

          <Flex direction="column" gap="md">
            <Group justify="space-between">
              <Text>Ref. number</Text>
              <Code style={{ fontSize: '1.25rem' }}>
                {selectedReservation?.GCASH_PENDING_PAYMENTS[0]?.refNumber}
              </Code>
            </Group>

            <Group justify="space-between">
              <Text>G-cash name</Text>
              <Text>
                {selectedReservation?.GCASH_PENDING_PAYMENTS[0]?.gcashName}
              </Text>
            </Group>

            <Group justify="space-between">
              <Text>G-cash number</Text>
              <Text>
                {selectedReservation?.GCASH_PENDING_PAYMENTS[0]?.gcashNumber}
              </Text>
            </Group>
          </Flex>
        </>
      ) : (
        <Flex gap="lg" miw={440}>
          {selectedReservation?.STATUS !== 'Cancelled' &&
            selectedReservation?.BALANCE > 0 && (
              <Flex direction="column" justify="center" gap="sm">
                <Image src={qr} w={400} />
                <Text align="center" display="inline-block" w={400} c="#006400">
                  After paying using the QR Code, please enter the neccessary
                  details and upload the screenshot of the transaction
                </Text>
              </Flex>
            )}

          <Flex flex={1} direction="column" miw={440}>
            <>
              <Group mb="xs" justify="space-between">
                <Text>Service</Text>
                <div style={{ fontWeight: 700 }}>
                  {renderReservationServiceType(selectedReservation)}
                </div>
              </Group>

              <Group fw={700} mb="xs" justify="space-between">
                <Text>Service Price</Text>
                <div>
                  <NumberFormatter
                    thousandSeparator
                    prefix="₱"
                    value={selectedReservation?.PRICE}
                  />

                  {selectedReservation?.TYPE === 'Room' ? '/night' : '/hour'}
                </div>
              </Group>

              <Group fw={700} mb="xs" justify="space-between">
                <Text>Total Amount</Text>
                <NumberFormatter
                  thousandSeparator
                  prefix="₱"
                  value={selectedReservation?.AMOUNT}
                />
              </Group>

              <Group fw={700} mb="xs" justify="space-between">
                <Text>Balance</Text>
                <NumberFormatter
                  thousandSeparator
                  prefix="₱"
                  value={selectedReservation?.BALANCE}
                />
              </Group>
            </>

            {selectedReservation?.STATUS !== 'Cancelled' &&
              selectedReservation?.BALANCE === 0 && (
                <Text mt="sm" c="darkgreen" align="center" fw={700}>
                  This reservation is fully paid
                </Text>
              )}

            {selectedReservation?.STATUS === 'Cancelled' && (
              <Text mt="sm" c="#FF0800" align="center" fw={700}>
                This reservation is cancelled
              </Text>
            )}

            {selectedReservation?.STATUS !== 'Cancelled' &&
              selectedReservation?.BALANCE > 0 && (
                <>
                  <Group fw={700} justify="space-between" mb="md">
                    <Text size="1.5rem">Amount to be paid</Text>
                    <NumberFormatter
                      style={{ fontSize: '2rem' }}
                      thousandSeparator
                      value={selectedReservation?.BALANCE}
                      prefix="₱"
                    />
                  </Group>

                  <TextInput
                    withAsterisk
                    label="Reference number"
                    placeholder="Enter reference number"
                    mb="sm"
                    value={refNumber}
                    onChange={(e) => setRefNumber(e.currentTarget.value)}
                  />

                  <TextInput
                    withAsterisk
                    label="Name"
                    placeholder="Enter G-cash name"
                    mb="sm"
                    value={gcashName}
                    onChange={(e) => setGcashName(e.currentTarget.value)}
                  />

                  <NumberInput
                    withAsterisk
                    label="G-cash Number"
                    placeholder="Enter G-cash number"
                    mb="sm"
                    value={gcashNumber}
                    onChange={setGcashNumber}
                  />

                  <Flex align="center" gap="lg" direction="column">
                    <FileButton
                      onChange={setUploadedFile}
                      accept="image/png,image/jpeg"
                    >
                      {(props) => (
                        <Button
                          disabled={isUploadingTransaction}
                          {...props}
                          mt="lg"
                          mb="xs"
                          color="#006400"
                        >
                          Upload transaction
                        </Button>
                      )}
                    </FileButton>

                    <Text align="center">{uploadedFile?.name}</Text>
                  </Flex>

                  <Button
                    fullWidth
                    mt="xl"
                    color="#006400"
                    leftSection={<IconCoins />}
                    loading={isUploadingTransaction}
                    disabled={
                      !refNumber || !gcashName || !gcashNumber || !uploadedFile
                    }
                    onClick={handleProcessGcashPayment}
                  >
                    Pay
                  </Button>
                </>
              )}
          </Flex>
        </Flex>
      );
    } else {
      return <NoRecords message="No QR available" />;
    }
  };

  const renderFeedbackModalBody = () => {
    return (
      <Flex justify="center" align="center" direction="column">
        <Rating
          size="xl"
          mb="sm"
          value={feedbackStars}
          onChange={setFeedbackStars}
        ></Rating>

        <Textarea
          w={400}
          rows={10}
          mb="sm"
          label="Tell us about your experience!"
          placeholder="Message..."
          value={feedbackMessage}
          onChange={(e) => setFeedbackMessage(e.currentTarget.value)}
        />

        <Text mb="md">{feedbackDate && moment(feedbackDate).format('ll')}</Text>

        <Button
          fullWidth
          color="#006400"
          onClick={handleSubmitFeedback}
          loading={isSubmittingFeedback}
          disabled={!feedbackStars || !feedbackMessage}
        >
          Submit
        </Button>
      </Flex>
    );
  };

  const renderEditModalBody = () => {
    if (selectedReservation?.TYPE === 'Room') {
      return (
        <Flex direction="column" gap="md">
          <DatePickerInput
            withAsterisk
            minDate={new Date()}
            mb="sm"
            type="range"
            label="Choose dates"
            placeholder="Please choose date range"
            value={roomDates}
            onChange={(values) => handleDateChange(values)}
          />

          <Group justify="space-between">
            <Text>Total Amount</Text>
            <NumberFormatter thousandSeparator value={totalAmount} prefix="₱" />
          </Group>

          <Group justify="space-between" align="start">
            <Text>Payment History</Text>
            <Flex direction="column">
              {selectedReservation?.PAYMENT_HISTORY &&
                selectedReservation?.PAYMENT_HISTORY.map((h, index) => (
                  <NumberFormatter
                    key={index}
                    thousandSeparator
                    value={h?.amount}
                    prefix="₱"
                  />
                ))}
            </Flex>
          </Group>

          <Group justify="space-between">
            <Text>Required Downpayment</Text>
            <NumberFormatter
              thousandSeparator
              value={Math.floor(totalAmount * 0.3)}
              prefix="₱"
            />
          </Group>

          <Group justify="space-between">
            <Text>New Balance</Text>
            <NumberFormatter thousandSeparator value={newBalance} prefix="₱" />
          </Group>

          <Button
            fullWidth
            color="#006400"
            fw="normal"
            loading={isEditingReservation}
            onClick={handleReschedule}
          >
            Reschedule
          </Button>
        </Flex>
      );
    }

    if (selectedReservation?.TYPE === 'Pavilion') {
      return (
        <Flex direction="column" gap="md">
          <DateInput
            withAsterisk
            label="Choose date"
            placeholder="Please choose date"
            minDate={
              new Date().getHours() >= 23
                ? new Date(new Date().setDate(new Date().getDate() + 1))
                : new Date()
            }
            value={pavDate}
            onChange={(value) => handleDateChange(value)}
          />

          <Flex gap="sm">
            <Select
              flex={1}
              withAsterisk
              clearable
              disabled={!pavDate}
              label="Start time"
              placeholder="Select start time"
              data={filteredDataTimes}
              value={pavTime}
              onChange={(value) => handleSetStartTime(value)}
            />

            <NumberInput
              flex={1}
              min={0}
              label="Additional hour/s?"
              placeholder="0"
              disabled={!pavTime}
              value={pavAddTime}
              onChange={(value) => handleAddAdditionalHours(value)}
            />
          </Flex>

          <Group justify="space-between" mt="md">
            <Text>Duration</Text>
            <Text>{duration}hours</Text>
          </Group>

          <Group justify="space-between">
            <Text>Price</Text>
            <Flex direction="row">
              <NumberFormatter
                thousandSeparator
                value={selectedReservation?.PRICE}
                prefix="₱"
              />
              <Text>/6hours</Text>
            </Flex>
          </Group>

          <Group justify="space-between">
            <Text>Additional hour pricing</Text>
            <Flex direction="row">
              <NumberFormatter
                thousandSeparator
                value={selectedReservation?.PRICE_EXCEED}
                prefix="₱"
              />
              <Text>/hour</Text>
            </Flex>
          </Group>

          <Divider />

          <Group justify="space-between">
            <Text>Total Amount</Text>
            <NumberFormatter thousandSeparator value={totalAmount} prefix="₱" />
          </Group>

          <Group justify="space-between" align="start">
            <Text>Payment History</Text>
            <Flex direction="column">
              {selectedReservation?.PAYMENT_HISTORY &&
                selectedReservation?.PAYMENT_HISTORY.map((h, index) => (
                  <NumberFormatter
                    key={index}
                    thousandSeparator
                    value={h?.amount}
                    prefix="₱"
                  />
                ))}
            </Flex>
          </Group>

          <Group justify="space-between">
            <Text>Required Downpayment</Text>
            <NumberFormatter
              thousandSeparator
              value={Math.floor(totalAmount * 0.3)}
              prefix="₱"
            />
          </Group>

          <Group justify="space-between">
            <Text>New Balance</Text>
            <NumberFormatter thousandSeparator value={newBalance} prefix="₱" />
          </Group>

          <Button
            fullWidth
            color="#006400"
            fw="normal"
            loading={isEditingReservation}
            onClick={handleReschedule}
          >
            Reschedule
          </Button>
        </Flex>
      );
    }

    if (selectedReservation?.TYPE === 'Pool') {
      return (
        <Flex direction="column" gap="md">
          <DateInput
            withAsterisk
            label="Choose date"
            placeholder="Please choose date"
            minDate={
              new Date().getHours() >= 23
                ? new Date(new Date().setDate(new Date().getDate() + 1))
                : new Date()
            }
            value={poolDate}
            onChange={(value) => handleDateChange(value)}
          />

          <Flex gap="sm">
            <Select
              flex={1}
              withAsterisk
              clearable
              disabled={!poolDate}
              label="Start time"
              placeholder="Select start time"
              data={filteredSwimmingTimes}
              value={poolTime}
              onChange={(value) => handleSetStartTime(value)}
            />

            <NumberInput
              flex={1}
              min={0}
              label="PAX"
              placeholder="1"
              disabled={!poolTime}
              value={poolPax}
              onChange={(value) => handleChangePax(value)}
            />
          </Flex>

          <Text c="#006400" mb="sm" mt="sm" align="center" fw={700}>
            This service is billed per pax
          </Text>

          <Group justify="space-between">
            <Text>Price for morning swim</Text>
            <Flex direction="row">
              <NumberFormatter
                thousandSeparator
                value={selectedReservation?.PRICE}
                prefix="₱"
              />
              <Text>/pax</Text>
            </Flex>
          </Group>

          <Group justify="space-between">
            <Text>Price for night swim</Text>
            <Flex direction="row">
              <NumberFormatter
                thousandSeparator
                value={selectedReservation?.PRICE_EXCEED}
                prefix="₱"
              />
              <Text>/pax</Text>
            </Flex>
          </Group>

          <Divider />

          <Group justify="space-between">
            <Text>Total Amount</Text>
            <NumberFormatter thousandSeparator value={totalAmount} prefix="₱" />
          </Group>

          <Group justify="space-between" align="start">
            <Text>Payment History</Text>
            <Flex direction="column">
              {selectedReservation?.PAYMENT_HISTORY &&
                selectedReservation?.PAYMENT_HISTORY.map((h, index) => (
                  <NumberFormatter
                    key={index}
                    thousandSeparator
                    value={h?.amount}
                    prefix="₱"
                  />
                ))}
            </Flex>
          </Group>

          <Group justify="space-between">
            <Text>Required Downpayment</Text>
            <NumberFormatter
              thousandSeparator
              value={Math.floor(totalAmount * 0.3)}
              prefix="₱"
            />
          </Group>

          <Group justify="space-between">
            <Text>New Balance</Text>
            <NumberFormatter thousandSeparator value={newBalance} prefix="₱" />
          </Group>

          <Button
            fullWidth
            color="#006400"
            fw="normal"
            loading={isEditingReservation}
            onClick={handleReschedule}
          >
            Reschedule
          </Button>
        </Flex>
      );
    }
  };

  useEffect(() => {
    let isMessageHandled = false;
    const messageListener = (event) => {
      if (isMessageHandled) {
        return;
      }

      if (
        typeof event.data === 'string' &&
        event.data.startsWith('PAYPAL_SUCCESS')
      ) {
        handleProcessPayment();
      } else {
        setIsProcessingPayment(false);
      }

      isMessageHandled = true;
    };

    window.addEventListener('message', messageListener);

    return () => {
      window.removeEventListener('message', messageListener);
    };
  }, [selectedReservation?.ID, isProcessingPayment]);

  return (
    <Box pos="relative" mih={200}>
      {allReservationsLoading && (
        <ComponentLoader message="Fetching dashboard" />
      )}

      {!allReservationsLoading && allReservationsError && (
        <ComponentError message={allReservationsError} />
      )}

      {!allReservationsLoading && !allReservationsError && (
        <>
          <Flex justify="space-between" mb="md" gap="md">
            {renderDashboardTotals()}
          </Flex>

          <Table.ScrollContainer
            minWidth={500}
            mah="calc(100vh - 24rem)"
            mih={0}
            h="100%"
            type="native"
          >
            <Table stickyHeader>
              <Table.Thead
                bg="white"
                style={{
                  zIndex: 2,
                  boxShadow: 'rgba(0, 0, 0, .24) 0px 3px 8px',
                }}
              >
                <Table.Tr>
                  <Table.Th></Table.Th>
                  <Table.Th>Service</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Pax</Table.Th>
                  <Table.Th>Duration</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Amount</Table.Th>
                  <Table.Th>Balance</Table.Th>
                  <Table.Th>Actions</Table.Th>
                  <Table.Th>Payments</Table.Th>
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>{renderTable()}</Table.Tbody>
            </Table>
          </Table.ScrollContainer>

          {syncedData?.length > 0 && renderTableLength()}
        </>
      )}

      <Modal
        centered
        title="Pay using PayPal"
        shadow="xl"
        opened={isPayPalModalOpen}
        onClose={closePayPalModal}
        closeButtonProps={{
          bg: 'crimson',
          radius: '50%',
          c: 'white',
        }}
        styles={{
          title: { color: 'darkgreen', fontSize: '1.7rem' },
          inner: { padding: 5 },
        }}
      >
        <Flex direction="column">
          <>
            {renderPayPalModalAmountTab()}

            {selectedReservation?.STATUS !== 'Cancelled' &&
              selectedReservation?.BALANCE > 0 && (
                <form
                  onSubmit={form.onSubmit(({ amount }) =>
                    handleOpenPaypalWindow(amount),
                  )}
                >
                  <NumberInput
                    withAsterisk
                    mt="sm"
                    mb="xs"
                    label="Amount"
                    placeholder="0.00"
                    min={0}
                    styles={{
                      label: { fontWeight: 700 },
                    }}
                    {...form.getInputProps('amount')}
                  />

                  <Button
                    fullWidth
                    type="submit"
                    fw="normal"
                    color="#006400"
                    leftSection={<IconBrandPaypal />}
                  >
                    Pay with PayPal
                  </Button>
                </form>
              )}

            {selectedReservation?.STATUS !== 'Cancelled' &&
              selectedReservation?.BALANCE === 0 && (
                <Text mt="sm" c="darkgreen" align="center" fw={700}>
                  This reservation is fully paid
                </Text>
              )}

            {selectedReservation?.STATUS === 'Cancelled' && (
              <Text mt="sm" c="#FF0800" align="center" fw={700}>
                This reservation is cancelled
              </Text>
            )}
          </>
        </Flex>
      </Modal>

      <Modal
        centered
        title="Cancel Reservation"
        shadow="xl"
        opened={isCancellationModalOpen}
        onClose={closeCancelModal}
        closeButtonProps={{
          bg: 'crimson',
          radius: '50%',
          c: 'white',
        }}
        styles={{
          title: { color: '#FF0800', fontSize: '1.7rem' },
          inner: { padding: 5 },
        }}
        withCloseButton={!isCancellingReservation}
        closeOnClickOutside={!isCancellingReservation}
        closeOnEscape={!isCancellingReservation}
      >
        {renderCancellationModalBody()}
      </Modal>

      <Modal
        centered
        title="Pay using G-cash"
        shadow="xl"
        size="auto"
        opened={isGcashModalOpen}
        onClose={closeGcashModal}
        closeButtonProps={{
          bg: 'crimson',
          radius: '50%',
          c: 'white',
        }}
        styles={{
          title: { color: '#006400', fontSize: '1.7rem' },
          inner: { padding: 5 },
        }}
        withCloseButton={!isUploadingTransaction}
        closeOnClickOutside={!isUploadingTransaction}
        closeOnEscape={!isUploadingTransaction}
      >
        {renderGcashQRModalBody()}
      </Modal>

      <Modal
        centered
        title="Rate your stay"
        shadow="xl"
        opened={isFeedbackModalOpen}
        onClose={closeFeedbackModal}
        closeButtonProps={{
          bg: 'crimson',
          radius: '50%',
          c: 'white',
        }}
        styles={{
          title: { color: '#006400', fontSize: '1.7rem' },
          inner: { padding: 5 },
        }}
        withCloseButton={!isSubmittingFeedback}
        closeOnClickOutside={!isSubmittingFeedback}
        closeOnEscape={!isSubmittingFeedback}
      >
        {renderFeedbackModalBody()}
      </Modal>

      <Modal
        centered
        title="Reschedule"
        shadow="xl"
        opened={isEditModalOpen}
        onClose={closeEditModal}
        closeButtonProps={{
          bg: 'crimson',
          radius: '50%',
          c: 'white',
        }}
        styles={{
          title: { color: '#006400', fontSize: '1.7rem' },
          inner: { padding: 5 },
        }}
        withCloseButton={!isEditingReservation}
        closeOnClickOutside={!isEditingReservation}
        closeOnEscape={!isEditingReservation}
      >
        {renderEditModalBody()}
      </Modal>

      <Modal
        centered
        title="Payment History"
        shadow="xl"
        opened={isHistoryModalOpen}
        onClose={closeHistoryModal}
        closeButtonProps={{
          bg: 'crimson',
          radius: '50%',
          c: 'white',
        }}
        styles={{
          title: { color: '#006400', fontSize: '1.7rem' },
          inner: { padding: 5 },
        }}
      >
        {renderPaymentHistoryModal()}
      </Modal>
    </Box>
  );
}

export default UserDashboard;
