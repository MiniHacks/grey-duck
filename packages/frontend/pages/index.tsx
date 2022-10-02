/* eslint-disable prettier/prettier */
import type { NextPage } from "next";
import { Text, Box, Flex, Heading, Button } from "@chakra-ui/react";
import { Cards } from '../components/Layout/Cards';
import PageLayout from "../components/Layout/PageLayout";

const Home: NextPage = () => {
  return (
    <PageLayout title={"geese, by minihacks"}>
      <Flex 
        bgGradient={"linear(to-br, #B1A17B, #7C62EE, #C25BD4)"}
        direction={"column"}
        align={"center"}
        px={[5, 10]} py={24}
        h={"240vh"}>
        
        <Flex direction={"column"} align={"end"}>
          <Text 
            color={"white"}
            fontSize={"9xl"}
            fontWeight={"bold"}>
            grey duck.
          </Text>
          <Heading mb={20} size={"lg"}>
            your mentor, line-by-line
          </Heading>
        </Flex>

        <Button size={"lg"} bg={"#010318"} color={"white"}>
            give it a try
        </Button>

        <Flex justify={"center"} mx={32} my={44} px={[5, 10]}>
          <Heading textAlign="center" color={"white"} mb={2} size={"2xl"}>
            Grey Duck is a VSCode extension that will provide feedback on code
            that you write, allowing you to learn how to write better instead of
            more.
          </Heading>
        </Flex>
       
        <Cards />
      
      </Flex>
    </PageLayout>
  );
};

export default Home;
