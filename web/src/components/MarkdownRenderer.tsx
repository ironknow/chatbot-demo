import React, { useMemo } from "react";
import {
  Box,
  Code,
  Link,
  Heading,
  ListItem,
  UnorderedList,
  OrderedList,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useThemeColors } from "@/theme/colors";

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const colors = useThemeColors();

  // Custom components for markdown rendering with theme styling
  const markdownComponents = useMemo(
    () => ({
      // Use a div-like container for paragraphs to avoid invalid nesting
      // (e.g., <pre> cannot appear inside <p>)
      p: ({ children }: any) => (
        <Box fontSize="md" lineHeight="1.6" color={colors.text.primary} mb={3}>
          {children}
        </Box>
      ),
      h1: ({ children }: any) => (
        <Heading as="h1" size="xl" color={colors.text.primary} mb={4} mt={6}>
          {children}
        </Heading>
      ),
      h2: ({ children }: any) => (
        <Heading as="h2" size="lg" color={colors.text.primary} mb={3} mt={5}>
          {children}
        </Heading>
      ),
      h3: ({ children }: any) => (
        <Heading as="h3" size="md" color={colors.text.primary} mb={2} mt={4}>
          {children}
        </Heading>
      ),
      h4: ({ children }: any) => (
        <Heading as="h4" size="sm" color={colors.text.primary} mb={2} mt={3}>
          {children}
        </Heading>
      ),
      ul: ({ children }: any) => (
        <UnorderedList mb={3} pl={6} color={colors.text.primary}>
          {children}
        </UnorderedList>
      ),
      ol: ({ children }: any) => (
        <OrderedList mb={3} pl={6} color={colors.text.primary}>
          {children}
        </OrderedList>
      ),
      li: ({ children }: any) => (
        <ListItem color={colors.text.primary} mb={1}>
          {children}
        </ListItem>
      ),
      code: ({ inline, children, ...props }: any) => {
        if (inline) {
          return (
            <Code
              px={1.5}
              py={0.5}
              borderRadius="md"
              fontSize="0.9em"
              color={colors.text.primary}
              bg="transparent"
            >
              {children}
            </Code>
          );
        }
        return (
          <Box
            as="pre"
            bg={colors.background.tertiary}
            p={4}
            borderRadius="md"
            overflowX="auto"
            mb={3}
            border="1px"
            borderColor={colors.border.primary}
          >
            <Code
              display="block"
              whiteSpace="pre"
              color={colors.text.primary}
              fontSize="0.9em"
              bg="transparent"
              {...props}
            >
              {children}
            </Code>
          </Box>
        );
      },
      a: ({ children, href }: any) => (
        <Link
          href={href}
          color={colors.accent.primary}
          isExternal
          _hover={{ textDecoration: "underline" }}
        >
          {children}
        </Link>
      ),
      blockquote: ({ children }: any) => (
        <Box
          as="blockquote"
          borderLeft="4px"
          borderColor={colors.accent.primary}
          pl={4}
          my={3}
          color={colors.text.secondary}
          fontStyle="italic"
        >
          {children}
        </Box>
      ),
      hr: () => (
        <Box
          as="hr"
          borderColor={colors.border.primary}
          my={4}
          borderTopWidth="1px"
        />
      ),
      table: ({ children }: any) => (
        <Box overflowX="auto" my={4}>
          <Table variant="simple" size="sm" colorScheme="gray">
            {children}
          </Table>
        </Box>
      ),
      thead: ({ children }: any) => (
        <Thead bg={colors.background.tertiary}>{children}</Thead>
      ),
      tbody: ({ children }: any) => <Tbody>{children}</Tbody>,
      tr: ({ children }: any) => <Tr>{children}</Tr>,
      th: ({ children }: any) => (
        <Th color={colors.text.primary} borderColor={colors.border.primary}>
          {children}
        </Th>
      ),
      td: ({ children }: any) => (
        <Td color={colors.text.primary} borderColor={colors.border.primary}>
          {children}
        </Td>
      ),
    }),
    [colors],
  );

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
