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
      <ScaleFade initialScale={0.9} in={isOpen}>
        <Card
          title={"1. Write some code"}
          caption={`Write three for-loops in a row and contemplate whether you're 
            actually a competent programmer.`}
        />
      </ScaleFade>

      <Card
        title={"2. Receive suggestions"}
        caption={`Let the grey duck honk suggestions at you and realize that maybe
            40 if statements was not the most optimal solution after all.`}
      />
      <Card
        title={"3. Become numpy expert"}
        caption={"happy x600 speed improvement"}
      />
    </SimpleGrid>
  </Box>
);
