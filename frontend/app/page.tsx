'use client';

import { Box } from '@chakra-ui/react';
import { useState } from 'react';
import HeaderNav from '@/components/HeaderNav';
import ChatScreen from '@/components/ChatScreen';
import { createDocuments, QueryResponse } from '@/services/api';

export default function Page() {
  const [currentConversation, setCurrentConversation] = useState<QueryResponse[]>([]);

  const clearConversation = () => {
    setCurrentConversation([]);
  };

  return (
    <Box h="100vh" display="flex" flexDirection="column" overflow="hidden">
      <HeaderNav 
        signOut={() => {}} 
        clearConversation={clearConversation}
        createDocuments={createDocuments} 
      />
      <ChatScreen 
        currentConversation={currentConversation}
        setCurrentConversation={setCurrentConversation}
      />
    </Box>
  );
}
