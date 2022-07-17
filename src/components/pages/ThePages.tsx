import React, { useState, useEffect } from "react";
import Menu from "../elements/Menu";
import Post from "../elements/Post";
import { listPosts } from '../../graphql/queries'
import { API, Storage } from 'aws-amplify'
import { PostType } from  "./admin/CreatePost" 

type typeOfThePages = {
    choosePage: string,
    underline: string
}

const ThePages = ({choosePage, underline}: typeOfThePages) => {
    const [posts, setPosts] = useState<Array<any> | null>(null)
    const [languageMenu, setLanguageMenu] = useState<boolean>(false)
    const [language, setLanguage] = useState("EN")

    useEffect(() => {
        getPosts()
    }, [])

    const getPosts = async () => {
        const postsData = await API.graphql({ 
            query: listPosts
        }) as {data?: {listPosts?: {items?: Array<PostType>}}} 
        if(postsData?.data?.listPosts?.items) {
            setPosts(postsData.data.listPosts.items)
            const postsCoverImage = await Promise.all(
                postsData.data.listPosts.items.map(async (post: PostType) => {
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
                    } catch(error) {
                        console.error(error)
                    }
                })
            )
            setPosts(postsCoverImage)
        }
    }


    if(posts) {
        posts.sort(function(a: {createdAt: string}, b: {createdAt: string}) {
            const num1:any = new Date(a.createdAt)
            const num2:any = new Date(b.createdAt)
            return num2 - num1;
        });
    }

    const showPosts = () => {
        if(posts?.length) {
            return  posts.map((dataOfPost: PostType, index: number) => {
                        if(dataOfPost.page === choosePage && dataOfPost.language === language) {
                            return(
                                <div key={index}>
                                    <Post dataOfPost={dataOfPost}/>
                                </div>
                            )
                        } else {
                            return <></>
                        }
                    })
        } else {
            return <h1>Loading...</h1>
        } 
    }
    
    return (
        <div className="container text-center"> 
                <Menu  designOn={underline}/>
                {
                    posts === null ?
                        (
                            <h1>Loading...</h1>
                        ) : (
                            <div style={{marginBottom: 30}}>
                                <div className="dropdown-list">
                                    <div
                                        className="dropdown-btn-list"
                                        onClick={() => {
                                            setLanguageMenu(!languageMenu);
                                        }}>
                                        <button type="button" className="btn btn-secondary">{language}</button>
                                    </div>
                                    {languageMenu ? (
                                            <div className="dropdown-content-list">
                                                <div className="dropdown-item-list" onClick={() => {setLanguage("EN"); setLanguageMenu(!languageMenu)}}>English</div>
                                                <div className="dropdown-item-list" onClick={() => {setLanguage("RU"); setLanguageMenu(!languageMenu)}}>Russian</div>
                                                <div className="dropdown-item-list" onClick={() => {setLanguage("CH"); setLanguageMenu(!languageMenu)}}>Chechen</div>
                                            </div>
                                        ) : <></>
                                    }
                                </div>
                                    {showPosts()}
                            </div>
                    )
                }
        </div>
    ) 
}

export default ThePages;
