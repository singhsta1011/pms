import { useState } from "react";
import { api } from "../../services/api";

export default function AssignUserModules({user,onClose,reload}){

  const [modules,setModules] = useState(user.modules || []);

  const toggle=(m)=>{
    setModules(prev =>
      prev.includes(m)
        ? prev.filter(x=>x!==m)
        : [...prev,m]
    );
  };

  const save = async()=>{
    await api.patch(`/users/${user.id}/modules`,{modules});
    reload();
    onClose();
  };

  return(
    <div className="fixed right-0 top-0 h-full w-[420px] bg-white border-l shadow-xl p-6">

      <div className="flex justify-between mb-4">
        <h2>Assign Modules</h2>
        <button onClick={onClose}>Close</button>
      </div>

      <label className="block">
        <input type="checkbox"
          checked={modules.includes("PMS")}
          onChange={()=>toggle("PMS")}
        /> PMS
      </label>

      <label className="block">
        <input type="checkbox"
          checked={modules.includes("HOUSEKEEPING")}
          onChange={()=>toggle("HOUSEKEEPING")}
        /> Housekeeping
      </label>

      <button
        onClick={save}
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded"
      >
        Save Modules
      </button>
    </div>
  );
}