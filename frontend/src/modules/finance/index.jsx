export default function FinancePage(){

  return (
    <div className="p-6 space-y-6">

      <h2 className="text-xl font-semibold">Finance</h2>

      <div className="grid grid-cols-4 gap-4">

        <Card title="Total Revenue" value="₹ 2,45,000"/>
        <Card title="Pending Payment" value="₹ 35,000"/>
        <Card title="Today Revenue" value="₹ 18,500"/>
        <Card title="Invoices" value="124"/>

      </div>

    </div>
  );
}

function Card({title,value}){
  return(
    <div className="bg-white border rounded-xl p-5 shadow-sm">
      <p className="text-xs text-gray-500">{title}</p>
      <h3 className="text-lg font-semibold mt-2">{value}</h3>
    </div>
  );
}