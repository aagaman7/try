import React from "react";

const Button = ({ 
  children, 
  type = "button", 
  className = "", 
  disabled = false, 
  onClick, 
  variant = "primary", 
  size = "md", 
  ...props 
}) => {
  // Base button styles
  const baseClasses =
    "rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  // Button sizes
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  // Button variants
  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500",
    success: "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    outline:
      "bg-transparent border border-gray-400 hover:bg-gray-100 text-gray-700 focus:ring-gray-500",
  };

  // Disabled state styles
  const disabledClasses = "opacity-50 cursor-not-allowed";

  // Construct final class string
  const classes = [
    baseClasses,
    sizeClasses[size] || sizeClasses["md"], // Fallback to "md" if invalid size is passed
    variantClasses[variant] || variantClasses["primary"], // Fallback to "primary" if invalid variant
    disabled ? disabledClasses : "",
    className,
  ]
    .join(" ")
    .trim();

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
