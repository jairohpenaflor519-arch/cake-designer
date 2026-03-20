export default function PanelSection({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "var(--text-light, #BBA890)",
        marginBottom: 10,
        paddingLeft: 2,
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}