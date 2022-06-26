import React, { useState, ChangeEvent, useRef, useEffect } from 'react'
import { API, Auth, Storage } from 'aws-amplify';
import { createTodo } from '../../../graphql/mutations';
import { SimpleMdeReact } from 'react-simplemde-editor';
import "easymde/dist/easymde.min.css";
import { v4 as uuid } from "uuid" 
import Menu from '../../menu/Menu';
import "./Admin.css"
import '../../DesignOfAllPages.css'
import AwesomeSlider from "react-awesome-slider";
import 'react-awesome-slider/dist/styles.css';
import "../../DesignOfAllPages.css"

export type PostType = {
    title: string;
    dateAndLocation: string,
    content: string;
    id: string,
    coverImage: string,
    language: string,
    page: string,
    images: Array<string>
}

const CreatePost = () => {
    const [post, setPost] = useState<PostType>({ title: "", dateAndLocation: "", content: "", id: "", coverImage: "", language: "choose:", page: "choose:", images: [] })
    const [image, setImage] = useState<any>(null)
    const [imageList, setImageList] = useState<Array<any>>([])
    const imageFileInput = useRef<any>(null)
    const imagesFileInput = useRef<any>(null)
    const [currentUser, setCurrentUser] = useState<boolean>(false)
    const [show, setShow] = useState<boolean>(false)
    const [secondShow, setSecondShow] = useState<boolean>(false)
    // const router = useRouter()

    const userConnected = async () => {
        try{
            const user = await Auth.currentAuthenticatedUser()
        if(user) {
            return true
        } else {
            return false
        }
        }catch(error){
            console.error(error)
            return false
        }
    }

    useEffect(() => {
        const setUser = async () => {
            const userIsConnected = await userConnected()
            setCurrentUser(userIsConnected)
        }
        setUser()
    }, [])

    const createNewPost = async (newPost: PostType) => {
        if(!newPost.title || !newPost.dateAndLocation) return;

        if(image) {
            const filename = `${image.name}_${uuid()}`
            newPost.coverImage = filename
            await Storage.put(filename, image)
        } 

        if(imageList) {
            imageList.map(async (image: any) => {
                const imageNewName = `${image.name}_${uuid()}`
                newPost.images.push(imageNewName)
                return await Storage.put(imageNewName, image)
            })
        }

        if(!newPost.images || !newPost.coverImage) return;

        await API.graphql({
            query: createTodo,
            variables: { input: newPost },
            // @ts-ignore
            authMode: "AMAZON_COGNITO_USER_POOLS"
        })
        console.log("reussi")
        alert("c'est bon")
    }
    console.log(post)

    const uploadImage = async () => {
        imageFileInput.current.click()
    }

    const uploadImages = async () => {
        imagesFileInput.current.click()
    }

    const handleChange = (e: any) => {
        const fileUploaded = e.target.files[0]
        if(!fileUploaded) return
        setImage(fileUploaded)
    }

    const handlesChange = (e: any) => {
        const filesUploaded = e.target.files[0]
        if(!filesUploaded) return
        setImageList([...imageList,filesUploaded])
    }


  return currentUser ? (
    <div className="container text-center">
        <Menu designOn="createPost"/>
        <h1 className='createAndUpdatePostTitle'>Create New Post</h1>
        {
            image && (
                <div>
                    <h1>Cover Image:</h1>
                    <img src={URL.createObjectURL(image)} alt="" className='covImage'/>
                </div>
            )
        }
        {
            imageList.length > 1 ? (
                <div>
                    <h1>Images:</h1>
                    <AwesomeSlider animation="cubeAnimation" bullets={false} className="imagesOfCarouselCreateAndEdit">
                        {imageList.map((image: any, index: number) => {
                            const objectUrl = URL.createObjectURL(image)
                            return <div data-src={objectUrl} key={index}/>
                        })}
                    </AwesomeSlider>
                </div>
            ) : <></>
        }
        {
            imageList.length < 2 && imageList.length > 0 ? (
                <div>
                    <h1>Image:</h1>
                    <img src={URL.createObjectURL(imageList[0])} alt='' className='oneImage'/>
                </div>
            ) : <></>
        }
        <br />
        <div className='pageAndLanguage'>
                <div className="dropdown-list">
                    <div
                        className="dropdown-btn-list"
                        onClick={() => {
                            setShow(!show);
                        }}>
                        <button type="button" className="btn btn-secondary">{post.language}</button>
                    </div>
                    {show ? (
                            <div className="dropdown-content-list">
                                <div className="dropdown-item-list" onClick={() => {setPost({...post, language: "EN"}); setShow(!show)}}>English</div>
                                <div className="dropdown-item-list" onClick={() => {setPost({...post, language: "RU"}); setShow(!show)}}>Russian</div>
                                <div className="dropdown-item-list" onClick={() => {setPost({...post, language: "CH"}); setShow(!show)}}>Chechen</div>
                            </div>
                        ) : <></>
                    }
                </div>
           
                <div className="dropdown-list">
                    <div
                        className="dropdown-btn-list"
                        onClick={() => {
                            setSecondShow(!secondShow);
                        }}>
                        <button type="button" className="btn btn-secondary">{post.page}</button>
                    </div>
                    {secondShow ? (
                            <div className="dropdown-content-list">
                                <div className="dropdown-item-list" onClick={() => {setPost({...post, page: "PROJECTS"}); setSecondShow(!secondShow)}}>Projects</div>
                                <div className="dropdown-item-list" onClick={() => {setPost({...post, page: "RESEARCH"}); setSecondShow(!secondShow)}}>Research</div>
                                <div className="dropdown-item-list" onClick={() => {setPost({...post, page: "TEAM"}); setSecondShow(!secondShow)}}>Team</div>
                                <div className="dropdown-item-list" onClick={() => {setPost({...post, page: "NEWS"}); setSecondShow(!secondShow)}}>News</div>
                            </div>
                        ) : <></>
                    }
                </div>  
        </div>
        <br />
        <input 
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setPost({...post, title: e.target.value})
            }}
            name="title"
            placeholder='title'
            value={post.title}/>{" "}
        <input placeholder='date and location' value={post.dateAndLocation}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {setPost({...post, dateAndLocation: e.target.value})}}/>
        <SimpleMdeReact 
            value={post.content}
            onChange={(value: string) => setPost({ ...post, content: value})}/>
        <input type="file" ref={imageFileInput} onChange={handleChange} style={{position: "absolute", height: 0, width: 0}}/>
        <input type="file" ref={imagesFileInput} onChange={handlesChange} style={{position: "absolute", height: 0, width: 0}}/>
        <div style={{marginBottom: 10}}>
            <button type="button" className="btn btn-success"
                onClick={() => createNewPost({...post, id: uuid()})}>
                    Create post
            </button>
            {" "}
            <button type="button" onClick={uploadImage} className="btn btn-info">
                Add Cover Image
            </button> {" "}
            <button type="button" onClick={uploadImages} className="btn btn-primary">
                Add Image
            </button>
        </div>
    </div>
  ) : <div><h1>You do not have access to this page</h1></div>
}

export default CreatePost;