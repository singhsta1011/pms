import { useState } from "react";
import { useParams } from "react-router-dom";

export default function RoomLimit(){

  const { id } = useParams();
  const [rooms,setRooms] = useState(10);

  return(
    <div className="p-6 max-w-[500px]">
      <h1 className="text-xl font-semibold mb-4">
        Restrict Rooms #{id}
      </h1>

      <div className="flex gap-2 items-center">
        <button
          onClick={()=>setRooms(rooms-1)}
          className="px-3 py-1 bg-gray-200 rounded"
        >
          -
        </button>

        <input
          value={rooms}
          readOnly
          className="border p-2 rounded w-full text-center"
        />

        <button
          onClick={()=>setRooms(rooms+1)}
          className="px-3 py-1 bg-gray-200 rounded"
        >
          +
        </button>
      </div>
    </div>
  );
}