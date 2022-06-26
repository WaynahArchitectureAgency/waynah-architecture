import React, { useState, useEffect } from 'react'
import { Auth, API, Storage } from 'aws-amplify'
import { listTodos } from '../../../graphql/queries'
import { deleteTodo as deletePostMutation } from '../../../graphql/mutations'
import EditPost from './EditPost'
import "./Admin.css"
import Menu from '../../menu/Menu'
import PropsOfPages from '../PropsOfPages'
import { PostType } from './CreatePost'
import 'react-awesome-slider/dist/styles.css';
import 'react-awesome-slider/dist/custom-animations/cube-animation.css'
import AwesomeSlider from "react-awesome-slider";

const MyPost = () => {
    const [posts, setPosts] = useState<Array<PostType> | Array<any>>([])
    const [post, setPost] = useState<PostType | null>(null)
    const [postEdit, setPostEdit] = useState<string>("")
    const [currentUser, setCurrentUser] = useState<boolean>(false)

    useEffect(() => {
        fetchPosts()
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

    const fetchPosts = async () => {
        const { email } = await Auth.currentAuthenticatedUser()
        const postData = await API.graphql({
            query: listTodos,
            variables: { email },
        }) as {data?: {listTodos?: {items?: Array<PostType>}}}
        if(postData?.data?.listTodos?.items) {
            setPosts(postData.data.listTodos.items)
            const postWithImage = await Promise.all(
                postData.data.listTodos.items.map(async (post: PostType) => {
                        try{
                            if(post.coverImage) {
                                post.coverImage = await Storage.get(post.coverImage)
                            }
                            if(post.images?.length) {
                                const postWithImages = await Promise.all(
                                    post.images.map(async (image: string) => {
                                        const imageUrl = await Storage.get(image)
                                        return imageUrl
                                    })
                                )
                                post.images = postWithImages
                            }
                            return post
                        }catch(err) {
                            console.error(err)
                        }
                })
            )
            setPosts(postWithImage)
        }
    }


    const deletePost = async (id: string) => {
        await API.graphql({
            query: deletePostMutation,
            variables: { input: { id } },
            // @ts-ignore
            authMode: "AMAZON_COGNITO_USER_POOLS"
        });
        fetchPosts()
    }

    console.log(posts)

    return ( 
        currentUser ? (
            post === null ? 
                <div>
                    <div className='col-6'>
                        <AwesomeSlider animation="cubeAnimation" bullets={false} >
                            <div data-src="https://www.referenseo.com/wp-content/uploads/2019/03/image-attractive-960x540.jpg"/>
                            <div data-src="https://img-19.commentcamarche.net/cI8qqj-finfDcmx6jMK6Vr-krEw=/1500x/smart/b829396acc244fd484c5ddcdcb2b08f3/ccmcms-commentcamarche/20494859.jpg"/>
                            <div data-src="https://cdn.futura-sciences.com/buildsv6/images/wide1920/6/5/2/652a7adb1b_98148_01-intro-773.jpg"/>
                            <div data-src="https://images.ctfassets.net/hrltx12pl8hq/7yQR5uJhwEkRfjwMFJ7bUK/dc52a0913e8ff8b5c276177890eb0129/offset_comp_772626-opt.jpg?fit=fill&w=800&h=300"/>
                            <div data-src="https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwcm9maWxlLXBhZ2V8N3x8fGVufDB8fHx8&w=1000&q=80"/>
                            <div data-src="https://helpx.adobe.com/content/dam/help/en/photoshop/using/convert-color-image-black-white/jcr_content/main-pars/before_and_after/image-before/Landscape-Color.jpg"/>
                            <div data-src="https://images.lesindesradios.fr/fit-in/1500x2000/medias/S3E2PZgG71/image/icon-apple-hit-west1620074801182-format1by1.png"/>
                        </AwesomeSlider>
                    </div>
                    {postEdit === "" ? 
                        <div className="container text-center">
                            <Menu designOn="myPosts"/>
                            <h1 className='myPostsTitle'>My Posts</h1>
                            {posts.map((post: PostType, index: number) => {
                                return(
                                    <div key={index} className="myPostsEachPost">
                                        <div onClick={() => setPost(post)}>
                                            <h1>{post.title}</h1>
                                            <p>{post.dateAndLocation}</p>
                                            <p>{post.language}</p>
                                            <p>{post.page}</p>
                                        </div>
                                        <button onClick={() => deletePost(post.id)} type="button" className="btn btn-danger">Delete Post</button>{" "}
                                        <button onClick={() => setPostEdit(post.id)} type="button" className="btn btn-warning">Edit Post</button>
                                    </div>
                                )
                            })}
                        </div> : 
                        <div>
                            <EditPost id={postEdit} setPostEdit={setPostEdit}/>
                        </div>
                    }
                </div> : 
                <div className='container-fluid designOfCarousel'>
                    <h1 className='createAndUpdatePostTitle'>My Post</h1>
                    {
                        post.coverImage && post.images?.length && (
                            <PropsOfPages dataOfPost={post} />
                        )
                    }
                </div>
        ) : <h1>You do not have access to this page</h1>
    )
}

export default MyPost;