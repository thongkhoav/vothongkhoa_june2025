import { Center, Spinner } from "@chakra-ui/react";

export default function Loading() {
  return (
    <Center h="100vh" w="100vw" bg="gray.50" color="gray.500">
      <Spinner size="md" />
    </Center>
  );
}
