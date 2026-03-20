export default function Layout({ children }) {
  return (
    <div style={{
      minHeight: "100vh",
      width: "100vw",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      background: "linear-gradient(145deg, #EDE0CF 0%, #E2D0BB 40%, #D9C4A8 100%)",
      fontFamily: "var(--font-body, 'DM Sans', system-ui, sans-serif)",
    }}>
      {children}
    </div>
  );
}