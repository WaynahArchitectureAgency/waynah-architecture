import React from "react";
import Menu from "../menu/Menu";

const HomePage = () => {
    return(
        <div className="container">
            <Menu/>
            <video width="750" height="500" controls>
                <source src="https://waynaharchitecturefc7a9a905b284f38a410a60f4dc36161829-dev.s3.eu-central-1.amazonaws.com/public/WAA+video+front+page.mp4" type="video/mp4" />
            </video>
        </div>
    )
}

export default HomePage;