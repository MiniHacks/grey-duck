import { Box, SimpleGrid, Text, Image, ScaleFade } from "@chakra-ui/react";

interface Props {
  title: string;
  caption: string;
}

const Card = ({ title, caption: text }: Props) => {
  return (
    <Box boxShadow={"lg"} p={8} bg={"white"} borderRadius={"16px"}>
      <Image mb={"6"} boxSize={"200px"} src={""} alt={""} />
      <Text fontWeight={"bold"}>{title}</Text>
      <Text>{text}</Text>
    </Box>
  );
};

export const Cards = () => (
  <Box px={4} py={12}>
    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
      <Card
        title={"1. Write some code"}
        caption={`Write three for-loops in a row and contemplate whether you're 
          actually a competent programmer.`}
      />

      <Card
        title={"2. Receive suggestions from Grey Duck"}
        caption={`Pair program with a goose to close the feedback loop.
          She writes idiomatic python.`}
      />
      <Card
        title={"3. Become numpy expert"}
        caption={"happy x600 speed improvement"}
      />
    </SimpleGrid>
  </Box>
);
