import { ManualControl } from "@/components/control/manualControl";
import { VideoStream } from "@/components/video/videoStream";

const Debug = () => {
  return (
    <div className="flex flex-col gap-10">
      <VideoStream />
      <ManualControl />
    </div>
  );
};

export default Debug;
