import React, {
  memo,
  useCallback,
  useRef,
  useEffect,
  useState,
  useMemo,
} from "react";
import {
  Box,
  HStack,
  IconButton,
  Text,
  VStack,
  Icon,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import {
  MdSend,
  MdAttachFile,
  MdClose,
  MdImage,
  MdDescription,
  MdPictureAsPdf,
} from "react-icons/md";
import { ChatInputProps } from "@/types";
import type { FileAttachment } from "@/types";
import { Textarea } from "@/components";
import { useThemeColors } from "@/theme/colors";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  "image/*",
  "application/pdf",
  "text/*",
  ".doc",
  ".docx",
  ".txt",
];

const getFileType = (file: File): FileAttachment["type"] => {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.includes("pdf") || file.type.includes("document"))
    return "document";
  return "other";
};

const getFileIcon = (type: FileAttachment["type"], fileType?: string) => {
  switch (type) {
    case "image":
      return MdImage;
    case "document":
      return fileType?.includes("pdf") ? MdPictureAsPdf : MdDescription;
    default:
      return MdDescription;
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

const ChatInput: React.FC<ChatInputProps> = memo(
  ({
    input,
    setInput,
    onSend,
    disabled,
    isTyping,
    isLoading: _isLoading,
    files = [],
    onFilesChange,
  }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const colors = useThemeColors();
    const toast = useToast();

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey && !disabled) {
          e.preventDefault();
          onSend();
        }
      },
      [disabled, onSend],
    );

    const processFiles = useCallback(
      (fileList: FileList | File[]): FileAttachment[] => {
        const processedFiles: FileAttachment[] = [];
        const filesArray = Array.from(fileList);

        filesArray.forEach((file) => {
          // Check file size
          if (file.size > MAX_FILE_SIZE) {
            toast({
              title: "File too large",
              description: `${file.name} exceeds maximum size of 10MB`,
              status: "warning",
              duration: 3000,
              isClosable: true,
              position: "bottom-right",
              containerStyle: { zIndex: 2000 },
            });
            return;
          }

          const type = getFileType(file);
          const fileAttachment: FileAttachment = {
            id: `${file.name}-${Date.now()}-${Math.random()}`,
            file,
            type,
          };

          // Generate preview for images
          if (type === "image") {
            const reader = new FileReader();
            reader.onloadend = () => {
              fileAttachment.preview = reader.result as string;
              if (onFilesChange) {
                onFilesChange([...files, ...processedFiles, fileAttachment]);
              }
            };
            reader.readAsDataURL(file);
          }

          processedFiles.push(fileAttachment);
        });

        return processedFiles;
      },
      [files, onFilesChange, toast],
    );

    const handleFileSelect = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
          const processedFiles = processFiles(e.target.files);
          if (onFilesChange) {
            onFilesChange([...files, ...processedFiles]);
          }
        }
        // Reset input so same file can be selected again
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      },
      [files, processFiles, onFilesChange],
    );

    const handleAttachClick = useCallback(() => {
      fileInputRef.current?.click();
    }, []);

    const removeFile = useCallback(
      (fileId: string) => {
        if (onFilesChange) {
          onFilesChange(files.filter((f) => f.id !== fileId));
        }
      },
      [files, onFilesChange],
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
    }, []);

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          const processedFiles = processFiles(e.dataTransfer.files);
          if (onFilesChange) {
            onFilesChange([...files, ...processedFiles]);
          }
        }
      },
      [files, processFiles, onFilesChange],
    );

    // Maintain focus after sending message
    useEffect(() => {
      if (input === "" && !isTyping && textareaRef.current) {
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 0);
      }
    }, [input, isTyping]);

    const fileIcon = useMemo(() => {
      if (files.length > 0) {
        return <MdAttachFile color={colors.text.primary} />;
      }
      return <MdAttachFile />;
    }, [files.length, colors.text.primary]);

    return (
      <Box position="relative">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_FILE_TYPES.join(",")}
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />

        {/* File preview area */}
        {files.length > 0 && (
          <Box
            mb={2}
            p={3}
            bg={colors.background.secondary}
            borderRadius="md"
            border="1px solid"
            borderColor={colors.border.primary}
          >
            <VStack align="stretch" spacing={2}>
              <Text
                fontSize="xs"
                fontWeight="semibold"
                color={colors.text.secondary}
              >
                Attached Files ({files.length})
              </Text>
              <HStack spacing={2} flexWrap="wrap">
                {files.map((fileAttachment) => {
                  const FileIcon = getFileIcon(
                    fileAttachment.type,
                    fileAttachment.file.type,
                  );
                  return (
                    <Box
                      key={fileAttachment.id}
                      position="relative"
                      p={2}
                      bg={colors.background.primary}
                      borderRadius="md"
                      border="1px solid"
                      borderColor={colors.border.primary}
                      maxW="200px"
                    >
                      {fileAttachment.type === "image" &&
                        fileAttachment.preview && (
                          <Box mb={2}>
                            <img
                              src={fileAttachment.preview}
                              alt={fileAttachment.file.name}
                              style={{
                                width: "100%",
                                maxHeight: "100px",
                                objectFit: "cover",
                                borderRadius: "4px",
                              }}
                            />
                          </Box>
                        )}
                      <HStack spacing={2}>
                        <Icon
                          as={FileIcon}
                          boxSize="16px"
                          color={colors.text.secondary}
                        />
                        <VStack
                          align="flex-start"
                          spacing={0}
                          flex="1"
                          minW={0}
                        >
                          <Text
                            fontSize="xs"
                            fontWeight="medium"
                            color={colors.text.primary}
                            noOfLines={1}
                            title={fileAttachment.file.name}
                          >
                            {fileAttachment.file.name}
                          </Text>
                          <Text fontSize="xs" color={colors.text.tertiary}>
                            {formatFileSize(fileAttachment.file.size)}
                          </Text>
                        </VStack>
                        <IconButton
                          aria-label="Remove file"
                          icon={<MdClose />}
                          size="xs"
                          variant="ghost"
                          onClick={() => removeFile(fileAttachment.id)}
                        />
                      </HStack>
                    </Box>
                  );
                })}
              </HStack>
            </VStack>
          </Box>
        )}

        {/* Drop zone overlay */}
        {isDragOver && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="blue.500"
            opacity={0.1}
            borderRadius="lg"
            border="2px dashed"
            borderColor="blue.500"
            zIndex={10}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <VStack spacing={2}>
              <Icon as={MdAttachFile} boxSize="48px" color="blue.500" />
              <Text fontWeight="bold" color="blue.500">
                Drop files here
              </Text>
            </VStack>
          </Box>
        )}

        {/* Main input area */}
        <Box
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message Chatty... (drag files here or click attach)"
            onKeyDown={handleKeyDown}
            disabled={disabled}
            minH="24px"
            maxH="200px"
            fontSize="md"
            lineHeight="1.5"
            leftIcon={
              <Tooltip label="Attach file">
                <IconButton
                  aria-label="Attach file"
                  icon={fileIcon}
                  size="sm"
                  variant="ghost"
                  onClick={handleAttachClick}
                  isDisabled={disabled}
                />
              </Tooltip>
            }
            rightIcon={<MdSend />}
            onRightIconClick={onSend}
          />
        </Box>
      </Box>
    );
  },
);

ChatInput.displayName = "ChatInput";

export default ChatInput;
