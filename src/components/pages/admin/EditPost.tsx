import React, { useState, useEffect, useRef } from 'react';
import { API, Storage } from 'aws-amplify';
import SimpleMdeReact from 'react-simplemde-editor';
import { getPost } from '../../../graphql/queries';
import { updatePost } from '../../../graphql/mutations';
import { PostType } from './CreatePost';
import { v4 as uuid } from 'uuid';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import '../../Admin.css';
import '../../StyleOfAllPages.css';
import imageCompression from 'browser-image-compression';

type PostUpdatedType = {
  id: string;
  title: string;
  content: string;
  coverImage: string | undefined;
  language: string;
  page: string;
  images: any;
  dateAndLocation: string;
};

const EditPost = ({ id, setPostEdit }: { id: string; setPostEdit: any }) => {
  const [post, setPost] = useState<null | PostType>(null);
  const [covImage, setCovImage] = useState<any>(null);
  const [localCoverImage, setLocalCoverImage] = useState<null | string>(null);
  const [imageList, setImageList] = useState<Array<any>>([]);
  const fileInput = useRef<any>(null);
  const imagesFileInput = useRef<any>(null);
  const [languageManu, setLanguageManu] = useState<boolean>(false);
  const [pageMenu, setPageMenu] = useState<boolean>(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      const postData = (await API.graphql({
        query: getPost,
        variables: { id }
      })) as { data?: { getPost?: PostType } };
      if (postData?.data?.getPost) {
        setPost(postData.data.getPost);
        if (postData.data.getPost.coverImage) {
          updateCoverImage(postData.data.getPost.coverImage);
        }
        if (postData.data.getPost.images) {
          updateImageList(postData.data.getPost.images);
        }
      }
    };
    fetchPost();
  }, []);

  const uploadImage = async () => {
    fileInput.current.click();
  };
  const uploadImages = async () => {
    imagesFileInput.current.click();
  };

  const updateCoverImage = async (covImage: string) => {
    const imageKey = await Storage.get(covImage);
    setCovImage(imageKey);
  };

  const updateImageList = async (covImages: Array<unknown>) => {
    const imagesKey = await Promise.all(
      covImages.map(async (image: any) => {
        const imageURL = await Storage.get(image);
        return imageURL;
      })
    );
    setImageList(imagesKey);
  };

  const options = {
    maxSizeMb: 1,
    maxWidthOrHeight: 700,
    useWebWorker: true
  };

  const handleChange = (e: any) => {
    const fileUpload = e.target.files[0];
    if (!fileUpload) return;
    imageCompression(fileUpload, options).then((x) => {
      setCovImage(x);
      setLocalCoverImage(URL.createObjectURL(x));
    });
  };

  const handleChanges = (e: any) => {
    const fileUpload = e.target.files[0];
    if (!fileUpload) return;
    imageCompression(fileUpload, options).then((x) => {
      setImageList([...imageList, x]);
    });
  };

  const updateCurrentPost = async () => {
    if (!post) return;
    const { title, content, language, page, coverImage, images, dateAndLocation } = post;
    const postUpdated: PostUpdatedType = {
      id,
      title,
      content,
      coverImage,
      language,
      page,
      images,
      dateAndLocation
    };

    if (covImage && localCoverImage) {
      const fileName = `${covImage.name}_${uuid()}`;
      postUpdated.coverImage = fileName;
      await Storage.put(fileName, covImage);
    }

    if (!covImage || !localCoverImage) {
      delete postUpdated.coverImage;
    }

    if (imageList) {
      imageList.map(async (image: any) => {
        if (typeof image !== 'string') {
          const imageName = `${image.name}_${uuid()}`;
          postUpdated.images.push(imageName);
          await Storage.put(imageName, image);
        }
      });
    }

    try {
      await API.graphql({
        query: updatePost,
        variables: { input: postUpdated },
        authMode: 'AMAZON_COGNITO_USER_POOLS'
      });
      setPostEdit('');
    } catch (error) {
      console.error(error);
    }
  };

  const showImages = () => {
    if (!imageList) return <></>;
    if (imageList.length > 1) {
      const theImages = (
        <div className="text-center">
          <h1>Images</h1>
          <Swiper navigation={true} rewind={true} modules={[Navigation]} className="theCarousel">
            {imageList.map((theImages: any, index: number) => {
              if (typeof theImages !== 'string') {
                const objectUrl = URL.createObjectURL(theImages);
                return (
                  <SwiperSlide>
                    <img src={objectUrl} alt="" key={`index ${index}`} className="swiperCarousel" />
                  </SwiperSlide>
                );
              }
              return (
                <SwiperSlide key={`index ${index}`}>
                  <img src={theImages} alt="" className="swiperCarousel" />
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      );
      return theImages;
    }
    if (imageList.length) {
      return (
        <div className="text-center">
          <h1>Image</h1>
          <img src={imageList[0]} className="showOneImage" alt="" />
        </div>
      );
    }
  };

  return post ? (
    <div className="container text-center">
      <h1 className="createAndUpdatePostTitle">Edit Post</h1>
      {covImage && (
        <div>
          <h1>Cover Image</h1>
          <img src={localCoverImage ? localCoverImage : covImage} className="covImage" alt="" />
        </div>
      )}
      {imageList && showImages()}
      <div className="pageAndLanguage">
        <div className="dropdown-list">
          <div
            className="dropdown-btn-list"
            onClick={() => {
              setLanguageManu(!languageManu);
            }}>
            <button type="button" className="btn btn-secondary">
              {post.language}
            </button>
          </div>
          {languageManu ? (
            <div className="dropdown-content-list">
              <div
                className="dropdown-item-list"
                onClick={() => {
                  setPost({ ...post, language: 'EN' });
                  setLanguageManu(!languageManu);
                }}>
                English
              </div>
              <div
                className="dropdown-item-list"
                onClick={() => {
                  setPost({ ...post, language: 'RU' });
                  setLanguageManu(!languageManu);
                }}>
                Russian
              </div>
              <div
                className="dropdown-item-list"
                onClick={() => {
                  setPost({ ...post, language: 'TC' });
                  setLanguageManu(!languageManu);
                }}>
                Tchetchene
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>
        <div className="dropdown-list">
          <div
            className="dropdown-btn-list"
            onClick={() => {
              setPageMenu(!pageMenu);
            }}>
            <button type="button" className="btn btn-secondary">
              {post.page}
            </button>
          </div>
          {pageMenu ? (
            <div className="dropdown-content-list">
              <div
                className="dropdown-item-list"
                onClick={() => {
                  setPost({ ...post, page: 'PROJECTS' });
                  setPageMenu(!pageMenu);
                }}>
                Projects
              </div>
              <div
                className="dropdown-item-list"
                onClick={() => {
                  setPost({ ...post, page: 'RESEARCH' });
                  setPageMenu(!pageMenu);
                }}>
                Research
              </div>
              <div
                className="dropdown-item-list"
                onClick={() => {
                  setPost({ ...post, page: 'TEAM' });
                  setPageMenu(!pageMenu);
                }}>
                Team
              </div>
              <div
                className="dropdown-item-list"
                onClick={() => {
                  setPost({ ...post, page: 'NEWS' });
                  setPageMenu(!pageMenu);
                }}>
                News
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
      <input
        value={post.title}
        name="title"
        placeholder="Title"
        onChange={(event: { target: { value: string } }) =>
          setPost({ ...post, title: event.target.value })
        }
      />
      <input
        value={post.dateAndLocation}
        name="title"
        placeholder="Title"
        onChange={(event: { target: { value: string } }) =>
          setPost({ ...post, dateAndLocation: event.target.value })
        }
      />
      <SimpleMdeReact
        value={post.content}
        onChange={(value: string) => setPost({ ...post, content: value })}
      />
      <input type="file" ref={fileInput} onChange={handleChange} className="hideInput" />
      <input type="file" ref={imagesFileInput} onChange={handleChanges} className="hideInput" />
      <div style={{ marginBottom: '10px' }}>
        <button onClick={updateCurrentPost} type="button" className="btn btn-success">
          Update Post
        </button>{' '}
        <button onClick={uploadImage} type="button" className="btn btn-primary">
          Update Cover Image
        </button>{' '}
        <button onClick={uploadImages} type="button" className="btn btn-info">
          Add Image
        </button>{' '}
        <button
          onClick={() => {
            setPost({ ...post, images: [] });
            setImageList([]);
          }}
          type="button"
          className="btn btn-danger">
          Clear Images
        </button>
      </div>
    </div>
  ) : (
    <div>Loading...</div>
  );
};

export default EditPost;
