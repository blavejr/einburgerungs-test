import { useToast } from "@/context/ToastContext";

export function Toast() {
  const { message, visible } = useToast();
  return <div className={`toast${visible ? " show" : ""}`}>{message}</div>;
}
