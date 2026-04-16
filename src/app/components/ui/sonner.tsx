import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      style={
        {
          "--normal-bg": "#ffffff",
          "--normal-text": "#1A1A2E",
          "--normal-border": "rgba(26, 26, 46, 0.1)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
