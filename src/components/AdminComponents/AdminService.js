import {
  Box,
  Button,
  FileButton,
  Flex,
  Group,
  Image,
  Menu,
  Modal,
  NumberInput,
  TagsInput,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import {
  IconBedFilled,
  IconCirclePlus,
  IconDeviceFloppy,
  IconEdit,
  IconHome2,
  IconSwimming,
  IconTrashFilled,
  IconUpload,
} from '@tabler/icons-react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import ServiceCard from '../ServiceCard/ServiceCard';
import ComponentError from '../utils/ComponentError';
import ComponentLoader from '../utils/ComponentLoader';
import NoRecords from '../utils/NoRecords';

function AdminService() {
  //fetching service
  const [services, setServices] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  //updating service
  const [selectedService, setSelectedService] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [image, setImage] = useState(null);
  const [imageDisplay, setImageDisplay] = useState(null);

  const handleUploadImage = (e) => {
    setImage(e);
    const selectedFile = e;

    if (selectedFile) {
      const fileReader = new FileReader();

      fileReader.onloadend = () => {
        setImageDisplay(fileReader.result);
      };

      fileReader.readAsDataURL(selectedFile);
    }
  };

  //modal
  const [upsertMode, setUpsertMode] = useState('');
  const [
    isUpsertModalOpen,
    { open: openUpsertModal, close: closeUpsertModal },
  ] = useDisclosure(false);

  //form
  let form = useForm({
    initialValues: {
      AMENITIES: [],
      IMAGE: '',
      NAME: '',
      PERSONS: 0,
      PRICE: 0,
      TYPE: '',
      QUANTITY: 0,
    },

    validate: {
      NAME: (value) =>
        upsertMode.includes('Delete') || (value && value.trim() !== '')
          ? null
          : 'Name is required',
      PERSONS: (value) =>
        upsertMode.includes('Delete') || (value && value > 0)
          ? null
          : 'Person capacity must be at least 1',
      PRICE: (value) =>
        upsertMode.includes('Delete') || (value && value > 0)
          ? null
          : 'Price must be at least 0',
      AMENITIES: (value) =>
        upsertMode.includes('Delete') || value.length > 0
          ? null
          : 'Add at least 1 amenity',
      QUANTITY: (value) =>
        upsertMode.includes('Delete') || (value && value > 0)
          ? null
          : 'Quantity must be at least 1',
    },
  });

  //functions
  const getServices = () => {
    closeUpsertModal();
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
  };

  const handleOpenModal = (
    { ID, AMENITIES, IMAGE, NAME, PERSONS, PRICE, TYPE, QUANTITY },
    mode,
  ) => {
    if (mode === 'Update') {
      axios({
        method: 'GET',
        url: `/image/${IMAGE}`,
      })
        .then(({ data }) => setImageDisplay(data?.PATH))
        .catch(() => {
          setImageDisplay(
            'https://placehold.co/350x200/EEE/31343C?font=source-sans-pro&text=Error%20while%20loading%20picture',
          );
        });
    } else {
      setImageDisplay('https://placehold.co/400x200/green/white');
      setImage(null);
    }

    setUpsertMode(mode + ' ' + TYPE);
    openUpsertModal();

    const service = {
      AMENITIES,
      IMAGE,
      NAME,
      PERSONS,
      PRICE,
      TYPE,
      QUANTITY,
      ID,
    };

    setSelectedService(service);

    if (mode === 'Update') {
      form.setValues(service);
    } else if (mode === 'Create') {
      form.reset();
    }
  };

  const handleSubmit = ({
    AMENITIES,
    IMAGE,
    NAME,
    PERSONS,
    PRICE,
    QUANTITY,
    TYPE,
  }) => {
    setIsSubmitting(true);

    const upsert = (id) => {
      axios({
        method: upsertMode.includes('Create') ? 'POST' : 'PUT',
        url: `/services${
          upsertMode.includes('Create') ? '' : '/' + selectedService?.ID
        }`,
        data: {
          AMENITIES,
          IMAGE: id,
          NAME,
          PERSONS,
          PRICE,
          QUANTITY,
          TYPE: upsertMode.includes('Create') ? selectedService?.TYPE : TYPE,
        },
      })
        .then(({ data }) => {
          toast.success(data?.message || 'Successfully updated service', {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 1500,
          });
          getServices();
        })
        .catch(({ response }) => {
          toast.error(
            response?.data?.message ||
              response?.data?.error ||
              'An error occurred',
            {
              position: toast.POSITION.TOP_RIGHT,
              autoClose: 1500,
            },
          );
        })
        .finally(() => setIsSubmitting(false));
    };

    if (upsertMode.includes('Delete')) {
      axios({
        method: 'DELETE',
        url: `/services/${selectedService?.ID}`,
      })
        .then(() => {
          toast.success('Service has been deleted', {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 1500,
          });

          getServices();
        })
        .catch(({ response }) => {
          toast.error(response?.data?.error || 'An error occurred', {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 1500,
          });
        })
        .finally(() => setIsSubmitting(false));
    } else {
      if (image) {
        const formData = new FormData();
        formData.append('image', image);

        //Upload picture
        axios({
          method: 'POST',
          url: '/image/upload',
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
          .then(({ data }) => {
            upsert(data?.ID);
          })
          .catch(() => {
            toast.error('Error while uploading image', {
              position: toast.POSITION.TOP_RIGHT,
              autoClose: 1500,
            });
            setIsSubmitting(false);
          });
      } else {
        if (upsertMode.includes('Create')) {
          upsert('');
        } else {
          upsert(IMAGE);
        }
      }
    }
  };

  //useEffect
  useEffect(() => {
    getServices();
  }, []);

  return (
    <Box pos="relative" mih={200}>
      {isFetching && <ComponentLoader message="Fetching services" />}
      {!isFetching && fetchError && <ComponentError message={fetchError} />}
      {!isFetching && !fetchError && (
        <>
          <Group mb="sm" justify="space-between" align="center">
            <Text size="xl">Services</Text>
            <Menu
              withArrow
              arrowSize={10}
              offset={-3}
              position="bottom"
              styles={{
                dropdown: { border: '1px solid gray' },
                arrow: { background: '#006400' },
              }}
            >
              <Menu.Target>
                <Button
                  color="#006400"
                  fw={400}
                  leftSection={<IconCirclePlus />}
                >
                  New Service
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconBedFilled />}
                  onClick={() => handleOpenModal({ TYPE: 'Room' }, 'Create')}
                >
                  Room
                </Menu.Item>
                {/* {['Room', 'Pavilion', 'Pool'].map((service) => (
                  <Menu.Item
                    key={service}
                    leftSection={
                      service === 'Room' ? (
                        <IconBedFilled />
                      ) : service === 'Pavilion' ? (
                        <IconHome2 />
                      ) : (
                        <IconSwimming />
                      )
                    }
                    onClick={() => handleOpenModal({ TYPE: service }, 'Create')}
                  >
                    {service}
                  </Menu.Item>
                ))} */}
              </Menu.Dropdown>
            </Menu>
          </Group>

          <Flex
            pos="relative"
            align="center"
            justify="center"
            direction="column"
            gap={5}
            p="md"
            style={{ borderBottom: '2px solid gray' }}
          >
            <Text size="2rem" px="lg">
              Rooms
            </Text>

            {services?.filter((s) => s.TYPE === 'Room').length ? (
              <Flex py="lg" gap={10} justify="center">
                {services?.map((service) => (
                  <ServiceCard
                    key={service.ID}
                    amenities={service.AMENITIES}
                    image={service?.IMAGE}
                    name={service.NAME}
                    persons={service.PERSONS}
                    price={service.PRICE}
                  >
                    <Flex align="center" gap={5}>
                      <Button
                        fullWidth
                        color="#006400"
                        leftSection={<IconEdit />}
                        onClick={() => handleOpenModal(service, 'Update')}
                      >
                        Edit
                      </Button>

                      <Button
                        fullWidth
                        color="red"
                        leftSection={<IconTrashFilled />}
                        onClick={() => handleOpenModal(service, 'Delete')}
                      >
                        Delete
                      </Button>
                    </Flex>
                  </ServiceCard>
                ))}
              </Flex>
            ) : (
              <NoRecords />
            )}
          </Flex>
        </>
      )}

      <Modal
        centered
        shadow="xl"
        opened={isUpsertModalOpen}
        onClose={closeUpsertModal}
        title={upsertMode}
        closeButtonProps={{
          bg: 'crimson',
          radius: '50%',
          c: 'white',
        }}
        styles={{
          title: {
            color: upsertMode.includes('Delete') ? 'crimson' : 'darkgreen',
            fontSize: '1.7rem',
          },
          inner: { padding: 5 },
        }}
        withCloseButton={!isSubmitting}
        closeOnClickOutside={!isSubmitting}
        closeOnEscape={!isSubmitting}
      >
        <Flex direction="column" align="center" w="100%">
          <form
            style={{ width: '100%' }}
            onSubmit={form.onSubmit((values) => {
              handleSubmit(values);
            })}
          >
            {upsertMode.includes('Delete') ? (
              <>
                <Text align="center" my="md">
                  Are you sure you want to delete? This action cannot be undone.
                </Text>
                <Text size="xl" fw={900} align="center">
                  {selectedService?.NAME && selectedService.NAME}
                </Text>
              </>
            ) : (
              <>
                <Image
                  w="100%"
                  h={200}
                  src={imageDisplay}
                  mb="sm"
                  fallbackSrc="https://placehold.co/400x200/green/white"
                />
                <FileButton
                  onChange={(e) => handleUploadImage(e)}
                  accept="image/png,image/jpeg"
                >
                  {(props) => (
                    <Button
                      fullWidth
                      {...props}
                      mb="sm"
                      color="#006400"
                      leftSection={<IconUpload />}
                    >
                      Upload image
                    </Button>
                  )}
                </FileButton>

                <hr />

                <TextInput
                  withAsterisk
                  label="Name"
                  placeholder="Name"
                  {...form.getInputProps('NAME')}
                />

                <NumberInput
                  withAsterisk
                  label="Price"
                  placeholder="0.00"
                  {...form.getInputProps('PRICE')}
                  min={0}
                />

                <NumberInput
                  withAsterisk
                  label="Person Capacity"
                  placeholder="2"
                  {...form.getInputProps('PERSONS')}
                  min={0}
                />

                <NumberInput
                  withAsterisk
                  label="Quantity"
                  placeholder="2"
                  {...form.getInputProps('QUANTITY')}
                  min={0}
                />

                <TagsInput
                  withAsterisk
                  label="Amenities"
                  description="Add at least 1"
                  placeholder="Enter here"
                  {...form.getInputProps('AMENITIES')}
                  data={['WIFI', 'Aircon', 'Fan', 'TV', 'Own Bathroom']}
                  min={1}
                  styles={{
                    pill: { background: 'darkgreen', color: 'white' },
                    dropdown: { border: '1px solid gray' },
                  }}
                />
              </>
            )}

            <Button
              fullWidth
              mt="md"
              color={upsertMode.includes('Delete') ? 'red' : '#006400'}
              tt="uppercase"
              fw={400}
              type="submit"
              leftSection={
                upsertMode.includes('Delete') ? (
                  <IconTrashFilled />
                ) : (
                  <IconDeviceFloppy />
                )
              }
              loading={isSubmitting}
            >
              {upsertMode.includes('Delete') ? 'I Understand' : 'Save'}
            </Button>
          </form>
        </Flex>
      </Modal>
    </Box>
  );
}

export default AdminService;
