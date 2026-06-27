import styles from "./ComponentName.module.scss"; // Optional, remove if style is simple and using TailwindCSS

interface ComponentNameProps {
  title: string;
  children?: React.ReactNode;
}

export function ComponentName({ title, children }: ComponentNameProps) {
  return (
    <div className={styles.container}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}

export default ComponentName;
