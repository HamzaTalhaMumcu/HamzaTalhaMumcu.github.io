"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  idleLabel,
  pendingLabel,
  className,
}: {
  idleLabel: string;
  pendingLabel: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${className ?? ""} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
