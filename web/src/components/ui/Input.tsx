import React from "react";
import {
  Input as ChakraInput,
  Textarea as ChakraTextarea,
  InputProps as ChakraInputProps,
  TextareaProps as ChakraTextareaProps,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/react";

interface CustomInputProps extends ChakraInputProps {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
}

interface CustomTextareaProps extends ChakraTextareaProps {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  disabled?: boolean;
}

const Input: React.FC<CustomInputProps> = ({
  leftIcon,
  rightIcon,
  onRightIconClick,
  ...props
}) => {
  const bgColor = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.300", "gray.600");
  const focusBorderColor = useColorModeValue("blue.500", "blue.400");
  const placeholderColor = useColorModeValue("gray.500", "gray.400");

  if (leftIcon || rightIcon) {
    return (
      <HStack
        bg={bgColor}
        borderRadius="lg"
        border="1px solid"
        borderColor={borderColor}
        _focusWithin={{
          borderColor: focusBorderColor,
          boxShadow: `0 0 0 1px ${focusBorderColor}`,
        }}
        px={3}
        py={2}
        spacing={2}
      >
        {leftIcon}
        <ChakraInput
          border="none"
          bg="transparent"
          _focus={{
            boxShadow: "none",
          }}
          _placeholder={{
            color: placeholderColor,
          }}
          {...props}
        />
        {rightIcon && (
          <IconButton
            aria-label="Action"
            icon={rightIcon as React.ReactElement}
            size="sm"
            variant="ghost"
            onClick={onRightIconClick}
          />
        )}
      </HStack>
    );
  }

  return (
    <ChakraInput
      bg={bgColor}
      borderColor={borderColor}
      _focus={{
        borderColor: focusBorderColor,
        boxShadow: `0 0 0 1px ${focusBorderColor}`,
      }}
      _placeholder={{
        color: placeholderColor,
      }}
      {...props}
    />
  );
};

const Textarea: React.FC<CustomTextareaProps> = ({
  leftIcon,
  rightIcon,
  onRightIconClick,
  disabled,
  ...props
}) => {
  const bgColor = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.300", "gray.600");
  const focusBorderColor = useColorModeValue("blue.500", "blue.400");
  const placeholderColor = useColorModeValue("gray.500", "gray.400");

  if (leftIcon || rightIcon) {
    return (
      <HStack
        bg={bgColor}
        borderRadius="lg"
        border="1px solid"
        borderColor={borderColor}
        _focusWithin={{
          borderColor: focusBorderColor,
          boxShadow: `0 0 0 1px ${focusBorderColor}`,
        }}
        px={3}
        py={2}
        spacing={2}
        align="flex-start"
      >
        {leftIcon}
        <ChakraTextarea
          border="none"
          bg="transparent"
          resize="none"
          disabled={disabled}
          _focus={{
            boxShadow: "none",
          }}
          _placeholder={{
            color: placeholderColor,
          }}
          {...props}
        />
        {rightIcon && (
          <IconButton
            aria-label="Action"
            icon={rightIcon as React.ReactElement}
            size="sm"
            variant="ghost"
            onClick={onRightIconClick}
            alignSelf="flex-end"
          />
        )}
      </HStack>
    );
  }

  return (
    <ChakraTextarea
      bg={bgColor}
      borderColor={borderColor}
      disabled={disabled}
      _focus={{
        borderColor: focusBorderColor,
        boxShadow: `0 0 0 1px ${focusBorderColor}`,
      }}
      _placeholder={{
        color: placeholderColor,
      }}
      {...props}
    />
  );
};

export { Input, Textarea };
