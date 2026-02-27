import { useState } from "react";
import { useParams } from "react-router-dom";

export default function AssignModules(){

  const { id } = useParams();
  const [modules,setModules] = useState([]);

  const toggle=(m)=>{
    setModules(prev=>
      prev.includes(m)
        ? prev.filter(x=>x!==m)
        : [...prev,m]
    );
  };

  return(
    <div className="p-6 max-w-[600px]">
      <h1 className="text-xl font-semibold mb-4">
        Assign Modules #{id}
      </h1>

      <label className="flex gap-2 mb-2">
        <input type="checkbox"
          checked={modules.includes("PMS")}
          onChange={()=>toggle("PMS")}
        />
        <span className="bg-blue-100 px-3 py-1 rounded">PMS</span>
      </label>

      <label className="flex gap-2">
        <input type="checkbox"
          checked={modules.includes("HOUSEKEEPING")}
          onChange={()=>toggle("HOUSEKEEPING")}
        />
        <span className="bg-purple-100 px-3 py-1 rounded">Housekeeping</span>
      </label>
    </div>
  );
}