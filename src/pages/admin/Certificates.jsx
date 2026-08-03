import React, { useEffect, useState } from "react";
import {
Search,
Download,
Plus,
Eye,
Trash2
} from "lucide-react";

const Certificates = () => {

const [certificates,setCertificates]=useState([]);
const [filteredCertificates,setFilteredCertificates]=useState([]);

const [search,setSearch]=useState("");
const [statusFilter,setStatusFilter]=useState("All");

const [showModal,setShowModal]=useState(false);
const [selectedCertificate,setSelectedCertificate]=useState(null);

useEffect(()=>{

const data=[

{
_id:"CERT001",
student:"John Doe",
email:"john@gmail.com",
course:"React Masterclass",
issueDate:"20 Jul 2025",
status:"Verified"
},

{
_id:"CERT002",
student:"Sarah Smith",
email:"sarah@gmail.com",
course:"Java Full Stack",
issueDate:"22 Jul 2025",
status:"Pending"
},

{
_id:"CERT003",
student:"David",
email:"david@gmail.com",
course:"Python Bootcamp",
issueDate:"25 Jul 2025",
status:"Revoked"
}

];

setCertificates(data);
setFilteredCertificates(data);

},[]);



useEffect(()=>{

let data=[...certificates];

if(search){

data=data.filter(c=>

c.student
.toLowerCase()
.includes(search.toLowerCase())

||

c._id
.toLowerCase()
.includes(search.toLowerCase())

);

}

if(statusFilter!=="All"){

data=data.filter(
c=>c.status===statusFilter
);

}

setFilteredCertificates(data);

},[
search,
statusFilter,
certificates
]);



const exportCSV=()=>{

const csv=

"Certificate ID,Student,Course,Status\n"+

filteredCertificates.map(c=>

`${c._id},
${c.student},
${c.course},
${c.status}`

).join("\n");


const blob=
new Blob([csv],{
type:"text/csv"
});

const url=
window.URL.createObjectURL(blob);

const a=
document.createElement("a");

a.href=url;
a.download="certificates.csv";
a.click();

};



const revokeCertificate=(id)=>{

const updated=

certificates.map(c=>

c._id===id

?

{
...c,
status:"Revoked"
}

:

c

);

setCertificates(updated);

};



const deleteCertificate=(id)=>{

const updated=

certificates.filter(
c=>c._id!==id
);

setCertificates(updated);

};



return(

<div className="bg-gray-50 min-h-screen p-6">

<div className="mb-6 text-gray-500">

Dashboard {" > "} Certificates

</div>


<div className="flex justify-between items-center mb-8">

<div>

<h1 className="text-3xl font-bold">

Certificates Management

</h1>

<p className="text-gray-500">

Manage course certificates

</p>

</div>


<button
className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl flex gap-2"
>

<Plus size={18}/>

Generate

</button>

</div>



<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

<div className="bg-white p-5 rounded-xl shadow">

<p>Total Issued</p>

<h2 className="text-3xl font-bold">

{certificates.length}

</h2>

</div>


<div className="bg-white p-5 rounded-xl shadow">

<p>Verified</p>

<h2 className="text-3xl text-green-500">

{
certificates.filter(
c=>c.status==="Verified"
).length
}

</h2>

</div>


<div className="bg-white p-5 rounded-xl shadow">

<p>Pending</p>

<h2 className="text-3xl text-orange-500">

{
certificates.filter(
c=>c.status==="Pending"
).length
}

</h2>

</div>


<div className="bg-white p-5 rounded-xl shadow">

<p>Revoked</p>

<h2 className="text-3xl text-red-500">

{
certificates.filter(
c=>c.status==="Revoked"
).length
}

</h2>

</div>

</div>



<div className="bg-white p-6 rounded-xl shadow">

<div className="flex flex-wrap gap-3 mb-6">

<div className="relative">

<Search
size={18}
className="absolute left-3 top-3 text-gray-400"
/>

<input
value={search}
onChange={(e)=>
setSearch(e.target.value)
}
placeholder="Search student or ID"
className="border rounded-xl pl-10 px-4 py-2"
/>

</div>


<select
value={statusFilter}
onChange={(e)=>
setStatusFilter(e.target.value)
}
className="border rounded-xl px-4 py-2"
>

<option>All</option>
<option>Verified</option>
<option>Pending</option>
<option>Revoked</option>

</select>


<button
onClick={exportCSV}
className="border rounded-xl px-4 py-2"
>

<Download/>

</button>

</div>



<div className="overflow-x-auto">

<table className="w-full">

<thead className="border-b">

<tr>

<th>Student</th>
<th>Course</th>
<th>Certificate ID</th>
<th>Issue Date</th>
<th>Status</th>
<th>Actions</th>

</tr>

</thead>


<tbody>

{

filteredCertificates.map(c=>(

<tr
key={c._id}
className="border-b"
>

<td className="py-5">

<div className="flex items-center gap-3">

<div
className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold"
>

{c.student.charAt(0)}

</div>

{c.student}

</div>

</td>


<td>{c.course}</td>

<td>{c._id}</td>

<td>{c.issueDate}</td>


<td>

<span
className={`px-3 py-1 rounded-full text-sm

${

c.status==="Verified"

?

"bg-green-100 text-green-600"

:

c.status==="Pending"

?

"bg-orange-100 text-orange-600"

:

"bg-red-100 text-red-600"

}

`}

>

{c.status}

</span>

</td>


<td>

<div className="flex gap-3">

<button
onClick={()=>{
setSelectedCertificate(c);
setShowModal(true);
}}
className="text-blue-500"
>

<Eye size={18}/>

</button>


<button
onClick={()=>
revokeCertificate(c._id)
}
className="text-yellow-500"
>

Revoke

</button>


<button
onClick={()=>
deleteCertificate(c._id)
}
className="text-red-500"
>

<Trash2 size={18}/>

</button>

</div>

</td>

</tr>

))

}

</tbody>

</table>

</div>

</div>



{showModal && selectedCertificate && (

<div className="fixed inset-0 bg-black/50 flex justify-center items-center">

<div className="bg-white w-[450px] rounded-xl p-6">

<h2 className="text-xl font-bold mb-5">

Certificate Details

</h2>

<p><strong>Student:</strong> {selectedCertificate.student}</p>

<p><strong>Email:</strong> {selectedCertificate.email}</p>

<p><strong>Course:</strong> {selectedCertificate.course}</p>

<p><strong>ID:</strong> {selectedCertificate._id}</p>

<p><strong>Issue Date:</strong> {selectedCertificate.issueDate}</p>

<p><strong>Status:</strong> {selectedCertificate.status}</p>

<button
onClick={()=>
setShowModal(false)
}
className="mt-6 bg-orange-500 text-white px-5 py-2 rounded-lg"
>

Close

</button>

</div>

</div>

)}

</div>

);

};

export default Certificates;