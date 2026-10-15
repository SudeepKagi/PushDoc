import CoreCapabilities from "./CoreCapabilities";
import Testimonials from "./Testimonials";
import EngineSection from "./EngineSection";
import Steps from "./Steps";
import Grid from "@/components/grid/Bento";

export default function Features() {
  return (
    <>
      <Steps />
      {/*<CoreCapabilities />*/}
      <Testimonials />
      <Grid />
    </>
  );
}
