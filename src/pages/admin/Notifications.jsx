import React, { useEffect, useState } from "react";
import {
Bell,
Plus,
Search,
Trash2,
Eye,
Send
} from "lucide-react";

const Notifications = () => {

const [notifications,setNotifications]=useState([]);
const [filteredNotifications,setFilteredNotifications]=useState([]);

const [search,setSearch]=useState("");

const [showModal,setShowModal]=useState(false);

const [formData,setFormData]=useState({
title:"",
message:"",
audience:"All Users"
});

const [selectedNotification,setSelectedNotification]=useState(null);


useEffect(()=>{

const data=[

{
id:1,
title:"New React Course Added",
message:"React Masterclass course is now available",
audience:"Students",
date:"20 Jul 2025"
},

{
id:2,
title:"Payment Reminder",
message:"Complete payment before deadline",
audience:"Students",
date:"22 Jul 2025"
},

{
id:3,
title:"Instructor Meeting",
message:"Meeting at 5 PM today",
audience:"Instructors",
date:"25 Jul 2025"
}

];

setNotifications(data);
setFilteredNotifications(data);

},[]);



useEffect(()=>{

const filtered=

notifications.filter(item=>

item.title
.toLowerCase()
.includes(search.toLowerCase())

||

item.message
.toLowerCase()
.includes(search.toLowerCase())

);

setFilteredNotifications(filtered);

},[
search,
notifications
]);



const addNotification=()=>{

if(
!formData.title ||
!formData.message
) return;


const newNotification={

id:Date.now(),

...formData,

date:new Date()
.toLocaleDateString()

};

setNotifications([
newNotification,
...notifications
]);

setShowModal(false);

setFormData({

title:"",
message:"",
audience:"All Users"

});

};



const deleteNotification=(id)=>{

setNotifications(

notifications.filter(
n=>n.id!==id
)

);

};



return(

<div className="bg-gray-50 min-h-screen p-6">

<div className="mb-6 text-gray-500">

Dashboard {" > "} Notifications

</div>


<div className="flex justify-between items-center mb-8">

<div>

<h1 className="text-3xl font-bold">

Notifications

</h1>

<p className="text-gray-500">

Send and manage notifications

</p>

</div>


<button

onClick={()=>setShowModal(true)}

className="bg-orange-500 text-white px-5 py-3 rounded-xl flex items-center gap-2"

>

<Plus size={18}/>

Create Notification

</button>

</div>



<div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

<div className="bg-white p-5 rounded-xl shadow">

<p>Total Notifications</p>

<h2 className="text-3xl font-bold">

{notifications.length}

</h2>

</div>


<div className="bg-white p-5 rounded-xl shadow">

<p>Students</p>

<h2 className="text-3xl text-blue-500">

{
notifications.filter(
n=>n.audience==="Students"
).length
}

</h2>

</div>


<div className="bg-white p-5 rounded-xl shadow">

<p>Instructors</p>

<h2 className="text-3xl text-purple-500">

{
notifications.filter(
n=>n.audience==="Instructors"
).length
}

</h2>

</div>

</div>



<div className="bg-white p-6 rounded-xl shadow">

<div className="flex justify-between mb-6">

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

placeholder="Search Notifications"

className="border rounded-xl pl-10 px-4 py-2"

/>

</div>

</div>



<div className="space-y-4">

{

filteredNotifications.map(item=>(

<div
key={item.id}
className="border rounded-xl p-4 flex justify-between items-center hover:shadow"
>

<div className="flex gap-4">

<div className="bg-orange-100 p-3 rounded-full">

<Bell className="text-orange-500"/>

</div>

<div>

<h2 className="font-semibold">

{item.title}

</h2>

<p className="text-gray-500 text-sm">

{item.message}

</p>

<p className="text-xs text-gray-400 mt-1">

{item.audience} • {item.date}

</p>

</div>

</div>


<div className="flex gap-3">

<button
onClick={()=>
setSelectedNotification(item)
}
className="text-blue-500"
>

<Eye size={18}/>

</button>


<button
onClick={()=>
deleteNotification(item.id)
}
className="text-red-500"
>

<Trash2 size={18}/>

</button>

</div>

</div>

))

}

</div>

</div>



{showModal && (

<div className="fixed inset-0 bg-black/50 flex items-center justify-center">

<div className="bg-white w-[450px] rounded-xl p-6">

<h2 className="text-xl font-bold mb-4">

Create Notification

</h2>

<input

placeholder="Title"

value={formData.title}

onChange={(e)=>
setFormData({
...formData,
title:e.target.value
})
}

className="border p-3 w-full rounded mb-3"

/>


<textarea

placeholder="Message"

value={formData.message}

onChange={(e)=>
setFormData({
...formData,
message:e.target.value
})
}

className="border p-3 w-full rounded mb-3"

/>


<select

value={formData.audience}

onChange={(e)=>
setFormData({
...formData,
audience:e.target.value
})
}

className="border p-3 w-full rounded mb-4"

>

<option>All Users</option>
<option>Students</option>
<option>Instructors</option>

</select>


<button

onClick={addNotification}

className="bg-orange-500 text-white w-full py-3 rounded-xl flex items-center justify-center gap-2"

>

<Send size={18}/>

Send Notification

</button>

</div>

</div>

)}



{selectedNotification && (

<div className="fixed inset-0 bg-black/40 flex justify-center items-center">

<div className="bg-white p-6 rounded-xl w-[400px]">

<h2 className="text-xl font-bold mb-4">

Notification Details

</h2>

<p><strong>Title:</strong> {selectedNotification.title}</p>

<p><strong>Message:</strong> {selectedNotification.message}</p>

<p><strong>Audience:</strong> {selectedNotification.audience}</p>
<p><strong>Date:</strong> {selectedNotification.date}</p>

<button
onClick={()=>
setSelectedNotification(null)
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

export default Notifications;