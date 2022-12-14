/* eslint-disable prettier/prettier */
import type {NextPage} from "next";
import {Text, Flex, Heading, Button, Image, VStack} from "@chakra-ui/react";
import {Cards} from '../components/Cards';
import PageLayout from "../components/Layout/PageLayout";
import {useCallback, useState} from "react";

const Home: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const onClick = useCallback(() => {
    // eslint-disable-next-line no-alert
    if (window.innerWidth < 768) return alert("Please use a desktop browser to use this feature");
    if (localStorage.getItem("session")) window.open(localStorage.getItem("session") || "", "_blank");
    else setLoading(true);
    return fetch("https://greyduck.guide/create-session").then(r => r.json()).then((res) => {
      localStorage.setItem("session", res.url);
      setTimeout(() => {
        setLoading(false);
        window.open(res.url, "_blank")
      }, 1500);
    });
  }, []);
  return (
    <PageLayout title={"Grey Duck"}>
      <Flex
        bgGradient={"linear(to-br, #B1A17B, #7C62EE, #C25BD4)"}
        direction={"column"}
        align={"center"}
        px={[5, 10]} py={24}
        h={"360vh"}>

        <Flex direction={"column"} align={"end"}>
          <Text
            color={"white"}
            fontSize={"9xl"}
            fontWeight={"bold"}>
            grey duck.
          </Text>
          <Heading as='i' mb={20} size={"lg"}>
            the goose writes idiomatic python!?
          </Heading>
        </Flex>

        <Button isLoading={loading} px={12} size={"lg"} bg={"#010318"} color={"white"} onClick={onClick}>
          give it a try
        </Button>

        <VStack justify={"center"} mx={32} my={44} px={[5, 10]}>
          <Heading textAlign={"center"} color={"white"} mb={1} size={"2xl"}>
            We provide feedback on code that you write
          </Heading>
          <Heading textAlign={"center"} color={"white"} size={"lg"}>allowing you to learn how to
            write <i>better</i> instead of
            {" "}<i>more</i>.</Heading>
        </VStack>

        <Cards/>

        <Image src="pixel_goose_animated.gif" alt="pixel goose"/>

      </Flex>
    </PageLayout>
  );
};

export default Home;
