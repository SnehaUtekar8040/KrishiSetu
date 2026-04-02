import { cn } from "../../lib/utils";
import { useState } from "react";

export const Component = () => {
  const [count, setCount] = useState(0);

  return (
    <div className={cn("flex flex-col items-center gap-4 p-4 rounded-lg bg-white shadow-md border border-gray-100")}>
      <h1 className="text-2xl font-bold mb-2 text-green-800">Component Example</h1>
      <h2 className="text-xl font-semibold text-brown-600">{count}</h2>
      <div className="flex gap-2">
        <button 
          className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
          onClick={() => setCount((prev) => prev - 1)}
        >
          -
        </button>
        <button 
          className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
          onClick={() => setCount((prev) => prev + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default Component;
