import React, { useState } from 'react'
import './SharedForm.css'
import Date_Picker from './Date_Picker';
import InputField from './InputField';
import CustomButton from './CustomButton';

function SharedForm() {
    const batchName = "Batch A";
    const [form, setForm] = useState({
        name: "",
        email: "",
        gender: "",
        contact: "",
        address: "",
        occupation: "",
        qualification: "",
        blood: "",
        photo: null,
        adhaar: null,
    });

    return (
        <div className='container p-4'>
            <div className="row">
                <div className="col-4"><img className='w-25' src="vite.svg" alt="No Logo Today" /></div>
                <div className="col-4"><h3 className='text text-center'>Trainee Registration For {batchName}</h3></div>
            </div>
            <div className="row py-3 justify-content-center">
                <div className="col-4 py-3" style={{width:"auto"}}>
                    <InputField
                        label="Name"
                        value={form.name}
                        onChange={e => setForm(f => ({...f, name: e.target.value}))}
                        placeholder="Enter Your Name"
                    />
                </div>
                <div className="col-4 py-3" style={{width:"auto"}}>
                    <InputField
                        label="Email"
                        value={form.email}
                        onChange={e => setForm(f => ({...f, email: e.target.value}))}
                        placeholder="Enter Your Email"
                    />
                </div>
                <div className="col-4 py-3" style={{width:"auto"}}>
                    <Date_Picker
                        label="DOB"
                        value={form.dob}
                        onChange={date => setForm(f => ({...f, dob: date}))}
                        iconRight="15px"
                    />
                </div>
                <div className="col-4 py-3" style={{width:"auto"}}>
                    <InputField
                        label="Gender"
                        type="select"
                        value={form.gender}
                        onChange={e => setForm(f => ({...f, gender: e.target.value}))}
                        options={[
                            { value: "Male", label: "Male" },
                            { value: "Female", label: "Female" }
                        ]}
                        placeholder="Select"
                    />
                </div>
                <div className="col-4 py-3" style={{width:"auto"}}>
                    <InputField
                        label="Contact Number"
                        type="number"
                        value={form.contact}
                        onChange={e => setForm(f => ({...f, contact: e.target.value}))}
                        placeholder="Contact Number"
                    />
                </div>
                <div className="col-4 py-3" style={{width:"auto"}}>
                    <InputField
                        label="Address"
                        value={form.address}
                        onChange={e => setForm(f => ({...f, address: e.target.value}))}
                        placeholder="Enter Your Address"
                    />
                </div>
                <div className="col-4 py-3" style={{width:"auto"}}>
                    <InputField
                        label="Occupation"
                        value={form.occupation}
                        onChange={e => setForm(f => ({...f, occupation: e.target.value}))}
                        placeholder="Enter Your Occupation"
                    />
                </div>
                <div className="col-4 py-3" style={{width:"auto"}}>
                    <InputField
                        label="Qualification"
                        value={form.qualification}
                        onChange={e => setForm(f => ({...f, qualification: e.target.value}))}
                        placeholder="Enter Your qualification"
                    />
                </div>
                <div className="col-4 py-3" style={{width:"auto"}}>
                    <InputField
                        label="Blood Group"
                        type="select"
                        value={form.blood}
                        onChange={e => setForm(f => ({...f, blood: e.target.value}))}
                        options={[
                            { value: "AB+", label: "AB+" },
                            { value: "AB-", label: "AB-" }
                        ]}
                        placeholder="Select"
                    />
                </div>
                <div className="col-4 py-3" style={{width:"auto"}}>
                    <InputField
                        label="Student Photo (PNG, JPG upto 2 MB)"
                        type="file"
                        value={form.photo}
                        onChange={e => setForm(f => ({...f, photo: e.target.files[0]}))}
                        placeholder="Upload Photo"
                        icon="clarity_attachment-line.svg"
                    />
                </div>
                <div className="col-4 py-3" style={{width:"auto"}}>
                    <InputField
                        label="Adhaar Card Photo(PNG, JPG upto 2 MB)"
                        type="file"
                        value={form.adhaar}
                        onChange={e => setForm(f => ({...f, adhaar: e.target.files[0]}))}
                        placeholder="Upload Adhaar"
                        icon="clarity_attachment-line.svg"
                    />
                </div>
                <div className="col-4 py-3"></div>
            </div>
            <div className="row pb-3 mt-4" style={{width:"auto"}}>
                    <div className='col-auto ms-auto'>
                        <CustomButton
                        title={"Submit"}
                        icon="vite.svg"
                        color="#374174"
                        onClick={()=>console.log("Clicked")}
                        />
                    </div>
                </div>
        </div>
    )
}

export default SharedForm;