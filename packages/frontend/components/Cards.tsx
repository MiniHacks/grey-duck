import { Box, SimpleGrid, Text, Image, ScaleFade } from "@chakra-ui/react";

interface Props {
  image: string;
  title: string;
  caption: string;
}

const Card = ({ image, title, caption: text }: Props) => {
  return (
    <Box boxShadow={"lg"} p={4} bg={"white"} borderRadius={"16px"}>
      <Image overflow="hidden" mb={"6"} boxSize={"425px"} src={image} alt={""} />
      <Text fontWeight={"bold"}>{title}</Text>
      <Text>{text}</Text>
    </Box>
  );
};

export const Cards = () => (
  <Box px={4} py={12}>
    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
      <Card
        image="first.gif"
        title={"Data Structure Aware"}
        caption={`Models the runtime and space complexity of your code.`}
      /> 

      <Card
        image="second.gif"
        title={"Understands Python Inside and Out"}
        caption={`Knows about language features you don't.`}
      />
      <Card
        image="third.gif"
        title={"Deep Ecosystem Knowledge"}
        caption={"Leverages tooling for maximum performance."}
      />
    </SimpleGrid>
  </Box>
);
