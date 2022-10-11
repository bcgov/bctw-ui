import { SpeciesProvider } from "contexts/SpeciesContext";
import ManageLayout from "pages/layouts/ManageLayout";
import ExportPageV2 from "./ExportV2";


export default function ExportV2Wrapper () :JSX.Element {
    return (
        <ManageLayout>
            <SpeciesProvider>
                <ExportPageV2></ExportPageV2>
            </SpeciesProvider>
        </ManageLayout>
    )
}