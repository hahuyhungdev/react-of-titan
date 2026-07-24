import React from 'react';
import styles from './ui.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const buttonClass = `${styles.btn} ${styles[variant]} ${className}`;
  return (
    <button className={buttonClass} {...props}>
      {children}
    </button>
  );
};

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  badge?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, badge, children, className = '', ...props }) => {
  return (
    <div className={`${styles.card} ${className}`} {...props}>
      {(title || badge) && (
        <div className={styles.cardHeader}>
          {title && <h3 className={styles.cardTitle}>{title}</h3>}
          {badge}
        </div>
      )}
      <div className={styles.cardContent}>{children}</div>
    </div>
  );
};

export interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'success', children }) => {
  const variantClass = variant === 'warning' ? styles.badgeWarning : variant === 'danger' ? styles.badgeDanger : styles.badgeSuccess;
  return <span className={`${styles.badge} ${variantClass}`}>{children}</span>;
};

export interface StatWidgetProps {
  label: string;
  value: string | number;
}

export const StatWidget: React.FC<StatWidgetProps> = ({ label, value }) => {
  return (
    <div className={styles.statWidget}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
    </div>
  );
};

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className={styles.inputGroup}>
      {label && <label className={styles.inputLabel}>{label}</label>}
      <input className={`${styles.input} ${className}`} {...props} />
    </div>
  );
};
