import { useContext } from "react";
import { UserContext } from "./userContext";

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a ConfigProvider");
  }
  return context;
};
