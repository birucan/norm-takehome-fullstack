'use client';

import {
  Box,
  VStack,
  Text,
  Card,
  CardBody,
  Divider,
  Badge
} from '@chakra-ui/react';
import { QueryResponse } from '@/services/api';

interface QueryResultsProps {
  result: QueryResponse;
}

export default function QueryResults({ result }: QueryResultsProps) {
  return (
    <Box maxW="4xl" mx="auto">
      <Card w="100%" shadow="md">
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={2}>
                Query:
              </Text>
              <Text fontSize="md" color="gray.800" bg="gray.100" p={3} rounded="md">
                {result.query}
              </Text>
            </Box>

            <Divider />

            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={2}>
                Response:
              </Text>
              <Text fontSize="md" color="gray.800" lineHeight="1.6">
                {result.response}
              </Text>
            </Box>

            {result.citations && result.citations.length > 0 && (
              <>
                <Divider />
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={3}>
                    Citations:
                  </Text>
                  <VStack spacing={3} align="stretch">
                    {result.citations.map((citation, index) => (
                      <Box
                        key={index}
                        p={3}
                        bg="blue.50"
                        border="1px"
                        borderColor="blue.200"
                        rounded="md"
                      >
                        <Box display="flex" alignItems="center" mb={2}>
                          <Badge colorScheme="blue" mr={2}>
                            [{index + 1}]
                          </Badge>
                          <Text fontSize="sm" fontWeight="semibold" color="blue.700">
                            {citation.source}
                          </Text>
                        </Box>
                        <Text fontSize="sm" color="gray.700" lineHeight="1.5">
                          {citation.text}
                        </Text>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              </>
            )}
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
}
