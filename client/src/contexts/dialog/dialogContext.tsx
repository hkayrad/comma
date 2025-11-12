import { createContext } from "react";

import type { CustomerDto } from "@/lib/types";
import type { DialogConfig } from "./dialogProvider";

interface DialogContextType {
  openDialog: (config: DialogConfig) => void;
  closeDialog: () => void;
  isOpen: boolean;
  customerInfo: CustomerDto | null;
}

export const DialogContext = createContext<DialogContextType | undefined>(
  undefined,
);
