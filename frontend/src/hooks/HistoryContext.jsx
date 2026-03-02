import { createContext, useContext } from "react";

export const HistoryContext = createContext(null);

export const useHistory = () => {
  return useContext(HistoryContext);
};
