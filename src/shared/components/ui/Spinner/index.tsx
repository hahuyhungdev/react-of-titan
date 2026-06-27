import styles from "./styles.module.scss";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
}

export function Spinner({ size = "md" }: SpinnerProps) {
  const classes = [styles.spinner, styles[`spinner-${size}`]].filter(Boolean).join(" ");

  return (
    <div className={classes} role="status" aria-label="Loading">
      <span className="sr-only">Loading...</span>
    </div>
  );
}
