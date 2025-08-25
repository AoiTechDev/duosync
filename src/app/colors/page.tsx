import React from "react";

const colors = [
  { name: "Background", varName: "--background" },
  { name: "Foreground", varName: "--foreground" },
  { name: "Card", varName: "--card" },
  { name: "Card Foreground", varName: "--card-foreground" },
  { name: "Primary", varName: "--primary" },
  { name: "Primary FG", varName: "--primary-foreground" },
  { name: "Secondary", varName: "--secondary" },
  { name: "Secondary FG", varName: "--secondary-foreground" },
  { name: "Muted", varName: "--muted" },
  { name: "Muted FG", varName: "--muted-foreground" },
  { name: "Accent", varName: "--accent" },
  { name: "Accent FG", varName: "--accent-foreground" },
  { name: "Border", varName: "--border" },
  { name: "Input", varName: "--input" },
  { name: "Ring", varName: "--ring" },
  { name: "Sidebar", varName: "--sidebar" },
  { name: "Sidebar FG", varName: "--sidebar-foreground" },
  { name: "Sidebar Primary", varName: "--sidebar-primary" },
  { name: "Sidebar Primary FG", varName: "--sidebar-primary-foreground" },
  { name: "Sidebar Accent", varName: "--sidebar-accent" },
  { name: "Sidebar Accent FG", varName: "--sidebar-accent-foreground" },
  { name: "Sidebar Border", varName: "--sidebar-border" },
  { name: "Sidebar Ring", varName: "--sidebar-ring" },
];

const ColorSquare = ({ name, varName }: { name: string; varName: string }) => {
  return (
    <div className="rounded-lg border p-3 bg-card text-card-foreground">
      <div
        className="w-full h-20 rounded-md border"
        style={{ backgroundColor: `var(${varName})`, borderColor: "var(--border)" }}
      />
      <div className="mt-2 text-sm">
        <div className="font-medium">{name}</div>
        <div className="text-muted-foreground">{varName}</div>
      </div>
    </div>
  );
};

const ColorsPage = () => {
  return (
    <main className="min-h-[100svh] p-6 md:p-10 bg-background text-foreground">
      <h1 className="text-2xl font-semibold mb-6">Theme Colors</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {colors.map((c) => (
          <ColorSquare key={c.varName} name={c.name} varName={c.varName} />
        ))}
      </div>
    </main>
  );
};

export default ColorsPage; 