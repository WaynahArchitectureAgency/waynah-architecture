import React, { useState, ChangeEvent, useRef, useEffect } from 'react'
import { API, Auth, Storage } from 'aws-amplify';
import { createPost } from '../../../graphql/mutations';
import { SimpleMdeReact } from 'react-simplemde-editor';
import { v4 as uuid } from "uuid" 
import Menu from '../../elements/Menu';
import "../../Admin.css"
import '../../StyleOfAllPages.css'
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import imageCompression from "browser-image-compression"

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
    const [post, setPost] = useState<PostType>({ title: "", dateAndLocation: "", content: "", id: "", coverImage: "", language: "language:", page: "page:", images: [] })
    const [image, setImage] = useState<any>(null)
    const [imageList, setImageList] = useState<Array<any>>([])
    const imageFileInput = useRef<any>(null)
    const imagesFileInput = useRef<any>(null)
    const [currentUser, setCurrentUser] = useState<boolean>(false)
    const [languageManu, setLanguageManu] = useState<boolean>(false)
    const [pageMenu, setPageMenu] = useState<boolean>(false)
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
        if(!newPost.title || !newPost.dateAndLocation || !newPost.content) return;
        if(newPost.page === "page:" || newPost.language === "language:") return;

        // if(newPost.page !== "PROJECTS" || "RESEARCH" || "TEAM" || "NEWS") return;
        // if(newPost.language !== "EN" || "RU" || "CH") return;

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
            query: createPost,
            variables: { input: newPost },
            // @ts-ignore
            authMode: "AMAZON_COGNITO_USER_POOLS"
        })
        alert("it's ok")
    }

    const uploadImage = async () => {
        imageFileInput.current.click()
    }

    const uploadImages = async () => {
        imagesFileInput.current.click()
    }

    const options = {
        maxSizeMb : 1,
        maxWidthOrHeight: 700,
        useWebWorker: true
    }

    const handleChange = (e: any) => {
        const fileUploaded = e.target.files[0]
        if(!fileUploaded) return

        imageCompression(fileUploaded, options).then(x =>{
            setImage(x)
        })
    }

    const handlesChange = (e: any) => {
        const filesUploaded = e.target.files[0]
        if(!filesUploaded) return

        imageCompression(filesUploaded, options).then(x =>{
            setImageList([...imageList,x])
        })
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
                     <Swiper navigation={true} rewind={true} modules={[Navigation]} className="theCarousel">
                        {imageList.map((image: any, index: number) => {
                            const objectUrl = URL.createObjectURL(image)
                            return <SwiperSlide><img src={objectUrl} alt='' key={`index ${index}`} className="swiperCarousel" /></SwiperSlide>

                        })}
                    </Swiper>
                </div>
            ) : <></>
        }
        {
            imageList.length < 2 && imageList.length > 0 ? (
                <div>
                    <h1>Image:</h1>
                    <img src={URL.createObjectURL(imageList[0])} alt='' className='showOneImage'/>
                </div>
            ) : <></>
        }
        <br />
        <div className='pageAndLanguage'>
                <div className="dropdown-list">
                    <div
                        className="dropdown-btn-list"
                        onClick={() => {
                            setLanguageManu(!languageManu);
                        }}>
                        <button type="button" className="btn btn-secondary">{post.language}</button>
                    </div>
                    {languageManu ? (
                            <div className="dropdown-content-list">
                                <div className="dropdown-item-list" onClick={() => {setPost({...post, language: "EN"}); setLanguageManu(!languageManu)}}>English</div>
                                <div className="dropdown-item-list" onClick={() => {setPost({...post, language: "RU"}); setLanguageManu(!languageManu)}}>Russian</div>
                                <div className="dropdown-item-list" onClick={() => {setPost({...post, language: "TC"}); setLanguageManu(!languageManu)}}>Tchetchene</div>
                            </div>
                        ) : <></>
                    }
                </div>
           
                <div className="dropdown-list">
                    <div
                        className="dropdown-btn-list"
                        onClick={() => {
                            setPageMenu(!pageMenu);
                        }}>
                        <button type="button" className="btn btn-secondary">{post.page}</button>
                    </div>
                    {pageMenu ? (
                            <div className="dropdown-content-list">
                                <div className="dropdown-item-list" onClick={() => {setPost({...post, page: "PROJECTS"}); setPageMenu(!pageMenu)}}>Projects</div>
                                <div className="dropdown-item-list" onClick={() => {setPost({...post, page: "RESEARCH"}); setPageMenu(!pageMenu)}}>Research</div>
                                <div className="dropdown-item-list" onClick={() => {setPost({...post, page: "TEAM"}); setPageMenu(!pageMenu)}}>Team</div>
                                <div className="dropdown-item-list" onClick={() => {setPost({...post, page: "NEWS"}); setPageMenu(!pageMenu)}}>News</div>
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
        <input type="file" ref={imageFileInput} onChange={handleChange} className="hideInput"/>
        <input type="file" ref={imagesFileInput} onChange={handlesChange} className="hideInput"/>
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
            </button>{" "}
            <button onClick={() => {
                setPost({...post, images: []})
                setImageList([])
            }} type="button" className="btn btn-danger">Clear Images</button>
        </div>
    </div>
  ) : <div><h1>You do not have access to this page</h1></div>
}

export default CreatePost;