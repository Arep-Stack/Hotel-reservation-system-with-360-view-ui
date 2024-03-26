import { Box, Button, FileButton, Flex, Image } from '@mantine/core';
import { IconUpload } from '@tabler/icons-react';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { GlobalContext } from '../../App';
import NoRecords from '../utils/NoRecords';

export default function AdminQr() {
  const { allUsers } = useContext(GlobalContext);

  const [image, setImage] = useState(
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQciumEvhKg94GuuJcF-gTadN1zGOjW3MVvPzVRPf_WJA&s',
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleUploadImage = (e) => {
    const admin = allUsers?.find(
      (user) => user.IS_ADMIN && user.EMAIL === 'admin@felrey.com',
    );

    setIsUploading(true);

    if (e) {
      const formData = new FormData();
      formData.append('image', e);

      axios({
        method: 'POST',
        url: '/image/upload',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      })
        .then(({ data }) => {
          if (!!data) {
            axios({
              method: 'PUT',
              url: `/users/${admin?.ID}`,
              data: {
                ...admin,
                QR_IMAGE: data.PATH,
              },
            })
              .then(({ data }) => {
                setImage(data.QR_IMAGE);
                toast.success('Successfully uploaded', {
                  position: toast.POSITION.TOP_RIGHT,
                  autoClose: 1500,
                });
              })
              .catch(() => {
                toast.error('An error occurred', {
                  position: toast.POSITION.TOP_RIGHT,
                  autoClose: 1500,
                });
              })
              .finally(() => setIsUploading(false));
          }
        })
        .catch(() => {
          toast.error('An error occurred', {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 1500,
          });
          setIsUploading(false);
        });
    }
  };

  const handleRemoveQr = () => {
    setIsRemoving(true);

    const admin = allUsers?.find(
      (user) => user.IS_ADMIN && user.EMAIL === 'admin@felrey.com',
    );

    axios({
      method: 'PUT',
      url: `/users/${admin?.ID}`,
      data: { ...admin, QR_IMAGE: null },
    }).finally(() => setIsRemoving(false));
  };

  useEffect(() => {
    const adminWithQr = allUsers?.find(
      (user) => user.IS_ADMIN && user.EMAIL === 'admin@felrey.com',
    )?.QR_IMAGE;

    setImage(adminWithQr);
  }, [allUsers]);

  return (
    <Box pos="relative" mih={200}>
      <Flex
        justify="center"
        mt="lg"
        mb="lg"
        direction="column"
        align="center"
        pos="relative"
      >
        {image ? (
          <Image w={400} src={image} />
        ) : (
          <NoRecords message="No Gcash QR code uploaded" />
        )}

        <FileButton
          onChange={(e) => handleUploadImage(e)}
          accept="image/png,image/jpeg"
        >
          {(props) => (
            <Button
              loading={isUploading}
              disabled={isRemoving}
              w={400}
              {...props}
              mt="lg"
              mb="xs"
              color="#006400"
              leftSection={<IconUpload />}
            >
              Upload QR code
            </Button>
          )}
        </FileButton>

        {image && (
          <Button
            loading={isRemoving}
            disabled={isUploading}
            w={400}
            variant="outline"
            color="#FF0800"
            onClick={handleRemoveQr}
          >
            Remove QR
          </Button>
        )}
      </Flex>
    </Box>
  );
}
