import { createThirdwebClient } from "thirdweb";

// Fetch the client ID from environment variables
const clientId: string | undefined = process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID;

// Ensure the client ID is provided
if (!clientId) {
  throw new Error(
    "Environment variable NEXT_PUBLIC_TEMPLATE_CLIENT_ID is missing."
  );
}

// Initialize the Thirdweb client
export const client = createThirdwebClient({
  clientId,
});
