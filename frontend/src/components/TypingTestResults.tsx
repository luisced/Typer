import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Badge,
  Alert,
  AlertIcon,
  useColorModeValue,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  Button,
  Icon,
  Skeleton,
  SkeletonText,
} from "@chakra-ui/react";
import { useTests } from "../hooks/useTests";
import { useLocation, useNavigate } from "react-router-dom";
import { HiOutlineTrophy } from "react-icons/hi2";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

export const TypingTestResults: React.FC = () => {
  const { tests, isLoading, error } = useTests();
  const location = useLocation();
  const navigate = useNavigate();

  // Use the latest test from location.state or fallback to the first in tests[]
  const latest = location.state?.latestTest || (tests && tests[0]);

  // Build chart data from test history
  const [chartData, setChartData] = useState<
    Array<{ sessionIndex: number; wpm: number; rawWpm: number; errors: number }>
  >([]);

  useEffect(() => {
    if (tests) {
      const reversed = [...tests].reverse();
      const data = reversed.map((test, index) => ({
        sessionIndex: index + 1,
        wpm: test.wpm,
        rawWpm: test.raw_wpm,
        errors: test.chars.incorrect,
      }));
      setChartData(data);
    }
  }, [tests]);

  // Error state
  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        Error loading test history: {error.message}
      </Alert>
    );
  }

  // Color tokens
  const yellow = useColorModeValue("#F9C74F", "#F9C74F");
  const gray = useColorModeValue("gray.600", "gray.600");
  const red = useColorModeValue("red.400", "red.400");
  const cardBg = useColorModeValue("gray.200", "gray.800");
  const gridDivider = useColorModeValue("gray.300", "gray.700");

  // If no tests exist
  if (!latest && !isLoading) {
    return (
      <Box p={8}>
        <Text>No test data found.</Text>
      </Box>
    );
  }

  return (
    <Flex
      direction="column"
      align="center"
      justify="flex-start"
      minH="100vh"
      color="gray.100"
      py={12}
      px={4}
      fontFamily="mono"
    >
      {/* Page Header */}
      <SkeletonText
        noOfLines={1}
        spacing="4"
        w={{ base: "60%", md: "40%" }}
        mb={6}
        isLoaded={!isLoading}
      >
        <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color={yellow}>
          Your Typing Test Summary
        </Text>
      </SkeletonText>

      <Divider borderColor={gridDivider} mb={8} w="100%" maxW="1100px" />

      {/* Top Four Stats as Cards */}
      <SimpleGrid
        columns={{ base: 1, sm: 2, md: 4 }}
        spacing={6}
        w="100%"
        maxW="1100px"
        mb={10}
      >
        {/* WPM Card */}
        <Skeleton isLoaded={!isLoading} borderRadius="lg">
          <Stat
            bg={cardBg}
            boxShadow="xl"
            borderRadius="lg"
            p={5}
            textAlign="center"
            _hover={{ transform: "translateY(-2px)", boxShadow: "2xl" }}
            transition="all 0.2s ease"
          >
            <StatLabel fontSize="sm" color="gray.400">
              <Icon as={HiOutlineTrophy} color={yellow} mr={1} /> WPM
            </StatLabel>
            <StatNumber fontSize="4xl" color={yellow}>
              {latest?.wpm ?? "--"}
            </StatNumber>
            <StatHelpText fontSize="xs" color="gray.500">
              Goal: 100 WPM
            </StatHelpText>
          </Stat>
        </Skeleton>

        {/* Accuracy Card */}
        <Skeleton isLoaded={!isLoading} borderRadius="lg">
          <Stat
            bg={cardBg}
            boxShadow="xl"
            borderRadius="lg"
            p={5}
            textAlign="center"
            _hover={{ transform: "translateY(-2px)", boxShadow: "2xl" }}
            transition="all 0.2s ease"
          >
            <StatLabel fontSize="sm" color="gray.400">
              Accuracy
            </StatLabel>
            <StatNumber fontSize="4xl" color={yellow}>
              {latest ? `${latest.accuracy}%` : "--%"}
            </StatNumber>
            <StatHelpText fontSize="xs" color="gray.500">
              {latest
                ? latest.chars.incorrect > 0
                  ? `${latest.chars.incorrect} mistake${latest.chars.incorrect > 1 ? "s" : ""}`
                  : "Perfect!"
                : "---"}
            </StatHelpText>
          </Stat>
        </Skeleton>

        {/* Raw WPM Card */}
        <Skeleton isLoaded={!isLoading} borderRadius="lg">
          <Stat
            bg={cardBg}
            boxShadow="xl"
            borderRadius="lg"
            p={5}
            textAlign="center"
            _hover={{ transform: "translateY(-2px)", boxShadow: "2xl" }}
            transition="all 0.2s ease"
          >
            <StatLabel fontSize="sm" color="gray.400">
              Raw WPM
            </StatLabel>
            <StatNumber fontSize="4xl" color={gray}>
              {latest?.raw_wpm ?? "--"}
            </StatNumber>
            <StatHelpText fontSize="xs" color="gray.500">
              (incl. typos)
            </StatHelpText>
          </Stat>
        </Skeleton>

        {/* Consistency Card */}
        <Skeleton isLoaded={!isLoading} borderRadius="lg">
          <Stat
            bg={cardBg}
            boxShadow="xl"
            borderRadius="lg"
            p={5}
            textAlign="center"
            _hover={{ transform: "translateY(-2px)", boxShadow: "2xl" }}
            transition="all 0.2s ease"
          >
            <StatLabel fontSize="sm" color="gray.400">
              Consistency
            </StatLabel>
            <StatNumber fontSize="4xl" color={yellow}>
              {latest ? `${latest.consistency}%` : "--%"}
            </StatNumber>
            <StatHelpText fontSize="xs" color="gray.500">
              Keystroke rhythm
            </StatHelpText>
          </Stat>
        </Skeleton>
      </SimpleGrid>

      {/* Secondary Details: Test Type, Characters, Time */}
      <SimpleGrid
        columns={{ base: 1, sm: 2, md: 3 }}
        spacing={6}
        w="100%"
        maxW="1100px"
        mb={12}
      >
        {/* Test Type */}
        <Skeleton isLoaded={!isLoading} borderRadius="lg">
          <Box bg={cardBg} boxShadow="lg" borderRadius="lg" p={4}>
            <Text fontSize="sm" color="gray.400" mb={1}>
              Test Type
            </Text>
            <Badge colorScheme="yellow" fontSize="sm">
              {latest
                ? latest.test_type
                    .split(",")
                    .map((t) => t.trim())
                    .join(" / ")
                : "--"}
            </Badge>
          </Box>
        </Skeleton>

        {/* Characters */}
        <Skeleton isLoaded={!isLoading} borderRadius="lg">
          <Box bg={cardBg} boxShadow="lg" borderRadius="lg" p={4}>
            <Text fontSize="sm" color="gray.400" mb={1}>
              Characters
            </Text>
            <Text fontSize="lg" color={yellow} fontFamily="mono">
              {latest
                ? `${latest.chars.correct}/${latest.chars.incorrect}/${latest.chars.extra}/${latest.chars.missed}`
                : "--/--/--/--"}
            </Text>
          </Box>
        </Skeleton>

        {/* Time */}
        <Skeleton isLoaded={!isLoading} borderRadius="lg">
          <Box bg={cardBg} boxShadow="lg" borderRadius="lg" p={4}>
            <Text fontSize="sm" color="gray.400" mb={1}>
              Time
            </Text>
            <Text fontSize="lg" color={yellow} fontFamily="mono">
              {latest ? `${latest.duration}s` : "--s"}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {latest
                ? new Date(latest.timestamp).toLocaleTimeString()
                : "--:--:--"}
            </Text>
          </Box>
        </Skeleton>
      </SimpleGrid>

      {/* Chart Section */}
      <Box
        position="relative"
        w="100%"
        maxW="1100px"
        bg={cardBg}
        p={6}
        borderRadius="lg"
        boxShadow="2xl"
        mb={10}
      >
        {/* Subtle radial glow behind the chart (placeholder) */}
        <Box
          position="absolute"
          top="-20%"
          left="-20%"
          w="140%"
          h="140%"
          pointerEvents="none"
          borderRadius="full"
        />

        <SkeletonText noOfLines={1} spacing="4" w="50%" mb={4} isLoaded={!isLoading}>
          <Text fontSize="lg" color="gray.300" textAlign="center">
            Performance Over Time
          </Text>
        </SkeletonText>

        <Skeleton isLoaded={!isLoading} height="300px">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                stroke={useColorModeValue("#2D2D2D", "#444")}
                vertical={false}
                strokeDasharray="4 4"
              />

              <XAxis
                dataKey="sessionIndex"
                axisLine={false}
                tickLine={false}
                fontSize={12}
                tickFormatter={() => ""}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                stroke={"white"}
                fontSize={12}
              />

              <Tooltip
                cursor={{ stroke: "#888", strokeDasharray: "3 3" }}
                contentStyle={{
                  backgroundColor: useColorModeValue(
                    "rgba(26, 32, 44, 0.4)",
                    "rgba(45, 45, 45, 0.9)"
                  ),
                  borderRadius: "8px",
                  border: "none",
                  padding: "8px",
                }}
                labelStyle={{ color: "#bbb", fontSize: "12px" }}
                itemStyle={{ color: "white", fontSize: "14px" }}
                labelFormatter={(value) => `Session ${value}:`}
              />

              <ReferenceLine
                y={100}
                stroke={useColorModeValue("#555", "#888")}
                strokeDasharray="5 5"
                label={{
                  position: "top",
                  value: "Target 100 WPM",
                  fill: "#bbb",
                  fontSize: 12,
                }}
              />

              <defs>
                <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={yellow} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={yellow} stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="rawWpmGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="lightblue" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="lightblue" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="errorsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="red" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="red" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <Area
                type="monotone"
                dataKey="wpm"
                stroke={yellow}
                strokeWidth={2}
                fill="url(#wpmGradient)"
                dot={{ r: 3, stroke: yellow, strokeWidth: 1, fill: "#222" }}
                activeDot={{ r: 6 }}
              />
              <Area
                type="monotone"
                dataKey="rawWpm"
                stroke="lightblue"
                strokeWidth={2}
                fill="url(#rawWpmGradient)"
                dot={{ r: 3, stroke: "lightblue", strokeWidth: 1, fill: "#222" }}
                activeDot={{ r: 6 }}
              />
              <Area
                type="monotone"
                dataKey="errors"
                stroke="red"
                strokeWidth={2}
                fill="url(#errorsGradient)"
                dot={{ r: 3, stroke: "red", strokeWidth: 1, fill: "#222" }}
                activeDot={{ r: 6 }}
              />

              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 10, fontSize: 12, color: "#bbb" }}
                iconSize={8}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Skeleton>
      </Box>

      {/* Try Again Button */}
      <Box mb={8}>
        <Skeleton isLoaded={!isLoading} w="150px" h="40px">
          <Button
            colorScheme="yellow"
            size="lg"
            variant="outline"
            _hover={{ bg: "yellow.500", color: "gray.900" }}
            onClick={() => navigate("/")}
            boxShadow="lg"
            transition="all 0.2s ease"
          >
            Try Again
          </Button>
        </Skeleton>
      </Box>
    </Flex>
  );
};

export default TypingTestResults;
