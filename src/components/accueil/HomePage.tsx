import React from "react";
import Menu from "../menu/Menu";


const HomePage = () => {
    return(
        <div className="container">
            <Menu/>
            <video width="750" height="500" controls>
                <source src="https://amplify-waynaharchitectureag-staging-94913-deployment.s3.eu-central-1.amazonaws.com/video/video.mp4" type="video/mp4" />
            </video>
        </div>
    )
}

export default HomePage;