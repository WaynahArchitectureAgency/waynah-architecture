import React, { useState } from "react";
import '../DesignOfAllPages.css'
import { PostType } from "./admin/CreatePost"
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper";
import "swiper/css";
import "swiper/css/navigation";


const PropsOfPages = ({dataOfPost}: PostType | any) => {
    const [page, setPage] = useState<boolean>(false)
    const numbreImages = []
    numbreImages.push(dataOfPost.numberOfArticle)
    numbreImages.sort(function(a: number, b: number) {
        return a - b; 
      });

    const articels = () => {
        if(dataOfPost.images.length > 1) {
            return (
                <div className="generalRow row">
                    <div className="texteLeft col-md-6">
                        <h3>{dataOfPost.title}</h3>
                        <h5>{dataOfPost.dateAndLocation}</h5>
                        {dataOfPost.content}
                    </div>
                    <div className="col-md-6">
                         <Swiper navigation={true} rewind={true} modules={[Navigation]} className="theCarousel">
                            {dataOfPost.images.map((theImages: string, index: number) => {
                                return <SwiperSlide><img src={theImages} alt='' key={index} className="swiperCarousel"/></SwiperSlide>
                            })}
                        </Swiper>
                    </div>
                </div>
            )
        } else {
            return (
                <div className="generalRow row">
                    <div className="texteLeft col-md-6">
                        <h5>{dataOfPost.title}</h5>
                        <p>{dataOfPost.dateAndLocation}</p>
                        <p>{dataOfPost.content}</p>
                    </div>
                    <div className="col-md-6">   
                        <img src={dataOfPost.images} alt='' className="oneImage"/>
                    </div>
                </div>
            )
        }
    }

    return(
            page ? (
                <div>{articels()}</div>
            ) : (
                <div className="marginTop">
                    <img src={dataOfPost.coverImage} alt="" className="coverImage" onClick={() => setPage(true)}/>
                </div>
            )
        )
}

export default PropsOfPages;