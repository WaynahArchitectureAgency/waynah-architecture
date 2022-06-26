import React, {useState, useEffect, useRef} from 'react'
import { API, Storage } from "aws-amplify"
import SimpleMdeReact from 'react-simplemde-editor'
import "easymde/dist/easymde.min.css";
import { getTodo } from '../../../graphql/queries';
import { updateTodo } from '../../../graphql/mutations';
import { PostType } from './CreatePost';
import { v4 as uuid } from "uuid" 
import AwesomeSlider from "react-awesome-slider";
import "./Admin.css"

type PostUpdatedType = {
    id: string,
    title: string
    content: string
    coverImage: string | undefined
    language: string
    page: string,
    images: any,
    dateAndLocation: string
}

const EditPost = ({id, setPostEdit}: {id:string, setPostEdit: any}) => {
    const [post, setPost] = useState<null | PostType>(null)
    const [covImage, setCovImage] = useState<any>(null)
    const [localImage, setLocalImage] = useState<null |string>(null)
    const [imageList, setImageList] = useState<Array<any>>([])
    const fileInput = useRef<any>(null)
    const imagesFileInput = useRef<any>(null)
    const [show, setShow] = useState<boolean>(false)
    const [secondShow, setSecondShow] = useState<boolean>(false)

    useEffect(() => {
        const fetchPost = async () => {
            if(!id) return
            const postData = await API.graphql({
                query: getTodo,
                variables: { id }
            }) as {data?: {getTodo?: PostType}}
            if(postData?.data?.getTodo) {
                setPost(postData.data.getTodo)
                if(postData.data.getTodo.coverImage) {
                    updateCoverImage(postData.data.getTodo.coverImage)
                }
                if(postData.data.getTodo.images) {
                    updateImageList(postData.data.getTodo.images)
                }
            }
        } 
        fetchPost()
    }, [])

    const uploadImage = async () => {
        fileInput.current.click()
    }
    const uploadImages = async () => {
        imagesFileInput.current.click()
    }

    const updateCoverImage = async (covImage: string) => {
        const imageKey = await Storage.get(covImage)
        setCovImage(imageKey)
    } 

    const updateImageList = async (covImages: any) => {
        const imagesKey = await Promise.all(
            covImages.map(async (image: any) => {
                const imageURL = await Storage.get(image)
                return imageURL
            })
        )
        setImageList(imagesKey)
    } 

    const handleChange = (e: any) => {
        const fileUpload = e.target.files[0]
        if(!fileUpload) return;
        setCovImage(fileUpload)
        setLocalImage(URL.createObjectURL(fileUpload))
    }

    const handleChanges = (e: any) => {
        const fileUpload = e.target.files[0]
        if(!fileUpload) return;
        setImageList([...imageList, fileUpload])
    }

    const updateCurrentPost = async () => {
        if(!post) return 
        const { title, content, language, page, coverImage, images, dateAndLocation } = post
        const postUpdated: PostUpdatedType = {
            id,
            title,
            content,
            coverImage,
            language,
            page,
            images,
            dateAndLocation
        }

        if(covImage && localImage) {
            const fileName = `${covImage.name}_${uuid()}`
            postUpdated.coverImage = fileName
            await Storage.put(fileName, covImage)
        }
        
        if(!covImage || !localImage) {
            delete postUpdated.coverImage
        }

        if(imageList) {
            imageList.map(async (image: any) => {
                if(typeof image !== "string") {
                    const imageName = `${image.name}_${uuid()}`
                    postUpdated.images.push(imageName)
                    await Storage.put(imageName, image)
                }
            })
        }

        try{
            await API.graphql({
                query: updateTodo,
                variables: { input: postUpdated },
                // @ts-ignore 
                authMode: "AMAZON_COGNITO_USER_POOLS"
            })
            setPostEdit("")
        } catch(error) {
            console.error(error)
        }
    }

    const showImages = () => {
        if(!imageList) return <></>
        if(imageList.length > 1) {
            return  <AwesomeSlider animation="cubeAnimation" bullets={false} className="imagesOfCarouselCreateAndEdit">
                        {imageList.map((theImages: any, index: number) => {
                            if(typeof theImages !== "string") {
                                const objectUrl = URL.createObjectURL(theImages)
                                return <div data-src={objectUrl} key={index} style={{width: 500, height: 500}}/>
                            } 
                            return <div data-src={theImages} key={index} style={{width: 500, height: 500}}/>
                        })}
                    </AwesomeSlider>
        } else {
            return <img src={imageList[0]} className="covImage" alt=''/>
        } 
    }

  return post ? (
    <div className='container'>   
        <h1 className='createAndUpdatePostTitle'>Edit Post</h1>
        {covImage && (
            <img src={localImage ? localImage : covImage} className="covImage" alt="" />
        )}
        {imageList && (
            showImages()
        )}
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
        <input value={post.title} name="title" placeholder='Title' 
            onChange={(event: { target: { value: string; }; }) => setPost({...post, title: event.target.value})}/>
        <input value={post.dateAndLocation} name="title" placeholder='Title' 
            onChange={(event: { target: { value: string; }; }) => setPost({...post, dateAndLocation: event.target.value})}/>
        <SimpleMdeReact value={post.content} onChange={(value: string) => setPost({...post, content: value})}/>
        <input type="file" ref={fileInput} onChange={handleChange} style={{position: "absolute", height: 0, width: 0}}/>
        <input type="file" ref={imagesFileInput} onChange={handleChanges} style={{position: "absolute", height: 0, width: 0}}/>
        <button onClick={updateCurrentPost} type="button" className="btn btn-success">Update Post</button> {" "}
        <button onClick={uploadImage} type="button" className="btn btn-primary">Update Cover Image</button>{" "}
        <button onClick={uploadImages} type="button" className="btn btn-info">Update Images</button>{" "}
        <button onClick={() => setPost({...post, images: []})} type="button" className="btn btn-danger">Clear Images</button>
    </div>
  ) : <div>Loading...</div>
}

export default EditPost;
