import React, { useState, useEffect } from "react";
import './Menu.css'
import { AiOutlineHome } from 'react-icons/ai'
import { Auth } from "aws-amplify"

const Menu = ({designOn}: {designOn?: string}) => {
    const [currentUser, setCurrentUser] = useState<boolean>(false)

    useEffect(() => {
        const setUser = async () => {
            const userIsConnected = await userConnected()
            setCurrentUser(userIsConnected)
        }
        setUser()
    }, [])
  
    const userConnected = async () => {
        try{
            const user = await Auth.currentAuthenticatedUser()
            if(user) {
                return true
            } else {
                return false
            }
        } catch(error) {
            console.error(error)
            return false
        }
    }

    return currentUser ? (
        <div className="row menuGeneral">
            <div className="col-12 menu">
                <a href="/" className="textBlack"><AiOutlineHome className="homeIcon"/></a>
                <a href='/project' className={designOn === 'projects' ? ('textBlackWithDecoration') : ('textBlack')}>Projects</a>
                <a href='/research'className={designOn === 'research' ? ('textBlackWithDecoration') : ('textBlack')}>Research</a>
                <a href='/team' className={designOn === 'team' ? ('textBlackWithDecoration') : ('textBlack')}>Team</a>
                <a href='/news' className={designOn === 'news' ? ('textBlackWithDecoration') : ('textBlack')}>News</a>
                <a href='/mypost' className={designOn === 'myPosts' ? ('textBlackWithDecoration') : ('textBlack')}>My Posts</a>
                <a href='/createPost' className={designOn === 'createPost' ? ('textBlackWithDecoration') : ('textBlack')}>Create Post</a>
                <a href='/profile' className={designOn === 'profile' ? ('textBlackWithDecoration') : ('textBlack')}>Profile</a>
            </div>
        </div>
    ) :(
        <div className="row menuGeneral">
            <div className="col-12 menu">
                <a href="/" className="textBlack"><AiOutlineHome className="homeIcon"/></a>
                <a href='/project' className={designOn === 'projects' ? ('textBlackWithDecoration') : ('textBlack')}>Projects</a>
                <a href='/research'className={designOn === 'research' ? ('textBlackWithDecoration') : ('textBlack')}>Research</a>
                <a href='/team' className={designOn === 'team' ? ('textBlackWithDecoration') : ('textBlack')}>Team</a>
                <a href='/news' className={designOn === 'news' ? ('textBlackWithDecoration') : ('textBlack')}>News</a>
            </div>
        </div>
    )  
}

export default Menu;