import React from "react";

type Props = {
  title: string;
  rows: { name: string; value: string | number }[];
};

export default function ResultTable({ title, rows }: Props) {
  if (!rows.length) return null;
  return (
    <div className="mt-4">
      <h3 className="font-semibold mb-2 text-gray-900">{title}</h3> {/* << ajouté */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-gray-900">{/* << ajouté */}
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="border-b border-gray-200">
                <td className="py-2 pr-6 font-mono text-gray-900">{r.name}</td>   {/* << ajouté */}
                <td className="py-2 text-gray-900">{r.value}</td>                  {/* << ajouté */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
