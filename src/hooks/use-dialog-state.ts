import { useState } from "react";

export default function useDialogState(initialState = false) {
  const [open, setOpen] = useState(initialState);
  return [open, setOpen] as const;
}
