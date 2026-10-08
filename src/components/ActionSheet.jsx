import Sheet from "./Sheet";

export default function ActionSheet({ title, close, actions }) {
  return (
    <Sheet title={title} close={close}>
      <div className="actions-col">
        {actions.filter(Boolean).map((a, i) => (
          <button key={i} className={"action-item pressable " + (a.danger ? "danger" : "")}
            onClick={() => { close(); a.onClick?.(); }}>
            {a.icon}
            <span>{a.label}</span>
            {a.trailing}
          </button>
        ))}
      </div>
    </Sheet>
  );
}
