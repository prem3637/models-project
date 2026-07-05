import React from "react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

interface PhoneInputFieldProps {
  label?: string;
  value: string;
  onChange: (phone: string) => void;
  defaultCountry?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  className?: string;
}

const PhoneInputField: React.FC<PhoneInputFieldProps> = ({
  label,
  value,
  onChange,
  defaultCountry = "in",
  error = false,
  helperText,
  disabled = false,
  className = "",
}) => {
  const bc = error ? "#ef4444" : "var(--phone-input-border, #cbd5e1)";

  return (
    <div className={`text-slate-900 dark:text-slate-100 ${className}`}>
      {label && (
        <label className="block mb-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      )}

      <PhoneInput
        defaultCountry={defaultCountry}
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={
          {
            "--react-international-phone-height": "46px",
            "--react-international-phone-border-radius": "8px",
            "--react-international-phone-border-color": bc,
            "--react-international-phone-background-color": "var(--phone-input-bg, #ffffff)",
            "--react-international-phone-text-color": "var(--phone-input-text, #0f172a)",
            "--react-international-phone-selected-dropdown-item-background-color": "var(--phone-input-dropdown-selected-bg, #eff6ff)",
            "--react-international-phone-country-selector-background-color-hover": "var(--phone-input-dropdown-hover-bg, #f8fafc)",
            "--react-international-phone-font-size": "0.875rem",
            width: "100%",
          } as React.CSSProperties
        }
        inputStyle={{
          width: "100%",
          height: "46px",
          borderTopWidth: "2px",
          borderBottomWidth: "2px",
          borderRightWidth: "2px",
          borderLeftWidth: "0px",
          borderStyle: "solid",
          borderColor: bc,
          borderRadius: "0 8px 8px 0",
          fontSize: "0.875rem",
          color: "var(--phone-input-text, #0f172a)",
          backgroundColor: "var(--phone-input-bg, #ffffff)",
          outline: "none",
          paddingLeft: "10px",
        }}
        countrySelectorStyleProps={{
          buttonStyle: {
            height: "46px",
            paddingLeft: "12px",
            paddingRight: "6px",
            borderTopWidth: "2px",
            borderBottomWidth: "2px",
            borderLeftWidth: "2px",
            borderRightWidth: "0px",
            borderStyle: "solid",
            borderColor: bc,
            borderRadius: "8px 0 0 8px",
            backgroundColor: "var(--phone-input-bg, #ffffff)",
          },
        }}
      />

      {helperText && (
        <p className={`mt-1 text-xs ${error ? "text-red-500" : "text-slate-500"}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export default PhoneInputField;
