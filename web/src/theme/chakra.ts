import { extendTheme } from "@chakra-ui/react";

const config = {
    initialColorMode: "light",
    useSystemColorMode: false,
};

const theme = extendTheme({
    config,
    styles: {
        global: (props: any) => ({
            body: {
                bg: props.colorMode === "dark" ? "gray.900" : "gray.50",
                color: props.colorMode === "dark" ? "white" : "gray.900",
            },
        }),
    },
});

export default theme;
