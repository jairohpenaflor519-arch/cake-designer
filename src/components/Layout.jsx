export default function Layout({ children }) {
  return (
    <div style={{
      background: "#f0e8dc",
      minHeight: "100vh",
      width: "100vw",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      fontFamily: "system-ui, sans-serif",
    }}>
      {children}
    </div>
  );
}