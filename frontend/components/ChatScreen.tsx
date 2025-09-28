'use client';

import {
  Box,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  useToast,
  Spinner,
  Text,
  Checkbox
} from '@chakra-ui/react';
import { useState } from 'react';
import { QueryResponse, queryLaw } from '@/services/api';
import QueryResults from './QueryResults';

interface ChatScreenProps {
  currentConversation: QueryResponse[];
  setCurrentConversation: React.Dispatch<React.SetStateAction<QueryResponse[]>>;
}

export default function ChatScreen({ currentConversation, setCurrentConversation }: ChatScreenProps) {
  const [query, setQuery] = useState('');
  const [filePath, setFilePath] = useState('docs/laws.pdf');
  const [aiSectioning, setAiSectioning] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<QueryResponse | null>(null);
  const toast = useToast();

  const handleSubmit = async () => {
    if (!query.trim()) {
      toast({
        title: 'Query Required',
        description: 'Please enter a query to search.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!filePath.trim()) {
      toast({
        title: 'File Path Required',
        description: 'Please enter a document file path.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      // Call the query API with the user's input
      const queryResult: QueryResponse = await queryLaw(query, filePath, aiSectioning);
      
      // Update the UI with the query results
      setResult(queryResult);
      setCurrentConversation([...currentConversation, queryResult]);
    } catch (error) {
      console.error('Error querying:', error);
      toast({
        title: 'Query Failed',
        description: 'There was an error processing your query.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Box 
      flex="1" 
      display="flex" 
      flexDirection="column" 
      bg="gray.50" 
      overflow="hidden"
    >
      {/* Results Section - Takes up remaining space */}
      <Box flex="1" overflow="auto" p={6}>
        <VStack spacing={4} align="stretch">
          {currentConversation.map((conversation, index) => (
            <QueryResults key={index} result={conversation} />
          ))}
        </VStack>
      </Box>

      {/* Input Form - Fixed at bottom */}
      <Box p={6} bg="white" borderTop="1px" borderColor="gray.200" flexShrink={0}>
        <Box maxW="4xl" mx="auto">
          <VStack spacing={4}>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700">
                Query
              </FormLabel>
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your legal query here... (e.g., 'what happens if I steal from the Sept?')"
                size="lg"
                minH="120px"
                resize="vertical"
                bg="white"
                borderColor="gray.300"
                _focus={{
                  borderColor: 'blue.400',
                  boxShadow: '0 0 0 1px #4299E1',
                }}
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700">
                Document Filepath
              </FormLabel>
              <Input
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                placeholder="Enter document path (e.g., docs/laws.pdf)"
                size="lg"
                bg="white"
                borderColor="gray.300"
                _focus={{
                  borderColor: 'blue.400',
                  boxShadow: '0 0 0 1px #4299E1',
                }}
              />
            </FormControl>

            <Box w="100%" display="flex" justifyContent="flex-end">
            <FormControl>
            <Checkbox 
              isChecked={aiSectioning} 
              onChange={(e) => setAiSectioning(e.target.checked)}
              colorScheme="purple"
              size="md"
            >
              <Text fontSize="sm" color="#5E6272">
                AI-powered document sectioning
              </Text>
            </Checkbox>
          </FormControl>
              <Button
                colorScheme="blue"
                onClick={handleSubmit}
                isLoading={isLoading}
                loadingText="Processing..."
                spinner={<Spinner size="sm" />}
                size="lg"
                minW="120px"
              >
                Submit Query
              </Button>
            </Box>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
}