import usePmsData from "../../hooks/usePmsData";

export default function RoomsPage(){

  const { rooms } = usePmsData();

  const data = rooms?.data || rooms || [];

  return (
    <div className="p-6 space-y-4">

      <h2 className="text-xl font-semibold">Rooms</h2>

      <div className="bg-white border rounded-xl overflow-hidden">

        <div className="grid grid-cols-5 text-xs font-semibold bg-gray-50 p-3">
          <div>Room</div>
          <div>Type</div>
          <div>Status</div>
          <div>Active</div>
          <div>Action</div>
        </div>

        {data.map(r=>(
          <div key={r.id} className="grid grid-cols-5 p-3 border-t">
            <div>{r.roomNumber}</div>
            <div>{r.roomType}</div>
            <div>{r.status}</div>
            <div>{r.isActive ? "Yes":"No"}</div>
            <button className="text-blue-600">Edit</button>
          </div>
        ))}

      </div>

    </div>
  );
}