import React, { useState, useEffect } from 'react'
import { Auth } from 'aws-amplify'
import Menu from "../../menu/Menu"
import "./Admin.css"

type InputChangeType = {
  email: string,
  passworld: string
}

const Profile = () => {
    const [user, setUser] = useState<boolean>(false)
    const [inputChange, setInputChange] = useState<InputChangeType>({email: "", passworld: ""})

    useEffect(() => {
        checkUser()
    }, [])

    const checkUser = async () => {
       try{
        await Auth.currentAuthenticatedUser()
        setUser(true)
       } catch(error){
        console.error(error)
       }
    }

    return  user === false ? (
      <div className="container text-center">
          <Menu designOn="profile"/>
          <div className='divGeneralProfile'>
            <h1>Profile</h1>
            <input type="email" value={inputChange.email} onChange={(event: { target: { value: string } }) => {
              setInputChange({...inputChange, email: event.target.value})}} placeholder="email"/>
              <br />
            <input type="password" style={{marginTop: 10, marginBottom: 10}} value={inputChange.passworld} onChange={(event: { target: { value: string } }) => {
              setInputChange({...inputChange, passworld: event.target.value})}} placeholder="passworld"/>
              <br />
            <button style={{marginBottom: 10}} onClick={async () => {
              await Auth.signIn(inputChange.email, inputChange.passworld)
              setUser(true)
              }}>Connect</button>
          </div>
      </div>
    ) : <div className="container text-center">
            <Menu designOn="profile"/>
            <div className='text-center' style={{marginTop: 200}}>
              <button onClick={async () => {
                  setUser(false)
                  await Auth.signOut()
                  }}>Déconnecté</button>
            </div>
        </div>
}

export default Profile;