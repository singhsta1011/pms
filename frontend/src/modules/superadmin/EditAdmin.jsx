import { useParams } from "react-router-dom";

export default function EditAdmin(){

  const { id } = useParams();

  return(
    <div className="p-6 max-w-[600px]">
      <h1 className="text-xl font-semibold mb-4">
        Edit Admin #{id}
      </h1>

      <input className="border p-2 rounded w-full mb-3" placeholder="Hotel Name"/>
      <input className="border p-2 rounded w-full mb-3" placeholder="City"/>
      <input className="border p-2 rounded w-full mb-3" placeholder="State"/>

      <button className="bg-blue-600 text-white px-4 py-2 rounded">
        Save Changes
      </button>
    </div>
  );
}