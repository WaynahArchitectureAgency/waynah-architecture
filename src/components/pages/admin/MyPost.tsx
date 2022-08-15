import React, { useState, useEffect } from 'react'
import { Auth, API, Storage } from 'aws-amplify'
import { listPosts } from '../../../graphql/queries'
import { deletePost as deletePostMutation } from '../../../graphql/mutations'
import EditPost from './EditPost'
import "../../Admin.css"
import Menu from '../../elements/Menu'
import Post from '../../elements/Post'
import { PostType } from './CreatePost'

const MyPost = () => {
    const [posts, setPosts] = useState<Array<any>>([])
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

    useEffect(() => {
        fetchPosts()
    }, [postEdit])

    const sortPosts = posts.sort(function(a: {createdAt: string}, b: {createdAt: string}) {
                        const num1:any = new Date(a.createdAt)
                        const num2:any = new Date(b.createdAt)
                        return num2 - num1;
                    });
  
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
            query: listPosts,
            variables: { email },
        }) as {data?: {listPosts?: {items?: Array<PostType>}}}
        if(postData?.data?.listPosts?.items) {
            setPosts(postData.data.listPosts.items)
            const postWithImage = await Promise.all(
                postData.data.listPosts.items.map(async (post: PostType) => {
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

    const deleteThePost = async (id: string) => {
        await API.graphql({
            query: deletePostMutation,
            variables: { input: { id } },
            // @ts-ignore
            authMode: "AMAZON_COGNITO_USER_POOLS"
        });
        fetchPosts()
    }

    return ( 
        currentUser ? (
            post === null ? 
                <div>
                    {postEdit === "" ? 
                        <div className="container text-center">
                            <Menu designOn="myPosts"/>
                            <h1 className='myPostsTitle'>My Posts</h1>
                            {sortPosts.map((post: PostType, index: number) => {
                                return(
                                    <div key={`index ${index}`} className="myPostsEachPost">
                                        <div onClick={() => setPost(post)}>
                                            <h1>{post.title}</h1>
                                            <p>{post.dateAndLocation}</p>
                                            <p>{post.language}</p>
                                            <p>{post.page}</p>
                                        </div>
                                        <button onClick={() => deleteThePost(post.id)} type="button" className="btn btn-danger">Delete Post</button>{" "}
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
                <div className='container-fluid text-center'>
                    <h1 className='createAndUpdatePostTitle'>My Post</h1>
                    {
                        post.coverImage && post.images?.length && (
                            <Post dataOfPost={post} />
                        )
                    }
                </div>
        ) : <h1>You do not have access to this page</h1>
    )
}

export default MyPost;