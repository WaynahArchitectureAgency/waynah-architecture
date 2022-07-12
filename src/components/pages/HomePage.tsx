import React from "react";
import Menu from "../elements/Menu";
import "../StyleOfAllPages.css"

const HomePage = () => {
    return(
        <div className="container text-center">
            <Menu/>
                <video width="750" height="500" className="sizeOfVideo" controls>
                    <source src="https://waynaharchitecturefc7a9a905b284f38a410a60f4dc36161829-dev.s3.eu-central-1.amazonaws.com/public/WAA+video+front+page.mp4" type="video/mp4" />
                </video>
        </div>
    )
}

export default HomePage;