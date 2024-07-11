import { FC, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../Store";
import { fetchLandUses, landUses } from "./LandUsesSlice";
import { useParams } from "react-router-dom";

const LandUses: FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { id: siteId } = useParams();

    const { landUses: landUsesData } = useSelector(landUses)

    useEffect(() => {
        if (siteId) {
            dispatch(fetchLandUses(siteId));
        }
    }, [dispatch, siteId])

    return (
        <div>
            <p>Land Uses</p>
            <pre>{JSON.stringify(landUsesData, null, 2)}</pre>
        </div>
    )
}

export default LandUses