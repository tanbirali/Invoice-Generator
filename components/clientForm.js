"use client";

const ClientForm = ({props}) => {
const [clientName, setClientName] = useState("");
const [clientAddress, setClientAddress] = useState("");
  return props.trigger? (
    <div 
    className="w-full h-full"
    onClick={props.setTrigger(false)}>
      <div>
        <h3>Edit Client Details</h3>
        <hr className="h-4"/>
        <div>
        <input
            value={clientName}
            onChange={(e)=>setClientName(e.target.value)}
        />
        <input
            value={clientAddress}
            onChange={(e)=>setClientAddress(e.target.value)}
        />
        </div>
      </div>
    </div>
  ): ("");
}

export default ClientForm